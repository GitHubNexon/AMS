const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const AccumulatedDepreciationSchema = new mongoose.Schema({
  Date: { type: String, required: false },
  Value: { type: Number, required: true },
});

const PropertySaleSchema = new mongoose.Schema(
  {
    PropertyInfo: { type: mongoose.Schema.Types.Mixed, required: false },
    SellingDate: { type: Date, required: true },
    SellingPrice: { type: Number, required: true },
    Cost: { type: Number, required: true },
    Ad: { type: AccumulatedDepreciationSchema, required: false },
    BookValue: { type: Number, required: true },
    GainLoss: { type: Number, required: true },
    PreparedBy: { type: SignatoriesSchema },
    ReviewedBy: { type: SignatoriesSchema },
    CreatedBy: { type: SignatoriesSchema },
    InventoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

const PropertySaleModel = mongoose.model("PropertySale", PropertySaleSchema);
module.exports = PropertySaleModel;