const mongoose = require("mongoose");
const Account = require("../models/AccountModel")

const VendorSchema = new mongoose.Schema({
  VendorDisplayName: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  suffix: { type: String },
  CompanyName: { type: String, required: true },
  taxNo: { type: String },
  // account: {
  //   _id: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  //   category: { type: String },
  //   code: { type: String, required: true },
  //   name: { type: String, required: true },
  //   description: { type: String },
  //   archived: { type: Boolean, default: false },
  //   dateAdded: { type: Date, default: Date.now },
  //   archivedDate: { type: Date },
  //   isSubAccount: { type: Boolean, default: false },
  //   parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounts' },
  //   openingBalance: { type: Number },
  //   openingBalanceAsOf: { type: Date }
  // },
  // openBalance: [
  //   {
  //     amount: { type: Number, required: true }, // Liability amount to vendor
  //     creditAsOf: { type: Date, default: Date.now },
  //   },
  // ],
  Email: { type: String },
  phoneNumber: { type: String },
  mobileNumber: { type: String, required: true },
  website: { type: String },
  address: {
    region: {
      id: { type: Number, required: true },
      region_name: { type: String, required: true },
    },
    province: {
      id: { type: Number, required: true },
      province_name: { type: String, required: true },
    },
    municipality: {
      id: { type: Number, required: true },
      municipality_name: { type: String, required: true },
    },
    barangay: {
      id: { type: Number, required: true },
      barangay_name: { type: String, required: true },
    },
    streetAddress: { type: String },
    houseNumber: { type: String },
    zipcode: { type: String },
  },
  dateTimestamp: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

VendorSchema.pre("save", function (next) {
  this.dateUpdated = Date.now();
  next();
});

module.exports = mongoose.model("Vendor", VendorSchema);
