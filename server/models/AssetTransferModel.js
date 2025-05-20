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
  itemNo: { type: String, required: false },
  useFullLife: { type: Number, required: false },
  amount: { type: Number, required: false, default: 0 },
});

const AssetsTransferSchema = new mongoose.Schema(
  {
    entityName: { type: String, required: true },
    ptrNo: { type: String, required: true },
    date: { type: Date, required: false },
    fundCluster: { type: String, required: false },
    transferType: { type: String, required: false },
    fromAccountable: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
    toAccountable: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
    assetRecords: [AssetsRecordSchema],
    reason: { type: String, required: false },
    Status: { type: StatusSchema, required: false },
    CreatedBy: { type: SignatoriesSchema, required: false },
    ReviewedBy: { type: SignatoriesSchema, required: false },
    ApprovedBy1: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);
