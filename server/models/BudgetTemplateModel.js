const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/AccountModel");


const CategorySchema = new Schema({
  CategoryCode: { type: String, required: true },
  CategoryName: { type: String, required: true },
  CategoryBudget: { type: Number, required: true },
  CategoryActual: { type: Number, required: false, default: 0 },
  CurrentBalance: { type: Number, required: false },
  CategoryPercentage: { type: Number, required: false, default: 0 },
});

const FundsTemplateSchema = new Schema({
  FundsName: { type: String, required: true },
  FundsCode: { type: String, required: true },
  FundsBudget: { type: Number, required: true },
  FundsAllocated: { type: Number, required: false, default: 0 },
  UnutilizedAmount: { type: Number, required: false },
  FundsPercentage: { type: Number, required: false, default: 0 },
  Category: [CategorySchema],
});


const BudgetTemplateModel = mongoose.model("BudgetTemplate", FundsTemplateSchema);

module.exports = BudgetTemplateModel;

