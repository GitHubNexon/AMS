const SubReport = require('../models/SubReport');
const ReportEquityChanges = require('../models/ReportEquityChangesSetup');

/**
 * this report relies on values from trial balance data
 * and does not have its own built in report generation query yet
 */
const SubReportController = {

    get: async (req, res)=>{
        try{
            const subs = await SubReport.find();
            res.json(subs);
        }catch(error){
            console.error(error);
            res.json({message: "Internal server error"});
        }        
    },

    add: async (req,res)=>{
        try{
            console.log(req.body);
            const newSub = new SubReport(req.body);
            await newSub.save();
            res.json({ message: "Saved"});
        }catch(error){
            console.error(error);
            res.json({message: "Internal server error"});
        }
    },        

    update: async (req, res)=>{
        try{
            const { id } = req.params;
            const sub = await SubReport.findById(id);
            console.log(req.body);
            sub.set(req.body);
            await sub.save();
            res.json({message: "Saved"});
        }catch(error){
            console.error(error);
            res.json({message: "Internal server error"});
        }
    },

    // subreport but on another model
    // EQUITY CHANGES
    ECupsert: async (req, res)=>{
        try{
            const templates = req.body.template;
            for(let i = 0; i < templates.length; i++){
                await ReportEquityChanges.findOneAndUpdate({position: templates[i].position}, templates[i], { upsert: true, new: true });
            }
            res.json({message: "Saved"});
        }catch(error){
            console.error(error);
            res.json({message: "Internal server error"});
        }
    },

    ECget: async (req, res)=>{
        try{
            const template = await ReportEquityChanges.find();

            res.json(template);
        }catch(error){
            console.error(error);
            res.json({message: "Internal server error"})
        }
    },

};

module.exports = SubReportController;