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
  quantity: { type: Number, required: false, default: 1 },
  unit: { type: String, required: false },
  description: { type: String, required: false },
  useFullLife: { type: Number, required: false },
  itemNo: { type: String, required: false },
  amount: { type: Number, required: false, default: 0 },
});

const AssetsRepairedSchema = new mongoose.Schema(
  {
    docType: { type: String, required: false },
    parNo: { type: String, required: false },
    fundCluster: { type: String, required: false },
    entityName: { type: String, required: false, default: "Government" },
    assetRecords: [AssetsRecordSchema],
    Status: { type: StatusSchema, required: false },
    purpose: {
      type: String,
      required: false,
    },
    dateRepaired: {
      type: Date,
      required: true,
    },
    CreatedBy: { type: SignatoriesSchema, required: false },
    ReviewedBy: { type: SignatoriesSchema, required: false },
    ApprovedBy1: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const AssetsRepairedModel = mongoose.model(
  "AssetsRepaired",
  AssetsRepairedSchema
);

module.exports = AssetsRepairedModel;
