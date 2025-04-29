const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Archive Schema
const ArchiveBudgetSchema = new Schema({
  Parent: { type: String, required: true },
  Category: { type: Array, required: true },
  Budget: { type: Number, required: true },
  Actual: { type: Number, required: true },
  Unutilized: { type: Number, required: false },
  Percentage: { type: Number, required: false },
  ApprovedBy: [{ type: String }],
  Attachments: [{ type: String }],
  ArchivedDate: { type: Date, default: Date.now },
});

// Create the Archive Model
const ArchiveBudgetModel = mongoose.model("ArchiveBudget", ArchiveBudgetSchema);

module.exports = ArchiveBudgetModel;
