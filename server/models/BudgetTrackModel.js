const mongoose = require("mongoose");
const { Schema } = mongoose;
const Account = require("../models/AccountModel");
const SubledgerReference = require("../models/subledgerReferenceModel");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
});

const WorkGroupSchema = new mongoose.Schema({
  acronym: { type: String, required: true },
  fullName: { type: String, required: true },
  code: { type: String, required: true },
});

const CategorySchema = new Schema({
  CategoryCode: { type: String, required: true },
  CategoryName: { type: String, required: true },
  CategoryBudget: { type: Number, required: true },
  CategoryActual: { type: Number, required: false, default: 0 },
  CurrentBalance: { type: Number, required: false },
  CategoryPercentage: { type: Number, required: false, default: 0 },
});

const FundsSchema = new Schema({
  FundsName: { type: String, required: true },
  FundsCode: { type: String, required: true },
  FundsBudget: { type: Number, required: true },
  FundsAllocated: { type: Number, required: false, default: 0 },
  FundsExpense: { type: Number, required: false, default: 0 },//added
  UnutilizedAmount: { type: Number, required: false },
  FundsPercentage: { type: Number, required: false, default: 0 },
  Category: [CategorySchema],
});

const BudgetTrackSchema = new Schema(
  {
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    TotalBudget: { type: Number, required: true },
    TotalExpense: { type: Number, required: false, default: 0 },//added
    TotalAllocated: { type: Number, required: false, default: 0 },
    TotalUnutilized: { type: Number, required: false },
    TotalPercentage: { type: Number, required: false, default: 0 },
    Funds: [FundsSchema],
    WorkGroup: { type: WorkGroupSchema, required: true },
    PreparedBy: { type: SignatoriesSchema, required: false },
    Description: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const BudgetTrackModel = mongoose.model("BudgetTrack", BudgetTrackSchema);

module.exports = BudgetTrackModel;
