const employeeAssetsModel = require("../models/employeeAssetsModel");
const AssetsModel = require("../models/AssetsModel");

const mongoose = require("mongoose");

const createEmployeeAssetsRecord = async (req, res) => {
  try {
    const EmployeeAssetsData = req.body;

    const newEmployeeAssets = new employeeAssetsModel(EmployeeAssetsData);
    const savedEmployeeAssets = await newEmployeeAssets.save();

    res.status(201).json(savedEmployeeAssets);
  } catch (error) {
    console.error(
      "Error creating employee assets record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const updateEmployeeAssetsRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedEmployeeAssets = await employeeAssetsModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedEmployeeAssets) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updatedEmployeeAssets);
  } catch (error) {
    console.error(
      "Error updating employee assets record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const getEmployeeAssetsRecord = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { parNo: { $regex: keyword, $options: "i" } },
          { employeeName: { $regex: keyword, $options: "i" } },
        ],
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

    const sortCriteria = {
      "Status.isDeleted": 1,
      "Status.isArchived": 1,
      [sortBy]: sortOrder,
    };

    const totalItems = await employeeAssetsModel.countDocuments(query);

    const employeeAssets = await employeeAssetsModel
      .find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      employeeAssets: employeeAssets,
    });
  } catch (error) {
    console.error("Error getting employee assets record:", error.message);
    res.status(500).json({ message: "Error processing request" });
  }
};

const deleteEmployeeAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await employeeAssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (asset.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Cannot delete an archived asset." });
    }

    if (asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is already deleted." });
    }

    const updatedAsset = await employeeAssetsModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": true },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error deleting asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const archiveEmployeeAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await employeeAssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (asset.Status.isArchived) {
      return res.status(400).json({ message: "Asset is already archived." });
    }

    if (asset.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot archive a deleted asset." });
    }

    const updatedAsset = await employeeAssetsModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": true },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error archiving asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoDeleteEmployeeAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await employeeAssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await employeeAssetsModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": false },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error undoing delete of asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoArchiveEmployeeAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await employeeAssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isArchived) {
      return res.status(400).json({ message: "Asset is not archived." });
    }

    if (asset.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot undo archive for a deleted asset." });
    }

    const updatedAsset = await employeeAssetsModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": false },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error(
      "Error undoing archive of asset:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

module.exports = {
  createEmployeeAssetsRecord,
  updateEmployeeAssetsRecord,
  getEmployeeAssetsRecord,
  deleteEmployeeAsset,
  archiveEmployeeAsset,
  undoDeleteEmployeeAsset,
  undoArchiveEmployeeAsset,
};
