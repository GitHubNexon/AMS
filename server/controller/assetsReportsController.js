const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsRepairModel = require("../models/AssetsRepairModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetInventoryHistoryModel = require("../models/AssetsInventoryHistoryModel");
const mongoose = require("mongoose");

const toObjectId = (id) => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(id);
};
const buildQueryConditions = (assetId, employeeId, filter) => {
  // Query by assetId inside the assetRecords array
  const conditions = { "assetRecords.assetId": toObjectId(assetId) };

  // Apply transaction filter if provided
  if (filter && Object.keys(filter).length > 0) {
    const statusFilters = Object.entries(filter)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);

    if (statusFilters.length > 0) {
      conditions.transaction = { $in: statusFilters };
    }
  }

  return conditions;
};

const filterByEmployeeId = (historyRecords, employeeId) => {
  if (!employeeId) {
    return historyRecords;
  }

  // Filter records: keep all non-Issuance/Return transactions,
  // and only Issuance/Return transactions that match the employeeId
  return historyRecords.filter((record) => {
    if (["Issuance", "Return"].includes(record.transaction)) {
      return (
        record.employeeId &&
        record.employeeId.toString() === employeeId.toString()
      );
    }
    // For all other transactions (Disposal, Repair, Lost, Stolen, etc.), include them
    return true;
  });
};

const populateEmployeeDetails = async (historyRecords) => {
  for (let record of historyRecords) {
    // Only populate employee details for transactions that have employeeId
    if (
      record.employeeId &&
      ["Issuance", "Return"].includes(record.transaction)
    ) {
      try {
        const employee = await EmployeeModel.findById(record.employeeId)
          .select(
            "employeeName employeePosition employeeDepartment employeeDivision employeeSection email contactNo"
          )
          .lean();

        if (employee) {
          Object.assign(record, {
            employeeName: employee.employeeName || null,
            employeePosition: employee.employeePosition || null,
            employeeDepartment: employee.employeeDepartment || null,
            employeeDivision: employee.employeeDivision || null,
            employeeSection: employee.employeeSection || null,
            employeeEmail: employee.email || null,
            employeeContactNo: employee.contactNo || null,
          });
        } else {
          Object.assign(record, {
            employeeName: null,
            employeePosition: null,
            employeeDepartment: null,
            employeeDivision: null,
            employeeSection: null,
            employeeEmail: null,
            employeeContactNo: null,
          });
        }
      } catch (error) {
        console.warn(
          `Failed to populate employee ${record.employeeId}:`,
          error.message
        );
        Object.assign(record, {
          employeeName: null,
          employeePosition: null,
          employeeDepartment: null,
          employeeDivision: null,
          employeeSection: null,
          employeeEmail: null,
          employeeContactNo: null,
        });
      }
    } else {
      // For transactions without employeeId, set employee fields to null
      Object.assign(record, {
        employeeName: null,
        employeePosition: null,
        employeeDepartment: null,
        employeeDivision: null,
        employeeSection: null,
        employeeEmail: null,
        employeeContactNo: null,
      });
    }
  }
  return historyRecords;
};

const calculateTotalAmount = (historyRecords) => {
  return historyRecords.reduce((total, record) => {
    if (record.assetRecords && Array.isArray(record.assetRecords)) {
      const recordTotal = record.assetRecords.reduce((sum, assetRecord) => {
        return sum + (assetRecord.amount || 0);
      }, 0);
      return total + recordTotal;
    } else if (record.assetRecords && record.assetRecords.amount) {
      return total + (record.assetRecords.amount || 0);
    }
    return total;
  }, 0);
};

const getAssetsHistory = async (req, res) => {
  try {
    const { assetId, employeeId, filter } = req.body;

    if (!assetId) {
      return res.status(400).json({ message: "assetId is required" });
    }

    const queryConditions = buildQueryConditions(assetId, null, filter); // Don't filter by employeeId in DB query

    // Fetch all matching history records from AssetInventoryHistoryModel
    let historyRecords = await AssetInventoryHistoryModel.find(queryConditions)
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    if (!historyRecords || historyRecords.length === 0) {
      return res.status(404).json({
        message: "No asset history found",
        inventoryHistory: [],
        totalAmount: 0,
      });
    }

    // Apply employeeId filtering after fetching from DB
    historyRecords = filterByEmployeeId(historyRecords, employeeId);

    // Populate employee details for records that have employeeId
    const populatedHistory = await populateEmployeeDetails(historyRecords);

    // Calculate total amount from all records
    const totalAmount = calculateTotalAmount(populatedHistory);

    res.status(200).json({
      message: "Assets history retrieved successfully",
      assetId: toObjectId(assetId),
      inventoryHistory: populatedHistory,
      totalAmount: totalAmount,
    });
  } catch (error) {
    console.error("Error fetching assets history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAssetsConditions = async (req, res) => {
  try {
    const result = await AssetsModel.aggregate([
      { $unwind: "$inventory" },
      {
        $group: {
          _id: "$inventory.status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // Structure data for Chart.js Polar Area chart
    // Polar Area chart needs: labels and data arrays
    const labels = result.map((item) => item.status);
    const data = result.map((item) => item.count);

    res.json({ labels, data });
  } catch (error) {
    console.error("Error Getting all assets Condition", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const getICSReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Build query filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.acquisitionDate = {};

      if (startDate) {
        dateFilter.acquisitionDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        dateFilter.acquisitionDate.$lte = end;
      }
    }

    // Query assets with optional date filtering and exclude deleted/archived
    const query = {
      ...dateFilter,
      "Status.isDeleted": { $ne: true },
      "Status.isArchived": { $ne: true },
    };

    const assets = await AssetsModel.find(query);

    let reportData = [];
    let totalAmount = 0;

    // Process each asset
    assets.forEach((asset) => {
      // If asset has inventory items, create a report entry for each
      if (asset.inventory && asset.inventory.length > 0) {
        asset.inventory.forEach((inventoryItem) => {
          const reportItem = {
            quantity: 1, // Each inventory item represents 1 unit
            unit: asset.propName,
            amount: asset.unitCost, // Price per unit
            totalCost: asset.unitCost, // Since quantity is 1, totalCost = unitCost
            description: asset.propDescription,
            inventoryItemNo: inventoryItem.invNo,
            useFullLife: asset.useFullLife,
          };

          reportData.push(reportItem);
          totalAmount += asset.unitCost;
        });
      } else {
        // If no inventory items, create entry based on asset quantity
        for (let i = 0; i < (asset.quantity || 1); i++) {
          const reportItem = {
            quantity: 1,
            unit: asset.propName,
            amount: asset.unitCost,
            totalCost: asset.unitCost,
            description: asset.propDescription,
            inventoryItemNo: asset.propNo + `-${i + 1}`, // Generate inventory number
            useFullLife: asset.useFullLife,
          };

          reportData.push(reportItem);
          totalAmount += asset.unitCost;
        }
      }
    });

    // Return the formatted response
    res.status(200).json({
      reportData,
      totalAmount,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      totalRecords: reportData.length,
    });
  } catch (error) {
    console.error("Error getting ICS Report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getWMRReport = async (req, res) => {
  try {
    const { startDate, endDate, assetId, inventoryId } = req.body;

    // Build the query filter
    let query = { transaction: "Disposal" };

    // Add date range filter if provided (check for non-empty strings)
    if (
      (startDate && startDate.trim() !== "") ||
      (endDate && endDate.trim() !== "")
    ) {
      query.date = {};
      if (startDate && startDate.trim() !== "") {
        query.date.$gte = new Date(startDate);
      }
      if (endDate && endDate.trim() !== "") {
        query.date.$lte = new Date(endDate);
      }
    }

    // Add asset filtering if provided (check for non-empty strings)
    if (
      assetId &&
      assetId.trim() !== "" &&
      inventoryId &&
      inventoryId.trim() !== ""
    ) {
      // Specific asset and inventory combination
      query.$and = [
        { "assetRecords.assetId": new mongoose.Types.ObjectId(assetId) },
        {
          "assetRecords.inventoryId": new mongoose.Types.ObjectId(inventoryId),
        },
      ];
    } else if (assetId && assetId.trim() !== "") {
      // All records with specific assetId
      query["assetRecords.assetId"] = new mongoose.Types.ObjectId(assetId);
    }

    // Fetch the disposal records
    console.log("Query:", JSON.stringify(query, null, 2));
    const disposalRecords = await AssetInventoryHistoryModel.find(query);
    console.log("Found records:", disposalRecords.length);

    // Process the data to create reportData
    let reportData = [];
    let totalAmount = 0;

    disposalRecords.forEach((record) => {
      record.assetRecords.forEach((assetRecord) => {
        // Filter asset records based on the criteria if specific filtering is needed
        let includeRecord = true;

        if (
          assetId &&
          assetId.trim() !== "" &&
          inventoryId &&
          inventoryId.trim() !== ""
        ) {
          includeRecord =
            assetRecord.assetId.toString() === assetId &&
            assetRecord.inventoryId.toString() === inventoryId;
        } else if (assetId && assetId.trim() !== "") {
          includeRecord = assetRecord.assetId.toString() === assetId;
        }

        if (includeRecord) {
          reportData.push({
            inventoryId: assetRecord.inventoryId,
            quantity: 1, // Always 1 as specified
            unit: assetRecord.unit,
            description: assetRecord.description,
          });

          totalAmount += assetRecord.amount || 0;
        }
      });
    });

    // Prepare the response
    const response = {
      reportData,
      totalAmount,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      totalRecords: reportData.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error Getting WMR Report", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAssetsInventoriesReports = async (req, res, next) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;

    // Build query object
    const query = {
      ...(keyword && {
        $or: [
          { entityName: { $regex: keyword, $options: "i" } },
          { fundCluster: { $regex: keyword, $options: "i" } },
        ],
      }),
    };

    // Build sort criteria
    const sortCriteria = {
      [sortBy]: sortOrder,
    };

    // Get total count for pagination
    const totalItems = await AssetInventoryHistoryModel.countDocuments(query);

    // Fetch paginated data
    const assets = await AssetInventoryHistoryModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      // .populate("employeeId")
      // .populate("issuanceId")
      // .populate("returnId")
      // .populate("disposalId")
      // .populate("repairId")
      // .populate("repairedId")
      // .populate("lostStolenId")
      .lean();

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: `Success Getting Asset Inventory History Reports`,
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssetsHistory,
  getAssetsConditions,
  getICSReport,
  getWMRReport,
  getAssetsInventoriesReports,
};
