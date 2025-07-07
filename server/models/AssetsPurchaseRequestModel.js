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

const AssetsPurchaseRequestSchema = new mongoose.Schema(
  {
    isApproved: { type: Boolean, required: false, default: false },
    prNo: { type: String, required: false },
    entityName: { type: String, default: "Government" },
    fundCluster: { type: String, required: false },
    officeSection: { type: String, required: false },
    ResponsibilityCenterCode: { type: String, required: false },
    prDate: { type: Date, required: false },
    purpose: { type: String, required: false },
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
  "AssetsPurchaseRequest",
  AssetsPurchaseRequestSchema
);
