const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema({
    from: { type: Date },
    to: { type: Date },
    rows: [ { type: mongoose.Schema.Types.Mixed } ],
    linkedJournal: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' }
});

const PayrollModel = mongoose.model("Payroll", PayrollSchema);

module.exports = PayrollModel;