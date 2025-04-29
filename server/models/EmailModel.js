const mongoose = require("mongoose");

// Define the attachment schema
const attachmentSchema = new mongoose.Schema({
  originalname: { type: String }, // Original name of the file
  filename: { type: String }, // Saved filename with timestamp
  path: { type: String }, // Path to the saved file
  contentType: { type: String }, // MIME type of the file
});

// Define the email log schema
const emailLogSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Sender's email address
  to: { type: String, required: true }, // Recipient's email address
  subject: { type: String, required: true }, // Subject of the email
  body: { type: String }, // Body of the email (optional)
  attachments: [attachmentSchema], // Array of attachment objects
  status: { type: String, enum: ["sent", "failed"], required: true }, // Status of the email
  errorMessage: { type: String }, // Error message if sending fails (optional)
  createdAt: { type: Date, default: Date.now }, // Timestamp of the log entry
});

// Create the EmailLog model
const EmailLog = mongoose.model("EmailLog", emailLogSchema);

module.exports = EmailLog;
