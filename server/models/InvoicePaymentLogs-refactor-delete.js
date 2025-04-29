const mongoose = require('mongoose');

const InvoicePaymentLogsSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    depositAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounts'},
    paymentDate: { type: Date },
    amountReceived: { type: Number },
    appliedAmount: { type: Number },
    appliedCredits: { type: Number },
    credited: { type: Number },
    paymentMethod: { type: String },
    memo: { type: String },
    referenceNumber: { type: String },
    invoices: [
        {
            invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
            amount: { type: Number }
        }
    ],
    attachements: [{type: String}],
    dateLogged: { type: Date, default: Date.now }
}); 

const InvoicePaymentLogs = mongoose.model("InvoicePaymentLogs", InvoicePaymentLogsSchema);

module.exports = InvoicePaymentLogs;