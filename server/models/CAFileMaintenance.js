const mongoose = require("mongoose");

const CAFileMaintenanceSchema = new mongoose.Schema({
    riskNumber: { type: String },
    subledger: { type: mongoose.Schema.Types.Mixed },
    maxAccAmount: { type: Number },
    bondAmount: { type: Number },
    pettyCash: { type: Number },
    bondPeriodStart: { type: Date },
    bondPeriodEnd: { type: Date },
    bonded: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model("CaFileMaintenance", CAFileMaintenanceSchema);