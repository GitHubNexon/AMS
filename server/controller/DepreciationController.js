const mongoose = require("mongoose");
const DepreciationModel = require("../models/DepreciationModel");
const moment = require("moment");
const { Types } = require("mongoose");
const { ObjectId } = mongoose.Types;
// const { ObjectId } = require('mongodb');
const EntriesModel = require("../models/EntriesModel");
const PropertySaleModel = require("../models/PropertySaleModel");

const generateMonthlyDepreciation = (
  acquisitionDate,
  monthlyAmount,
  usefulLife
) => {
  let depreciationArray = [];
  let startDate = moment(acquisitionDate);

  if (startDate.date() !== 1) {
    startDate.add(1, "month").date(1);
  }

  for (let i = 0; i < usefulLife; i++) {
    let endDate = startDate.clone().endOf("month");
    depreciationArray.push({
      _id: new Types.ObjectId(),
      month: startDate.format("MMMM"),
      year: parseInt(startDate.format("YYYY"), 10),
      amount: monthlyAmount,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      linkId: "",
    });

    startDate.add(1, "month").date(1);
  }

  return depreciationArray;
};

const calculateAD = (acquisitionCost, netBookValues) => {
  const accumulatedDepreciation = [];
  let previousYearTotalDepreciation = 0;

  netBookValues.forEach((netBookValue, index) => {
    const yearlyDepreciation =
      acquisitionCost - netBookValue.Value - previousYearTotalDepreciation;
    let months = [];

    if (netBookValue.Months && netBookValue.Months.length > 0) {
      const startMonth = moment()
        .month(netBookValue.Months[0].Month)
        .startOf("month");

      const monthlyDepreciation =
        yearlyDepreciation / netBookValue.Months.length;

      months = netBookValue.Months.map((monthObj, i) => {
        const currentMonthAccumulated =
          previousYearTotalDepreciation +
          parseFloat(((i + 1) * monthlyDepreciation).toFixed(2));

        return {
          Month: startMonth.clone().add(i, "months").format("MMMM"),
          Value: currentMonthAccumulated,
        };
      });
    }

    previousYearTotalDepreciation += parseFloat(yearlyDepreciation.toFixed(2));

    accumulatedDepreciation.push({
      Year: netBookValue.Year,
      Date: netBookValue.Date,
      Value: previousYearTotalDepreciation,
      Months: months,
    });
  });

  return accumulatedDepreciation;
};

const calculateAnnualNetBookValue = (
  acquisitionDate,
  acquisitionCost,
  usefulLife
) => {
  const monthlyAmount = parseFloat((acquisitionCost / usefulLife).toFixed(2));
  let remainingValue = acquisitionCost;
  const netBookValues = [];

  let startDate = moment(acquisitionDate).add(1, "month").date(1);
  let currentYear = startDate.year();
  let yearEnd = moment().year(currentYear).endOf("year");

  let monthsArray = [];

  for (let i = 0; i < usefulLife; i++) {
    if (startDate.year() > currentYear) {
      netBookValues.push({
        Year: currentYear,
        Date: yearEnd.toDate(),
        Value: parseFloat(remainingValue.toFixed(2)),
        Months: monthsArray,
      });

      currentYear = startDate.year();
      yearEnd = moment().year(currentYear).endOf("year");
      monthsArray = [];
    }

    monthsArray.push({
      Month: startDate.format("MMMM"),
      Value: parseFloat((remainingValue - monthlyAmount).toFixed(2)),
    });

    remainingValue -= monthlyAmount;

    if (remainingValue < 0) remainingValue = 0;

    startDate.add(1, "month").date(1);
  }

  netBookValues.push({
    Year: currentYear,
    Date: yearEnd.toDate(),
    Value: parseFloat(remainingValue.toFixed(2)),
    Months: monthsArray,
  });

  return netBookValues;
};

const getUpdatedMonthlyDepreciation = async (req, res) => {
  try {
    const { id } = req.params;
    const depreciation = await DepreciationModel.findById(id);

    if (!depreciation) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    const { AcquisitionDate, AcquisitionCost, UseFullLife } = depreciation;
    const monthlyAmount = AcquisitionCost / UseFullLife;

    const updatedDepreciation = generateMonthlyDepreciation(
      new Date(AcquisitionDate),
      monthlyAmount,
      UseFullLife
    );

    depreciation.MonthlyDepreciation = updatedDepreciation;

    await depreciation.save();

    res.status(200).json(depreciation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating depreciation record" });
  }
};

const createDepreciation = async (req, res) => {
  try {
    const { AcquisitionDate, AcquisitionCost, UseFullLife } = req.body;

    const netBookValues = calculateAnnualNetBookValue(
      AcquisitionDate,
      AcquisitionCost,
      UseFullLife
    );
    const monthlyAmount = parseFloat(
      (AcquisitionCost / UseFullLife).toFixed(2)
    );

    const monthlyDepreciation = generateMonthlyDepreciation(
      new Date(AcquisitionDate),
      monthlyAmount,
      UseFullLife
    );

    // Calculate accumulated depreciation
    const accumulatedDepreciation = calculateAD(AcquisitionCost, netBookValues);

    const depreciation = new DepreciationModel({
      ...req.body,
      MonthlyDepreciation: monthlyDepreciation,
      NetBookValue: netBookValues,
      AccumulatedDepreciation: accumulatedDepreciation,
    });

    await depreciation.save();
    res.status(201).json(depreciation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating depreciation record" });
  }
};

const updateDepreciation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedDepreciation = await DepreciationModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedDepreciation) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updatedDepreciation);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

const deleteDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the depreciation record
    const depreciationRecord = await DepreciationModel.findById(id);
    if (!depreciationRecord || !depreciationRecord.Status) {
      return res
        .status(404)
        .json({ message: "Depreciation record or status not found" });
    }

    // Check if the record is archived
    if (depreciationRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Cannot delete an archived depreciation record." });
    }

    // Check if already deleted
    if (depreciationRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Depreciation record is already deleted." });
    }

    // Update the isDeleted field within Status
    const updatedDepreciation = await DepreciationModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": true },
      { new: true }
    );

    if (!updatedDepreciation) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    res.status(200).json(updatedDepreciation);
  } catch (error) {
    console.error(
      "Error deleting depreciation record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const archiveDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the depreciation record
    const depreciationRecord = await DepreciationModel.findById(id);
    if (!depreciationRecord || !depreciationRecord.Status) {
      return res
        .status(404)
        .json({ message: "Depreciation record or status not found" });
    }

    // Check if already archived
    if (depreciationRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Depreciation record is already archived." });
    }

    // Check if the record is deleted
    if (depreciationRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot archive a deleted depreciation record." });
    }

    // Update isArchived field to true within Status
    const updatedDepreciation = await DepreciationModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": true }, // Correct nested path
      { new: true }
    );

    if (!updatedDepreciation) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    res.status(200).json(updatedDepreciation);
  } catch (error) {
    console.error(
      "Error archiving depreciation record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoDeleteDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the depreciation record
    const depreciationRecord = await DepreciationModel.findById(id);
    if (!depreciationRecord || !depreciationRecord.Status) {
      return res
        .status(404)
        .json({ message: "Depreciation record or status not found" });
    }

    // Check if already not deleted
    if (!depreciationRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Depreciation record is not deleted." });
    }

    // Update isDeleted field to false within Status
    const updatedDepreciation = await DepreciationModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": false }, // Correct nested path
      { new: true }
    );

    if (!updatedDepreciation) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    res.status(200).json(updatedDepreciation);
  } catch (error) {
    console.error(
      "Error undoing delete of depreciation record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoArchiveDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the depreciation record
    const depreciationRecord = await DepreciationModel.findById(id);
    if (!depreciationRecord || !depreciationRecord.Status) {
      return res
        .status(404)
        .json({ message: "Depreciation record or status not found" });
    }

    // Check if already not archived
    if (!depreciationRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Depreciation record is not archived." });
    }

    // Check if the record is deleted
    if (depreciationRecord.Status.isDeleted) {
      return res.status(400).json({
        message: "Cannot undo archive for a deleted depreciation record.",
      });
    }

    // Update isArchived field to false within Status
    const updatedDepreciation = await DepreciationModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": false }, // Correct nested path
      { new: true }
    );

    if (!updatedDepreciation) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    res.status(200).json(updatedDepreciation);
  } catch (error) {
    console.error(
      "Error undoing archive of depreciation record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const getSummaryDepreciation = async (req, res) => {
  try {
    const { year, month, category } = req.query;
    const matchStage = { "Status.isDeleted": false };

    if (category) {
      matchStage["EquipmentCategory.code"] = category;
    }

    const projectStage = {
      _id: 1,
      PropNo: 1,
      Name: 1,
      Reference: 1,
      AssetDescription: 1,
      AcquisitionDate: 1,
      UnitCost: 1,
      Quantity: 1,
      UseFullLife: 1,
      EquipmentCategory: 1,
      AcquisitionCost: 1,
      Status: 1,
      MonthlyDepreciation: 1,
      AccumulatedDepreciation: 1,
      NetBookValue: 1,
    };

    if (year) {
      const parsedYear = parseInt(year);

      let monthlyDepFilter = {
        $filter: {
          input: "$MonthlyDepreciation",
          as: "md",
          cond: { $eq: ["$$md.year", parsedYear] },
        },
      };

      // Add month filter if provided
      if (month) {
        monthlyDepFilter = {
          $filter: {
            input: "$MonthlyDepreciation",
            as: "md",
            cond: {
              $and: [
                { $eq: ["$$md.year", parsedYear] },
                { $eq: ["$$md.month", month] },
              ],
            },
          },
        };
      }

      projectStage.MonthlyDepreciation = monthlyDepFilter;

      // For AccumulatedDepreciation and NetBookValue, we need to filter the Months arrays based on month
      if (month) {
        projectStage.AccumulatedDepreciation = {
          $map: {
            input: {
              $filter: {
                input: "$AccumulatedDepreciation",
                as: "ad",
                cond: { $eq: ["$$ad.Year", parsedYear] },
              },
            },
            as: "ad",
            in: {
              Year: "$$ad.Year",
              Date: "$$ad.Date",
              Value: "$$ad.Value",
              Months: {
                $filter: {
                  input: "$$ad.Months",
                  as: "m",
                  cond: { $eq: ["$$m.Month", month] },
                },
              },
            },
          },
        };

        projectStage.NetBookValue = {
          $map: {
            input: {
              $filter: {
                input: "$NetBookValue",
                as: "nbv",
                cond: { $eq: ["$$nbv.Year", parsedYear] },
              },
            },
            as: "nbv",
            in: {
              Year: "$$nbv.Year",
              Date: "$$nbv.Date",
              Value: "$$nbv.Value",
              Months: {
                $filter: {
                  input: "$$nbv.Months",
                  as: "m",
                  cond: { $eq: ["$$m.Month", month] },
                },
              },
            },
          },
        };
      } else {
        projectStage.AccumulatedDepreciation = {
          $filter: {
            input: "$AccumulatedDepreciation",
            as: "ad",
            cond: { $eq: ["$$ad.Year", parsedYear] },
          },
        };

        projectStage.NetBookValue = {
          $filter: {
            input: "$NetBookValue",
            as: "nbv",
            cond: { $eq: ["$$nbv.Year", parsedYear] },
          },
        };
      }
    }

    const summary = await DepreciationModel.aggregate([
      { $match: matchStage },
      { $project: projectStage },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: null,
          totalNetBookValue: { $sum: { $sum: "$NetBookValue.Value" } },
          totalAccumulatedDepreciation: {
            $sum: { $sum: "$AccumulatedDepreciation.Value" },
          },
          totalMonthlyDepreciation: { $push: "$MonthlyDepreciation" },
          summary: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          totalNetBookValue: 1,
          totalAccumulatedDepreciation: 1,
          totalMonthlyDepreciation: 1,
          summary: 1,
        },
      },
    ]);

    const months = month
      ? [month]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

    const totals = summary[0]
      ? {
          totalNetBookValue: summary[0].totalNetBookValue.toFixed(2),
          totalAccumulatedDepreciation:
            summary[0].totalAccumulatedDepreciation.toFixed(2),
          totalMonthlyDepreciation: months.map((m) => {
            let totalAmountForMonth = 0;

            summary[0].totalMonthlyDepreciation.forEach(
              (monthlyDepreciations) => {
                monthlyDepreciations.forEach((dep) => {
                  if (dep.month === m) {
                    totalAmountForMonth += dep.amount;
                  }
                });
              }
            );

            return {
              month: m,
              amount: totalAmountForMonth.toFixed(2),
            };
          }),
        }
      : {
          totalNetBookValue: (0).toFixed(2),
          totalAccumulatedDepreciation: (0).toFixed(2),
          totalMonthlyDepreciation: [],
        };

    res.status(200).json({
      summary: summary[0] ? summary[0].summary : [],
      totals: totals,
    });
  } catch (error) {
    console.error(
      "Error getting summary depreciation:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const getAllDepreciations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { PropNo: { $regex: keyword, $options: "i" } },
          { Name: { $regex: keyword, $options: "i" } },
          { Reference: { $regex: keyword, $options: "i" } },
          { AssetDescription: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
      ...(status &&
        status === "isDeleted" && {
          "Status.isDeleted": true,
        }),
      ...(status &&
        status === "isArchived" && {
          "Status.isArchived": true,
        }),
    };

    // const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
    const sortCriteria = {
      "Status.isDeleted": 1,
      "Status.isArchived": 1,
      [sortBy]: sortOrder,
    };
    const totalItems = await DepreciationModel.countDocuments(query);
    const depreciation = await DepreciationModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      depreciation: depreciation,
    });
  } catch (error) {
    console.error("Error in getAllDepreciation:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getLinkDepreciation = async (req, res) => {
  try {
    const { entryId, id, monthlyDepreciationId, DocNo, month, year } = req.body;

    // Validate required fields
    if (
      !entryId ||
      !id ||
      !monthlyDepreciationId ||
      !DocNo ||
      !month ||
      !year
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Convert string IDs to MongoDB ObjectIds
    const entryObjectId = new mongoose.Types.ObjectId(entryId);
    const monthlyDepreciationObjectId = new mongoose.Types.ObjectId(
      monthlyDepreciationId
    );

    // Find the depreciation document and update multiple fields
    const updatedDepreciationDoc = await DepreciationModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        "MonthlyDepreciation._id": monthlyDepreciationObjectId,
      },
      {
        $set: {
          // Update the MonthlyDepreciation entry
          "MonthlyDepreciation.$.linkId": entryObjectId,
          "MonthlyDepreciation.$.DocNo": DocNo,
          "MonthlyDepreciation.$.isDepreciated": true,

          // Update the AccumulatedDepreciation for the specific month and year
          "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].linkId":
            entryObjectId,
          "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].DocNo":
            DocNo,
          "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].isDepreciated": true,

          // Update the NetBookValue for the specific month and year
          "NetBookValue.$[yearElem].Months.$[monthElem].linkId": entryObjectId,
          "NetBookValue.$[yearElem].Months.$[monthElem].DocNo": DocNo,
          "NetBookValue.$[yearElem].Months.$[monthElem].isDepreciated": true,
        },
      },
      {
        new: true,
        arrayFilters: [{ "yearElem.Year": year }, { "monthElem.Month": month }],
      }
    );

    if (!updatedDepreciationDoc) {
      return res.status(404).json({
        message: "Depreciation entry not found or not updated",
      });
    }

    return res.json({
      message: "Successfully linked depreciation",
      updatedDoc: updatedDepreciationDoc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAllLinkDepreciation = async (req, res) => {
  try {
    const { entryId, ids, monthlyDepreciationIds, DocNo, month, year } =
      req.body;

    // Validate required fields
    if (
      !entryId ||
      !ids ||
      !monthlyDepreciationIds ||
      !DocNo ||
      !month ||
      !year
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check if arrays are provided and not empty
    if (!Array.isArray(ids) || !Array.isArray(monthlyDepreciationIds)) {
      return res
        .status(400)
        .json({ message: "ids and monthlyDepreciationIds must be arrays" });
    }

    if (ids.length === 0 || monthlyDepreciationIds.length === 0) {
      return res.status(400).json({ message: "ID arrays cannot be empty" });
    }

    // Verify the arrays have the same length
    if (ids.length !== monthlyDepreciationIds.length) {
      return res
        .status(400)
        .json({ message: "Both ID arrays must have the same length" });
    }

    // Convert string IDs to MongoDB ObjectIds
    const entryObjectId = new mongoose.Types.ObjectId(entryId);
    const monthlyDepreciationObjectIds = monthlyDepreciationIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const documentIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    // Process each document and monthly depreciation ID
    const updateResults = await Promise.all(
      documentIds.map(async (docId, index) => {
        try {
          // Find the depreciation document and update multiple fields
          const updatedDepreciationDoc =
            await DepreciationModel.findOneAndUpdate(
              {
                _id: docId,
                "MonthlyDepreciation._id": monthlyDepreciationObjectIds[index],
              },
              {
                $set: {
                  // Update the MonthlyDepreciation entry
                  "MonthlyDepreciation.$.linkId": entryObjectId,
                  "MonthlyDepreciation.$.DocNo": DocNo,
                  "MonthlyDepreciation.$.isDepreciated": true,

                  // Update the AccumulatedDepreciation for the specific month and year
                  "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].linkId":
                    entryObjectId,
                  "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].DocNo":
                    DocNo,
                  "AccumulatedDepreciation.$[yearElem].Months.$[monthElem].isDepreciated": true,

                  // Update the NetBookValue for the specific month and year
                  "NetBookValue.$[yearElem].Months.$[monthElem].linkId":
                    entryObjectId,
                  "NetBookValue.$[yearElem].Months.$[monthElem].DocNo": DocNo,
                  "NetBookValue.$[yearElem].Months.$[monthElem].isDepreciated": true,
                },
              },
              {
                new: true,
                arrayFilters: [
                  { "yearElem.Year": year },
                  { "monthElem.Month": month },
                ],
              }
            );

          return {
            id: docId,
            success: !!updatedDepreciationDoc,
            document: updatedDepreciationDoc,
          };
        } catch (error) {
          return {
            id: docId,
            success: false,
            error: error.message,
          };
        }
      })
    );

    // Check if any updates were successful
    const anySuccessful = updateResults.some((result) => result.success);

    if (!anySuccessful) {
      return res.status(404).json({
        message: "No depreciation entries were found or updated",
        details: updateResults,
      });
    }

    return res.json({
      message: "Successfully linked depreciation entries",
      results: updateResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getUpdatedById = async (req, res) => {
  try {
    const { id } = req.params;

    const depreciation = await DepreciationModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: {
          MonthlyDepreciation: 1,
          NetBookValue: 1,
          AccumulatedDepreciation: 1,
        },
      },
    ]);

    if (!depreciation || depreciation.length === 0) {
      return res.status(404).json({ message: "Depreciation not found" });
    }

    const [depreciationData] = depreciation;
    const { MonthlyDepreciation, NetBookValue, AccumulatedDepreciation } =
      depreciationData;

    const depreciationDetails = MonthlyDepreciation.filter(
      (item) => item.isDepreciated === true
    );

    if (depreciationDetails.length === 0) {
      return res.status(200).json(depreciationData);
    }

    const { month, year } = depreciationDetails[0];

    const updatedNetBookValue = NetBookValue.map((item) => {
      if (item.Year === year) {
        item.Months = item.Months.map((monthItem) => {
          if (monthItem.Month === month) {
            monthItem.isDepreciated = true;
          }
          return monthItem;
        });
      }
      return item;
    });

    const updatedAccumulatedDepreciation = AccumulatedDepreciation.map(
      (item) => {
        if (item.Year === year) {
          item.Months = item.Months.map((monthItem) => {
            if (monthItem.Month === month) {
              monthItem.isDepreciated = true;
            }
            return monthItem;
          });
        }
        return item;
      }
    );

    const updatedDepreciation = {
      ...depreciationData,
      NetBookValue: updatedNetBookValue,
      AccumulatedDepreciation: updatedAccumulatedDepreciation,
    };

    await DepreciationModel.findByIdAndUpdate(id, updatedDepreciation, {
      new: true,
    });

    return res.status(200).json(updatedDepreciation);
  } catch (error) {
    console.error("Error in getUpdatedById:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getInventoryTable = async (req, res) => {
  try {
    const { _id, page = 1, limit = 10 } = req.query;

    if (!_id) {
      return res.status(400).json({ error: "_id is required" });
    }

    const matchStage = {
      _id: new ObjectId(_id),
    };

    const aggregationPipeline = [
      { $match: matchStage },
      { $unwind: { path: "$Inventory", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          // Find the latest depreciated month in NetBookValue
          latestDepreciatedValue: {
            $last: {
              $filter: {
                input: {
                  $reduce: {
                    input: "$NetBookValue",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this.Months"] },
                  },
                },
                as: "month",
                cond: { $eq: ["$$month.isDepreciated", true] },
              },
            },
          },
          // Find the latest depreciated month in AccumulatedDepreciation
          latestAccumulatedDepreciation: {
            $last: {
              $filter: {
                input: {
                  $reduce: {
                    input: "$AccumulatedDepreciation",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this.Months"] },
                  },
                },
                as: "month",
                cond: { $eq: ["$$month.isDepreciated", true] },
              },
            },
          },
          // Get the first month from AccumulatedDepreciation
          firstAccumulatedDepreciation: {
            $arrayElemAt: [
              {
                $reduce: {
                  input: "$AccumulatedDepreciation",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.Months"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          // Calculate CurrentCost
          CurrentCost: {
            $cond: [
              {
                $and: [
                  { $ne: ["$latestDepreciatedValue", null] },
                  { $gt: ["$latestDepreciatedValue.Value", 0] },
                ],
              },
              {
                $round: [
                  {
                    $divide: [
                      "$latestDepreciatedValue.Value",
                      { $cond: [{ $gt: ["$Quantity", 0] }, "$Quantity", 1] },
                    ],
                  },
                  2,
                ],
              },
              // If no depreciated month or value is 0, use UnitCost
              {
                $round: [
                  {
                    $divide: [
                      "$UnitCost",
                      { $cond: [{ $gt: ["$Quantity", 0] }, "$Quantity", 1] },
                    ],
                  },
                  2,
                ],
              },
            ],
          },
          // Calculate CurrentAdValue (Current Accumulated Depreciation Value)
          CurrentAdValue: {
            $cond: [
              {
                $and: [
                  { $ne: ["$latestAccumulatedDepreciation", null] },
                  { $gt: ["$latestAccumulatedDepreciation.Value", 0] },
                ],
              },
              {
                $round: [
                  {
                    $divide: [
                      "$latestAccumulatedDepreciation.Value",
                      { $cond: [{ $gt: ["$Quantity", 0] }, "$Quantity", 1] },
                    ],
                  },
                  2,
                ],
              },
              // If no depreciated month, use the first month's value
              {
                $round: [
                  {
                    $divide: [
                      { $ifNull: ["$firstAccumulatedDepreciation.Value", 0] },
                      { $cond: [{ $gt: ["$Quantity", 0] }, "$Quantity", 1] },
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $project: {
          "Inventory.InventoryNo": 1,
          "Inventory.Remarks": 1,
          "Inventory.issuedTo": 1,
          "Inventory.issueDate": 1,
          "Inventory.PersonAccountable": 1,
          "Inventory.Location": 1,
          "Inventory.Condition": 1,
          "Inventory._id": 1,
          Reference: 1,
          UnitCost: 1,
          Name: 1,
          CurrentCost: 1,
          CurrentAdValue: 1,
          Quantity: 1,
          LatestDepreciatedValue: "$latestDepreciatedValue",
          LatestAccumulatedDepreciation: "$latestAccumulatedDepreciation",
          FirstAccumulatedDepreciation: "$firstAccumulatedDepreciation",
        },
      },
    ];

    const inventoryData = await DepreciationModel.aggregate(
      aggregationPipeline
    );

    const totalCount = await DepreciationModel.aggregate([
      { $match: matchStage },
      { $unwind: "$Inventory" },
      { $count: "total" },
    ]);

    // Fetch property sales for each inventory item
    const inventoryWithSales = await Promise.all(
      inventoryData.map(async (item) => {
        const propertySales = await PropertySaleModel.findOne({
          InventoryId: item.Inventory._id,
        }).lean();

        return {
          ...item,
          PropertySales: propertySales,
        };
      })
    );

    res.json({
      data: inventoryWithSales,
      total: totalCount[0]?.total || 0,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching inventory table:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getReference = async (req, res) => {
  try {
    const aggregationPipeline = [
      {
        $group: {
          _id: null,
          PropertyNumbers: { $addToSet: "$PropNo" },
        },
      },
      {
        $project: {
          _id: 0,
          PropertyNumbers: 1,
        },
      },
    ];

    const result = await DepreciationModel.aggregate(aggregationPipeline);

    if (result.length > 0) {
      res.json({
        PropertyNumbers: result[0].PropertyNumbers,
      });
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    console.error("Error fetching references:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateCondition = async (req, res) => {
  try {
    // Extract the parameters from the request body
    const { inventoryId, conditionUpdates } = req.body;

    // Find the Depreciation document that contains the Inventory item
    const depreciationRecord = await DepreciationModel.findOne({
      "Inventory._id": inventoryId,
    });

    if (!depreciationRecord) {
      return res.status(404).json({ message: "Depreciation record not found" });
    }

    // Find the inventory item by its _id
    const inventoryItem = depreciationRecord.Inventory.id(inventoryId);

    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Update the condition for the found inventory item
    inventoryItem.Condition = {
      ...inventoryItem.Condition,
      ...conditionUpdates,
    };

    // Save the updated document
    await depreciationRecord.save();

    // Send the updated inventory item back in the response
    res.status(200).json({
      message: "Condition updated successfully",
      updatedInventoryItem: inventoryItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const sellItem = async (req, res) => {
  try {
    const saleData = new PropertySaleModel({ ...req.body });
    await saleData.save();
    res.status(201).json({ message: "Item sold successfully", data: saleData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error selling item", error: error.message });
  }
};

const updateSellItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedItem = await PropertySaleModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res
      .status(200)
      .json({ message: "Item updated successfully", data: updatedItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
};

const deleteSellItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PropertySaleModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};


const createPRA = async (req, res) => {
  try{
    const {id} = req.params
    


  }catch(error){
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = {
  createDepreciation,
  updateDepreciation,
  deleteDepreciation,
  archiveDepreciation,
  undoDeleteDepreciation,
  undoArchiveDepreciation,
  getAllDepreciations,
  getUpdatedMonthlyDepreciation,
  getSummaryDepreciation,
  getLinkDepreciation,
  updateCondition,
  getUpdatedById,
  sellItem,
  getAllLinkDepreciation,
  getInventoryTable,
  getReference,
  updateCondition,
  updateSellItem,
  deleteSellItem,
};
