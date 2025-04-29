const TrialBalanceModel = require('../models/TrialBalanceModel');
const EntriesModel = require("../models/EntriesModel");
const Account = require("../models/AccountModel");

const TrialBalance = {

    getStructure: async (req, res)=>{
        try{
            const data = await TrialBalanceModel.find();
            res.json(data);
        }catch(error){
            console.error(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    
    addLine: async (req, res)=>{
        try{
            const row = req.body;
            const newRow = new TrialBalanceModel(row);
            await newRow.save();
            res.json({ message: 'row saved'});
        }catch(error){
            console.error(error);
            res.status(500).json({message: "Internal server error"});
        }
    },

    updateLine: async (req, res)=>{
        try{
            const row = req.body;
            const {id} = req.params;

            const line = await TrialBalanceModel.findById(id);
            line.set(row);
            await line.save();

            res.json(line);

        }catch(error){
            console.error(error);
            res.status(500).json({message: "Internal server error"});
        }
    },

    getReport: async (req, res) => {
        try {
            const { date } = req.params;
            // Get the report structure
            const structure = await TrialBalanceModel.find();
    
            // Build the report array with parallel processing
            const reportPromises = structure.map(async (item, index) => {
                const balance = await TrialBalance.getBalance(item.account, date, item.slFilter, item.traverse);
                return {
                    title: item.title,
                    dr: item.type === "dr" ? Math.abs(balance) : 0,
                    cr: item.type === "cr" ? Math.abs(balance) : 0
                };
            });
    
            // Wait for all promises to resolve
            const report = await Promise.all(reportPromises);

            const totalDr = report.map(m=>m.dr).reduce((pre,cur)=>pre+cur,0);
            const totalCr = report.map(m=>m.cr).reduce((pre,cur)=>pre+cur,0);
            report.push({
                title: "TOTAL",
                dr: totalDr,
                cr: totalCr
            });
    
            res.json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    

    getBalance: async (code, date, filter, traverse=false)=>{
        try{
            if(code.length === 0) return 0;
            let codes = code;
            if(traverse){
                // get all sub accounts of all codes
                for(let i = 0; i < code.length; i++){
                    const subs = await Account.find({parentAccount: code[i]});
                    codes = [...codes, ...subs.map(m=>m.code)]
                }
            }    
            const filtering = filter.length > 0 ? { 'ledgers.subledger.slCode': { $in: filter } } : {};
            const balance = await EntriesModel.aggregate([
                {
                    $addFields: {
                        date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                        no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
                    }
                },
                { $project: { date: 1, no: 1, ledgers: 1 } },
                { $match: { 'ledgers.ledger.code': { $in: codes }, date: { $lte: new Date(date) } } },
                { $unwind: { path: "$ledgers" } },
                { $match: { 'ledgers.ledger.code': { $in: codes }, ...filtering } },
                {
                    $project: {
                        date: 1,
                        no: 1,
                        type: "$ledgers.type",
                        dr: "$ledgers.dr",
                        cr: "$ledgers.cr",
                        code: "$ledgers.ledger.code",
                        ledger: "$ledgers.ledger.name",
                        slCode: "$ledgers.subledger.slCode",
                        subledger: "$ledgers.subledger.name"
                    }
                },
                { $group: { _id: null, totalDr: {$sum: "$dr"}, totalCr: {$sum: "$cr"} } },
                { $project: { total: { $round: [ {$subtract: ['$totalDr', '$totalCr']}, 2] } }}
            ]);
            return balance.length > 0 ? balance[0].total : 0;
        }catch(error){
            console.error(error);
        }
    },

};

module.exports = TrialBalance;