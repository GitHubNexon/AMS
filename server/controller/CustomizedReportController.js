const CustomizedReportModel = require('../models/CustomizedReportModel');
const Accounts = require('../models/AccountModel');
const EntriesModel = require('../models/EntriesModel');

async function getAccountTotalDRCR(code, start=null, end=null){
    const date = {};
    if(start) date.$gte = new Date(start);
    if(end) date.$lte = new Date(end);
    const records = await EntriesModel.aggregate(
      [
        {
          $addFields: {
            date: {
              $ifNull: ["$JVDate", {
                $ifNull: ["$DVDate", "$CRDate"]
              }]
            },
            no: {
              $ifNull: ["$JVNo", {
                $ifNull: ["$DVNo", "$CRNo"]
              }]
            }
          }
        },
        {
          $project: {
            date: 1,
            no: 1,
            ledgers: 1
          }
        },
        {
          $match: {
            'ledgers.ledger.code': {$in: code},
            date: date
          }
        },
        {
          $unwind: {
            path: "$ledgers"
          }
        },
        {
          $match: {
            'ledgers.ledger.code': {$in: code}
          }
        },
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
        {
          $group: {
            _id: null,
            totalDr: {$sum: "$dr"},
            totalCr: {$sum: "$cr"}
          }
        }
      ]
    );
    return records;
}

const CustomizedReport = {

    list: async (req, res)=>{
        try{
            const reports = await CustomizedReportModel.find();
            res.json(reports);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error"});
        }
    },

    report: async (req, res)=>{
        try{
            const {id} = req.params;
            const {from=null, to=null} = req.query;
            const layout = await CustomizedReportModel.findById(id);
            const report = [];
            for(let i = 0; i < layout.fields.length; i++){
                let toCompute = 0;
                let nextOperation = '';
                for(let j = 0; j < layout.fields[i].value.length; j++){

                    let amount = 0;

                    // we can just use this
                    const total = await getAccountTotalDRCR(layout.fields[i].value[j].accounts, from, to)
                    if(total.length === 0) continue;
                    // amount = total[0].totalDr - total[0].totalCr;
                    amount = total[0].totalCr - total[0].totalDr;

                    if(j === 0){
                        toCompute = amount;
                        nextOperation = layout.fields[i].value[j].operateNext;
                    }else{
                        switch(nextOperation){
                            case 'add':
                                toCompute += amount;
                            break;
                            case 'sub':
                                toCompute -= amount;
                            break;
                            case 'prod':
                                toCompute *= amount;
                            break;
                            case 'diff':
                                toCompute /= amount;
                            break;
                        }
                        nextOperation = layout.fields[i].value[j].operateNext;
                    }
                }
                report.push({
                    title: layout.fields[i].title,
                    amount: toCompute
                });
            }
            res.json(report);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error"});
        }
    },

    add: async (req, res)=>{
        try{
            const newReport = new CustomizedReportModel(req.body);
            await newReport.save();
            res.json('New report added');
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error"});
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            console.log(id, data);
            delete(data._id);
            delete(data.__v)
            // Check if report exists
            const report = await CustomizedReportModel.findById(id);
            if (!report) {
                return res.status(404).json({ message: "Report not found" });
            }
    
            // Update the report
            report.set(data);
            await report.save();
    
            res.json({ message: "Report updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    

};

module.exports = CustomizedReport;