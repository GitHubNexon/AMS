const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyType: {
    type: String,
    enum: ["Private", "Public", "Non-Profit", "Government"],
    required: true,
  },
  companyLogo: { 
    type: String,
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  companyPhone: { type: String, required: true },
  companyWebsite: { 
    type: String,
    validate: {
      validator: (v) => /^(ftp|http|https):\/\/[^ "]+$/.test(v),
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  streetAddress: { type: String },
  city: { type: String, required: true },
  region: { type: String, required: true },
  barangay: { type: String, required: true },
  zipCode: { type: String },
});

const companySettingsModel = mongoose.model("CompanySettings", companySettingsSchema);

module.exports = companySettingsModel;
