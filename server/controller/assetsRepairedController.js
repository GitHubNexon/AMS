const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetInventoryHistoryModel = require("../models/AssetsInventoryHistoryModel");
const AssetsRepairedModel = require("../models/AssetsRepairedModel");
const generateStatusHandlers = require("../utils/generateStatusHandlers");

const mongoose = require("mongoose");

const handleApproval = async (repairedDoc) => {
  for (let record of repairedDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
    repairedDoc;
    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = repairedDoc.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    if (filteredAssetRecords.length === 0) continue;
    // const filteredAssetRecords = [record];

    const historyData = {
      parNo: repairedDoc.parNo,
      fundCluster: repairedDoc.fundCluster,
      entityName: repairedDoc.entityName,
      date: repairedDoc.dateRepaired,
      transaction: "Re-Assign for Inventory",
      repairedId: repairedDoc._id,
      employeeId: repairedDoc.employeeId,
      issuedBy: repairedDoc.CreatedBy,
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
        $set: { "inventory.$.status": "Repaired-Available" },
      }
    );
  }

  const assetDetailIdsToRemove = repairedDoc.assetRecords.map(
    (r) => new mongoose.Types.ObjectId(r.inventoryId)
  );

  // Step 1: Pull assetDetails matching returned inventoryIds
  await EmployeeModel.updateOne(
    { _id: repairedDoc.employeeId },
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
    { _id: repairedDoc.employeeId },
    {
      $pull: {
        assetRecords: {
          assetDetails: { $size: 0 },
        },
      },
    }
  );
};

const handleReservation = async (repairedDoc) => {
  for (let record of repairedDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: {
          "inventory.$.status": "Reserved for Re-Assign Repaired Assets",
        },
      }
    );
  }
};

const CleanAssetsRecord = async () => {
  try {
    const allDrafts = await AssetsRepairedModel.find({ docType: "Draft" });

    for (let repairedDoc of allDrafts) {
      const isDeleted = repairedDoc.Status?.isDeleted;
      const isArchived = repairedDoc.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived
          ? "Under-Repair"
          : "Reserved for Re-Assign Repaired Assets";

      for (let record of repairedDoc.assetRecords) {
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

const createAssetsRepaired = async (req, res) => {
  try {
    const AssetsRepairedData = req.body;
    const NewAssetsRepairedData = new AssetsRepairedModel(AssetsRepairedData);
    await NewAssetsRepairedData.save();

    try {
      if (AssetsRepairedData.docType === "Approved") {
        await handleApproval(NewAssetsRepairedData);
      } else if (AssetsRepairedData.docType === "Draft") {
        await handleReservation(NewAssetsRepairedData);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsRepairedData.docType === "Approved"
          ? "Assets Repaired created and assets marked as Repaired-Available"
          : "Draft Repaired saved and assets marked as 'Reserved for Re-Assign Repaired Assets'",
      data: NewAssetsRepairedData,
    });
  } catch (error) {
    console.error("Error creating assets repaired:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsRepaired = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRepaired = await AssetsRepairedModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRepaired) {
      return res.status(404).json({ message: "Repaired record not found" });
    }

    try {
      if (updateData.docType === "Approved") {
        await handleApproval(updatedRepaired);
      } else if (updateData.docType === "Draft") {
        await handleReservation(updatedRepaired);
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Repaired approved and assets marked as Repaired-Available"
          : "Draft return updated and assets marked as 'Reserved for Re-Assign Repaired Assets'",
      data: updatedRepaired,
    });
  } catch (error) {
    console.error("Error updating repaired record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsRepairedRecords = async (req, res) => {
  try {
    // Ensure inventory statuses are up-to-date based on draft status
    await CleanAssetsRecord();

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
    const totalItems = await AssetsRepairedModel.countDocuments(query);
    const repairedRecords = await AssetsRepairedModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      repairedRecords: repairedRecords,
    });
  } catch (error) {
    console.error("Error getting all Employee record", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const {
  softDelete: softDeleteRepaired,
  undoDelete: undoDeleteRepaired,
  softArchive: softArchiveRepaired,
  undoArchive: undoArchiveRepaired,
} = generateStatusHandlers(AssetsRepairedModel, "AssetsRepaired");

module.exports = {
  createAssetsRepaired,
  updateAssetsRepaired,
  getAllAssetsRepairedRecords,
  softDeleteRepaired,
  undoDeleteRepaired,
  softArchiveRepaired,
  undoArchiveRepaired,
};
