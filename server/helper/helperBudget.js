const startDate = new ISODate("2023-01-01");
const endDate = new ISODate("2023-12-31");

db.entries.aggregate([
  {
    $unwind: "$ledgers",
  },
  {
    $match: {
      "ledgers.ledger.code": { $in: ["50101010", "501"] },
      "ledgers.subledger.slCode": { $in: ["9527"] },
      $or: [
        {
          JVDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        {
          CRDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        {
          DVDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      ],
    },
  },
  {
    $group: {
      _id: "null",
      totalDr: { $sum: "$ledgers.dr" },
      totalCr: { $sum: "$ledgers.cr" },
    },
  },
]);

// to ge the total cr and dr of entries base on ledgers.ledger.code and ledgers.subledger.slCode

const mongoose = require("mongoose");
const Account = require("../models/AccountModel");

async function connectToDB() {
  try {
    const dbURI = "mongodb://0.0.0.0:27017/ndc_ams";
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
    aggregateAccountData();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function aggregateAccountData() {
  try {
    const accounts = await Account.find({
      code: {
        $in: [
          "50202020",
          "50203010",
          "50203020",
          "50203090",
          "50203210",
          "50203990",
          "50204010",
          "50204020",
          "50205010",
          "50205020",
          "50205030",
          "50205040",
          "50210030",
          "50210030A",
          "50210030B",
          "50210030C",
          "50210030D",
          "50211010",
          "50211020",
          "50211030",
          "50211990",
          "50212010",
          "50212020",
          "50212030",
          "50212990",
          "50212990A",
          "50212990B",
          "50213010",
          "50213040",
          "50213060",
          "50213060A",
          "50213060B",
          "50213060C",
          "50213070",
          "50213990",
          "50213050",
          "50215010",
          "50215010A",
          "50215010B",
          "50215010C",
          "50215010D",
          "50215010E",
          "50215010F",
          "50215020",
          "50215030",
          "50215030A",
          "50215030B",
          "50215040",
          "50299010",
          "50299030",
          "50299040",
          "50299050",
          "50299050A",
          "50299050B",
          "50299060",
          "50299070",
          "50299140",
          "50299180",
          "50299020",
          "50299090",
          "50299990",
          "50301020",
          "50301030",
          "50301040",
        ],
      },
    });

    const formattedResults = accounts
      .map((account) => {
        return `{
              "_id": "${account._id}",
              "CategoryCode": "${account.code}",
              "CategoryName": "${account.name}",
              "CategoryBudget": 33333333.33,
              "CategoryActual": 0,
              "CurrentBalance": 33333333.33,
              "CategoryPercentage": 0
          }`;
      })
      .join(",");

    const finalResult = `[${formattedResults}]`;

    console.log(finalResult);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

connectToDB();

// for testing cloning documents

var originalDoc = db.entries.findOne({
  _id: ObjectId("677f66d484b433db15e2b9b5"),
});

if (originalDoc) {
  delete originalDoc._id;

  for (var i = 0; i < 10; i++) {
    db.entries.insert(originalDoc);
  }
  print(
    "Cloned the document 10 times successfully in the `entries` collection."
  );
} else {
  print("Document not found in the `entries` collection.");
}
