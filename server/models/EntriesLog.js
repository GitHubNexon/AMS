const mongoose = require('mongoose');

const EntriesLogSchema = new mongoose.Schema({
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' },
    updated: { type: mongoose.Schema.Types.Mixed },
    updatedDate: { type: Date },
    updatedBy: { type: String }
});

const EntriesLogModel = mongoose.model("EntriesLog", EntriesLogSchema);

module.exports = EntriesLogModel;