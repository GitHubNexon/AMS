const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const bankReconTotalSchema = new mongoose.Schema({
  debit: {
    totalNo: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  credit: {
    totalNo: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
});

const bankStatementSchema = new mongoose.Schema({
  remarks: { type: String, required: false },
  adjustedAmount: {type: Number},
  bookBegBalance: {type: Number},
  bookEndBalance: {type: Number},
  bankEndBalance: { type: Number },
  clearedBalance: { type: Number, required: false },
  difference: { type: Number, required: false },
  endDate: { type: Date, required: true },
});

const bankReconciliationSchema = new mongoose.Schema(
  {
    statementNo: { type: String, required: false},
    glAccount: { type: mongoose.Schema.Types.Mixed },
    slAccount: { type: mongoose.Schema.Types.Mixed },
    statementNo: { type: String, required: false },
    bankReport:  {type: mongoose.Schema.Types.Mixed },
    transactions: [{ type: mongoose.Schema.Types.Mixed, _id: true }],
    bankReconTotal: { type: bankReconTotalSchema, required: false },
    bankStatement: { type: bankStatementSchema, required: false },
    PreparedBy: { type: SignatoriesSchema, required: false },
    CertifiedBy: { type: SignatoriesSchema, required: false },
    ReviewedBy: { type: SignatoriesSchema, required: false },
    ApprovedBy1: { type: SignatoriesSchema, required: false },
    reconciled: { type: Boolean, default: false },
    reconciledDate: { type: Date },
    reconciliationNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

const BankReconModel = mongoose.model(
  "BankReconciliation",
  bankReconciliationSchema
);

module.exports = BankReconModel;
