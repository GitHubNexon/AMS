const CustomReportModel = require("../models/CustomReportModel");
const EntriesModel = require("../models/EntriesModel");
const reportingflatledgers = require("../models/ReportingFlatLedgers");
const {
    getBook, // all entries on a book
    getBookSummary, // summarized all credit and debit on a book
    getBookTransactionSummary, // summarized credit and debit per subledgers on a book
} = require('./reportController');

module.exports = {
    get: async (req, res)=>{
        try{
            const { title } = req.params;
            const layout = await CustomReportModel.find({title: title});
            res.json(layout);
        }catch(err){
            module.exports.errlog(err, res);
        }
    },
    create: async (req, res)=>{
        try{
            const report = new CustomReportModel({
                title: req.body.title,
                fields: req.body.fields
            });
            const result = await report.save();
            res.send({data: result});
        }catch(err){
            module.exports.errlog(err, res);
        }
    },
    edit: async (req, res)=>{
        try{
            const {title} = req.params;
            const update = await CustomReportModel.findOneAndUpdate({title:title}, req.body, {new: true});
            console.log(update);
            console.log(update);
            res.send({data: update})
        }catch(err){
            module.exports.errlog(err, res);
        }
    },
    valuesPrevMonthCurrentINCDEC: async (req, res)=>{
        try{
            const { title } = req.params;
            const intervals = req.body;
            let layout = await CustomReportModel.findOne({title: title});
            let reportRows = [];
            // loop through rows in this layout
            for(let i = 0; i < layout.rows.length; i++){
                const accountsToGet = layout.rows[i].accounts.map(item=>item.code);
                let prev = 0, cur = 0, incdec = 0;                
                for(let j = 0; j < accountsToGet.length; j++){
                    // previous month
                    const p = await module.exports.getAccountTotalValues(accountsToGet[j], intervals.prev.firstDay, intervals.prev.lastDay, res);
                    // current month
                    const c = await module.exports.getAccountTotalValues(accountsToGet[j], intervals.cur.firstDay, intervals.cur.lastDay, res);
                    // inc/dec
                    prev += p.totalDr - p.totalCr;
                    cur += c.totalDr - p.totalCr;
                    incdec = prev + cur;
                }
                reportRows.push({
                    title: layout.rows[i].title,
                    prev: prev,
                    cur: cur,
                    incdec: incdec
                });
            }
            res.json(reportRows);
        }catch(err){
            module.exports.errlog(err, res);
        }
    },
    getAccountTotalValues: async (code, start, end, res)=>{
        try{
            const date = {};
            if(start) date.$gte = new Date(start);
            if(end) date.$lte = new Date(end);
            console.log(code, date)
            const transactions = await EntriesModel.aggregate(
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
                        'ledgers.ledger.code': code,
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
                        'ledgers.ledger.code': code
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
            console.log(transactions);
            return transactions[0] ? transactions[0] : {totalDr: 0, totalCr: 0};
        }catch(err){
            module.exports.errlog(err, res);
        }
    },
    // retrieve report: sum of credit and debits on the specific range of date ( to be refactored )
    report: async (req, res)=>{
        try{
            // get parameters
            const { title } = req.params;
            const { mode, start, end } = req.query;
            console.log(title, mode, start, end);
            // get report structure
            const structure = await CustomReportModel.findOne({title: title});
            console.log(structure);
            
            res.send([]);
        }catch(err){
            module.exports.errlog(err, res);
        }
    },

    errlog: (err, res)=>{
        console.error(err);
        res.status(400).json({message: err.message});
    }
};