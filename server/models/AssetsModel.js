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
  invNo: { type: String },
  invName: { type: String },
  description: { type: String },
  qrCode: { type: String, default: "" },
  location: { type: String },
  barCode: { type: String, default: "" },
  expirationDate: Date,
  rfidTag: { type: String, default: "" },
  status: {
    type: String,
    enum: [
      "New-Available",
      "Issued-Available",
      "Repaired-Available",
      "Issued",
      "Returned",
      "Defective",
      "Under-repair",
      "Disposed",
      "Reserved",
    ],
    default: "New-Available",
  },
  history: { type: mongoose.Schema.Types.Mixed },
});

const assetsSchema = new mongoose.Schema(
  {
    propNo: { type: String, required: false },
    propName: { type: String, required: false },
    propDescription: { type: String, required: false },
    //added new fields
    manufacturer: { type: String, required: false },
    model: { type: String, required: false },
    warrantyDate: { type: Date, required: false },
    //
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
    CreatedBy: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const AssetsModel = mongoose.model("Assets", assetsSchema);

module.exports = AssetsModel;
