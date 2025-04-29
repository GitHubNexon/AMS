const mongoose = require('mongoose');

const SOASchema = new mongoose.Schema({
    account:  { type: mongoose.Schema.Types.Mixed },
    slCode: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: Date },   
    rows: [ { type: mongoose.Schema.Types.Mixed } ]
}, { timestamps: true });

const SOAModel = mongoose.model('SOA', SOASchema);

module.exports = SOAModel;