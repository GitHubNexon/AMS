const mongoose = require("mongoose");

const PayrollColumnsSchema = new mongoose.Schema({
    name: { type: String },
    type: { type: String },
    debitTo: { type: mongoose.Schema.Types.Mixed },
    creditTo: { type: mongoose.Schema.Types.Mixed },
    creditToSL: { type: mongoose.Schema.Types.Mixed }
});

const PayrollColumnsModel = mongoose.model("PayrollColumns", PayrollColumnsSchema);

module.exports = PayrollColumnsModel;