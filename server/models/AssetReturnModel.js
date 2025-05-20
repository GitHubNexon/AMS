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
