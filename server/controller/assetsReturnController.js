const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const AssetInventoryHistoryModel = require("../models/AssetsInventoryHistoryModel");

const mongoose = require("mongoose");

const handleReturnApproval = async (returnDoc) => {
  for (let record of returnDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = returnDoc.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    if (filteredAssetRecords.length === 0) continue;
    // const filteredAssetRecords = [record];

    const historyData = {
      parNo: returnDoc.parNo,
      fundCluster: returnDoc.fundCluster,
      entityName: returnDoc.entityName,
      date: returnDoc.dateReturned,
      transaction: "Return in Inventory",
      returnId: returnDoc._id,
      employeeId: returnDoc.employeeId,
      issuedBy: returnDoc.CreatedBy,
      assetRecords: filteredAssetRecords,
      assetId: record.assetId,
      inventoryId: record.inventoryId,
    };

    // Save to history collection
    await AssetInventoryHistoryModel.create(historyData);

    // Update the asset's inventory status to "Available"
    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Used-Available" },
      }
    );
  }

  const assetDetailIdsToRemove = returnDoc.assetRecords.map(
    (r) => new mongoose.Types.ObjectId(r.inventoryId)
  );

  // Step 1: Pull assetDetails matching returned inventoryIds
  await EmployeeModel.updateOne(
    { _id: returnDoc.employeeId },
    {
      $pull: {
        "assetRecords.$[record].assetDetails": {
          inventoryId: { $in: assetDetailIdsToRemove },
        },
      },
    },
    {
      arrayFilters: [
        {
          "record.assetDetails": {
            $elemMatch: {
              inventoryId: { $in: assetDetailIdsToRemove },
            },
          },
        },
      ],
    }
  );

  // Step 2: Remove any assetRecords where assetDetails is now empty
  await EmployeeModel.updateOne(
    { _id: returnDoc.employeeId },
    {
      $pull: {
        assetRecords: {
          assetDetails: { $size: 0 },
        },
      },
    }
  );
};

const handleReturnReservation = async (returnDoc) => {
  for (let record of returnDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Return" },
      }
    );
  }
};

const CleanAssetsReturnRecord = async () => {
  try {
    const allDrafts = await AssetsReturnModel.find({ docType: "Draft" });

    for (let returnDoc of allDrafts) {
      const isDeleted = returnDoc.Status?.isDeleted;
      const isArchived = returnDoc.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Issued" : "Reserved for Return";

      for (let record of returnDoc.assetRecords) {
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
    console.error("Error cleaning/restoring return asset statuses:", error);
  }
};

const createAssetsReturn = async (req, res) => {
  try {
    const AssetsReturnData = req.body;
    const NewAssetsReturnData = new AssetsReturnModel(AssetsReturnData);
    await NewAssetsReturnData.save();

    try {
      if (AssetsReturnData.docType === "Approved") {
        await handleReturnApproval(NewAssetsReturnData);
      } else if (AssetsReturnData.docType === "Draft") {
        await handleReturnReservation(NewAssetsReturnData);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsReturnData.docType === "Approved"
          ? "Assets return created and assets marked as returned"
          : "Draft return saved and assets marked as 'ReturnReserved'",
      data: NewAssetsReturnData,
    });
  } catch (error) {
    console.error("Error creating assets return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReturn = await AssetsReturnModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedReturn) {
      return res.status(404).json({ message: "Return record not found" });
    }

    try {
      if (updateData.docType === "Approved") {
        await handleReturnApproval(updatedReturn);
      } else if (updateData.docType === "Draft") {
        await handleReturnReservation(updatedReturn);
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Return approved and assets marked as returned"
          : "Draft return updated and assets marked as 'ReturnReserved'",
      data: updatedReturn,
    });
  } catch (error) {
    console.error("Error updating return record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsReturnRecords = async (req, res) => {
  try {
    // Ensure inventory statuses are up-to-date based on draft status
    await CleanAssetsReturnRecord();

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
    const totalItems = await AssetsReturnModel.countDocuments(query);
    const returnRecords = await AssetsReturnModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      returnRecords: returnRecords,
    });
  } catch (error) {
    console.error("Error getting all Employee record", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAssetsReturnRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsReturnModel.findById(id);
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

    const updatedAsset = await AssetsReturnModel.findByIdAndUpdate(
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

const archiveAssetsReturnRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsReturnModel.findById(id);
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

    const updatedAsset = await AssetsReturnModel.findByIdAndUpdate(
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

const undoDeleteAssetsReturnRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsReturnModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsReturnModel.findByIdAndUpdate(
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

const undoArchiveAssetsReturnRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsReturnModel.findById(id);
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

    const updatedAsset = await AssetsReturnModel.findByIdAndUpdate(
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
  createAssetsReturn,
  updateAssetsReturn,
  getAllAssetsReturnRecords,
  deleteAssetsReturnRecord,
  archiveAssetsReturnRecord,
  undoDeleteAssetsReturnRecord,
  undoArchiveAssetsReturnRecord,
};
