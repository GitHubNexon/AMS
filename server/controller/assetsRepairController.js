const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetsRepairModel = require("../models/AssetsRepairModel");

const handleRepairApproval = async (repairDoc) => {
  for (let record of repairDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = repairDoc.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    // If no matching records, skip
    if (filteredAssetRecords.length === 0) continue;

    const historyData = {
      parNo: repairDoc.parNo,
      fundCluster: repairDoc.fundCluster,
      entityName: repairDoc.entityName,
      date: repairDoc.createdAt,
      transaction: "Repair",
      repairId: repairDoc._id,
      employeeId: repairDoc.employeeId,
      dateDisposed: repairDoc.dateDisposed,
      issuedBy: repairDoc.CreatedBy,
      // assetRecords: repairDoc.assetRecords,
      assetRecords: filteredAssetRecords,
    };
    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $push: { "inventory.$.history": historyData },
        $set: { "inventory.$.status": "Repair" },
      }
    );
  }
};

const handleRepairReservation = async (repairDoc) => {
  for (let record of repairDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Repair" },
      }
    );
  }
};

const CleanAssetsRepairRecord = async () => {
  try {
    const allDrafts = await AssetsRepair.find({ docType: "Draft" });

    for (let repairDoc of allDrafts) {
      const isDeleted = repairDoc.Status?.isDeleted;
      const isArchived = repairDoc.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Available" : "Reserved for Repair";

      for (let record of repairDoc.assetRecords) {
        const asset = await AssetsModel.findOne({ _id: record.assetId });
        if (!asset) continue;

        await AssetsModel.updateOne(
          { _id: record.assetId, "inventory._id": record.inventoryId },
          {
            $set: { "inventory.$.status": newStatus },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error cleaning/restoring repair asset statuses:", error);
  }
};

const createAssetsRepair = async (req, res) => {
  try {
    const AssetsRepairData = req.body;
    const NewAssetsRepairData = new AssetsRepairModel(AssetsRepairData);
    await NewAssetsRepairData.save();

    try {
      if (AssetsRepairData.docType === "Approved") {
        await handleRepairApproval(NewAssetsRepairData);
      } else if (AssetsRepairData.docType === "Draft") {
        await handleRepairReservation(NewAssetsRepairData);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsRepairData.docType === "Approved"
          ? "Assets repair created and assets marked as repaired"
          : "Draft repair saved and assets marked as 'RepairReserved'",
      data: NewAssetsRepairData,
    });
  } catch (error) {
    console.error("Error creating assets repair:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRepair = await AssetsRepairModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRepair) {
      return res.status(404).json({ message: "Repair record not found" });
    }

    try {
      if (updateData.docType === "Approved") {
        await handleRepairApproval(updatedRepair);
      } else if (updateData.docType === "Draft") {
        await handleRepairReservation(updatedRepair);
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Repair approved and assets marked as repaired"
          : "Draft repair updated and assets marked as 'RepairReserved'",
      data: updatedRepair,
    });
  } catch (error) {
    console.error("Error updating repair record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsRepairs = async (req, res) => {
  try {
    await CleanAssetsRepairRecord();

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "CreatedBy.position": { $regex: keyword, $options: "i" } },
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

    const totalItems = await AssetsRepairModel.countDocuments(query);
    const repairRecords = await AssetsRepairModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      repairRecords: repairRecords,
    });
  } catch (error) {
    console.error("Error fetching all assets repairs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAssetsRepairRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsRepairModel.findById(id);
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

    const updatedAsset = await AssetsRepairModel.findByIdAndUpdate(
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

const archiveAssetsRepairRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsRepairModel.findById(id);
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

    const updatedAsset = await AssetsRepairModel.findByIdAndUpdate(
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

const undoDeleteAssetsRepairRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsRepairModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsRepairModel.findByIdAndUpdate(
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

const undoArchiveAssetsRepairRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsRepairModel.findById(id);
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

    const updatedAsset = await AssetsRepairModel.findByIdAndUpdate(
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
  createAssetsRepair,
  updateAssetsRepair,
  getAllAssetsRepairs,
  deleteAssetsRepairRecord,
  archiveAssetsRepairRecord,
  undoDeleteAssetsRepairRecord,
  undoArchiveAssetsRepairRecord,
};
