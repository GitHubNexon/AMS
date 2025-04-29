const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderOfPaymentSchema = new Schema({
    orderOfPaymentNo: { type: String, required: true, unique: true },
    linkedCashReceiptEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' },
    linkedDepositSlipEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' },
    date: { type: Date, required: true },
    remarks: { type: String },
    amount: { type: Number, required: true },
    client: {
        slCode: { type: String, required: true },
        name: { type: String, required: true }
    },
    gl: [
        {
            code: { type: String, required: true },
            name: { type: String, required: true },
            slCode: { type: String },
            slName: { type: String },
            amount: { type: Number, required: true },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    paymentMethod: { type: String },
    bank: {
        slCode: { type: String },
        name: { type: String }
    },
    remarkSelected: { type: String },
    deletedDate: { type: Date },
    cancelledDate: { type: Date }
});

OrderOfPaymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// OrderOfPaymentSchema.post('findOneAndDelete', async function(doc) {
//     if(doc){
//         doc.deletedDate = new Date();
//         // also find if this or has linked entries
//         const EntriesModel = require("./EntriesModel");
//         if(doc.linkedCashReceiptEntry){
//             await EntriesModel.findByIdAndDelete(doc.linkedCashReceiptEntry);
//         }
//         if(doc.linkedDepositSlipEntry){
//             await EntriesModel.findByIdAndDelete(doc.linkedDepositSlipEntry);
//         }
//         await OrderOfPaymentDeleted.create(doc.toObject());
//     }
// });

const OrderOfPaymentDeleted = mongoose.model('OrderOfPaymentDeleted', OrderOfPaymentSchema);

const OrderOfPaymentCancelled = mongoose.model("OrderOfPaymentCancelled", OrderOfPaymentSchema);

const OrderOfPayment = mongoose.model('OrderOfPayment', OrderOfPaymentSchema);

module.exports = OrderOfPayment;
module.exports.OrderOfPaymentDeleted = OrderOfPaymentDeleted;
module.exports.OrderOfPaymentCancelled = OrderOfPaymentCancelled;