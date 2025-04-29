const mongoose = require("mongoose");
const EntriesModel = require('./EntriesModel');

const subledgerReferenceSchema = new mongoose.Schema({

    parentAccounts: [{type: mongoose.Schema.Types.Mixed}],

    slCode: { type: String, unique: true },
    name: { type: String },
    tin: {type: String},
    address: {type: String},
    zip: {type: String},
    associatedWithAccount: [
        { type: String }
    ],
    // associatedWithWorkgroup: [
    //     { type: String }
    // ],
    // subledgers can be lessee
    isLessee: {type: Boolean, default: false},
    // base info where escalation can be built but is editable on each escalation
    area: {type: Number},
    initialRate: {type: Number},
    yearlyIncrease: {type: Number},
    periodStart: {type: Date},
    periodEnd: {type: Date},
    securityDepositIsMonthlyRental: {type: Boolean, default: false},
    vat: {type: Number},
    ewt: {type: Number},
    fvat: {type: Number},
    cwt: {type: Number},
    escalation: [{type: mongoose.Schema.Types.Mixed}],

    // wip
    billingDate: {type: String},
    dueDate: {type: String},
    penalty: {type: Number},
    billingDateSchedules: [{type: Date}],
    dueDateSchedules: [{type: Date}],

    securityDeposit: {type: Number}, //current security deposit this lessee holds. initial value must be a payment entry
});

// before update
subledgerReferenceSchema.pre('findOneAndUpdate', async function (next) {
    const query = this.getQuery();
    const update = this.getUpdate();
    const docToUpdate = await this.model.findOne(query);
    // if not lessee then clear lessee exclusive info
    if (docToUpdate && update.isLessee === false) {
        update.area = null;
        update.initialRate = null;
        update.yearlyIncrease = null;
        update.periodStart = null;
        update.periodEnd = null;
        update.vat = 12;
        update.ewt = null;
        update.fvat = null;
        update.cwt = null;
        update.securityDepositIsMonthlyRental = false;
        update.escalation = [];
        update.billingDate = null,
        update.dueDate = null,
        update.penalty = 0
    }else{
        // build an array of billing and due dates
        // get all months in this range
        let months = getMonthsInRange(update.periodStart, update.periodEnd); 
        let billingDs = [];
        for(let i = 0; i < months.length; i++){
            if(update.billingDate === 'last'){
                // get the last day of this month
                const lastDay = getLastDayoOfMonth(months[i].year, months[i].month);
                billingDs.push(new Date(Date.UTC(months[i].year, months[i].month, lastDay)));
            }else{
                billingDs.push(new Date(Date.UTC(months[i].year, months[i].month, parseInt(update.billingDate))));
            }
        }
        // same logic for due date
        update.billingDateSchedules = billingDs;
        const dueDs = [];
        for(let i = 0; i < months.length; i++){
            if(update.dueDate === 'last'){
                const lastDay = getLastDayoOfMonth(months[i].year, months[i].month);
                dueDs.push(new Date(Date.UTC(months[i].year, months[i].month, lastDay)));
            }else{
                dueDs.push(new Date(Date.UTC(months[i].year, months[i].month, parseInt(update.dueDate))));
            }
        }
        update.dueDateSchedules = dueDs;
    }
    next();
});

// extra functions used for building schedules
function getMonthsInRange(startDate, endDate){
    const start = new Date(startDate);
    const end = new Date(endDate);
    if(start > end){
        console.log('invalid date range');
    } 
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while(current <= end){
        const year = current.getFullYear();
        const month = current.getMonth();
        months.push({year, month});
        current.setMonth(current.getMonth() + 1);
    }
    return months;
}

function getLastDayoOfMonth(year, month){
    const nextMonth = new Date(year, month + 1, 1);
    const lastDay = new Date(nextMonth - 1);
    return lastDay.getDate();
}

const SubledgerReference = mongoose.model("SubledgerReference", subledgerReferenceSchema);

module.exports = SubledgerReference;