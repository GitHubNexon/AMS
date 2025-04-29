const mongoose = require('mongoose');

/**
 * defines the structure of trial balance report
 * formerly fetch from accounts tree
 */
const TrialBalanceSchema = mongoose.Schema({
    title: { type: String },
    type: { type: String },
    traverse: { type: Boolean },
    account: [
        { type: String }
    ],
    slFilter: [
        { type: String }
    ]
});

const TrialBalanceModel = mongoose.model('TrialBalance', TrialBalanceSchema);

module.exports = TrialBalanceModel;