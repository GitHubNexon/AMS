const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  Code: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Coverage: {
    type: String,
    required: false,
  },
  Type: {
    type: String,
    enum: ['Individual', 'Corporation'],
    required: true,
  },
  taxRate: {
    type: Number,
    required: true,
  },
});

const TaxModel = mongoose.model('Tax', taxSchema);

module.exports = TaxModel;
