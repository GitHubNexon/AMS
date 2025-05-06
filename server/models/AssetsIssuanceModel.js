const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const StatusSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

const AssetsRecordSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "assets" },
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "assets" },
});

const AssetsIssuanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
    dateAcquired: { type: Date, required: false },
    dateReleased: { type: Date, required: false },
    assetRecords: [AssetsRecordSchema],
    Status: { type: StatusSchema, required: false },
    CreatedBy: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const AssetsIssuanceModel = mongoose.model(
  "AssetsIssuance",
  AssetsIssuanceSchema
);

module.exports = AssetsIssuanceModel;
