const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const StatusSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

const ConditionSchema = new mongoose.Schema(
  {
    isGood: Boolean,
    forSale: Boolean,
    forDisposal: Boolean,
    forRepair: Boolean,
    lost: Boolean,
  },
  { _id: false }
);

const EmployeeAssetsRecordSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "assets" },
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "assets" },
  // quantity: { type: Number, required: false },
  category: { type: String, required: false },
  description: { type: String, required: false },
  propNo: { type: String, required: false },
  dateAcquired: { type: Date, required: false },
  amount: { type: Number, required: false },
  condition: {type: [ConditionSchema], required: false },
  inventoryNo: { type: String, required: false },
  isAssigned: { type: Boolean, default: false },
});

const EmployeeAssetsSchema = new mongoose.Schema({
  parNo: { type: String, required: false },
  fundCluster: { type: String, required: false },
  entityName: { type: String, required: false },
  employeeName: { type: mongoose.Schema.Types.Mixed },
  position: { type: String, required: false },
  approvedBy: { type: SignatoriesSchema, required: false },
  issuedBy: { type: SignatoriesSchema, required: false },
  assetRecords: [EmployeeAssetsRecordSchema],
  Status: { type: StatusSchema, required: false },
});

const EmployeeAssetsModel = mongoose.model(
  "EmployeeAssets",
  EmployeeAssetsSchema
);

module.exports = EmployeeAssetsModel;
