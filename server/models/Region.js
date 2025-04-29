// models/Region.js
const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
    region_id: { type: Number, required: true, unique: true },
    region_name: { type: String, required: true },
    region_description: { type: String, required: true },
    FIELD4: { type: String, default: '' },
});

module.exports = mongoose.model('Region', regionSchema);
