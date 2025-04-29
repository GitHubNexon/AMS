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
    GoodCondition: { type: Boolean, default: false },
    ForSale: { type: Boolean, default: false },
    ForRepair: { type: Boolean, default: false },
    ForDisposal: { type: Boolean, default: false },
    Unserviceable: { type: Boolean, default: false },
    Lost: { type: Boolean, default: false },
  },
  { _id: false }
);

const InventorySchema = new mongoose.Schema({
  InventoryNo: { type: String, required: false },
  Remarks: { type: String, required: false },
  issuedTo: { type: String, required: false },
  issueDate: { type: Date, required: false },
  returnDate: { type: Date, required: false },
  PersonAccountable: { type: String, required: false },
  Location: { type: String, required: false },
  Condition: { type: ConditionSchema, required: false },
});



const DepreciationSchema = new mongoose.Schema(
  {
    Inventory: { type: [InventorySchema] },
    PropNo: { type: String, required: false },
    Name: { type: String, required: false },
    Quantity: { type: Number, required: false },
    UnitCost: { type: Number, required: false },
    AcquisitionDate: { type: Date, required: false },
    AssetImage: { type: String, required: false },
    Reference: { type: String, required: false },
    Subledger: { type: mongoose.Schema.Types.Mixed },
    EquipmentCategory: { type: mongoose.Schema.Types.Mixed },
    AccumulatedAccount: { type: mongoose.Schema.Types.Mixed },
    DepreciationAccount: { type: mongoose.Schema.Types.Mixed },
    AcquisitionCost: { type: Number, required: false },
    UseFullLife: { type: Number, required: false },
    NetBookValue: { type: mongoose.Schema.Types.Mixed },
    AccumulatedDepreciation: { type: mongoose.Schema.Types.Mixed },
    MonthlyDepreciation: { type: mongoose.Schema.Types.Mixed },
    YearlyDepreciation: { type: mongoose.Schema.Types.Mixed },
    AssetDescription: { type: String, required: false },
    PreparedBy: { type: SignatoriesSchema },
    ReviewedBy: { type: SignatoriesSchema },
    CreatedBy: { type: SignatoriesSchema },
    ApprovedBy1: { type: SignatoriesSchema },
    Status: { type: StatusSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const DepreciationModel = mongoose.model("Depreciation", DepreciationSchema);

module.exports = DepreciationModel;
