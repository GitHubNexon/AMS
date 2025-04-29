// models/Barangay.js
const mongoose = require('mongoose');

const barangaySchema = new mongoose.Schema({
    barangay_id: { type: Number, required: true, unique: true },
    municipality_id: { type: Number, required: true },
    barangay_name: { type: String, required: true },
});

module.exports = mongoose.model('Barangay', barangaySchema);
