const BudgetTrackModel = require("../models/BudgetTrackModel");
const mongoose = require("mongoose");
const Account = require("../models/AccountModel");
const EntriesModel = require("../models/EntriesModel");

const getWorkGroupBudget = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { workGroupCodes, categoryCodes } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    if (
      !categoryCodes ||
      !Array.isArray(categoryCodes) ||
      categoryCodes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid body parameter: categoryCodes" });
    }

    if (
      !workGroupCodes ||
      !Array.isArray(workGroupCodes) ||
      workGroupCodes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid body parameter: workGroupCodes" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const result = await BudgetTrackModel.aggregate([
      {
        $match: {
          updatedAt: { $gte: start, $lte: end },
          "WorkGroup.code": { $in: workGroupCodes },
        },
      },
      {
        $unwind: "$Funds",
      },
      {
        $unwind: "$Funds.Category",
      },
      {
        $match: {
          "Funds.Category.CategoryCode": { $in: categoryCodes },
        },
      },
      {
        $project: {
          "Funds.Category.CategoryCode": 1,
          "Funds.Category.CategoryBudget": {
            $toDouble: "$Funds.Category.CategoryBudget",
          },
          "Funds.Category.CategoryActual": {
            $toDouble: "$Funds.Category.CategoryActual",
          },
          "Funds.Category.CurrentBalance": {
            $toDouble: "$Funds.Category.CurrentBalance",
          },
          "Funds.Category.CategoryPercentage": {
            $cond: {
              if: { $eq: ["$Funds.Category.CategoryBudget", 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      "$Funds.Category.CategoryActual",
                      "$Funds.Category.CategoryBudget",
                    ],
                  },
                  100,
                ],
              },
            },
          },
          WorkGroup: 1,
        },
      },
      {
        $group: {
          _id: "$WorkGroup.code",
          CategoryBudgetTotal: { $sum: "$Funds.Category.CategoryBudget" },
          CategoryActualTotal: { $sum: "$Funds.Category.CategoryActual" },
          CurrentBalanceTotal: { $sum: "$Funds.Category.CurrentBalance" },
          CategoryPercentageTotal: {
            $avg: "$Funds.Category.CategoryPercentage",
          },
          WorkGroup: { $first: "$WorkGroup" },
        },
      },
      {
        $project: {
          _id: 1,
          WorkGroup: 1,
          TotalBudget: { $round: ["$CategoryBudgetTotal", 2] },
          TotalActual: { $round: ["$CategoryActualTotal", 2] },
          TotalCurrentBalance: { $round: ["$CurrentBalanceTotal", 2] },
          AverageCategoryPercentage: {
            $cond: {
              if: { $eq: ["$CategoryBudgetTotal", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$CategoryActualTotal", "$CategoryBudgetTotal"] },
                  100,
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          reports: {
            $push: {
              _id: "$_id",
              WorkGroup: "$WorkGroup",
              TotalBudget: "$TotalBudget",
              TotalActual: "$TotalActual",
              TotalCurrentBalance: "$TotalCurrentBalance",
              AverageCategoryPercentage: "$AverageCategoryPercentage",
            },
          },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching workgroup budget" });
  }
};

const getUtilizationReport = async (req, res) => {
  try {
    const { startDate, endDate, workGroupCode } = req.query;
    const { categoryCodes } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required query parameters: startDate and endDate",
      });
    }

    if (
      !workGroupCode ||
      typeof workGroupCode !== "string" ||
      workGroupCode.trim() === ""
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid query parameter: workGroupCode" });
    }

    if (
      !categoryCodes ||
      !Array.isArray(categoryCodes) ||
      categoryCodes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid body parameter: categoryCodes" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const result = await BudgetTrackModel.aggregate([
      {
        $match: {
          "WorkGroup.code": workGroupCode,
          updatedAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: "$Funds",
      },
      {
        $unwind: "$Funds.Category",
      },
      {
        $match: {
          "Funds.Category.CategoryCode": { $in: categoryCodes },
        },
      },
      {
        $group: {
          _id: {
            workGroupCode: "$WorkGroup.code",
            fundsCode: "$Funds.FundsCode",
            categoryCode: "$Funds.Category.CategoryCode",
            fundsName: "$Funds.FundsName",
            categoryName: "$Funds.Category.CategoryName",
          },
          totalBudget: { $sum: "$Funds.Category.CategoryBudget" },
          totalAllocated: { $sum: "$Funds.Category.CategoryActual" },
          totalUnutilized: { $sum: "$Funds.Category.CurrentBalance" },
        },
      },
      {
        $group: {
          _id: "$_id.workGroupCode",
          totalBudget: { $sum: "$totalBudget" },
          totalAllocated: { $sum: "$totalAllocated" },
          totalUnutilized: { $sum: "$totalUnutilized" },
          funds: {
            $push: {
              fundsName: "$_id.fundsName",
              categoryCode: "$_id.categoryCode",
              categoryName: "$_id.categoryName",
              totalBudget: "$totalBudget",
              totalAllocated: "$totalAllocated",
              totalUnutilized: "$totalUnutilized",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          workGroupCode: "$_id",
          totalBudget: 1,
          totalAllocated: 1,
          totalUnutilized: 1,
          funds: 1,
          totalPercentage: {
            $cond: {
              if: { $eq: ["$totalBudget", 0] }, // Prevent division by zero
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$totalUnutilized", "$totalBudget"] },
                  100,
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          reports: {
            $push: {
              workGroupCode: "$workGroupCode",
              totalBudget: "$totalBudget",
              totalAllocated: "$totalAllocated",
              totalUnutilized: "$totalUnutilized",
              totalPercentage: "$totalPercentage",
              funds: "$funds",
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the specified criteria" });
    }

    // Now process the reports to aggregate the categories under each fund
    result[0].reports.forEach((report) => {
      report.funds = report.funds.reduce((acc, fund) => {
        const existingFund = acc.find((f) => f.fundsName === fund.fundsName);
        if (existingFund) {
          existingFund.categories.push({
            categoryCode: fund.categoryCode,
            categoryName: fund.categoryName,
            totalBudget: fund.totalBudget,
            totalAllocated: fund.totalAllocated,
            totalUnutilized: fund.totalUnutilized,
          });
        } else {
          acc.push({
            fundsName: fund.fundsName,
            categories: [
              {
                categoryCode: fund.categoryCode,
                categoryName: fund.categoryName,
                totalBudget: fund.totalBudget,
                totalAllocated: fund.totalAllocated,
                totalUnutilized: fund.totalUnutilized,
              },
            ],
          });
        }
        return acc;
      }, []);
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching utilization report" });
  }
};

const getPerAccountReport = async (req, res) => {
  try {
    const { startDate, endDate, categoryCodes } = req.query;
    const { workGroupCodes } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required query parameters: startDate and endDate",
      });
    }

    if (
      !workGroupCodes ||
      !Array.isArray(workGroupCodes) ||
      workGroupCodes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid body parameter: workGroupCodes" });
    }

    if (
      !categoryCodes ||
      typeof categoryCodes !== "string" ||
      categoryCodes.trim() === ""
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid query parameter: categoryCodes" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const result = await BudgetTrackModel.aggregate([
      {
        $match: {
          "WorkGroup.code": { $in: workGroupCodes },
          updatedAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$Funds" },
      { $unwind: "$Funds.Category" },
      {
        $match: {
          "Funds.Category.CategoryCode": categoryCodes,
        },
      },
      {
        $group: {
          _id: {
            workGroupCode: "$WorkGroup.code",
            categoryCode: "$Funds.Category.CategoryCode",
          },
          workGroupName: { $first: "$WorkGroup.fullName" },
          categoryName: { $first: "$Funds.Category.CategoryName" },
          totalBudget: { $sum: "$Funds.Category.CategoryBudget" },
          totalActual: { $sum: "$Funds.Category.CategoryActual" },
          totalBalance: { $sum: "$Funds.Category.CurrentBalance" },
        },
      },
      {
        $project: {
          _id: 0,
          workGroupCode: "$_id.workGroupCode",
          categoryCode: "$_id.categoryCode",
          workGroupName: 1,
          categoryName: 1,
          totalBudget: { $round: ["$totalBudget", 2] },
          totalActual: { $round: ["$totalActual", 2] },
          totalBalance: { $round: ["$totalBalance", 2] },
          CategoryPercentage: {
            $cond: {
              if: { $eq: ["$totalBudget", 0] },
              then: 0,
              else: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$totalActual", "$totalBudget"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          reports: {
            $push: {
              workGroupCode: "$workGroupCode",
              categoryCode: "$categoryCode",
              workGroupName: "$workGroupName",
              categoryName: "$categoryName",
              totalBudget: "$totalBudget",
              totalActual: "$totalActual",
              totalBalance: "$totalBalance",
              CategoryPercentage: "$CategoryPercentage",
            },
          },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching per account report" });
  }
};

module.exports = {
  getWorkGroupBudget,
  getUtilizationReport,
  getPerAccountReport,
};
