const mongoose = require('mongoose');

const BillPaymentLogsSchema = new mongoose.Schema({
    billId: { type: mongoose.Schema.Types.ObjectId },
    paymentDate: { type: Date },
    method: { type: String },
    reference: { type: String },
    account: { type: mongoose.Types.ObjectId, ref: 'Account' },
    amount: { type: Number },
});

const BillPaymentLogs = mongoose.model("BillPaymentLogs", BillPaymentLogsSchema);

module.exports = BillPaymentLogs;