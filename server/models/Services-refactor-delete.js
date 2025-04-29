const mongoose = require("mongoose");

// Create a schema for the service
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // This field is required
    index: true, // Index for faster search
  },
  description: {
    type: String,
    required: true, // This field is required
  },
  price: {
    type: Number, // Changed to Number
    required: true, // This field is required
  },
  sku: {
    type: String,
    unique: true, // Ensures SKU is unique across services
    sparse: true, // Allows for multiple documents without a SKU
  },
  serviceImage: {
    type: String, // URL or path to the service image
  },
  dateTimestamp: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now }, // Automatically updates on each modification
  account: {type: mongoose.Schema.Types.ObjectId, ref: 'Accounts'}
});

// Create a model from the schema
const Service = mongoose.model("Service", serviceSchema);

// Export the model
module.exports = Service;
