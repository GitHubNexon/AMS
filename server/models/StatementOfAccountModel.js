const mongoose = require('mongoose');

const StatementOfAccountSchema = new mongoose.Schema({
    ledger: { 
        code: { type: String },
        name: { type: String }
    },
    subledger: { 
        slCode: { type: String },
        name: { type: String }
    },
    row1: { 
        particular: { type: String },
        billingAmount: { type: Number },
        penalty: { type: Number },
        amountDue: { type: Number },
        outstandingBalance: { type: Number },
        dueDate: { type: Date },
        daysDelayed: { type: Number }
    },
    row2: { 
        particular: { type: String },
        paymentDate: { type: Date },
        paymentRefNo: { type: String },
        paymentAmount: { type: Number },
        amountDue: { type: Number },
        outstandingBalance: { type: Number }
    },
    isRentalEscalation: { type: mongoose.Schema.Types.Boolean },
    rentalEscalationDate: { type: Date },
    recordedEscalation: { type: Number },
    escalationRecordedDescription: { type: String },
    // on billing side
    arrears: { type: Number },
    assessmentBalance: { type: Number },
    assessmentBilling: { type: Number },
    // totalSales: { type: Number },
    // lessOfVat: { type: Number },
    // amountNetOfVat: { type: Number },
    // amountDue: { type: Number },
    // totalAmountDue: { type: Number }
}, { timestamps: true });

const StatementOfAccountModel = mongoose.model('StatementOfAccount', StatementOfAccountSchema);

module.exports = StatementOfAccountModel;