const PayrollColumnsModel = require("../models/PayrollColumns");
const PayrollModel = require("../models/PayrollModel");

const PayrollController = {

    link: async (req, res)=>{
        try{
            const { pId, jId } = req.body;
            const data = await PayrollModel.findByIdAndUpdate(pId, { linkedJournal: jId }, {  new: true });
            res.json(data);
        }catch(error){
            console.error(error);
            res.status(500).json({ error: "internal server error" });
        }
    },

    getPayroll: async (req, res)=>{
        try{
            let { page=1, limit=10, query } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            const skip = (page - 1) * limit;            
            const data = await PayrollModel.aggregate([
                { 
                    $lookup: {
                        from: "entries", // Collection to join (MongoDB uses lowercase & plural names)
                        localField: "linkedJournal",
                        foreignField: "_id",
                        as: "linkedJournal"
                    }
                },
                { $unwind: { path: "$linkedJournal", preserveNullAndEmptyArrays: true } }, // Unwind if a journal exists
                { $match: query ? { "linkedJournal.Particulars": { $regex: query, $options: "i" } } : {} },
                { $sort: { _id: -1 } }, // Sort by most recent
                { $skip: skip }, // Pagination
                { $limit: limit } // Limit results per page
            ]);
            const count = await PayrollModel.countDocuments();

            res.json({
                rows: data,
                pages: Math.ceil(count / limit),
                count: count
            });
        }catch(error){
            console.error(error);
            res.status(500).json({ error: "internal server error" });
        }
    },

    savePayroll: async (req, res)=>{
        try{
            const data = req.body;            
            let saved;
            // update existing
            if(data._id){
                saved = await PayrollModel.findByIdAndUpdate(data._id, {data});
            }else{
                delete data._id;
                // save as new
                const payroll = new PayrollModel(data);
                saved = await payroll.save();
            }
            res.json(saved);
        }catch(error){
            console.error(error);
            res.status(500).json({ error: "internal server error" });
        }
    },
    
    saveSettings: async (req, res)=>{
        try{  
            const { rows } = req.body;

            // delete all rows where _id is not in rows
            const ids = rows.map(m=>m._id).filter(Boolean);
            await PayrollColumnsModel.deleteMany({ _id: { $nin: ids } });
            
            // update existing rows
            const toUpdate = rows.filter(f => f._id != null);
            for(let i = 0; i < toUpdate.length; i++){
                await PayrollColumnsModel.findByIdAndUpdate(toUpdate[i]._id, toUpdate[i], {new: true});
            }
            
            // insert new rows
            const toInsert = rows.filter(f => !("_id" in f));
            for(let i = 0; i < toInsert.length; i++){
                const newDoc = new PayrollColumnsModel(toInsert[i]);
                await newDoc.save();
            }

            res.json({inserted: toInsert.length, updated: toUpdate.length, deleted: ids.length});
        }catch(error){
            console.error(error);
            res.status(500).json({ error: "internal server error" });
        }
    },

    getSettings: async (req, res)=>{
        try{
            const settings = await PayrollColumnsModel.find();
            res.json(settings);
        }catch(error){
            console.error(error);
            res.status(500).json({ error: "internal server error" });
        }
    },

};

module.exports = PayrollController;