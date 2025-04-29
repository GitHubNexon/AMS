const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  suffix: { type: String },
  companyName: { type: String },
  customerDisplayName: { type: String },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  mobileNumber: { type: String },
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
  credit: { type: Number, default: 0 }
});

// Add a pre-save hook to update dateUpdated before saving
CustomerSchema.pre("save", function (next) {
  this.dateUpdated = Date.now();
  next();
});

module.exports = mongoose.model("Customer", CustomerSchema);
