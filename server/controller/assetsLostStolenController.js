const AssetsLostStolenModel = require("../models/AssetsLostStolenModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");

const handleLostStolenApproval = async (lostStolenDoc) => {
  for (let record of lostStolenDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
    // Filter only the asset records relevant to this inventory
    const filteredAssetRecords = lostStolenDoc.assetRecords.filter(
      (ar) => ar.inventoryId.toString() === record.inventoryId.toString()
    );

    // If no matching records, skip
    if (filteredAssetRecords.length === 0) continue;

    const historyData = {
      parNo: lostStolenDoc.parNo,
      fundCluster: lostStolenDoc.fundCluster,
      entityName: lostStolenDoc.entityName,
      date: lostStolenDoc.createdAt,
      transaction: "Lost/Stolen",
      lostStolenId: lostStolenDoc._id,
      // employeeId: lostStolenDoc.employeeId,
      dateLostStolen: lostStolenDoc.dateLostStolen,
      issuedBy: lostStolenDoc.CreatedBy,
      // assetRecords: lostStolenDoc.assetRecords,
      assetRecords: filteredAssetRecords,
    };
    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $push: { "inventory.$.history": historyData },
        $set: { "inventory.$.status": "Lost/Stolen" },
      }
    );
  }
};

const handleLostStolenReservation = async (lostStolenDoc) => {
  for (let record of lostStolenDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $set: { "inventory.$.status": "Reserved for Lost/Stolen" },
      }
    );
  }
};

const CleanAssetsLostStolenRecord = async () => {
  try {
    const allDrafts = await AssetsLostStolenModel.find({ docType: "Draft" });

    for (let lostStolenDoc of allDrafts) {
      const isDeleted = lostStolenDoc.Status?.isDeleted;
      const isArchived = lostStolenDoc.Status?.isArchived;

      const newStatus =
        isDeleted || isArchived ? "Available" : "Reserved for Lost/Stolen";

      for (let record of lostStolenDoc.assetRecords) {
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
    console.error(
      "Error cleaning/restoring lost/stolen asset statuses:",
      error
    );
  }
};

const createAssetsLostStolen = async (req, res) => {
  try {
    const AssetsLostStolenData = req.body;
    const NewAssetsLostStolenData = new AssetsLostStolenModel(
      AssetsLostStolenData
    );
    await NewAssetsLostStolenData.save();

    try {
      if (AssetsLostStolenData.docType === "Approved") {
        await handleLostStolenApproval(NewAssetsLostStolenData);
      } else if (AssetsLostStolenData.docType === "Draft") {
        await handleLostStolenReservation(NewAssetsLostStolenData);
      }
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    res.status(201).json({
      message:
        AssetsLostStolenData.docType === "Approved"
          ? "Assets lost/stolen created and assets marked as lost/stolen"
          : "Draft lost/stolen saved and assets marked as 'Lost/StolenReserved'",
      data: NewAssetsLostStolenData,
    });
  } catch (error) {
    console.error("Error creating assets lost/stolen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsLostStolen = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLostStolen = await AssetsLostStolenModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedLostStolen) {
      return res.status(404).json({ message: "Lost/Stolen record not found" });
    }

    try {
      if (updateData.docType === "Approved") {
        await handleLostStolenApproval(updatedLostStolen);
      } else if (updateData.docType === "Draft") {
        await handleLostStolenReservation(updatedLostStolen);
      }
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({
      message:
        updateData.docType === "Approved"
          ? "Lost/Stolen approved and assets marked as lost/stolen"
          : "Draft disposal updated and assets marked as 'DisposalReserved'",
      data: updatedLostStolen,
    });
  } catch (error) {
    console.error("Error updating lost/stolen record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsLostStolen = async (req, res) => {
  try {
    await CleanAssetsLostStolenRecord();

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

    const totalItems = await AssetsLostStolenModel.countDocuments(query);
    const lostStolenRecords = await AssetsLostStolenModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      lostStolenRecords: lostStolenRecords,
    });
  } catch (error) {
    console.error("Error fetching all assets lost/stolen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const deleteAssetsLostStolenRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsLostStolenModel.findById(id);
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

    const updatedAsset = await AssetsLostStolenModel.findByIdAndUpdate(
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

const archiveAssetsLostStolenRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsLostStolenModel.findById(id);
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

    const updatedAsset = await AssetsLostStolenModel.findByIdAndUpdate(
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

const undoDeleteAssetsLostStolenRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsLostStolenModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsLostStolenModel.findByIdAndUpdate(
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

const undoArchiveAssetsLostStolenRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsLostStolenModel.findById(id);
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

    const updatedAsset = await AssetsLostStolenModel.findByIdAndUpdate(
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
  createAssetsLostStolen,
  updateAssetsLostStolen,
  getAllAssetsLostStolen,
  deleteAssetsLostStolenRecord,
  archiveAssetsLostStolenRecord,
  undoDeleteAssetsLostStolenRecord,
  undoArchiveAssetsLostStolenRecord,
};