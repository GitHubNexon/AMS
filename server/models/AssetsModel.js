const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const StatusSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

const InventoryItemSchema = new mongoose.Schema({
  invNo: String,
  invName: String,
  description: String,
  code: String,
  status: {
    type: String,
    enum: [
      "Available",
      "Issued",
      "Returned",
      "Defective",
      "Under-repair",
      "Disposed",
    ],
    default: "Available", // optional, if you want a default value
  },
});

const assetsSchema = new mongoose.Schema(
  {
    propNo: { type: String, required: false },
    propName: { type: String, required: false },
    propDescription: { type: String, required: false },
    unitCost: { type: Number, required: false },
    acquisitionDate: { type: Date, required: false },
    useFullLife: { type: Number, required: false },
    assetImage: { type: String, required: false },
    quantity: { type: Number, required: false },
    acquisitionCost: { type: Number, required: false },
    reference: { type: String, required: false },
    category: { type: mongoose.Schema.Types.Mixed },
    accumulatedAccount: { type: mongoose.Schema.Types.Mixed },
    depreciationAccount: { type: mongoose.Schema.Types.Mixed },
    assetsAssigned: { type: mongoose.Schema.Types.Mixed },
    inventory: { type: [InventoryItemSchema], required: false },
    attachments: { type: [String], required: false },
    Status: { type: StatusSchema, required: false },
    recordedBy: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const AssetsModel = mongoose.model("Assets", assetsSchema);

module.exports = AssetsModel;
