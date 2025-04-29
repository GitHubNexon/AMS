const EntriesModel = require("../models/EntriesModel");
const SubledgerReference = require("../models/subledgerReferenceModel");
const SOAModel = require("../models/SOAModel");

const monthMap = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
};

async function getAccountTotalDRCR(code, slCode, start=null, end=null){
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
          date: {
            $gte: new Date(start),
            $lte: new Date(end)
          }
        }
      },
      {
        $unwind: {
          path: "$ledgers"
        }
      },
      {
        $match: {
          'ledgers.ledger.code': {$in: code},
          'ledgers.subledger.slCode': slCode
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
    ]
  );
  return records;
}

const SOA = {

  add: async (req, res)=>{
    try{
      const soa = new SOAModel(req.body);
      await soa.save();
      res.json(soa);
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  edit: async (req, res)=>{
    try{
      const { id } = req.params;
      const data = req.body;;
      const soa = await SOAModel.findById(id);
      soa.set(data);
      await soa.save();
      res.json([]);
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal server error" })
    }
  },

  get: async (req, res)=>{
    // create proper pagination later
    try{
      const { sl } = req.params;
      const sls = await SOAModel.find({slCode: sl}).sort({ date: -1 }).limit(1000);
      res.json(sls);
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  findDueDate: async (req, res)=>{
    try{
      const { slCode, month, year } = req.params;
      const sl = await SubledgerReference.findOne({slCode: slCode});
      // returns first day of the given month if no record found in due dates
      if(sl.dueDateSchedules.length === 0){
        return res.json({ duedate: new Date(`${year}-${month.padStart(2, '0')}-01`) });
      }else{
        const finding = sl.dueDateSchedules.find(dateStr=>{
          const date = new Date(dateStr);
          return date.getUTCFullYear() === parseInt(year) && (date.getUTCMonth() + 1) === parseInt(month);
        });
        return res.json({ duedate: finding ? finding : `${year}-${month.padStart(2, '0')}-01` });
      }
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  
  last: async (req, res)=>{
    try{
      const { slCode, glCode } = req.params;
      const sl = await SOAModel.findOne({ slCode: slCode, 'account.code': glCode }).sort({ date: -1 });
      res.json(sl);
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

};

module.exports = SOA;