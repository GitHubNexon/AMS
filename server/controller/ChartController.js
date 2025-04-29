const EntriesModel = require("../models/EntriesModel");
const Account = require("../models/AccountModel");

const getAccountsReceivableChart = async (req, res) => {
  try {
    const Data = await EntriesModel.aggregate([
      { $unwind: "$ledgers" },
      {
        $project: {
          ledgerCode: { $substr: ["$ledgers.ledger.code", 0, 1] },
          amount: {
            $subtract: [
              { $ifNull: ["$ledgers.cr", 0] },
              { $ifNull: ["$ledgers.dr", 0] },
            ],
          },
          date: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          referenceNo: { $ifNull: ["$DVNo", { $ifNull: ["$JVNo", "$CRNo"] }] },
        },
      },
      {
        $group: {
          _id: "$ledgerCode",
          totalAmount: { $sum: "$amount" },
          details: {
            $push: {
              date: "$date",
              referenceNo: "$referenceNo",
              amount: "$amount",
            },
          },
        },
      },
    ]);

    // Process results
    let totalSales = 0;
    let totalIncome = 0;
    let salesDetails = [];
    let incomeDetails = [];

    Data.forEach((item) => {
      if (item._id === "4") {
        totalSales = item.totalAmount;
        salesDetails = item.details.filter((detail) => detail.amount !== 0);
      } else if (item._id === "1") {
        totalIncome = item.totalAmount;
        incomeDetails = item.details.filter((detail) => detail.amount !== 0);
      }
    });

    res.json({
      totalSales,
      totalIncome,
      salesDetails,
      incomeDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccountsPayableChart = async (req, res) => {
  try {
    const Data = await EntriesModel.aggregate([
      { $unwind: "$ledgers" },
      {
        $project: {
          ledgerCode: { $substr: ["$ledgers.ledger.code", 0, 1] },
          amount: {
            $subtract: [
              { $ifNull: ["$ledgers.cr", 0] },
              { $ifNull: ["$ledgers.dr", 0] },
            ],
          },
          date: { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", "$JVDate"] }] },
          referenceNo: { $ifNull: ["$DVNo", { $ifNull: ["$JVNo", "$CRNo"] }] },
        },
      },
      {
        $group: {
          _id: "$ledgerCode",
          totalAmount: { $sum: "$amount" },
          details: {
            $push: {
              date: "$date",
              referenceNo: "$referenceNo",
              amount: "$amount",
            },
          },
        },
      },
    ]);

    // Process results
    let totalExpense = 0;
    let totalLiabilities = 0;
    let ExpenseDetails = [];
    let LiabilitiesDetails = [];

    Data.forEach((item) => {
      if (item._id === "5") {
        totalExpense = item.totalAmount;
        ExpenseDetails = item.details.filter((detail) => detail.amount !== 0);
      } else if (item._id === "2") {
        totalLiabilities = item.totalAmount;
        LiabilitiesDetails = item.details.filter(
          (detail) => detail.amount !== 0
        );
      }
    });

    res.json({
      totalExpense,
      totalLiabilities,
      ExpenseDetails,
      LiabilitiesDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccountsReceivableChart,
  getAccountsPayableChart,
};
