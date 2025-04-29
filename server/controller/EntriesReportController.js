const EntriesModel = require("../models/EntriesModel");
const userModel = require("../models/userModel");
const XlsxPopulate = require("xlsx-populate");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment");



// const getReportForPayment = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res
//         .status(400)
//         .json({ message: "startDate and endDate are required." });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     // Validate that startDate is not later than endDate
//     if (start > end) {
//       return res
//         .status(400)
//         .json({ message: "startDate cannot be later than endDate." });
//     }

//     end.setHours(23, 59, 59, 999);

//     const entries = await EntriesModel.find({
//       EntryType: "Payment",
//       DVDate: { $gte: start, $lte: end },
//       // "DisbursementTransaction.AlphaList.Date": { $gte: start, $lte: end },
//     });

//     if (entries.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No data found for the given period." });
//     }

//     let totalDr = 0;
//     let totalCr = 0;

//     entries.forEach((entry) => {
//       entry.ledgers.forEach((ledger) => {
//         totalDr += ledger.dr || 0;
//         totalCr += ledger.cr || 0;
//       });
//     });

//     // Respond with the filtered entries and the totals
//     return res.status(200).json({
//       message: "Report fetched successfully",
//       data: entries,
//       totals: {
//         totalDr,
//         totalCr,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

/*
const getReportForAlphalistTax = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // if (!startDate || !endDate) {
    //   return res
    //     .status(400)
    //     .json({ message: "startDate and endDate are required." });
    // }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // if (start > end) {
    //   return res
    //     .status(400)
    //     .json({ message: "startDate cannot be later than endDate." });
    // }

    end.setHours(23, 59, 59, 999);

    // const entries = await EntriesModel.find({
    //   EntryType: "Payment",
    // });

    const entries = await EntriesModel.find();

    if (entries.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the given period." });
    }

    const Grandtotal = {
      grossPurchase: 0,
      exemptPurchase: 0,
      zeroRatePurchase: 0,
      amountOfTaxablePurchase: 0,
      servicesPurchase: 0,
      capitalGoods: 0,
      goodsOtherThanCapital: 0,
      inputTaxAmount: 0,
      grossTaxablePurchase: 0,
    };

    const individualAlphaListEntries = [];

    entries.forEach((entry) => {
      entry.ledgers.forEach((ledger) => {
        if (ledger.it && ledger.it.length > 0) {
          ledger.it.forEach((itItem) => {
            const itDate = new Date(itItem.date);

            if (itDate >= start && itDate <= end) {
              // Directly extract tax-related values from itItem
              const {
                grossPurchase = 0,
                exemptPurchase = 0,
                zeroRatePurchase = 0,
                amountOfTaxablePurchase = 0,
                servicesPurchase = 0,
                capitalGoods = 0,
                goodsOtherThanCapital = 0,
                inputTaxAmount = 0,
                grossTaxablePurchase = 0,
              } = itItem; // Destructuring and defaulting to 0 if not present

              // Sum up all the tax amounts into Grandtotal
              Grandtotal.grossPurchase += grossPurchase;
              Grandtotal.exemptPurchase += exemptPurchase;
              Grandtotal.zeroRatePurchase += zeroRatePurchase;
              Grandtotal.amountOfTaxablePurchase += amountOfTaxablePurchase;
              Grandtotal.servicesPurchase += servicesPurchase;
              Grandtotal.capitalGoods += capitalGoods;
              Grandtotal.goodsOtherThanCapital += goodsOtherThanCapital;
              Grandtotal.inputTaxAmount += inputTaxAmount;
              Grandtotal.grossTaxablePurchase += grossTaxablePurchase;

              // Push the current itItem into individualAlphaListEntries
              // Add DVNo to itItem
              individualAlphaListEntries.push({
                ...itItem,
                DVNo: entry.DVNo,
                JVNo: entry.JVNo,
                CRNo: entry.CRNo,
              });
            }
          });
        }
      });
    });

    return res.status(200).json({
      message: "Report fetched successfully",
      Grandtotal,
      individualAlphaListEntries,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
*/

/*
const getReportForEWT = async (req, res) => {
  const { startDate, endDate, ownerName } = req.query;

  // Set start and end dates to null if not provided
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  // If provided startDate > endDate, return an error
  if (start && end && start > end) {
    return res
      .status(400)
      .json({ message: "startDate cannot be later than endDate." });
  }

  // Set the end date to the last moment of the day if it's provided
  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  try {
    // Build the aggregation pipeline
    const pipeline = [
      {
        $match: {
          // If dates are provided, match records within the date range
          ...(start && end ? { 
            $or: [
              { JVDate: { $gte: start, $lte: end } },
              { CRDate: { $gte: start, $lte: end } },
              { DVDate: { $gte: start, $lte: end } }
            ] 
          } : {}),
        },
      },
      { $unwind: "$ledgers" },
      {
        $match: {
          "ledgers.wt.taxType": { $exists: true, $eq: "EWT" },
        },
      },
      {
        $project: {
          _id: 0,
          atcCode: "$ledgers.wt.taxCode",
          naturePayment: "$ledgers.wt.taxCategory",
          incomePayment: "$ledgers.wt.taxBase",
          taxRate: "$ledgers.wt.taxRate",
          taxTotal: "$ledgers.wt.taxTotal",
          taxTypeDetail: "$ledgers.wt.taxTypeDetail",
          tin: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
              else: {
                $cond: {
                  if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
                  then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
                  else: "",
                },
              },
            },
          },
          corporation: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          individual: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          DVNo: "$DVNo",
          CRNO: "$CRNO",
          JVNo: "$JVNo",
        },
      },
    ];

    // If ownerName is provided, add the match for ownerName
    if (ownerName) {
      pipeline.push({
        $match: {
          $or: [{ corporation: ownerName }, { individual: ownerName }],
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalIncomePayment: { $sum: "$incomePayment" },
        totalTaxRate: { $sum: "$taxRate" },
        totalTaxTotal: { $sum: "$taxTotal" },
        reports: { $push: "$$ROOT" },
      },
    });

    pipeline.push({
      $addFields: {
        reports: {
          $map: {
            input: { $range: [0, { $size: "$reports" }] },
            as: "index",
            in: {
              $mergeObjects: [
                { seqNo: { $add: ["$$index", 1] } },
                { $arrayElemAt: ["$reports", "$$index"] },
              ],
            },
          },
        },
      },
    });

    const report = await EntriesModel.aggregate(pipeline);

    if (report.length === 0) {
      return res.status(200).json([]); // Return empty array if no results
    }

    const result = {
      totalIncomePayment: report[0].totalIncomePayment,
      totalTaxRate: report[0].totalTaxRate,
      totalTaxTotal: report[0].totalTaxTotal,
      reports: report[0].reports,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReportForFVAT = async (req, res) => {
};

const getReportForWPT = async (req, res) => {
  const { startDate, endDate, ownerName } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res
      .status(400)
      .json({ message: "startDate cannot be later than endDate." });
  }

  end.setHours(23, 59, 59, 999);

  try {
    const pipeline = [
      {
        $match: {
          $or: [
            { JVDate: { $gte: start, $lte: end } },
            { CRDate: { $gte: start, $lte: end } },
            { DVDate: { $gte: start, $lte: end } },
          ],
        },
      },
      { $unwind: "$ledgers" },
      {
        $match: {
          "ledgers.wt.taxType": { $exists: true, $eq: "WPT" },
        },
      },
      {
        $project: {
          _id: 0,
          atcCode: "$ledgers.wt.taxCode",
          naturePayment: "$ledgers.wt.taxCategory",
          incomePayment: "$ledgers.wt.taxBase",
          taxRate: "$ledgers.wt.taxRate",
          taxTotal: "$ledgers.wt.taxTotal",
          taxTypeDetail: "$ledgers.wt.taxTypeDetail",
          tin: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
              else: {
                $cond: {
                  if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
                  then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
                  else: "",
                },
              },
            },
          },
          corporation: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          individual: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          DVNo: "$DVNo",
          CRNO: "$CRNO",
          JVNo: "$JVNo",
        },
      },
    ];

    if (ownerName) {
      pipeline.push({
        $match: {
          $or: [{ corporation: ownerName }, { individual: ownerName }],
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalIncomePayment: { $sum: "$incomePayment" },
        totalTaxRate: { $sum: "$taxRate" },
        totalTaxTotal: { $sum: "$taxTotal" },
        reports: { $push: "$$ROOT" },
      },
    });

    pipeline.push({
      $addFields: {
        reports: {
          $map: {
            input: { $range: [0, { $size: "$reports" }] },
            as: "index",
            in: {
              $mergeObjects: [
                { seqNo: { $add: ["$$index", 1] } },
                { $arrayElemAt: ["$reports", "$$index"] },
              ],
            },
          },
        },
      },
    });

    const report = await EntriesModel.aggregate(pipeline);

    if (report.length === 0) {
      return res.status(200).json([]);
    }

    const result = {
      totalIncomePayment: report[0].totalIncomePayment,
      totalTaxRate: report[0].totalTaxRate,
      totalTaxTotal: report[0].totalTaxTotal,
      reports: report[0].reports,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReportForWTC = async (req, res) => {
  const { startDate, endDate, ownerName } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res
      .status(400)
      .json({ message: "startDate cannot be later than endDate." });
  }

  end.setHours(23, 59, 59, 999);

  try {
    const pipeline = [
      {
        $match: {
          $or: [
            { JVDate: { $gte: start, $lte: end } },
            { CRDate: { $gte: start, $lte: end } },
            { DVDate: { $gte: start, $lte: end } },
          ],
        },
      },
      { $unwind: "$ledgers" },
      {
        $match: {
          "ledgers.wt.taxType": { $exists: true, $eq: "WTC" },
        },
      },
      {
        $project: {
          _id: 0,
          atcCode: "$ledgers.wt.taxCode",
          naturePayment: "$ledgers.wt.taxCategory",
          incomePayment: "$ledgers.wt.taxBase",
          taxRate: "$ledgers.wt.taxRate",
          taxTotal: "$ledgers.wt.taxTotal",
          taxTypeDetail: "$ledgers.wt.taxTypeDetail",
          tin: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
              else: {
                $cond: {
                  if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
                  then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
                  else: "",
                },
              },
            },
          },
          corporation: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          individual: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          DVNo: "$DVNo",
          CRNO: "$CRNO",
          JVNo: "$JVNo",
        },
      },
    ];

    if (ownerName) {
      pipeline.push({
        $match: {
          $or: [{ corporation: ownerName }, { individual: ownerName }],
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalIncomePayment: { $sum: "$incomePayment" },
        totalTaxRate: { $sum: "$taxRate" },
        totalTaxTotal: { $sum: "$taxTotal" },
        reports: { $push: "$$ROOT" },
      },
    });

    pipeline.push({
      $addFields: {
        reports: {
          $map: {
            input: { $range: [0, { $size: "$reports" }] },
            as: "index",
            in: {
              $mergeObjects: [
                { seqNo: { $add: ["$$index", 1] } },
                { $arrayElemAt: ["$reports", "$$index"] },
              ],
            },
          },
        },
      },
    });

    const report = await EntriesModel.aggregate(pipeline);

    if (report.length === 0) {
      return res.status(200).json([]);
    }

    const result = {
      totalIncomePayment: report[0].totalIncomePayment,
      totalTaxRate: report[0].totalTaxRate,
      totalTaxTotal: report[0].totalTaxTotal,
      reports: report[0].reports,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
 };
 */



/*
version 2
*/

const getReportForAlphalistTax = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set default values to null if not provided
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Fetch all entries (no date filtering by default)
    const entries = await EntriesModel.find();

    if (entries.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the given period." });
    }

    const Grandtotal = {
      grossPurchase: 0,
      exemptPurchase: 0,
      zeroRatePurchase: 0,
      amountOfTaxablePurchase: 0,
      servicesPurchase: 0,
      capitalGoods: 0,
      goodsOtherThanCapital: 0,
      inputTaxAmount: 0,
      grossTaxablePurchase: 0,
    };

    const individualAlphaListEntries = [];

    // Loop through all entries and their ledgers
    entries.forEach((entry) => {
      entry.ledgers.forEach((ledger) => {
        if (ledger.it && ledger.it.length > 0) {
          ledger.it.forEach((itItem) => {
            const itDate = new Date(itItem.date);

            // If startDate and endDate are provided, filter the entries by date
            // Otherwise, don't filter by date
            if (
              (!start || itDate >= start) &&
              (!end || itDate <= end)
            ) {
              // Destructure the tax-related fields from itItem
              const {
                grossPurchase = 0,
                exemptPurchase = 0,
                zeroRatePurchase = 0,
                amountOfTaxablePurchase = 0,
                servicesPurchase = 0,
                capitalGoods = 0,
                goodsOtherThanCapital = 0,
                inputTaxAmount = 0,
                grossTaxablePurchase = 0,
              } = itItem;

              // Sum up the values into Grandtotal
              Grandtotal.grossPurchase += grossPurchase;
              Grandtotal.exemptPurchase += exemptPurchase;
              Grandtotal.zeroRatePurchase += zeroRatePurchase;
              Grandtotal.amountOfTaxablePurchase += amountOfTaxablePurchase;
              Grandtotal.servicesPurchase += servicesPurchase;
              Grandtotal.capitalGoods += capitalGoods;
              Grandtotal.goodsOtherThanCapital += goodsOtherThanCapital;
              Grandtotal.inputTaxAmount += inputTaxAmount;
              Grandtotal.grossTaxablePurchase += grossTaxablePurchase;

              // Push the current itItem into individualAlphaListEntries
              individualAlphaListEntries.push({
                ...itItem,
                DVNo: entry.DVNo,
                JVNo: entry.JVNo,
                CRNo: entry.CRNo,
              });
            }
          });
        }
      });
    });

    return res.status(200).json({
      message: "Report fetched successfully",
      Grandtotal,
      individualAlphaListEntries,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReportForAlphalistOutputTax = async (req, res) => {
  try{
    const { startDate, endDate } = req.query;

    //set default values to null if not provided
    const start = startDate? new Date(startDate) : null;
    const end = endDate? new Date(endDate) : null;

    const entries = await EntriesModel.find();

    if(entries.length === 0) {
      return res
       .status(404)
       .json({ message: "No data found for the given period." });
    }

    const Grandtotal = {
      grossSales: 0,
      exemptSales: 0,
      zeroRateSales: 0,
      amountOfTaxableSales: 0,
      outputTaxAmount: 0,
      grossTaxableSales: 0
    }

    const individualAlphaListEntries = [];

    entries.forEach((entry) => {
      entry.ledgers.forEach((ledger) => {
        if (ledger.ot && ledger.ot.length > 0) {
          ledger.ot.forEach((otItem) => {
            const otDate = new Date(otItem.date);

            if (
              (!start || otDate >= start) &&
              (!end || otDate <= end)
            ) {
              const {
                grossSales = 0,
                exemptSales = 0,
                zeroRateSales = 0,
                amountOfTaxableSales = 0,
                outputTaxAmount = 0,
                grossTaxableSales = 0,
              } = otItem;

              // Sum up the values into Grandtotal
              Grandtotal.grossSales += grossSales;
              Grandtotal.exemptSales += exemptSales;
              Grandtotal.zeroRateSales += zeroRateSales;
              Grandtotal.amountOfTaxableSales += amountOfTaxableSales;
              Grandtotal.outputTaxAmount += outputTaxAmount;
              Grandtotal.grossTaxableSales += grossTaxableSales;

              individualAlphaListEntries.push({
                ...otItem,
                DVNo: entry.DVNo,
                JVNo: entry.JVNo,
                CRNo: entry.CRNo,
              });
            }
          });
        }
      });
    });

    return res.status(200).json({
      message: "Report fetched successfully",
      Grandtotal,
      individualAlphaListEntries,
    });

  }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateReport = async (taxType, req, res) => {
  const { startDate, endDate, ownerName } = req.query;

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && end && start > end) {
    return res.status(400).json({ message: "startDate cannot be later than endDate." });
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  try {
    const pipeline = [
      {
        $match: {
          $or: [
            { JVDate: { $gte: start || new Date(0), $lte: end || new Date() } },
            { CRDate: { $gte: start || new Date(0), $lte: end || new Date() } },
            { DVDate: { $gte: start || new Date(0), $lte: end || new Date() } },
          ],
        },
      },
      { $unwind: "$ledgers" },
      {
        $match: {
          "ledgers.wt.taxType": { $exists: true, $eq: taxType },
        },
      },
      {
        $project: {
          _id: 0,
          atcCode: "$ledgers.wt.taxCode",
          naturePayment: "$ledgers.wt.taxCategory",
          incomePayment: "$ledgers.wt.taxBase",
          taxRate: "$ledgers.wt.taxRate",
          taxTotal: "$ledgers.wt.taxTotal",
          taxTypeDetail: "$ledgers.wt.taxTypeDetail",
          tin: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
              else: {
                $cond: {
                  if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
                  then: { $ifNull: ["$PaymentEntity.tin", "$ledgers.wt.PaymentEntity.tin"] },
                  else: "",
                },
              },
            },
          },
          corporation: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Corporation"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          individual: {
            $cond: {
              if: { $eq: ["$ledgers.wt.taxTypeDetail", "Individual"] },
              then: { $ifNull: ["$PaymentEntity", "$ledgers.wt.PaymentEntity"] },
              else: "",
            },
          },
          DVNo: "$DVNo",
          CRNO: "$CRNO",
          JVNo: "$JVNo",
        },
      },
    ];

    if (ownerName) {
      pipeline.push({
        $match: {
          $or: [{ corporation: ownerName }, { individual: ownerName }],
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalIncomePayment: { $sum: "$incomePayment" },
        totalTaxRate: { $sum: "$taxRate" },
        totalTaxTotal: { $sum: "$taxTotal" },
        reports: { $push: "$$ROOT" },
      },
    });

    pipeline.push({
      $addFields: {
        reports: {
          $map: {
            input: { $range: [0, { $size: "$reports" }] },
            as: "index",
            in: {
              $mergeObjects: [
                { seqNo: { $add: ["$$index", 1] } },
                { $arrayElemAt: ["$reports", "$$index"] },
              ],
            },
          },
        },
      },
    });

    const report = await EntriesModel.aggregate(pipeline);

    if (report.length === 0) {
      return res.status(200).json([]);
    }

    const result = {
      totalIncomePayment: report[0].totalIncomePayment,
      totalTaxRate: report[0].totalTaxRate,
      totalTaxTotal: report[0].totalTaxTotal,
      reports: report[0].reports,
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReportForEWT = (req, res) => generateReport("EWT", req, res);
const getReportForFVAT = (req, res) => generateReport("FVAT", req, res);
const getReportForWPT = (req, res) => generateReport("WPT", req, res);
const getReportForWTC = (req, res) => generateReport("WTC", req, res);


const get2307 = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const entries = await EntriesModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          _id: 1,
          DVNo: 1,
          JVNo: 1,
          CRNo: 1,
          DVDate: 1,
          CRDate: 1,
          JVDate: 1,
          CertifiedBy: 1,
          PayeeInformation: {
            slCode: "$PaymentEntity.slCode",
            name: "$PaymentEntity.name",
            tin: "$PaymentEntity.tin",
            address: "$PaymentEntity.address",
            zip: "$PaymentEntity.zip",
          },
          ledgers: 1,
        },
      },
    ]);

    if (entries.length === 0) {
      return res.json({ error: "No entries found" });
    }

    const entry = entries[0];

    // Populate CertifiedBy using userModel (the user data that corresponds to CertifiedBy._id)
    const certifiedByDetails = await userModel.findById(entry.CertifiedBy).exec();

    if (!certifiedByDetails) {
      return res.json({ error: "CertifiedBy user not found" });
    }

    // Determine the period date
    const entryDate = entry.DVDate || entry.CRDate || entry.JVDate;
    if (!entryDate) {
      return res.status(400).json({ error: "Entry date not found" });
    }

    const date = moment(entryDate);
    const fromDate = date.startOf("month").format("YYYY-MM-DD");
    const toDate = date.endOf("month").format("YYYY-MM-DD");

    // Determine document number
    const docNo = entry.DVNo || entry.CRNo || entry.JVNo || "";

    // Categorize ledgers based on taxType
    const incomePayments = [];
    const moneyPayments = [];
    let incomeTaxBaseTotal = 0;
    let incomeTaxTotal = 0;
    let moneyTaxBaseTotal = 0;
    let moneyTaxTotal = 0;

    if (entry.ledgers) {
      entry.ledgers.forEach((ledger) => {
        if (ledger.wt && ledger.wt.taxType) {
          const paymentObj = {
            _id: ledger._id,
            taxType: ledger.wt.taxType,
            taxCode: ledger.wt.taxCode,
            taxCategory: ledger.wt.taxCategory,
            taxRate: ledger.wt.taxRate,
            taxBase: ledger.wt.taxBase,
            taxTotal: ledger.wt.taxTotal,
            taxTypeDetail: ledger.wt.taxTypeDetail,
          };

          if (ledger.wt.taxType === "EWT") {
            incomePayments.push(paymentObj);
            incomeTaxBaseTotal += ledger.wt.taxBase || 0;
            incomeTaxTotal += ledger.wt.taxTotal || 0;
          } else if (["FVAT", "WPT"].includes(ledger.wt.taxType)) {
            moneyPayments.push(paymentObj);
            moneyTaxBaseTotal += ledger.wt.taxBase || 0;
            moneyTaxTotal += ledger.wt.taxTotal || 0;
          }
        }
      });
    }

    res.json({
      from: fromDate,
      to: toDate,
      docNo,
      PayeeInformation: entry.PayeeInformation,
      CertifiedBy: entry.CertifiedBy,
      CertifiedByDetails: certifiedByDetails, 
      incomePayments,
      incomeTaxBaseTotal,
      incomeTaxTotal,
      moneyPayments,
      moneyTaxBaseTotal,
      moneyTaxTotal,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = {
  // getReportForPayment,
  getReportForAlphalistTax,
  getReportForAlphalistOutputTax,
  getReportForEWT,
  getReportForFVAT,
  getReportForWPT,
  getReportForWTC,
  get2307,
};
