const BudgetTrackModel = require("../models/BudgetTrackModel");
const mongoose = require("mongoose");
const Account = require("../models/AccountModel");
const EntriesModel = require("../models/EntriesModel");
const BudgetTemplateModel = require("../models/BudgetTemplateModel");

const postBudgetTrack = async (req, res) => {
  try {
    const {
      TotalBudget,
      Funds,
      WorkGroup,
      startDate,
      endDate,
      PreparedBy,
      Description,
    } = req.body;

    const TotalUnutilized = req.body.TotalUnutilized || TotalBudget;

    // Iterate over each fund in the Funds array
    Funds.forEach((fund) => {
      // Set UnutilizedAmount to FundsBudget if not provided
      if (fund.UnutilizedAmount === undefined) {
        fund.UnutilizedAmount = fund.FundsBudget;
      }

      // Iterate over each category in the Category array of the fund
      fund.Category.forEach((category) => {
        category.CurrentBalance = category.CategoryBudget;
      });
    });

    const budgetTrack = new BudgetTrackModel({
      TotalBudget,
      TotalUnutilized,
      Funds,
      WorkGroup,
      startDate,
      endDate,
      PreparedBy,
      Description,
    });

    await budgetTrack.save();

    return res.status(201).json({
      message: "Budget data saved successfully!",
      savedData: req.body,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const patchBudgetTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const budgetTrackData = req.body;

    const budgetTrack = await BudgetTrackModel.findByIdAndUpdate(
      id,
      { $set: budgetTrackData },
      { new: true }
    );

    if (!budgetTrack) {
      return res.status(404).json({ message: "Budget track not found" });
    }

    return res.status(200).json({
      message: "Budget data updated successfully!",
      updatedData: budgetTrack,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// get budget track all old
// const getAllBudgetTrack = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const keyword = req.query.keyword || "";
//     const sortBy = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
//     const date = req.query.date;

//     const query = {
//       ...(keyword && {
//         $or: [
//           { WorkGroup: { $regex: keyword, $options: "i" } },
//           { FundsName: { $regex: keyword, $options: "i" } },
//           { CategoryName: { $regex: keyword, $options: "i" } },
//         ],
//       }),
//       ...(date && {
//         createdAt: {
//           $gte: new Date(`${date}T00:00:00.000Z`),
//           $lt: new Date(`${date}T23:59:59.999Z`),
//         },
//       }),
//     };

//     const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
//     const totalItems = await BudgetTrackModel.countDocuments(query);
//     const budgets = await BudgetTrackModel.find(query)
//       .sort(sortCriteria)
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.json({
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//       budgets,
//     });
//   } catch (error) {
//     console.error("Error fetching budgets:", error);
//     return res.status(500).json({ message: "internal server error" });
//   }
// };


const getAllBudgetTrack = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      ...(keyword && {
        $or: [
          { WorkGroup: { $regex: keyword, $options: "i" } },
          { FundsName: { $regex: keyword, $options: "i" } },
          { CategoryName: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
    const totalItems = await BudgetTrackModel.countDocuments(query);
    const budgets = await BudgetTrackModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    // Loop through each budget and fix the Current Balance issue
    for (const budget of budgets) {
      let totalAllocated = 0;
      let totalExpense = 0;

      // Process each fund and category inside the budget
      for (const fund of budget.Funds) {
        if (fund.FundsBudget === 0 && fund.UnutilizedAmount === 0) continue;
        if (fund.Category.length === 0) continue;

        let fundAllocated = 0;
        let fundExpense = 0;

        for (const category of fund.Category) {
          // Assuming you have ledger data processed and saved in the result variable
          const ledgerResult = await EntriesModel.aggregate([
            { $unwind: "$ledgers" },
            {
              $match: {
                "ledgers.subledger.slCode": budget.WorkGroup.code,
                "ledgers.ledger.code": category.CategoryCode,
                $or: [
                  { JVDate: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) } },
                  { CRDate: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) } },
                  { DVDate: { $gte: new Date(budget.startDate), $lte: new Date(budget.endDate) } },
                ],
              },
            },
            {
              $group: {
                _id: "$ledgers.ledger.code",
                total_dr: { $sum: "$ledgers.dr" },
              },
            },
          ]);

          const totalDr = ledgerResult.length > 0 ? ledgerResult[0].total_dr : 0;
          let categoryBudget = category.CategoryBudget || 0;
          let categoryActual = totalDr || 0;

          // 🚀 FIX: Ensure categoryActual is absolute and doesn't cause negative calculations
          categoryActual = Math.abs(categoryActual);

          const categoryPercentage =
            categoryBudget !== 0 ? (categoryActual / categoryBudget) * 100 : 0;

          // 🚀 FIX: Proper calculation of current balance
          const currentBalance = Math.max(0, categoryBudget - categoryActual);

          category.CategoryActual = categoryActual;
          category.CategoryPercentage = categoryPercentage;
          category.CurrentBalance = currentBalance;

          fundAllocated += categoryBudget;
          fundExpense += categoryActual;
        }

        fund.FundsAllocated = fundAllocated;
        fund.FundsExpense = fundExpense;
        fund.FundsPercentage =
          fund.FundsBudget !== 0 ? (fund.FundsExpense / fund.FundsBudget) * 100 : 0;
        fund.UnutilizedAmount =
          fund.FundsBudget !== 0 ? Math.max(0, fund.FundsBudget - fund.FundsExpense) : 0;

        totalAllocated += fund.FundsBudget;
        totalExpense += fundExpense;
      }

      budget.TotalAllocated = totalAllocated;
      budget.TotalExpense = totalExpense;
      budget.TotalPercentage =
        budget.TotalBudget !== 0 ? (totalExpense / budget.TotalBudget) * 100 : 0;
      budget.TotalUnutilized = Math.max(0, budget.TotalBudget - totalExpense);

      budget.updatedAt = new Date();
    }

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      budgets,
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//old
// const monitorBudgeTrack = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const budgetTrack = await BudgetTrackModel.findById(id);
//     if (!budgetTrack) {
//       return res.status(404).json({ message: "BudgetTrack not found" });
//     }

//     const { startDate, endDate } = budgetTrack;
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     const result = await EntriesModel.aggregate([
//       {
//         $unwind: "$ledgers",
//       },
//       {
//         $match: {
//           "ledgers.subledger.slCode": budgetTrack.WorkGroup.code,
//           "ledgers.ledger.code": {
//             $in: [
//               ...budgetTrack.Funds.flatMap((fund) =>
//                 fund.Category.map((category) => category.CategoryCode)
//               ),
//               ...budgetTrack.Funds.map((fund) => fund.FundsCode),
//             ],
//           },
//           $or: [
//             {
//               JVDate: { $gte: start, $lte: end },
//             },
//             {
//               CRDate: { $gte: start, $lte: end },
//             },
//             {
//               DVDate: { $gte: start, $lte: end },
//             },
//           ],
//         },
//       },
//       {
//         $group: {
//           _id: "$ledgers.ledger.code",
//           total_dr: { $sum: "$ledgers.dr" },
//         },
//       },
//     ]);

//     console.log("Aggregation Result:", result);
//     console.log("Number of matched entries:", result.length);

//     let totalAllocated = 0;
//     for (const fund of budgetTrack.Funds) {
//       if (fund.FundsBudget === 0 && fund.UnutilizedAmount === 0) {
//         continue;
//       }
//       if (fund.Category.length === 0) {
//         continue;
//       }

//       let fundAllocated = 0;

//       for (const category of fund.Category) {
//         const ledgerResult = result.find(
//           (r) => r._id === category.CategoryCode
//         );
//         if (ledgerResult) {
//           const totalDr = ledgerResult.total_dr;

//           let categoryBudget = category.CategoryBudget;
//           let categoryActual = totalDr;

//           if (categoryBudget === 0) {
//             categoryActual = totalDr;
//           }

//           const categoryPercentage =
//             categoryBudget !== 0 ? (categoryActual / categoryBudget) * 100 : 0;
//           const currentBalance =
//             categoryBudget === 0 ? 0 : categoryBudget - categoryActual;

//           category.CategoryActual = categoryActual;
//           category.CategoryPercentage = categoryPercentage;
//           category.CurrentBalance = currentBalance;

//           fundAllocated += categoryActual;
//         }
//       }

//       fund.FundsAllocated = fundAllocated;
//       fund.FundsPercentage =
//         fund.FundsBudget !== 0
//           ? (fund.FundsAllocated / fund.FundsBudget) * 100
//           : 0;
//       fund.UnutilizedAmount =
//         fund.FundsBudget === 0 ? 0 : fund.FundsBudget - fund.FundsAllocated;

//       totalAllocated += fundAllocated;
//     }

//     budgetTrack.TotalAllocated = totalAllocated;
//     budgetTrack.TotalPercentage =
//       budgetTrack.TotalBudget !== 0
//         ? (totalAllocated / budgetTrack.TotalBudget) * 100
//         : 0;
//     budgetTrack.TotalUnutilized = budgetTrack.TotalBudget - totalAllocated;

//     await budgetTrack.save();

//     return res
//       .status(200)
//       .json({ message: "BudgetTrack updated successfully", data: budgetTrack });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };

// const monitorBudgetTrack = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const budgetTrack = await BudgetTrackModel.findById(id);
//     if (!budgetTrack) {
//       return res.status(404).json({ message: "BudgetTrack not found" });
//     }

//     const { startDate, endDate } = budgetTrack;
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     const result = await EntriesModel.aggregate([
//       {
//         $unwind: "$ledgers",
//       },
//       {
//         $match: {
//           "ledgers.subledger.slCode": budgetTrack.WorkGroup.code,
//           "ledgers.ledger.code": {
//             $in: [
//               ...budgetTrack.Funds.flatMap((fund) =>
//                 fund.Category.map((category) => category.CategoryCode)
//               ),
//               ...budgetTrack.Funds.map((fund) => fund.FundsCode),
//             ],
//           },
//           $or: [
//             {
//               JVDate: { $gte: start, $lte: end },
//             },
//             {
//               CRDate: { $gte: start, $lte: end },
//             },
//             {
//               DVDate: { $gte: start, $lte: end },
//             },
//           ],
//         },
//       },
//       {
//         $group: {
//           _id: "$ledgers.ledger.code",
//           total_dr: { $sum: "$ledgers.dr" },
//         },
//       },
//     ]);

//     let totalAllocated = 0;
//     let totalExpense = 0;

//     for (const fund of budgetTrack.Funds) {
//       if (fund.FundsBudget === 0 && fund.UnutilizedAmount === 0) {
//         continue;
//       }
//       if (fund.Category.length === 0) {
//         continue;
//       }

//       let fundAllocated = 0;
//       let fundExpense = 0;

//       for (const category of fund.Category) {
//         const ledgerResult = result.find(
//           (r) => r._id === category.CategoryCode
//         );
//         if (ledgerResult) {
//           const totalDr = ledgerResult.total_dr;

//           let categoryBudget = category.CategoryBudget;
//           let categoryActual = totalDr;

//           if (categoryBudget === 0) {
//             categoryActual = totalDr;
//           }

//           const categoryPercentage =
//             categoryBudget !== 0 ? (categoryActual / categoryBudget) * 100 : 0;
//           const currentBalance = categoryBudget - categoryActual;

//           category.CategoryActual = categoryActual;
//           category.CategoryPercentage = categoryPercentage;
//           category.CurrentBalance = currentBalance;

//           fundAllocated += categoryBudget;
//           fundExpense += categoryActual;
//         }
//       }

//       fund.FundsAllocated = fundAllocated;
//       fund.FundsExpense = fundExpense;
//       fund.FundsPercentage =
//         fund.FundsBudget !== 0
//           ? (fund.FundsAllocated / fund.FundsBudget) * 100
//           : 0;
//       fund.UnutilizedAmount =
//         fund.FundsBudget === 0 ? 0 : fund.FundsBudget - fund.FundsAllocated;

//       totalAllocated += fund.FundsBudget;
//       totalExpense += fundExpense;
//     }

//     budgetTrack.TotalAllocated = totalAllocated;
//     budgetTrack.TotalExpense = totalExpense;
//     budgetTrack.TotalPercentage =
//       budgetTrack.TotalBudget !== 0
//         ? (totalExpense / budgetTrack.TotalBudget) * 100
//         : 0;
//     budgetTrack.TotalUnutilized = budgetTrack.TotalBudget - totalExpense;

//     budgetTrack.updatedAt = new Date();
//     await budgetTrack.save();

//     return res
//       .status(200)
//       .json({ message: "BudgetTrack updated successfully", data: budgetTrack });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };

const monitorBudgetTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const budgetTrack = await BudgetTrackModel.findById(id);
    if (!budgetTrack) {
      return res.status(404).json({ message: "BudgetTrack not found" });
    }

    const { startDate, endDate } = budgetTrack;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Fetch ledger entries from MongoDB
    const result = await EntriesModel.aggregate([
      { $unwind: "$ledgers" },
      {
        $match: {
          "ledgers.subledger.slCode": budgetTrack.WorkGroup.code,
          "ledgers.ledger.code": {
            $in: [
              ...budgetTrack.Funds.flatMap((fund) =>
                fund.Category.map((category) => category.CategoryCode)
              ),
              ...budgetTrack.Funds.map((fund) => fund.FundsCode),
            ],
          },
          $or: [
            { JVDate: { $gte: start, $lte: end } },
            { CRDate: { $gte: start, $lte: end } },
            { DVDate: { $gte: start, $lte: end } },
          ],
        },
      },
      {
        $group: {
          _id: "$ledgers.ledger.code",
          total_dr: { $sum: "$ledgers.dr" },
        },
      },
    ]);

    let totalAllocated = 0;
    let totalExpense = 0;

    for (const fund of budgetTrack.Funds) {
      if (fund.FundsBudget === 0 && fund.UnutilizedAmount === 0) continue;
      if (fund.Category.length === 0) continue;

      let fundAllocated = 0;
      let fundExpense = 0;

      for (const category of fund.Category) {
        const ledgerResult = result.find((r) => r._id === category.CategoryCode);
        const totalDr = ledgerResult ? ledgerResult.total_dr : 0;

        let categoryBudget = category.CategoryBudget || 0;
        let categoryActual = totalDr || 0;

        // 🚀 FIX: Ensure categoryActual is absolute and doesn't cause negative calculations
        categoryActual = Math.abs(categoryActual);  

        const categoryPercentage =
          categoryBudget !== 0 ? (categoryActual / categoryBudget) * 100 : 0;

        // 🚀 FIX: Proper calculation of current balance
        const currentBalance = Math.max(0, categoryBudget - categoryActual);

        category.CategoryActual = categoryActual;
        category.CategoryPercentage = categoryPercentage;
        category.CurrentBalance = currentBalance;

        fundAllocated += categoryBudget;
        fundExpense += categoryActual;
      }

      fund.FundsAllocated = fundAllocated;
      fund.FundsExpense = fundExpense;
      fund.FundsPercentage =
        fund.FundsBudget !== 0 ? (fund.FundsExpense / fund.FundsBudget) * 100 : 0;
      fund.UnutilizedAmount =
        fund.FundsBudget !== 0 ? Math.max(0, fund.FundsBudget - fund.FundsExpense) : 0;

      totalAllocated += fund.FundsBudget;
      totalExpense += fundExpense;
    }

    budgetTrack.TotalAllocated = totalAllocated;
    budgetTrack.TotalExpense = totalExpense;
    budgetTrack.TotalPercentage =
      budgetTrack.TotalBudget !== 0
        ? (totalExpense / budgetTrack.TotalBudget) * 100
        : 0;
    budgetTrack.TotalUnutilized = Math.max(0, budgetTrack.TotalBudget - totalExpense);

    budgetTrack.updatedAt = new Date();
    await budgetTrack.save();

    console.log({
      TotalAllocated: budgetTrack.TotalAllocated,
      TotalExpense: budgetTrack.TotalExpense,
      TotalPercentage: budgetTrack.TotalPercentage,
      TotalUnutilized: budgetTrack.TotalUnutilized,
    });

    return res.status(200).json({
      message: "BudgetTrack updated successfully",
      data: budgetTrack,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};



const deleteBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    const Budget = await BudgetTrackModel.findByIdAndDelete(id);
    if (!Budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    return res.status(200).json({ message: "Budget successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const getAllBudgetTemplate = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      ...(keyword && {
        $or: [{ FundsName: { $regex: keyword, $options: "i" } }],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
    const totalItems = await BudgetTemplateModel.countDocuments(query);
    const BudgetTemplate = await BudgetTemplateModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      BudgetTemplate,
    });
  } catch (error) {
    console.error("Error fetching Budget Template:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

module.exports = {
  postBudgetTrack,
  patchBudgetTrack,
  monitorBudgetTrack,
  getAllBudgetTrack,
  deleteBudgetById,
  getAllBudgetTemplate,
};
