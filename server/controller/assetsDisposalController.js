const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");

const handleDisposalApproval = async (disposalDoc) => {
  for (let record of disposalDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
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
      assetRecords: disposalDoc.assetRecords,
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
        isDeleted || isArchived ? "Issued" : "Reserved for Return";

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
    const NewAssetsDisposalData = new AssetsDisposal(AssetsDisposalData);
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

    const updatedDisposal = await AssetsDisposal.findByIdAndUpdate(
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

module.exports = {
  createAssetsDisposal,
  updateAssetsDisposal,
};
