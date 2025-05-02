const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const StatusSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

const AssetsAssignmentSchema = new mongoose.Schema({
  parNo: { type: String, required: false },
  fundCluster: { type: String, required: false },
  entityName: { type: String, required: false },
  employeeName: { type: mongoose.Schema.Types.Mixed },
  position: { type: String, required: false },
  dateAcquired: { type: Date, required: false },
  dateReleased: { type: Date, required: false },
});

const assetsSchema = new mongoose.Schema({
  propNo: { type: String, required: false },
  propName: { type: String, required: false },
  propDescription: { type: String, required: false },
  unitCost: { type: Number, required: false },
  acquisitionDate: { type: Date, required: false },
  useFullLife: { type: Number, required: false },
  assetImage: { type: String, required: false },
  quantity: { type: Number, required: false },
  reference: { type: String, required: false },
  category: { type: mongoose.Schema.Types.Mixed },
  accumulatedAccount: { type: mongoose.Schema.Types.Mixed },
  depreciationAccount: { type: mongoose.Schema.Types.Mixed },
  attachments: { type: [String], required: false },
  Status: { type: StatusSchema, required: false },
});

const AssetsModel = mongoose.model("Assets", assetsSchema);

module.exports = AssetsModel;
