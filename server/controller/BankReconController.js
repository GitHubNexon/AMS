const mongoose = require("mongoose");
const Account = require("../models/AccountModel");
const EntriesModel = require("../models/EntriesModel");
const BankReconModel = require("../models/BankReconModel");
const moment = require("moment");

//v1
// const getTransaction = async (req, res) => {
//   try {
//     const { startDate, endDate, SLCODE, ACCTCODE } = req.body;

//     const start = startDate ? new Date(startDate) : new Date();
//     const end = endDate ? new Date(endDate) : new Date();
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     // Check if a reconciled record already exists in BankReconModel
//     const existingReconciliation = await BankReconModel.findOne({
//       // startDate: { $eq: start },
//       endDate: { $eq: end },
//       reconciled: true,
//     });

//     if (existingReconciliation) {
//       return res.status(400).json({
//         message: "Transactions for this period have already been reconciled.",
//       });
//     }

//     const ledgerFilter = {};
//     if (SLCODE) ledgerFilter["ledgers.subledger.slCode"] = SLCODE;
//     if (ACCTCODE) ledgerFilter["ledgers.ledger.code"] = ACCTCODE;

//     let pipeline = [];

//     pipeline.push({
//       $match: {
//         $or: [
//           { DVDate: { $gte: start, $lte: end } },
//           { CRDate: { $gte: start, $lte: end } },
//           { JVDate: { $gte: start, $lte: end } },
//         ],
//       },
//     });

//     pipeline.push(
//       { $unwind: "$ledgers" },
//       ...(Object.keys(ledgerFilter).length > 0
//         ? [{ $match: ledgerFilter }]
//         : []),
//       {
//         $project: {
//           _id: 1,
//           EntryType: 1,
//           PaymentEntity: 1,
//           SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
//           SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
//           SLDESC: "$Particulars",
//           CheckNo: { $ifNull: ["$CheckNo", 0] },
//           SLCODE: "$ledgers.subledger.slCode",
//           ACCTCODE: "$ledgers.ledger.code",
//           ACCOUNTNAME: "$ledgers.ledger.name",
//           SLDEBIT: "$ledgers.dr",
//           SLCREDIT: "$ledgers.cr",
//           isOutstanding: { $ifNull: ["$isOutstanding", false] },
//           isUnrecorded: { $ifNull: ["$isUnrecorded", false] },
//           isReconciled: { $ifNull: ["$isReconciled", false] },
//           clearedAmount: {
//             $cond: {
//               if: { $eq: ["$isReconciled", true] },
//               then: { $ifNull: ["$SLDEBIT", "$SLCREDIT"] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $sort: { SLDATE: 1 } }
//     );

//     let transactions = await EntriesModel.aggregate(pipeline).exec();

//     const reconciledTransactions = await BankReconModel.aggregate([
//       { $unwind: "$transactions" },
//       {
//         $match: {
//           "transactions.isReconciled": true,
//         },
//       },
//       {
//         $group: {
//           _id: "$transactions.SLDOCNO",
//         },
//       },
//     ]);

//     const reconciledSLDOCNOs = new Set(
//       reconciledTransactions.map((t) => t._id)
//     );

//     // Fetch outstanding transactions that are NOT reconciled
//     const outstandingTransactions = await BankReconModel.aggregate([
//       { $unwind: "$transactions" },
//       {
//         $match: {
//           "transactions.isOutstanding": true,
//           "transactions.isReconciled": false,
//         },
//       },
//       {
//         $group: {
//           _id: "$transactions.SLDOCNO",
//           transaction: { $first: "$transactions" },
//         },
//       },
//       {
//         $replaceRoot: { newRoot: "$transaction" },
//       },
//       {
//         $sort: { SLDATE: 1 },
//       },
//     ]);

//     outstandingTransactions.forEach((outstanding) => {
//       if (!reconciledSLDOCNOs.has(outstanding.SLDOCNO)) {
//         transactions.push(outstanding);
//       }
//     });

//     return res.status(200).json({
//       length: transactions.length,
//       transactions,
//     });
//   } catch (error) {
//     console.error("Error in getTransaction:", error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };

//updated
const getTransaction = async (req, res) => {
  try {
    const { startDate, endDate, SLCODE, ACCTCODE } = req.body;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Check if a reconciled record already exists in BankReconModel
    const existingReconciliation = await BankReconModel.findOne({
      // startDate: { $eq: start },
      endDate: { $eq: end },
      reconciled: true,
    });

    if (existingReconciliation) {
      return res.status(400).json({
        message: "Transactions for this period have already been reconciled.",
      });
    }

    const ledgerFilter = {};
    if (SLCODE) ledgerFilter["ledgers.subledger.slCode"] = SLCODE;
    if (ACCTCODE) ledgerFilter["ledgers.ledger.code"] = ACCTCODE;

    let pipeline = [];

    pipeline.push({
      $match: {
        $or: [
          { DVDate: { $gte: start, $lte: end } },
          { CRDate: { $gte: start, $lte: end } },
          { JVDate: { $gte: start, $lte: end } },
        ],
      },
    });

    pipeline.push(
      { $unwind: "$ledgers" },
      ...(Object.keys(ledgerFilter).length > 0
        ? [{ $match: ledgerFilter }]
        : []),
      {
        $project: {
          _id: 1,
          EntryType: 1,
          PaymentEntity: 1,
          SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
          SLDESC: "$Particulars",
          CheckNo: { $ifNull: ["$CheckNo", 0] },
          SLCODE: "$ledgers.subledger.slCode",
          ACCTCODE: "$ledgers.ledger.code",
          ACCOUNTNAME: "$ledgers.ledger.name",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
          isOutstanding: { $ifNull: ["$isOutstanding", false] },
          isUnrecorded: { $ifNull: ["$isUnrecorded", false] },
          isReconciled: { $ifNull: ["$isReconciled", false] },
          clearedAmount: {
            $cond: {
              if: { $eq: ["$isReconciled", true] },
              then: { $ifNull: ["$SLDEBIT", "$SLCREDIT"] },
              else: 0,
            },
          },
        },
      },
      { $sort: { SLDATE: 1 } }
    );

    let transactions = await EntriesModel.aggregate(pipeline).exec();

    const reconciledTransactions = await BankReconModel.aggregate([
      { $unwind: "$transactions" },
      {
        $match: {
          "transactions.isReconciled": true,
        },
      },
      {
        $group: {
          _id: "$transactions.SLDOCNO",
        },
      },
    ]);

    const reconciledSLDOCNOs = new Set(
      reconciledTransactions.map((t) => t._id)
    );

    const UnrecordedTransactions = await BankReconModel.aggregate([
      { $unwind: "$transactions" },
      {
        $match: {
          "transactions.isReconciled": true,
          "transactions.isUnrecorded": true,
          "transactions.SLDATE": { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$transactions.SLDOCNO",
        },
      },
    ]);

    const UnrecordedSLDOCNOs = new Set(
      UnrecordedTransactions.map((t) => t._id)
    );

    transactions = transactions.filter(
      (transaction) => !UnrecordedSLDOCNOs.has(transaction.SLDOCNO)
    );

    // Fetch outstanding transactions that are NOT reconciled
    const outstandingTransactions = await BankReconModel.aggregate([
      { $unwind: "$transactions" },
      {
        $match: {
          "transactions.isOutstanding": true,
          "transactions.isReconciled": false,
        },
      },
      {
        $group: {
          _id: "$transactions.SLDOCNO",
          transaction: { $first: "$transactions" },
        },
      },
      {
        $replaceRoot: { newRoot: "$transaction" },
      },
      {
        $sort: { SLDATE: 1 },
      },
    ]);

    outstandingTransactions.forEach((outstanding) => {
      if (!reconciledSLDOCNOs.has(outstanding.SLDOCNO)) {
        // transactions.push(outstanding);
        transactions.unshift(outstanding);
      }
    });

    return res.status(200).json({
      length: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error in getTransaction:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

//without rounded
// const getBookEndingBalance = async (req, res) => {
//   try {
//     const { startDate, endDate, SLCODE, ACCTCODE } = req.body;

//     if (!endDate) {
//       return res.status(400).json({ message: "endDate is required" });
//     }

//     const start = startDate ? new Date(startDate) : new Date("1970-01-01");
//     const end = new Date(endDate);
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     const ledgerFilter = {};
//     if (SLCODE) ledgerFilter["ledgers.subledger.slCode"] = SLCODE;
//     if (ACCTCODE) ledgerFilter["ledgers.ledger.code"] = ACCTCODE;

//     let pipeline = [];

//     pipeline.push({
//       $match: {
//         $or: [
//           { DVDate: { $gte: start, $lte: end } },
//           { CRDate: { $gte: start, $lte: end } },
//           { JVDate: { $gte: start, $lte: end } },
//         ],
//       },
//     });

//     pipeline.push(
//       { $unwind: "$ledgers" },
//       ...(Object.keys(ledgerFilter).length > 0
//         ? [{ $match: ledgerFilter }]
//         : []),
//       {
//         $project: {
//           _id: 1,
//           EntryType: 1,
//           SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
//           SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
//           SLCODE: "$ledgers.subledger.slCode",
//           ACCTCODE: "$ledgers.ledger.code",
//           ACCOUNTNAME: "$ledgers.ledger.name",
//           SLDEBIT: "$ledgers.dr",
//           SLCREDIT: "$ledgers.cr",
//         },
//       }
//     );

//     pipeline.push({
//       $group: {
//         _id: null,
//         totalSLDEBIT: { $sum: "$SLDEBIT" },
//         totalSLCREDIT: { $sum: "$SLCREDIT" },
//         transactions: { $push: "$$ROOT" },
//       },
//     });

//     // Compute bookEndingBalance
//     pipeline.push({
//       $project: {
//         _id: 0,
//         totalSLDEBIT: 1,
//         totalSLCREDIT: 1,
//         bookEndingBalance: { $subtract: ["$totalSLDEBIT", "$totalSLCREDIT"] },
//         // transactions: 1,
//       },
//     });

//     let result = await EntriesModel.aggregate(pipeline).exec();

//     return res.json({
//       success: true,
//       data: result.length > 0 ? result[0] : { totalSLDEBIT: 0, totalSLCREDIT: 0, bookEndingBalance: 0, transactions: [] },
//     });

//   } catch (error) {
//     console.error("Error in getBookEndingBalance:", error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };


const getBookEndingBalance = async (req, res) => {
  try {
    const { endDate, SLCODE, ACCTCODE } = req.body;

    if (!endDate) {
      return res.status(400).json({ message: "endDate is required" });
    }

    // Use moment for date handling
    const end = moment(endDate).endOf("day");

    const ledgerFilter = {};
    if (SLCODE) ledgerFilter["ledgers.subledger.slCode"] = SLCODE;
    if (ACCTCODE) ledgerFilter["ledgers.ledger.code"] = ACCTCODE;

    let pipeline = [];

    pipeline.push({
      $match: {
        $or: [
          { DVDate: { $lte: end.toDate() } },
          { CRDate: { $lte: end.toDate() } },
          { JVDate: { $lte: end.toDate() } },
        ],
      },
    });

    pipeline.push(
      { $unwind: "$ledgers" },
      ...(Object.keys(ledgerFilter).length > 0 ? [{ $match: ledgerFilter }] : []),
      {
        $project: {
          _id: 1,
          EntryType: 1,
          SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
          SLCODE: "$ledgers.subledger.slCode",
          ACCTCODE: "$ledgers.ledger.code",
          ACCOUNTNAME: "$ledgers.ledger.name",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
        },
      }
    );

    pipeline.push({
      $group: {
        _id: null,
        totalSLDEBIT: { $sum: "$SLDEBIT" },
        totalSLCREDIT: { $sum: "$SLCREDIT" },
      },
    });

    // Compute bookEndingBalance
    pipeline.push({
      $project: {
        _id: 0,
        totalSLDEBIT: 1,
        totalSLCREDIT: 1,
        bookEndingBalance: { $subtract: ["$totalSLDEBIT", "$totalSLCREDIT"] },
      },
    });

    let result = await EntriesModel.aggregate(pipeline).exec();

    return res.json({
      success: true,
      data: result.length > 0 ? result[0] : { totalSLDEBIT: 0, totalSLCREDIT: 0, bookEndingBalance: 0 },
    });

  } catch (error) {
    console.error("Error in getBookEndingBalance:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};




// v1




const getUnRecordedTransaction = async (req, res) => {
  try {
    const { SLDOCNO, SLCODE, ACCTCODE } = req.body;

    // Ensure SLDOCNO is a string and not empty
    if (typeof SLDOCNO !== "string" || SLDOCNO.trim() === "") {
      return res
        .status(400)
        .json({ message: "SLDOCNO must be a non-empty string." });
    }

    let pipeline = [
      {
        $match: {
          $or: [{ DVNo: SLDOCNO }, { CRNo: SLDOCNO }, { JVNo: SLDOCNO }],
        },
      },
      { $unwind: "$ledgers" }, // Unwind the ledger array
      {
        $match: {
          // Match only the specific ledger entry
          "ledgers.subledger.slCode": SLCODE,
          "ledgers.ledger.code": ACCTCODE,
        },
      },
      {
        $project: {
          _id: 1,
          EntryType: 1,
          PaymentEntity: 1,
          SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          SLDOCNO: {
            $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }],
          },
          SLDESC: "$Particulars",
          CheckNo: { $ifNull: ["$CheckNo", 0] },
          SLCODE: "$ledgers.subledger.slCode",
          ACCTCODE: "$ledgers.ledger.code",
          ACCOUNTNAME: "$ledgers.ledger.name",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
          isUnrecorded: { $ifNull: ["$isOutstanding", true] },
          isOutstanding: { $ifNull: ["$isOutstanding", false] },
          isReconciled: { $ifNull: ["$isReconciled", false] },
          clearedAmount: {
            $cond: {
              if: { $eq: ["$isReconciled", true] },
              then: { $ifNull: ["$SLDEBIT", "$SLCREDIT"] },
              else: 0,
            },
          },
        },
      },
      { $sort: { SLDATE: 1 } },
    ];

    let transactions = await EntriesModel.aggregate(pipeline).exec();

    return res.status(200).json({
      length: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error in getUnRecordedTransaction:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// const getUnRecordedTransaction = async (req, res) => {
//   try {
//     const { SLDOCNO, SLCODE, ACCTCODE } = req.body;

//     if (typeof SLDOCNO !== "string" || SLDOCNO.trim() === "") {
//       return res
//         .status(400)
//         .json({ message: "SLDOCNO must be a non-empty string." });
//     }

//     const existingUnrecorded = await BankReconModel.countDocuments({
//       "transactions.SLDOCNO": SLDOCNO,
//       "transactions.isUnrecorded": true,
//     });

//     if (existingUnrecorded > 0) {
//       return res.status(400).json({
//         message:
//           "An unrecorded transaction already exists for this SLDOCNO in BankReconModel.",
//       });
//     }

//     let pipeline = [
//       {
//         $match: {
//           $or: [{ DVNo: SLDOCNO }, { CRNo: SLDOCNO }, { JVNo: SLDOCNO }],
//         },
//       },
//       { $unwind: "$ledgers" },
//       {
//         $match: {
//           "ledgers.subledger.slCode": SLCODE,
//           "ledgers.ledger.code": ACCTCODE,
//         },
//       },
//       {
//         $lookup: {
//           from: "bankreconmodels",
//           let: { docNo: "$SLDOCNO" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $or: [{ $in: ["$$docNo", "$transactions.SLDOCNO"] }],
//                 },
//                 "transactions.isUnrecorded": true,
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 "transactions.SLDOCNO": 1,
//                 "transactions.isUnrecorded": 1,
//               },
//             },
//           ],
//           as: "existingRecon",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           EntryType: 1,
//           PaymentEntity: 1,
//           SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
//           SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
//           SLDESC: "$Particulars",
//           CheckNo: { $ifNull: ["$CheckNo", 0] },
//           SLCODE: "$ledgers.subledger.slCode",
//           ACCTCODE: "$ledgers.ledger.code",
//           ACCOUNTNAME: "$ledgers.ledger.name",
//           SLDEBIT: "$ledgers.dr",
//           SLCREDIT: "$ledgers.cr",
//           isUnrecorded: { $ifNull: ["$isOutstanding", true] },
//           isOutstanding: { $ifNull: ["$isOutstanding", false] },
//           isReconciled: { $ifNull: ["$isReconciled", false] },
//           clearedAmount: {
//             $cond: {
//               if: { $eq: ["$isReconciled", true] },
//               then: { $ifNull: ["$SLDEBIT", "$SLCREDIT"] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $match: { alreadyExists: false } }, // Filter out if it already exists
//       { $sort: { SLDATE: 1 } },
//     ];

//     let transactions = await EntriesModel.aggregate(pipeline).exec();

//     return res.status(200).json({
//       length: transactions.length,
//       transactions,
//     });
//   } catch (error) {
//     console.error("Error in getUnRecordedTransaction:", error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };

const getOutstandingById = async (req, res) => {
  try {
    const { id } = req.params;

    const matchCondition = {};
    if (id) {
      matchCondition._id = new mongoose.Types.ObjectId(id);
    }

    const transactions = await BankReconModel.aggregate([
      { $match: matchCondition },
      {
        $project: {
          bankStatement: 1,
          transactions: {
            $filter: {
              input: "$transactions",
              as: "transaction",
              cond: {
                $and: [
                  { $eq: ["$$transaction.isOutstanding", true] },
                  { $eq: ["$$transaction.isReconciled", false] }, // Ensure isReconciled is false
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$transactions",
      },
      { $unwind: "$bankStatement" },
      {
        $group: {
          _id: null,
          endDate: { $first: "$bankStatement.endDate" },
          totalSLDEBIT: { $sum: "$transactions.SLDEBIT" },
          totalSLCREDIT: { $sum: "$transactions.SLCREDIT" },
          transactions: { $push: "$transactions" },
        },
      },
    ]);

    return res.status(200).json(
      transactions.length
        ? {
            endDate: transactions[0].endDate,
            transactions: transactions[0].transactions,
            totalSLDEBIT: transactions[0].totalSLDEBIT || 0,
            totalSLCREDIT: transactions[0].totalSLCREDIT || 0,
          }
        : { endDate: null, transactions: [], totalSLDEBIT: 0, totalSLCREDIT: 0 }
    );
  } catch (error) {
    console.error("Error fetching outstanding transactions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUnrecordedById = async (req, res) => {
  try {
    const { id } = req.params;

    const matchCondition = {};
    if (id) {
      matchCondition._id = new mongoose.Types.ObjectId(id);
    }

    const transactions = await BankReconModel.aggregate([
      { $match: matchCondition },
      {
        $project: {
          bankStatement: 1,
          transactions: {
            $filter: {
              input: "$transactions",
              as: "transaction",
              cond: { $eq: ["$$transaction.isUnrecorded", true] },
            },
          },
        },
      },
      { $unwind: "$transactions" },
      { $unwind: "$bankStatement" },
      {
        $group: {
          _id: null,
          endDate: { $first: "$bankStatement.endDate" },
          totalSLDEBIT: { $sum: "$transactions.SLDEBIT" },
          totalSLCREDIT: { $sum: "$transactions.SLCREDIT" },
          transactions: { $push: "$transactions" },
        },
      },
    ]);

    return res.status(200).json(
      transactions.length
        ? {
            endDate: transactions[0].endDate,
            transactions: transactions[0].transactions,
            totalSLDEBIT: transactions[0].totalSLDEBIT || 0,
            totalSLCREDIT: transactions[0].totalSLCREDIT || 0,
          }
        : { endDate: null, transactions: [], totalSLDEBIT: 0, totalSLCREDIT: 0 }
    );
  } catch (error) {
    console.error("Error fetching unrecorded transactions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createBankReconciliation = async (req, res) => {
  try {
    if (Array.isArray(req.body.transactions)) {
      req.body.transactions = req.body.transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id
          ? new mongoose.Types.ObjectId(transaction._id)
          : new mongoose.Types.ObjectId(),
        SLDATE: transaction.SLDATE ? new Date(transaction.SLDATE) : null,
      }));
    }

    // Ensure bankStatement exists before modifying
    if (req.body.bankStatement) {
      const bankStatement = req.body.bankStatement;

      // Ensure values are numbers before formatting
      bankStatement.lastBalance = Number(bankStatement.lastBalance) || 0;
      bankStatement.endingBalance = Number(bankStatement.endingBalance) || 0;
      bankStatement.clearedBalance = Number(bankStatement.clearedBalance) || 0;
      bankStatement.difference = Number(bankStatement.difference) || 0;

      // Fix to 2 decimal places
      bankStatement.lastBalance = parseFloat(
        bankStatement.lastBalance.toFixed(2)
      );
      bankStatement.endingBalance = parseFloat(
        bankStatement.endingBalance.toFixed(2)
      );
      bankStatement.clearedBalance = parseFloat(
        bankStatement.clearedBalance.toFixed(2)
      );
      bankStatement.difference = parseFloat(
        bankStatement.difference.toFixed(2)
      );
    }

    // Save the bank reconciliation document
    const newBankRecon = new BankReconModel(req.body);
    await newBankRecon.save();

    return res.status(201).json({
      message: "Bank Reconciliation created successfully",
      bankReconciliation: newBankRecon,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const updateBankReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (Array.isArray(req.body.transactions)) {
      req.body.transactions = req.body.transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id
          ? new mongoose.Types.ObjectId(transaction._id)
          : new mongoose.Types.ObjectId(),
        SLDATE: transaction.SLDATE ? new Date(transaction.SLDATE) : null,
      }));
    }

    // Ensure bankStatement exists before modifying
    if (req.body.bankStatement) {
      const bankStatement = req.body.bankStatement;

      // Ensure values are numbers before formatting
      bankStatement.lastBalance = Number(bankStatement.lastBalance) || 0;
      bankStatement.endingBalance = Number(bankStatement.endingBalance) || 0;
      bankStatement.clearedBalance = Number(bankStatement.clearedBalance) || 0;
      bankStatement.difference = Number(bankStatement.difference) || 0;

      // Fix to 2 decimal places
      bankStatement.lastBalance = parseFloat(
        bankStatement.lastBalance.toFixed(2)
      );
      bankStatement.endingBalance = parseFloat(
        bankStatement.endingBalance.toFixed(2)
      );
      bankStatement.clearedBalance = parseFloat(
        bankStatement.clearedBalance.toFixed(2)
      );
      bankStatement.difference = parseFloat(
        bankStatement.difference.toFixed(2)
      );
    }

    const bankReconciliation = await BankReconModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true, // Return the updated document
      }
    );

    if (!bankReconciliation) {
      return res.status(404).json({ message: "Bank Reconciliation not found" });
    }

    return res.status(200).json({
      message: "Bank Reconciliation updated successfully",
      bankReconciliation,
    });
  } catch (error) {
    console.error("Error in updateBankReconciliation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const deleteBankReconciliation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBankRecon = await BankReconModel.findByIdAndDelete(id);

    if (!deletedBankRecon) {
      return res.status(404).json({ message: "Bank Reconciliation not found" });
    }

    return res.status(200).json({
      message: "Bank Reconciliation deleted successfully",
      deletedBankRecon,
    });
  } catch (error) {
    console.error("Error in deleteBankReconciliation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getAllBankReconciliation = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      ...(keyword && {
        $or: [{ statementNo: { $regex: keyword, $options: "i" } }],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
    const totalItems = await BankReconModel.countDocuments(query);
    const bankReconList = await BankReconModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      bankReconciliation: bankReconList,
    });
  } catch (error) {
    console.error("Error in getAllBankReconciliation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getBookBeginingBalance = async (req, res) => {
  try {
    const { endDate, SLCODE, ACCTCODE } = req.body;

    if (!endDate) {
      return res.status(400).json({ message: "endDate is required" });
    }

    // Calculate beginning balance date (one month before endDate)
    const beginDate = moment(endDate).subtract(1, "months").endOf("month");

    const ledgerFilter = {};
    if (SLCODE) ledgerFilter["ledgers.subledger.slCode"] = SLCODE;
    if (ACCTCODE) ledgerFilter["ledgers.ledger.code"] = ACCTCODE;

    let pipeline = [];

    pipeline.push({
      $match: {
        $or: [
          { DVDate: { $lte: beginDate.toDate() } },
          { CRDate: { $lte: beginDate.toDate() } },
          { JVDate: { $lte: beginDate.toDate() } },
        ],
      },
    });

    pipeline.push(
      { $unwind: "$ledgers" },
      ...(Object.keys(ledgerFilter).length > 0
        ? [{ $match: ledgerFilter }]
        : []),
      {
        $project: {
          _id: 1,
          EntryType: 1,
          SLDATE: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          SLDOCNO: { $ifNull: ["$DVNo", { $ifNull: ["$CRNo", "$JVNo"] }] },
          SLCODE: "$ledgers.subledger.slCode",
          ACCTCODE: "$ledgers.ledger.code",
          ACCOUNTNAME: "$ledgers.ledger.name",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
        },
      }
    );

    pipeline.push({
      $group: {
        _id: null,
        totalSLDEBIT: { $sum: "$SLDEBIT" },
        totalSLCREDIT: { $sum: "$SLCREDIT" },
      },
    });

    // Compute bookBeginningBalance
    pipeline.push({
      $project: {
        _id: 0,
        totalSLDEBIT: 1,
        totalSLCREDIT: 1,
        bookBeginningBalance: { $subtract: ["$totalSLDEBIT", "$totalSLCREDIT"] },
      },
    });

    let result = await EntriesModel.aggregate(pipeline).exec();

    return res.json({
      success: true,
      data: result.length > 0 ? result[0] : { totalSLDEBIT: 0, totalSLCREDIT: 0, bookBeginningBalance: 0 },
    });

  } catch (error) {
    console.error("Error in getBookBeginingBalance:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

module.exports = {
  getTransaction,
  createBankReconciliation,
  updateBankReconciliation,
  deleteBankReconciliation,
  getAllBankReconciliation,
  getUnRecordedTransaction,
  getOutstandingById,
  getUnrecordedById,
  getBookEndingBalance,
  getBookBeginingBalance
};
