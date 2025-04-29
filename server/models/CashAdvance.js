const mongoose = require("mongoose");

const CashAdvanceSchema = new mongoose.Schema({
    caNo: { type: String, unique: true, required: true },
    date: { type: Date, required: true },
    file: { type: mongoose.Types.ObjectId, ref: "CaFileMaintenance" },
    amount: { type: Number, required: true, min: 0 },
    particulars: { type: String },
    preparedBy: { type: String },
    caBal: { type: Number },
    pettyCash: { type: Number },
    linkedDV: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries', default: null },
    linkedJV: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries', default: null },
    linkedForEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'EntriesTemp', default: null },
    status: { type: String, enum: ['for entry', 'for liquidation', 'unliquidated', 'liquidated'], default: 'unliquidated' }
}, { timestamps: true });

module.exports = mongoose.model("CashAdvance", CashAdvanceSchema);
