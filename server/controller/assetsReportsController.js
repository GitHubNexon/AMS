const AssetsModel = require("../models/AssetsModel");
const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsRepairModel = require("../models/AssetsRepairModel");
const EmployeeModel = require("../models/employeeModel");

// Helper function to convert string to ObjectId
const toObjectId = (id) => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(id);
};

// Helper function to build match conditions
const buildMatchConditionsHistory = (assetId, inventoryId, employeeId, filter) => {
  const conditions = [];

  // Asset match condition
  conditions.push({ $match: { _id: toObjectId(assetId) } });

  // Unwind operations
  conditions.push(
    { $unwind: { path: "$inventory" } },
    { $unwind: { path: "$inventory.history" } },
    { $match: { "inventory.history": { $exists: true, $ne: null } } }
  );

  // Inventory filter
  if (inventoryId) {
    conditions.push({
      $match: { "inventory._id": toObjectId(inventoryId) },
    });
  }

  // Employee filter
  if (employeeId) {
    conditions.push({
      $match: { "inventory.history.employeeId": toObjectId(employeeId) },
    });
  }

  // Status filter
  if (filter && Object.keys(filter).length > 0) {
    const statusFilters = Object.entries(filter)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);

    if (statusFilters.length > 0) {
      conditions.push({
        $match: { "inventory.history.transaction": { $in: statusFilters } },
      });
    }
  }

  return conditions;
};

// Helper function to build aggregation pipeline
const buildAggregationPipelineHistory = (assetId, inventoryId, employeeId, filter) => {
  const matchConditions = buildMatchConditionsHistory(
    assetId,
    inventoryId,
    employeeId,
    filter
  );

  const pipeline = [
    ...matchConditions,
    {
      $group: {
        _id: "$_id",
        inventoryHistory: { $push: "$inventory.history" },
      },
    },
    {
      $project: {
        _id: 1,
        assetId: "$_id",
        inventoryHistory: 1,
      },
    },
  ];

  return pipeline;
};

// Helper function to populate employee details
const populateEmployeeDetails = async (historyRecords) => {
  for (let record of historyRecords) {
    if (record.employeeId) {
      try {
        const employee = await EmployeeModel.findById(record.employeeId)
          .select(
            "employeeName employeePosition employeeDepartment employeeDivision employeeSection email contactNo"
          )
          .lean();

        if (employee) {
          record.employeeName = employee.employeeName || null;
          record.employeePosition = employee.employeePosition || null;
          record.employeeDepartment = employee.employeeDepartment || null;
          record.employeeDivision = employee.employeeDivision || null;
          record.employeeSection = employee.employeeSection || null;
          record.employeeEmail = employee.email || null;
          record.employeeContactNo = employee.contactNo || null;
        } else {
          record.employeeName = null;
          record.employeePosition = null;
          record.employeeDepartment = null;
          record.employeeDivision = null;
          record.employeeSection = null;
          record.employeeEmail = null;
          record.employeeContactNo = null;
        }
      } catch (error) {
        console.warn(
          `Failed to populate employee ${record.employeeId}:`,
          error.message
        );
        record.employeeName = null;
        record.employeePosition = null;
        record.employeeDepartment = null;
        record.employeeDivision = null;
        record.employeeSection = null;
        record.employeeEmail = null;
        record.employeeContactNo = null;
      }
    }
  }
  return historyRecords;
};

const getAssetsHistory = async (req, res) => {
  try {
    const { assetId, employeeId, inventoryId, filter } = req.body;

    // Validate required field
    if (!assetId) {
      return res.status(400).json({ message: "assetId is required" });
    }

    // Build and execute aggregation pipeline
    const pipeline = buildAggregationPipelineHistory(
      assetId,
      inventoryId,
      employeeId,
      filter
    );
    const result = await AssetsModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "No asset found or no history available",
        inventoryHistory: [],
      });
    }

    // Populate employee details for each history record
    const populatedHistory = await populateEmployeeDetails(
      result[0].inventoryHistory || []
    );

    res.status(200).json({
      message: "Assets history retrieved successfully",
      assetId: result[0].assetId,
      inventoryHistory: populatedHistory,
    });
  } catch (error) {
    console.error("Error fetching assets history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAssetsHistory,
};
