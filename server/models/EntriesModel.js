const mongoose = require("mongoose");
const { baseModel } = require("./baseModel");
const AlphaListTaxModelSchema = require("./AlphaListTaxModel").schema;
const ReportingFlatLedgers = require("./ReportingFlatLedgers");
const OrderOfPayment = require("./OrderOfPaymentModel");
const EntriesLogModel = require("./EntriesLog");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String },
  position: { type: String },
});

const ledgerSchema = new mongoose.Schema(
  {
    type: { type: String },
    ledger: { 
      code: { type: String },
      name: { type: String }
    },
    subledger: {
      slCode: { type: String },
      name: { type: String },
    },
    dr: { type: Number },
    cr: { type: Number },
    description: { type: String },
    wt: { type: mongoose.Schema.Types.Mixed },
    it: { type: mongoose.Schema.Types.Mixed },
    od: { type: mongoose.Schema.Types.Mixed },
    ot: { type: mongoose.Schema.Types.Mixed },
    InputTaxList: {
      type: [AlphaListTaxModelSchema],  // Array of AlphaListTaxModelSchema documents
      required: false,
    },
  },
  {
    _id: true,  // Ensure _id is generated for each ledger in the array
  }
);

const entriesSchema = new mongoose.Schema(
  {
    EntryType: { type: String, required: true },
    ReceiptEntryType: { type: String, required: false },
    paymentMethods: { type: String, required: false },
    CRNo: { type: String, required: false },
    CRDate: { type: Date, required: false },
    DVNo: { type: String, required: false },
    DVDate: { type: Date, required: false },
    CheckNo: { type: String, required: false },
    // PaymentEntity: { type: String, required: false },
    PaymentEntity: { type: mongoose.Schema.Types.Mixed },
    JVNo: { type: String, required: false },
    JVDate: { type: Date, required: false },
    Particulars: { type: String, required: false },
    CreatedBy: { type: SignatoriesSchema },
    PreparedBy: { type: SignatoriesSchema },
    CertifiedBy: { type: SignatoriesSchema, required: false},
    ReviewedBy: { type: SignatoriesSchema },
    ApprovedBy1: { type: SignatoriesSchema },
    ApprovedBy2: { type: SignatoriesSchema },
    Depreciation:{ type: mongoose.Schema.Types.Mixed },
    Attachments: { type: [String] },
    // tag: { type: String, required: false },
    ledgers: [ ledgerSchema ],
    formType: { type: String },

    deletedBy: { type: String },
    deletedDate: { type: Date },

    cancelledBy: { type: String },
    cancelledDate: { type: Date }

  },
  {
    timestamps: true,
  }
);

entriesSchema.pre("save", async function (next) {
  try {
    const base = await baseModel.findOne(); // Entry checking

    // 3. Determine if this entry is related to "Journal" and check for rent accrual
    if (this.EntryType === "Journal") {
      const ledgers = this.ledgers.map((m) => m.ledger.code);
      const accrualLedgers = [
        base.rentalAccrual.accrual.debitTo.code,
        base.rentalAccrual.accrual.creditTo.code,
      ];
      if (isArraySubset(accrualLedgers, ledgers)) {
        this.formType = "RENT ACCRUAL";
      }
    }

    // log updates
    // console.log(this);


    // Proceed with the next middleware
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error); // Pass the error to the next middleware or callback
  }
});

entriesSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // move this document to recently deleted
    doc.deletedDate = new Date();
    await EntriesDeleted.create(doc.toObject());

    // clear linked order of payment and cash advance ????

  }
});

// returns true if all subset is in mainArray
function isArraySubset(subset, mainArray) {
  return subset.every((value) => mainArray.includes(value));
}

const EntriesModel = mongoose.model("Entries", entriesSchema);

const EntriesDeleted = mongoose.model('EntriesDeleted', entriesSchema);

const EntriesCancelled = mongoose.model('EntriesCancelled', entriesSchema);

const EntriesTemp = mongoose.model('EntriesTemp', entriesSchema);

module.exports = EntriesModel;

module.exports.EntriesDeleted = EntriesDeleted; 

module.exports.EntriesCancelled = EntriesCancelled;

module.exports.EntriesTemp = EntriesTemp;