const mongoose = require("mongoose");

const SignatoriesSchema = new mongoose.Schema({
  name: { type: String, required: false },
  position: { type: String, required: false },
});

const StatusSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
});

const EmployeeSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: false },
    employeeImage: { type: String, required: false },
    employeeType: { type: String, required: false },
    employeePosition: { type: String, required: false },
    employeeDivision: { type: String, required: false },
    employeeDepartment: { type: String, required: false },
    employeeSection: { type: String, required: false },
    address: { type: String, required: false },
    contactNo: { type: String, required: false },
    email: { type: String, required: false },
    dateOfBirth: { type: String, required: false },
    Status: { type: StatusSchema, required: false },
    assetRecords: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: [],
    },
    CreatedBy: { type: SignatoriesSchema, required: false },
  },
  {
    timestamps: true,
  }
);

const EmployeeModel = mongoose.model("Employee", EmployeeSchema);

module.exports = EmployeeModel;
