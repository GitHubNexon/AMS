const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const FileAttachmentsModel = require('../models/FileAttachmentsModel');
const AdmZip = require('adm-zip');
const EntriesLogModel = require("../models/EntriesLog");
// Allowed MIME types and file extensions
const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
];
const allowedExts = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.jpeg', '.jpg', '.png', '.gif', '.txt'];

// Set up multer storage configuration (store in memory for zipping later)
const storage = multer.memoryStorage();

// Multer file filter to validate files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // Limit file size to 15MB
    },
    fileFilter: (req, file, cb) => {
        const isMimeValid = allowedMimes.includes(file.mimetype); // Validate MIME type
        const isExtValid = allowedExts.includes(path.extname(file.originalname).toLowerCase()); // Validate file extension

        if (isMimeValid && isExtValid) {
            return cb(null, true); // File type is allowed
        } else {
            return cb(new Error('Invalid file type')); // Invalid file type error
        }
    }
}).array('files'); // For multiple files

const FileAttachments = {
    // Handle file upload and zipping
    upload: async (req, res) => {
        const { id } = req.params; // Get the 'id' from the route parameter
        // Handle multer's errors
        if (req.fileValidationError) {
            return res.status(400).json({ message: req.fileValidationError });
        }
        // Check if no files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded.' });
        }
        // Create a list to hold the paths of all the zip files created
        const zipFiles = [];
        // Iterate over the files and zip each one separately
        for (const file of req.files) {
            const zipFileName = `${id}-${file.originalname}.zip`; // File name for the zip file
            const zipPath = path.join(__dirname, `../uploads/entries-attachment/${zipFileName}`); // Full path to save the zip file
            // Create the output stream for each zip file
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } }); // Max compression
            // Pipe the archive to the output stream (create the zip file)
            archive.pipe(output);
            // Add the current file to the zip archive
            archive.append(file.buffer, { name: file.originalname });  // Save the original file name inside the zip
            // Finalize the zip archive
            archive.finalize();
            // Add the zip file path to the list
            zipFiles.push({
                entryId: id,
                fileName: file.originalname,
                location: `/uploads/entries-attachment/${id}-${file.originalname}.zip`
            });
            // log
            await new EntriesLogModel({
                entryId: id,
                updated: {
                    field: "Attached file",
                    oldValue: '',
                    newValue: file.originalname
                },
                updatedDate: new Date(),
                updatedBy: req.user.name
            }).save();
        }
        // save info to database
        for(let i = 0; i < zipFiles.length; i++){
            const toSave = new FileAttachmentsModel(zipFiles[i]);
            await toSave.save();
        }
        // Respond after all files have been processed
        res.status(200).json({
            message: 'Files uploaded and zipped successfully!',
            zipFiles: zipFiles // Send back the paths of the generated zip files
        });
    },

    get: async (req, res) => {
        // Add your logic to retrieve the zip files if needed
        try{
            const {id} = req.params;
            const files = await FileAttachmentsModel.find({entryId: id});
            res.json(files);
        }catch(error){
            console.error(error)
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    delete: async (req, res) => {
        // Add logic for deleting the file(s)
        try{
            const { id, file } = req.body;
            // delete from server
            const filePath = `./uploads/entries-attachment/${id}-${file}.zip`;
            fs.unlink(filePath, (err)=>{
                if(err){
                    console.error('error deleting file:', err);
                    return res.status(500).json({ message: "Internal server error"});
                }
            });
            await FileAttachmentsModel.deleteOne({ entryId: id, fileName: file });
            await new EntriesLogModel({
                entryId: id,
                updated: {
                    field: "Removed attachment",
                    oldValue: file,
                    newValue: ''
                },
                updatedDate: new Date(),
                updatedBy: req.user.name
            }).save();



            res.json({ message: 'File deleted' });
        }catch(error){
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    download: async (req, res) => {
        try {
            const { id, file } = req.body;
    
            console.log(id, file);
            const zipFilePath = path.join(
                __dirname,
                '../uploads/entries-attachment',
                `${id}-${file}.zip`
            );
    
            // Check if the ZIP file exists
            if (!fs.existsSync(zipFilePath)) {
                return res.status(404).json({ message: 'ZIP file not found.' });
            }
    
            // Load the ZIP file using AdmZip
            const zip = new AdmZip(zipFilePath);
            const extractedFiles = zip.getEntries(); // Get all files inside the ZIP
    
            if (extractedFiles.length === 1) {
                // If there is only one file in the ZIP, stream it directly
                const fileToSend = extractedFiles[0];
                res.setHeader('Content-Disposition', `attachment; filename="${fileToSend.entryName}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
    
                // Stream the file directly to the response
                res.write(fileToSend.getData());
                res.end();
            } else {
                // If there are multiple files, you can either:
                // 1. Send them as a ZIP bundle, or
                // 2. Stream them one by one (you'll likely need to create a new ZIP for the response)
    
                // Create a new ZIP archive in memory with the extracted files
                const archive = new AdmZip();
                extractedFiles.forEach((entry) => {
                    archive.addFile(entry.entryName, entry.getData());
                });
    
                // Prepare the response as a download
                const buffer = archive.toBuffer();
    
                res.setHeader('Content-Disposition', `attachment; filename="${id}-unzipped-bundle.zip"`);
                res.setHeader('Content-Type', 'application/zip');
    
                // Send the ZIP bundle directly
                res.send(buffer);
            }
    
        } catch (error) {
            console.error('Error during download:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    
};

module.exports = { upload, FileAttachments };
