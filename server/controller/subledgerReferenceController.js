const SubledgerReference = require('../models/subledgerReferenceModel');
const EntriesModel = require('../models/EntriesModel');

const subledgerReference = {

    async create(req, res){
        try{
            const data = req.body;
            const newSubLedger = new SubledgerReference(data);
            await newSubLedger.save();
            res.json({status: true});
        }catch(error){
            console.error(error);
            res.status(500).json({ error: 'An error occurred while searching' });
        }
    },

    async paginated(req, res){
        const search = req.query.search || '';
        const page = req.query.page || 1;
        const lesseeOnly = req.query.lesseeOnly || false;
        try{
            const filter = {};
            if(lesseeOnly === 'true'){
                filter.isLessee = lesseeOnly
            }
            filter.$or = [
                { slCode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
            const count = await SubledgerReference.countDocuments(filter);
            const docs = await SubledgerReference.find(filter).skip((page - 1) * 10).limit(10); 
            res.json({count: count, docs: docs});
        }catch(error){
            console.error(error);
            res.status(500).json({ error: 'An error occurred while searching' });
        }
    },

    async search(req, res) {
        // Extract query parameters (may pass sl code, name, or account)
        const search = req.query.search || '';
        // Construct the filter using $or for flexible searching
        const filter = { $or: [] };
        if (search) {
            filter.$or.push(
                { slCode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            );
        }
        //   if (account) filter.$or.push({ account: { $regex: account, $options: 'i' } });
        // If $or array is empty, remove it to match all documents
        if (filter.$or.length === 0){
            delete filter.$or;
            // return res.json({data: []});
        };
        try { 
            // Query the database with the constructed filter
            const subledgers = await SubledgerReference.find(filter).sort({slCode: 1});
            res.json({ data: subledgers }); // Respond with the matched subledgers
        } catch (error) {
            // Handle any errors
            console.error(error);
            res.status(500).json({ error: 'An error occurred while searching' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
    
            // Update the SubledgerReference first
            const toupdate = await SubledgerReference.findByIdAndUpdate(
                id,
                data,
                { new: true, useFindAndModify: false }
            );
    
            // Update only subledger names inside the ledgers array
            await EntriesModel.updateMany(
                { "ledgers.subledger.slCode": data.slCode }, // Find entries with this subledger code
                {
                    $set: {
                        "ledgers.$[subledgerElem].subledger.name": data.name // Update subledger name
                    }
                },
                {
                    arrayFilters: [{ "subledgerElem.subledger.slCode": data.slCode }]
                }
            );
    
            res.json({ data: toupdate });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred while updating" });
        }
    },    

    async getBillFor(req, res){
        try{
            // get all lessee with bill on passed month
            const { date } = req.params;
            const data = await SubledgerReference.find({
                escalation: {
                    $elemMatch: {
                        'period.start': { $lte: date },
                        'period.end': { $gte: date }
                    }
                }
            });
            // transform to billing information
            const toBill = [];
            for(let i = 0; i < data.length; i++){
                const b = data[i].escalation.filter(f=>new Date(f.period.start) <= new Date(date) && new Date(f.period.end) >= new Date(date))[0];
                const tb = {
                    slCode: data[i].slCode,
                    name: data[i].name,
                    start: b.period.start,
                    end: b.period.end,
                    securityDeposit: data[i].securityDeposit,
                    securityToDeposit: b.securityDeposit,
                    rate: b.rate,
                    billingDate: data[i].billingDateSchedules && data[i].billingDateSchedules.length > 0 ? data[i].billingDateSchedules.reduce((closest, current)=>{
                        const currentDiff = Math.abs(new Date(current) - new Date(date));
                        const closestDiff = Math.abs(new Date(closest) - new Date(date));
                        return currentDiff < closestDiff ? current : closest;
                    }) : '',
                    amount: b.office,
                    vat12: b.vat12,
                    grossAmount: b.grossAmount,
                    ewt5: b.ewt,
                    cashPayment: b.cashPayment
                };
                toBill.push(tb);
            }
            res.json({ data: toBill });
        }catch(error){
            console.error(error);
            res.status(500).json({ error: 'An error occured while updating '});
        }
    }

};
  

module.exports = subledgerReference; 
