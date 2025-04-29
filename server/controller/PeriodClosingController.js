const PeriodClosingModel = require('../models/PeriodClosingModel');
const EntriesModel = require("../models/EntriesModel");

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
          _id: "$slCode",
          name: {$first: "$subledger"},
          totalDr: {$sum: "$dr"},
          totalCr: {$sum: "$cr"}
        }
      },
      {
        $match: {
          $or: [
            { totalDr: { $ne: 0 } },
            { totalCr: { $ne: 0 } }
          ]
        }
      }
    ]
  );
  return records;
}

const PeriodClosing = {

    get: async (req, res)=>{
      try{
        const {page=1, limit=10, closed='false'} = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const skip = (pageInt - 1) * limitInt;
        const filter = {};
        if(closed === 'true') filter.closed = true;
        const list = await PeriodClosingModel.find(filter).sort({closingDate: -1}).skip(skip).limit(limitInt);
        res.json({list: list, count: 0});
      }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },

  check: async (req, res)=>{
    try{
      const {date} = req.params;
      const tocheck = await PeriodClosingModel.find({closingDate: {$gte: new Date(date)}, closed: true}).sort({closingDate: -1}).limit(3);
      res.json(tocheck);
    }catch(error){
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  add: async (req, res)=>{
    try{
      const entry = req.body.entry;
      const closing = req.body.closing;
      // update entry here to zero all subledgers
      let ledg = entry.ledgers.filter(item => !(item.dr === null && item.cr === 0) && !(item.dr === 0 && item.cr === null));
      const newledg = [];
      // remove 1st row (retained earnings)
      ledg = ledg.slice(1);
      // loop through passed accounts (income/expenses) then record closing data for each
      for(let i = 0; i < ledg.length; i++){
        // get all current dr and cr on each account
        const d = await getAccountTotalDRCR([ledg[i].ledger.code], null, closing.beforeDate);
        // entry for zero
        newledg.push(...d.map(m=>({
          ledger: {
            code: ledg[i].ledger.code,
            name: ledg[i].ledger.name
          },
          subledger: {
            slCode: m._id,
            name: m.name
          },
          // debit if income account
          dr: (ledg[i].ledger.code.charAt(0) === '4' ? (m.totalCr - m.totalDr) : null ),
          // credit if expenses account
          cr: (ledg[i].ledger.code.charAt(0) === '5' ? (m.totalDr - m.totalCr) : null )

        })));
        // record retained earnings for each subledger
        newledg.push(...d.map(m=>({
          ledger: {
            code: "30701010",
            name: "RETAINED EARNINGS/(DEFICIT)"
          },
          subledger: {
            slCode: m._id,
            name: m.name
          },
          // debit retained earnings if expenses account
          dr: (ledg[i].ledger.code.charAt(0) === '5' ? (m.totalDr - m.totalCr) : null),
          // credit retained earnings if income acocunt
          cr: (ledg[i].ledger.code.charAt(0) === '4' ? (m.totalCr - m.totalDr) : null)
        })));
      }
      entry.ledgers = newledg
      // save entry to 0 accoutns and record retained earnings
      const closingEntry = new EntriesModel(entry);
      await closingEntry.save();
      closing.entryId = closingEntry._id;
      // record closing info
      const toClose = new PeriodClosingModel(closing);
      await toClose.save();
      res.json({message: "Saved"});
    }catch(error){
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  reopen: async (req, res)=>{
    try{
      const { id } = req.params;
      const p = await PeriodClosingModel.findById(id);
      console.log(p);
      // delete closing entry
      await EntriesModel.deleteOne({_id: p.entryId});
      p.entryId = null;
      p.closed = false;
      await p.save();
      res.json({message: "Re opened"});
    }catch(error){
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  delete: async (req, res)=>{
    try{
      const { id } = req.params; 
      console.log(id);
      await PeriodClosingModel.deleteOne({_id: id});
      res.json({ mesage: "Deleted" })
    }catch(error){
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

};

module.exports = PeriodClosing;