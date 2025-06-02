const AssetsDisposalModel = require("../models/AssetsDisposalModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");

const handleDisposalApproval = async (disposalDoc) => {
  for (let record of disposalDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = disposalDoc.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    // If no matching records, skip
    if (filteredAssetRecords.length === 0) continue;

    const historyData = {
      parNo: disposalDoc.parNo,
      fundCluster: disposalDoc.fundCluster,
      entityName: disposalDoc.entityName,
      date: disposalDoc.createdAt,
      transaction: "Disposal",
      disposalId: disposalDoc._id,
      employeeId: disposalDoc.employeeId,
      dateDisposed: disposalDoc.dateDisposed,
      issuedBy: disposalDoc.CreatedBy,
      // assetRecords: disposalDoc.assetRecords,
      assetRecords: filteredAssetRecords,
    };
    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $push: { "inventory.$.history": historyData },
        $set: { "inventory.$.status": "Dispose" },
      }
    );
  }
};

const handleDisposalReservation = async (disposalDoc) => {
  for (let record of disposalDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Disposal" },
      }
    );
  }
};

const CleanAssetsDisposalRecord = async () => {
  try {
    const allDrafts = await AssetsDisposal.find({ docType: "Draft" });

    for (let disposalDoc of allDrafts) {
      const isDeleted = disposalDoc.Status?.isDeleted;
      const isArchived = disposalDoc.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Available" : "Reserved for Disposal";

      for (let record of disposalDoc.assetRecords) {
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
    console.error("Error cleaning/restoring disposal asset statuses:", error);
  }
};

const createAssetsDisposal = async (req, res) => {
  try {
    const AssetsDisposalData = req.body;
    const NewAssetsDisposalData = new AssetsDisposalModel(AssetsDisposalData);
    await NewAssetsDisposalData.save();

    try {
      if (AssetsDisposalData.docType === "Approved") {
        await handleDisposalApproval(NewAssetsDisposalData);
      } else if (AssetsDisposalData.docType === "Draft") {
        await handleDisposalReservation(NewAssetsDisposalData);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsDisposalData.docType === "Approved"
          ? "Assets disposal created and assets marked as disposed"
          : "Draft disposal saved and assets marked as 'DisposalReserved'",
      data: NewAssetsDisposalData,
    });
  } catch (error) {
    console.error("Error creating assets disposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsDisposal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDisposal = await AssetsDisposalModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedDisposal) {
      return res.status(404).json({ message: "Disposal record not found" });
    }

    try {
      if (updateData.docType === "Approved") {
        await handleDisposalApproval(updatedDisposal);
      } else if (updateData.docType === "Draft") {
        await handleDisposalReservation(updatedDisposal);
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Disposal approved and assets marked as disposed"
          : "Draft disposal updated and assets marked as 'DisposalReserved'",
      data: updatedDisposal,
    });
  } catch (error) {
    console.error("Error updating disposal record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsDisposals = async (req, res) => {
  try {
    await CleanAssetsDisposalRecord();

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

    const totalItems = await AssetsDisposalModel.countDocuments(query);
    const disposalRecords = await AssetsDisposalModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      disposalRecords: disposalRecords,
    });
  } catch (error) {
    console.error("Error fetching all assets disposals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAssetsDisposalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsDisposalModel.findById(id);
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

    const updatedAsset = await AssetsDisposalModel.findByIdAndUpdate(
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

const archiveAssetsDisposalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsDisposalModel.findById(id);
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

    const updatedAsset = await AssetsDisposalModel.findByIdAndUpdate(
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

const undoDeleteAssetsDisposalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsDisposalModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsDisposalModel.findByIdAndUpdate(
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

const undoArchiveAssetsDisposalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsDisposalModel.findById(id);
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

    const updatedAsset = await AssetsDisposalModel.findByIdAndUpdate(
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
  createAssetsDisposal,
  updateAssetsDisposal,
  getAllAssetsDisposals,
  deleteAssetsDisposalRecord,
  archiveAssetsDisposalRecord,
  undoDeleteAssetsDisposalRecord,
  undoArchiveAssetsDisposalRecord,
};
