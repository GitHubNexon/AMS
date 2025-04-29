const mongoose = require("mongoose");

const SubReportSchema = new mongoose.Schema({
    title: { type: String },
    rows: [
        {
            description: {type: String},
            customCalc: { type: String },
            value: [{            
                code: { type: String },
                name: { type: String },
                operateNext: { type: String },
                group: { type: String, default: null }
            }]
        }
    ]
});

const SubReport = mongoose.model("SubReport", SubReportSchema);
module.exports = SubReport;