const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  middleName: { type: String },
  gender: { type: String, enum: ["", "Male", "Female", "Other"] },
  contactNumber: { type: String },
  address: { type: String },
  tin: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    required: true,
  },
  signatoryType: {
    type: [String],
    enum: ["PreparedBy", "CreatedBy", "CertifiedBy", "ReviewedBy", "ApprovedBy1", "ApprovedBy2",],
    required: false,
  },
  profileImage: { type: String },
  dateTimestamp: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
  failedAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null }
});

// userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
