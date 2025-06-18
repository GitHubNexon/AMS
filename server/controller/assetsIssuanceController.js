const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetInventoryHistoryModel = require("../models/AssetsInventoryHistoryModel");

/*
const handleIssuanceApproval = async (issuance) => {
  for (let record of issuance.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = issuance.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    // If no matching records, skip
    if (filteredAssetRecords.length === 0) continue;

    const historyData = {
      parNo: issuance.parNo,
      fundCluster: issuance.fundCluster,
      entityName: issuance.entityName,
      date: issuance.createdAt,
      transaction: "Issuance",
      issuanceId: issuance._id,
      employeeId: issuance.employeeId,
      dateAcquired: issuance.dateAcquired,
      dateReleased: issuance.dateReleased,
      issuedBy: issuance.CreatedBy,
      // assetRecords: issuance.assetRecords,
      assetRecords: filteredAssetRecords,
    };

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $push: { "inventory.$.history": historyData },
        $set: { "inventory.$.status": "Issued" },
      }
    );
  }

  await EmployeeModel.updateOne(
    { _id: issuance.employeeId },
    {
      $push: {
        assetRecords: {
          parNo: issuance.parNo,
          fundCluster: issuance.fundCluster,
          entityName: issuance.entityName,
          issuanceId: issuance._id,
          dateReleased: issuance.dateReleased,
          issuedBy: issuance.CreatedBy,
          assetDetails: issuance.assetRecords,
          // assetRecords: issuance.assetRecords,
        },
      },
    }
  );
};

const handleIssuanceReservation = async (issuance) => {
  for (let record of issuance.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Issuance" },
      }
    );
  }

  // No update to EmployeeModel or inventory history for reservations
};

const CleanAssetsIssuanceRecord = async () => {
  try {
    const allDrafts = await AssetsIssuanceModel.find({ docType: "Draft" });

    for (let issuance of allDrafts) {
      const isDeleted = issuance.Status?.isDeleted;
      const isArchived = issuance.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Available" : "Reserved for Issuance";

      for (let record of issuance.assetRecords) {
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
    console.error("Error cleaning/restoring asset reservations:", error);
  }
};

const createAssetsIssuance = async (req, res) => {
  try {
    const AssetsIssuanceData = req.body;
    const newAssetsIssuance = new AssetsIssuanceModel(AssetsIssuanceData);
    await newAssetsIssuance.save();

    try {
      if (AssetsIssuanceData.docType === "Approved") {
        await handleIssuanceApproval(newAssetsIssuance);
      } else if (AssetsIssuanceData.docType === "Draft") {
        await handleIssuanceReservation(newAssetsIssuance);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsIssuanceData.docType === "Approved"
          ? "Assets Issuance record created and issued successfully"
          : "Draft saved and assets reserved successfully",
      data: newAssetsIssuance,
    });
  } catch (error) {
    console.error("Error creating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsIssuance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedIssuance = await AssetsIssuanceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedIssuance) {
      return res.status(404).json({ message: "Issuance record not found" });
    }

    if (updateData.docType === "Approved") {
      try {
        await handleIssuanceApproval(updatedIssuance);
      } catch (err) {
        return res.status(404).json({ message: err.message });
      }
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Issuance approved and assets issued"
          : "Draft updated",
      data: updatedIssuance,
    });
  } catch (error) {
    console.error("Error updating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

*/

const handleIssuanceApproval = async (issuance) => {
  for (let record of issuance.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = issuance.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    // If no matching records, skip
    if (filteredAssetRecords.length === 0) continue;

    const historyData = {
      parNo: issuance.parNo,
      fundCluster: issuance.fundCluster,
      entityName: issuance.entityName,
      date: issuance.createdAt,
      transaction: "Issuance",
      issuanceId: issuance._id,
      employeeId: issuance.employeeId,
      dateAcquired: issuance.dateAcquired,
      dateReleased: issuance.dateReleased,
      issuedBy: issuance.CreatedBy,
      assetRecords: filteredAssetRecords,
      assetId: record.assetId,
      inventoryId: record.inventoryId,
    };

    // Insert history into separate collection instead of pushing into AssetsModel
    await AssetInventoryHistoryModel.create(historyData);

    // Update the asset's inventory status
    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Issued" },
      }
    );
  }

  // // Save to employee record collection (one document per issuance)
  // const employeeRecord = {
  //   parNo: issuance.parNo,
  //   fundCluster: issuance.fundCluster,
  //   entityName: issuance.entityName,
  //   issuanceId: issuance._id,
  //   dateReleased: issuance.dateReleased,
  //   issuedBy: issuance.CreatedBy,
  //   assetDetails: issuance.assetRecords,
  // };

  // await AssetsEmployeeRecordModel.create(employeeRecord);
};

const handleIssuanceReservation = async (issuance) => {
  for (let record of issuance.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Issuance" },
      }
    );
  }

  // No update to EmployeeModel or inventory history for reservations
};

const CleanAssetsIssuanceRecord = async () => {
  try {
    const allDrafts = await AssetsIssuanceModel.find({ docType: "Draft" });

    for (let issuance of allDrafts) {
      const isDeleted = issuance.Status?.isDeleted;
      const isArchived = issuance.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Available" : "Reserved for Issuance";

      for (let record of issuance.assetRecords) {
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
    console.error("Error cleaning/restoring asset reservations:", error);
  }
};

const createAssetsIssuance = async (req, res) => {
  try {
    const AssetsIssuanceData = req.body;
    const newAssetsIssuance = new AssetsIssuanceModel(AssetsIssuanceData);
    await newAssetsIssuance.save();

    try {
      if (AssetsIssuanceData.docType === "Approved") {
        await handleIssuanceApproval(newAssetsIssuance);
      } else if (AssetsIssuanceData.docType === "Draft") {
        await handleIssuanceReservation(newAssetsIssuance);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsIssuanceData.docType === "Approved"
          ? "Assets Issuance record created and issued successfully"
          : "Draft saved and assets reserved successfully",
      data: newAssetsIssuance,
    });
  } catch (error) {
    console.error("Error creating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsIssuance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedIssuance = await AssetsIssuanceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedIssuance) {
      return res.status(404).json({ message: "Issuance record not found" });
    }

    if (updateData.docType === "Approved") {
      try {
        await handleIssuanceApproval(updatedIssuance);
      } catch (err) {
        return res.status(404).json({ message: err.message });
      }
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Issuance approved and assets issued"
          : "Draft updated",
      data: updatedIssuance,
    });
  } catch (error) {
    console.error("Error updating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsIssuanceRecords = async (req, res) => {
  try {
    // Ensure inventory statuses are up-to-date based on draft status
    await CleanAssetsIssuanceRecord();

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
    const totalItems = await AssetsIssuanceModel.countDocuments(query);
    const issuanceRecords = await AssetsIssuanceModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      issuanceRecords: issuanceRecords,
    });
  } catch (error) {
    console.error("Error getting all Employee record", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAssetsIssuanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsIssuanceModel.findById(id);
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

    const updatedAsset = await AssetsIssuanceModel.findByIdAndUpdate(
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

const archiveAssetsIssuanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsIssuanceModel.findById(id);
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

    const updatedAsset = await AssetsIssuanceModel.findByIdAndUpdate(
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

const undoDeleteAssetsIssuanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsIssuanceModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsIssuanceModel.findByIdAndUpdate(
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

const undoArchiveAssetsIssuanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsIssuanceModel.findById(id);
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

    const updatedAsset = await AssetsIssuanceModel.findByIdAndUpdate(
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

const validateAssetsRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const issuanceRecord = await AssetsIssuanceModel.findById(id);

    if (!issuanceRecord || issuanceRecord.docType !== "Draft") {
      return res.status(404).json({ message: "Draft record not found." });
    }

    const assetRecords = issuanceRecord.assetRecords || [];

    const inventoryIds = assetRecords.map((record) => record.inventoryId);

    const issuedInventories = await AssetsModel.aggregate([
      { $unwind: "$inventory" },
      {
        $match: {
          "inventory._id": { $in: inventoryIds },
          "inventory.status": "Issued",
        },
      },
      {
        $project: {
          assetId: "$_id",
          inventoryId: "$inventory._id",
        },
      },
    ]);

    const issuedSet = new Set(
      issuedInventories.map((inv) => `${inv.assetId}_${inv.inventoryId}`)
    );

    const issuedRecords = [];
    const validAssetRecords = [];

    for (const record of assetRecords) {
      const key = `${record.assetId}_${record.inventoryId}`;
      if (issuedSet.has(key)) {
        issuedRecords.push({
          assetId: record.assetId,
          inventoryId: record.inventoryId,
          description: record.description,
          itemNo: record.itemNo,
          message:
            "This asset is already in use, for repair, or issued to another employee. It will be removed on next submission.",
        });
      } else {
        validAssetRecords.push(record);
      }
    }

    res.json({
      assetRecords: validAssetRecords,
      issuedRecords,
    });
  } catch (error) {
    console.error("Validation Error:", error);
    res.status(500).json({ message: "Error Validating Assets" });
  }
};

module.exports = {
  createAssetsIssuance,
  getAllAssetsIssuanceRecords,
  updateAssetsIssuance,
  deleteAssetsIssuanceRecord,
  archiveAssetsIssuanceRecord,
  undoDeleteAssetsIssuanceRecord,
  undoArchiveAssetsIssuanceRecord,
  validateAssetsRecord,
};
