const mongoose = require('mongoose');
const EntriesModel = require('./EntriesModel');

const PeriodClosingSchema = new mongoose.Schema({
    beforeDate: { type: Date },
    closingDate: { type: Date },
    incomeAccountsAmount: { type: mongoose.Schema.Types.Mixed },
    expenseAccountsAmount: { type: mongoose.Schema.Types.Mixed },
    summary: { type: Number },
    beforeRetainedEarning: { type: mongoose.Schema.Types.Mixed },
    afterRetainedEarning: { type: mongoose.Schema.Types.Mixed },
    closed: { type: Boolean, default: true },
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' },
}, { timestamps: true });

const PeriodClosingModel = mongoose.model("PeriodClosing", PeriodClosingSchema);

module.exports = PeriodClosingModel;