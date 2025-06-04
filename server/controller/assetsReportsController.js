const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsRepairModel = require("../models/AssetsRepairModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");

const toObjectId = (id) => {
  const ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(id);
};

const buildMatchConditionsHistory = (assetId, employeeId, filter) => {
  const conditions = [];

  conditions.push({ $match: { _id: toObjectId(assetId) } });

  conditions.push(
    { $unwind: { path: "$inventory" } },
    { $unwind: { path: "$inventory.history" } },
    { $match: { "inventory.history": { $exists: true, $ne: null } } }
  );

  if (employeeId) {
    conditions.push({
      $match: { "inventory.history.employeeId": toObjectId(employeeId) },
    });
  }

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

const buildAggregationPipelineHistory = (assetId, employeeId, filter) => {
  const matchConditions = buildMatchConditionsHistory(
    assetId,
    employeeId,
    filter
  );

  return [
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
};

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
    }
  }
  return historyRecords;
};

const getAssetsHistory = async (req, res) => {
  try {
    const { assetId, employeeId, filter } = req.body;

    if (!assetId) {
      return res.status(400).json({ message: "assetId is required" });
    }

    const pipeline = buildAggregationPipelineHistory(
      assetId,
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
