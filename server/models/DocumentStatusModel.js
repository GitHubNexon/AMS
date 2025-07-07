const mongoose = require("mongoose");

const DocumentStatusSchema = new mongoose.Schema(
  {
    isDeleted: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { _id: false }
);

module.exports = DocumentStatusSchema;
