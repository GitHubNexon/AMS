const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    vendor: {
        vendorId: {type: mongoose.Types.ObjectId, refPath: 'Vendor'},
        vendorName: {type: String}
    },
    mailingAddress: {type: String},
    terms: {type: String},
    billDate: {type: Date},
    dueDate: {type: Date},
    billNo: {type: String},
    reference: {type: String},
    tags: {type: String},
    categoryDetails: [
        {
            category: {type: mongoose.Types.ObjectId, ref: 'Accounts'},
            description: {type: String},
            amount: {type: Number},
            tax: [{
                _id: {type: mongoose.Types.ObjectId, ref: 'Bases.taxTypes._id'},
                taxCode: {type: String},
                tax: {type: String},
                percentage: {type: Number}
            }]
        }
    ],
    memo: {type: String},
    attachments: [{type: String}],
    status: {type: String, default: 'unpaid'},
    payment: [
        {
            paymentDate: { type: Date },
            method: { type: String },
            referenceNo: { type: String },
            account: { type: mongoose.Schema.Types.Mixed },
            amount: { type: Number },
            reference: { type: String },
            attachment: [{ type: String }]
        }
    ],
    totalAmount: { type: Number },
    totalPaid: { type: Number },
    openBalance: { type: Number }
});

BillSchema.pre('save', function(next){
    this.totalAmount = this.categoryDetails.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0);
    this.totalPaid = this.payment.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0);
    this.openBalance = this.totalAmount - this.totalPaid;
    if(this.totalPaid < this.totalAmount){
        this.status = 'unpaid';
    }else{
        this.status = 'paid';
    }
    next();
});

BillSchema.post('findOneAndUpdate', async function(){
    // Retrieve the updated document using the query
    const bill = await this.model.findOne(this.getQuery());
    if (bill) {
        // Trigger the `pre('save')` middleware to re-compute the calculated fields
        await bill.save();
    }
});

module.exports = mongoose.model('Bill', BillSchema);