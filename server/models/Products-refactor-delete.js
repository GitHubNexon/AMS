const mongoose = require("mongoose");

// Create a schema for the product
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  sku: {
    type: String,
    unique: true, 
    sparse: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number, 
    required: true, 
  },
  productImage: {
    type: String,
  },
  dateTimestamp: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now }, 
  account: {type: mongoose.Schema.Types.ObjectId, ref: 'Accounts'}
});

// Create a model from the schema
const Product = mongoose.model("Product", productSchema);

// Export the model
module.exports = Product;
