const mongoose = require("mongoose");
const DocumentStatusSchema = require("./DocumentStatusModel");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const RecordsSchema = new mongoose.Schema({
  propertyNo: { type: String, required: false },
  unit: { type: String, required: false },
  description: { type: String, required: false },
  quantity: { type: Number, required: false },
  unitCost: { type: Number, required: false },
  totalCost: { type: Number, required: false },
});

const AssetPurchaseOrderSchema = new mongoose.Schema(
  {
    isApproved: { type: Boolean, required: false, default: false },
    supplier: { type: String, required: false },
    address: { type: String, required: false },
    tin: { type: String, required: false },
    poNo: { type: String, required: false },
    modeOfProcurement: { type: String, required: false },
    poDate: { type: Date, required: false },
    placeOfDelivery: { type: String, required: false },
    dateOfDelivery: { type: Date, required: false },
    deliveryTerm: { type: String, required: false },
    paymentTerm: { type: String, required: false },
    gentlemen: { type: String, required: false },
    items: { type: [RecordsSchema], required: false },
    CreatedBy: { type: SignatoriesSchema, required: false },
    ReviewedBy: { type: SignatoriesSchema, required: false },
    ApprovedBy1: { type: SignatoriesSchema, required: false },
    status: {
      type: DocumentStatusSchema,
      required: false,
      default: {
        isDeleted: false,
        isArchived: false,
      },
    },
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AssetsPurchaseOrder",
  AssetPurchaseOrderSchema
);
