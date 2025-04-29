const mongoose = require("mongoose");

const CustomReportSchema = new mongoose.Schema({
    title: {type: String},  // this title should not be editable outside and is linked with pages in frontend as constant
    /**
     * fields: {
     *  "title": ""
     * }
     */
    fields: {type: mongoose.Schema.Types.Mixed},
    rows: [
        {
            title: {type: String},
            accounts: [
                {code: {type: String}, name: {type: String}}
            ]
        }
    ]
});

const CustomReportModel = mongoose.model("CustomReport", CustomReportSchema);

module.exports = CustomReportModel;