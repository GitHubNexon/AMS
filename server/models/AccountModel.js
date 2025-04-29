const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    category: {type: String},
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    archived: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now },
    archivedDate: { type: Date },
    isSubAccount: { type: Boolean, default: false },
    parentAccount: { type: String },
});

accountSchema.post('findOneAndUpdate', async function (doc){
    // default income and expenses accounts
    if(doc.code.charAt(0) === '4'){
        const baseModel = mongoose.model('Bases');
        const b = await baseModel.findOne();
        if(!b.incomeAccounts.includes(doc.code)){
            b.incomeAccounts.push(doc.code);
        }
        await b.save();

    }else if(doc.code.charAt(0) === '5'){
        const baseModel = mongoose.model('Bases');
        const b = await baseModel.findOne();
        if(!b.expensesAccounts.includes(doc.code)){
            b.expensesAccounts.push(doc.code);
        }
        await b.save();

    }
});

accountSchema.post('save', async function (doc){
    console.log(doc);
    // default income and expenses accounts
    if(doc.code.charAt(0) === '4'){
        const baseModel = mongoose.model('Bases');
        const b = await baseModel.findOne();
        if(!b.incomeAccounts.includes(doc.code)){
            b.incomeAccounts.push(doc.code);
        }
        await b.save();

    }else if(doc.code.charAt(0) === '5'){
        const baseModel = mongoose.model('Bases');
        const b = await baseModel.findOne();
        if(!b.expensesAccounts.includes(doc.code)){
            b.expensesAccounts.push(doc.code);
        }
        await b.save();

    }
});
 
const Account = mongoose.model('Accounts', accountSchema);

module.exports = Account;