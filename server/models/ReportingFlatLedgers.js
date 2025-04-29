// models/Region.js
const mongoose = require('mongoose');

/**
 * sacrificing storage space and insert/update operations for reports retrieval performance
 * all inserts and updates from entry ledgers will be reflected here
 */
const ReportingFlatLedgersSchema = new mongoose.Schema(
    {
        entryId: {type: mongoose.Schema.Types.ObjectId, ref: 'Entries'},
        ledgerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Entries.ledgers'},
        no: {type: String}, // can be JVNo, DVNo, CRNo.
        entryType: {type: String},
        entryDate: {type: Date},
        code: {type: String},
        name: {type: String},
        slCode: {type: String},
        subledger: {type: String},
        dr: {type: Number},
        cr: {type: Number}
    }
);

module.exports = mongoose.model('ReportingFlatLedgers', ReportingFlatLedgersSchema);