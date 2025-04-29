const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaxAmountSchema = new Schema(
  {
    GrossPurchase: { type: Number, required: false },
    ExemptPurchase: { type: Number, required: false },
    ZeroRatePurchase: { type: Number, required: false },
    TaxablePurchase: { type: Number, required: false },
    ServicesPurchase: { type: Number, required: false },
    CapitalGoods: { type: Number, required: false },
    GoodsOtherThanCapital: { type: Number, required: false },
    InputTaxAmount: { type: Number, required: false },
    GrossTaxablePurchase: { type: Number, required: false },
  },
  { _id: true }
);

const AlphaListSchema = new Schema(
  {
    Date: { type: Date, required: false },
    TaxpayerID: { type: String, required: false },
    RegisteredName: { type: String, required: false },
    SupplierName: { type: String, required: false },
    SupplierAddress: { type: String, required: false },
    TaxAmount: { type: TaxAmountSchema, required: false },
  },
  { _id: true }
);

const AlphaListTaxModelSchema = new Schema(
  {
    Description: { type: String, required: true },
    AlphaList: [AlphaListSchema],
    GrandTotal: {
      GrossPurchase: { type: Number, default: 0 },
      ExemptPurchase: { type: Number, default: 0 },
      ZeroRatePurchase: { type: Number, default: 0 },
      TaxablePurchase: { type: Number, default: 0 },
      ServicesPurchase: { type: Number, default: 0 },
      CapitalGoods: { type: Number, default: 0 },
      GoodsOtherThanCapital: { type: Number, default: 0 },
      InputTaxAmount: { type: Number, default: 0 },
      GrossTaxablePurchase: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// for GrandToal
AlphaListTaxModelSchema.pre("save", function (next) {
  let grandTotal = {
    GrossPurchase: 0,
    ExemptPurchase: 0,
    ZeroRatePurchase: 0,
    TaxablePurchase: 0,
    ServicesPurchase: 0,
    CapitalGoods: 0,
    GoodsOtherThanCapital: 0,
    InputTaxAmount: 0,
    GrossTaxablePurchase: 0,
  };

  this.AlphaList.forEach((item) => {
    if (item.TaxAmount) {
      grandTotal.GrossPurchase += item.TaxAmount.GrossPurchase || 0;
      grandTotal.ExemptPurchase += item.TaxAmount.ExemptPurchase || 0;
      grandTotal.ZeroRatePurchase += item.TaxAmount.ZeroRatePurchase || 0;
      grandTotal.TaxablePurchase += item.TaxAmount.TaxablePurchase || 0;
      grandTotal.ServicesPurchase += item.TaxAmount.ServicesPurchase || 0;
      grandTotal.CapitalGoods += item.TaxAmount.CapitalGoods || 0;
      grandTotal.GoodsOtherThanCapital +=
        item.TaxAmount.GoodsOtherThanCapital || 0;
      grandTotal.InputTaxAmount += item.TaxAmount.InputTaxAmount || 0;
      grandTotal.GrossTaxablePurchase +=
        item.TaxAmount.GrossTaxablePurchase || 0;
    }
  });

  for (let key in grandTotal) {
    grandTotal[key] = parseFloat(grandTotal[key].toFixed(2));
  }

  this.GrandTotal = grandTotal;
  next();
});

const AlphaListTaxModel = mongoose.model(
  "AlphaListTax",
  AlphaListTaxModelSchema
);

module.exports = AlphaListTaxModel;
