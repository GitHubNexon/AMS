// models/Province.js
const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    province_id: { type: Number, required: true, unique: true },
    region_id: { type: Number, required: true },
    province_name: { type: String, required: true },
});

module.exports = mongoose.model('Province', provinceSchema);
