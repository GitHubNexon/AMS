const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const mongoose = require("mongoose");

const handleReturnApproval = async (returnDoc) => {
  for (let record of returnDoc.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }

    const historyData = {
      parNo: returnDoc.parNo,
      fundCluster: returnDoc.fundCluster,
      entityName: returnDoc.entityName,
      date: returnDoc.createdAt,
      transaction: "Return",
      returnId: returnDoc._id,
      employeeId: returnDoc.employeeId,
      dateReturned: returnDoc.dateReturned,
      issuedBy: returnDoc.CreatedBy,
      assetRecords: returnDoc.assetRecords,
    };

    await AssetsModel.updateOne(
      { _id: record.assetId, "inventory._id": record.inventoryId },
      {
        $push: { "inventory.$.history": historyData },
        $set: { "inventory.$.status": "Available" },
      }
    );
  }

  await EmployeeModel.updateOne(
    { _id: returnDoc.employeeId },
    {
      $pull: {
        assetRecords: {
          issuanceId: returnDoc.issuanceId,
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

      const newStatus = isDeleted || isArchived ? "Issued" : "Reserved"; // Or whatever default applies

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


module.exports = {
  createAssetsReturn,
  updateAssetsReturn,
};
