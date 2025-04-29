const EntriesModel = require("../models/EntriesLog");
const SubledgerReference = require("../models/subledgerReferenceModel");
const StatementOfAccountModel = require("../models/StatementOfAccountModel");

async function recalc(id, acc){
    // get all soa
    const soa = await StatementOfAccountModel.aggregate([
        { 
            $match: { 
                "ledger.code": acc, 
                "subledger.slCode": id 
            } 
        },
        { 
            $addFields: { 
                effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] } 
            } 
        },
        { $sort: { effectiveDueDate: -1, createdAt: -1 } } // Sort by fallback date
    ]);       
    let soaToUpdate = [];
    // find last soa with complete payment proceed to its next rows
    for(let i = 0; i < soa.length; i++){
        // always insert escalation
        if(soa[i].isRentalEscalation){
            soaToUpdate.push(soa[i]);
            continue;   
        }
        if(soa[i].row2.outstandingBalance <= 0){
            break;
        }else{
            soaToUpdate.push(soa[i]);
        }
    }
    soaToUpdate.reverse();
    const client = await SubledgerReference.findOne({slCode: id});
    const penalty = client.penalty ? client.penalty / 100 : 0;
    let lastOutstandingBalance = 0;
    // pass down escalation info to next rows for billing data
    let escalationRecorded = 0;
    let escalationRecordedDescription = "";
    // sync each soa
    for(let i = 0; i < soaToUpdate.length; i++){
        // find actual soa
        const current = await StatementOfAccountModel.findById(soaToUpdate[i]._id);
        // rental rate escalation is passed down
        if(current.isRentalEscalation){
            current.row1.outstandingBalance = lastOutstandingBalance + current.row1.amountDue;
            current.row2.outstandingBalance = current.row1.outstandingBalance;
            lastOutstandingBalance = current.row1.outstandingBalance;
            escalationRecorded += current.row1.billingAmount;
            escalationRecordedDescription = current.row1.particular;
        }else{
            // sync due date
            const dueDate = soaToUpdate[i].row1.dueDate;
            const delayed = getDaysDelayed(new Date(dueDate), new Date());
            const newPenalty = current.row1.billingAmount * penalty * delayed / 30;
            const newAmountDue = current.row1.billingAmount + newPenalty;
            // Update row1
            current.row1.daysDelayed = delayed;
            current.row1.penalty = newPenalty;
            current.row1.amountDue = newAmountDue;
            current.row1.outstandingBalance = lastOutstandingBalance + newAmountDue;
            // Update row2
            current.row2.outstandingBalance = lastOutstandingBalance + newAmountDue - current.row2.paymentAmount;
            lastOutstandingBalance = current.row2.outstandingBalance;
            current.recordedEscalation = escalationRecorded;
            current.escalationRecordedDescription = escalationRecordedDescription;
            console.log(escalationRecordedDescription);
        }
        await current.save();
    }
}

function getDaysDelayed(dueDate, paymentDate) {
    const due = new Date(dueDate);
    const payment = paymentDate ? new Date(paymentDate) : new Date(); // Use paymentDate or current date
    // Calculate the difference in milliseconds
    const diffTime = payment - due;
    // Convert to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // Ensure we return 0 if there is no delay
    return diffDays > 0 ? diffDays : 0;
}

// chatgpt refactor
async function getBill(code, slCode, asof) {
    const bill = await StatementOfAccountModel.aggregate([
        {
            $addFields: {
                effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] }
            }
        },
        {
            $match: {
                "ledger.code": code,
                "subledger.slCode": slCode,
                effectiveDueDate: { $lte: new Date(asof) },
                isRentalEscalation: false
            }
        },
        {
            $sort: { effectiveDueDate: -1 } // Sort by due date descending (latest first)
        },
        {
            $group: {
                _id: {
                    code: "$ledger.code",
                    slCode: "$subledger.slCode"
                },
                latestUnpaidBill: { $first: "$$ROOT" } // Pick the first (latest unpaid) bill
            }
        },
        {
            $replaceRoot: { newRoot: "$latestUnpaidBill" } // Flatten the object
        },
        {
            $match: {
                $or: [
                    { "row2.paymentAmount": { $exists: false } }, // Field does not exist
                    { "row2.paymentAmount": null }, // Field is null
                    { "row2.paymentAmount": { $eq: 0 } } // Payment amount is 0
                ]
            }
        }
    ]);
    return bill.length ? bill[0] : null; // Return the latest unpaid bill or null
}

// latest stable DO NOT DELETE
// async function getBill(code, slCode, asof){
//     // returns the last unpaid bill as of given date
//     const bill = await StatementOfAccountModel.aggregate([
//         {
//             $addFields: {
//                 effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] }
//             }
//         },
//         {
//             $match: {
//                 "ledger.code": code,
//                 "subledger.slCode": slCode,
//                 effectiveDueDate: { $lte: new Date(asof) },
//                 isRentalEscalation: false
//             }
//         },
//         { $sort: { effectiveDueDate: -1 } }
//     ]);
//     const trimmed = [];
//     for(let i = 0; i < bill.length; i++){
//         if(bill[i].row2.paymentAmount){
//             break;
//         }
//         trimmed.push(bill[i]);
        
//     }
//     if(trimmed.length === 0) return [];
//     return trimmed[0];
// }

const statementOfAccount = {

    billing: async (req, res) => {
        try {
            const { asof } = req.params;
            const { page = 1 } = req.query; // Get page number from query, default to 1
            const pageSize = 10; // Set page size
    
            const pageNum = parseInt(page, 10);
            if (isNaN(pageNum) || pageNum < 1) return res.status(400).json({ message: "Invalid page number" });
    
            // Get list of lessee with SOA
            const list = await StatementOfAccountModel.aggregate([
                { $group: { _id: { code: "$ledger.code", slCode: "$subledger.slCode" } } },
                { $project: { _id: 0, code: "$_id.code", slCode: "$_id.slCode" } },
                { $skip: (pageNum - 1) * pageSize }, // Skip records based on page
                { $limit: pageSize } // Limit the number of records per page
            ]);
    
            if (list.length === 0) return res.json([]);
    
            // Find each SOA record
            const bill = await Promise.all(list.map(({ slCode, code }) => getBill(code, slCode, asof)));
            
            // Get total count for pagination info
            const totalRecords = await StatementOfAccountModel.aggregate([
                {
                    $group: {
                        _id: { code: "$ledger.code", slCode: "$subledger.slCode" }
                    }
                },
                {
                    $count: "total"
                }
            ]);
            
            const totalCount = totalRecords.length > 0 ? totalRecords[0].total : 0;
            const totalPages = Math.ceil(totalCount / pageSize);
    
            res.json({
                data: bill.flat(),
                totalRecords,
                totalPages,
                currentPage: pageNum
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    scheduledSync: async () => {
        const list = await StatementOfAccountModel.aggregate([
            {
                $group: {
                    _id: {
                        code: "$ledger.code",
                        slCode: "$subledger.slCode"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    code: "$_id.code",
                    slCode: "$_id.slCode"
                }
            }
        ]);
        // Process all in parallel
        await Promise.all(list.map(({ slCode, code }) => recalc(slCode, code)));
    },
    
    sync: async (req, res)=>{
        try{
            const { id, acc } = req.params;
            await recalc(id, acc);
            res.json([]);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    add: async (req, res)=>{
        try{
            const soa = new StatementOfAccountModel(req.body);
            const saveSoa = await soa.save();
            await recalc(req.body.subledger.slCode, req.body.ledger.code);
            res.json(saveSoa);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    get: async (req, res)=>{
        try{
            const { from, to, account, client } = req.params;
            const data = await StatementOfAccountModel.aggregate([
                {
                    $addFields: {
                        effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] }
                    }
                },
                {
                    $match: {
                        "ledger.code": account,
                        "subledger.slCode": client,
                        effectiveDueDate: { $gte: new Date(from), $lte: new Date(to) }
                    }
                },
                { $sort: { effectiveDueDate: 1 } } // Sort in ascending order
            ]);            
            res.json(data);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    update: async (req, res)=>{
        try{
            const { id } = req.params;
            const soa = await StatementOfAccountModel.findById(id);
            soa.set(req.body);
            await soa.save();
            await recalc(req.body.subledger.slCode, req.body.ledger.code);
            res.json(soa)
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    delete: async (req, res)=>{
        try{
            const { id } = req.params;
            const soa = await StatementOfAccountModel.deleteOne({_id: id});
            res.json(soa);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    lastRow: async (req, res)=>{
        try{
            const { id, sl } = req.params;
            // if id=latest get the latest entry
            if(id === "latest"){
                const soa = await StatementOfAccountModel.aggregate([
                    { $match: { "subledger.slCode": sl } },
                    { 
                        $addFields: { 
                            effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] } 
                        }
                    },
                    { $sort: { effectiveDueDate: -1, createdAt: -1 } }, // Sort by the most recent date
                    { $limit: 1 } // Get only the latest entry
                ]);                
                return res.json(soa.length > 0 ? soa[0] : null);
            }else{
                const currentSoa = await StatementOfAccountModel.findById(id);
                const data = await StatementOfAccountModel.aggregate([
                    {
                        $addFields: {
                            effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] }
                        }
                    },
                    {
                        $match: {
                            "ledger.code": currentSoa.ledger.code,
                            "subledger.slCode": currentSoa.subledger.slCode
                        }
                    },
                    { $sort: { effectiveDueDate: 1 } } // Sort in ascending order
                ]);  
                if(data.length <= 1){
                    return res.json(null);
                }
                let last = null;
                for(let i = 0; i < data.length; i++){
                    if(data[i]._id.toString() === id){
                        last = data[i-1];
                        break;
                    }
                }
                return res.json(last);
            }
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

    total: async (req, res)=>{
        try{
            const { asof, sl, acc } = req.params;
            const data = await StatementOfAccountModel.aggregate([
                {
                    $addFields: {
                        effectiveDueDate: { $ifNull: ["$row1.dueDate", "$rentalEscalationDate"] }
                    }
                },
                {
                    $match: {
                        "ledger.code": acc,
                        "subledger.slCode": sl,
                        effectiveDueDate: { $lte: new Date(asof) }
                    }
                },
                { $sort: { effectiveDueDate: 1 } } // Sort in ascending order
            ]); 

            if(data.length === 0){
                return  res.json({
                    totalBillingAmount: 0,
                    totalPaymentAmount: 0,
                    totalPenalty: 0,
                    totalAmountDue: 0,
                    oustandingBalance: 0
                });
            }
            const totalBillingAmount = data.map(m=>m.row1.billingAmount).reduce((pre,cur)=>pre+cur,0);
            const totalPaymentAmount = data.map(m=>m.row2.paymentAmount).reduce((pre,cur)=>pre+cur,0);
            const totalPenalty = data.map(m=>m.row1.penalty).reduce((pre,cur)=>pre+cur,0);
            const d1 = data.map(m=>m.row1.amountDue).reduce((pre,cur)=>pre+cur,0);
            const d2 = data.map(m=>m.row2.amountDue).reduce((pre,cur)=>pre+cur,0);
            const totalAmountDue = d1 + d2;
            const oustandingBalance = data[data.length - 1].row2.outstandingBalance;
            res.json({
                totalBillingAmount: totalBillingAmount,
                totalPaymentAmount: totalPaymentAmount,
                totalPenalty: totalPenalty,
                totalAmountDue: totalAmountDue,
                oustandingBalance: oustandingBalance
            });
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "internal server error"});
        }
    },

};

module.exports = statementOfAccount;