const mongoose = require("mongoose");

const FileAttachmentsSchema = new mongoose.Schema({
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entries' },
    fileName: { type: String },
    location: { type: String }
}, { timestamps: true });

const FileAttachmentsModel = mongoose.model('FileAttachments', FileAttachmentsSchema);

module.exports = FileAttachmentsModel;