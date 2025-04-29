// models/Municipality.js
const mongoose = require('mongoose');

const municipalitySchema = new mongoose.Schema({
    municipality_id: { type: Number, required: true, unique: true },
    province_id: { type: Number, required: true },
    municipality_name: { type: String, required: true },
});

module.exports = mongoose.model('Municipality', municipalitySchema);
