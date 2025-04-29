const mongoose = require('mongoose');

const CustomizedReportSchema = new mongoose.Schema({
    reportName: { type: String },
    fields: [
        {
            title: { type: String },
            value: [
                {
                    accounts: [ { type: String } ],
                    operateNext: { type: String }
                }
            ]
        }
    ]
});

const CustomizedReportModel = mongoose.model("CustomizedReport", CustomizedReportSchema);

module.exports = CustomizedReportModel;