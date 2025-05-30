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
  amount: { type: Number, required: false, default: 0 },
});

const AssetsDisposalSchema = new mongoose.Schema(
  {
    docType: { type: String, required: false },
    parNo: { type: String, required: false },
    fundCluster: { type: String, required: false },
    entityName: { type: String, required: false },
    employeeName: { type: String, required: false },
    employeePosition: { type: String, required: false },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
    assetRecords: [AssetsRecordSchema],
    Status: { type: StatusSchema, required: false },
    description: {
      type: String,
      required: true,
    },
    dateDisposed: {
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

const AssetsDisposalModel = mongoose.model("AssetsDisposal", AssetsDisposalSchema);
module.exports = AssetsDisposalModel;