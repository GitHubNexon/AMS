const mongoose = require('mongoose');

const ReportEquityChangesSetupSchema = new mongoose.Schema(
    {
        position: { type: String },
        customCalc: { type: String },
        value: [{            
            code: { type: String },
            name: { type: String },
            operateNext: { type: String },
            group: { type: String, default: null }
        }]
    }
);

module.exports = mongoose.model('ReportEquityChanges', ReportEquityChangesSetupSchema);