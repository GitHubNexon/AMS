const multer = require('multer');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

const tempDir = path.join(__dirname, '../temp');
const uploadsDirInvoiceAttachment = path.join(__dirname, '../uploads/invoice-attachment');
const uploadsDirBillAttachment = path.join(__dirname, '../uploads/bill-attachment');

// Ensure directories exist
[uploadsDirInvoiceAttachment, uploadsDirBillAttachment, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer storage configuration for temporary file handling
const storage = multer.memoryStorage({
    destination: (req, file, cb) => cb(null, tempDir), // Temporary folder for processing
    filename: (req, file, cb) => cb(null, file.originalname) // Keep original name initially
});

// Multer instance to handle incoming files and JSON data
const withfile = multer({ storage }).fields([
    { name: 'json', maxCount: 1 },
    { name: 'files', maxCount: 100 }
]);

// Upload and compress attachments (generic function)
async function uploadAttachment(file, uploadDir) {
    const newFileName = `${generateRandomCode(4)}-${Date.now()}-${file.originalname}.gz`; // Add `.gz` extension for compressed file
    const uploadPath = path.join(uploadDir, newFileName);
    return new Promise((resolve, reject) => {
        // Compress the file buffer using gzip
        zlib.gzip(file.buffer, (err, compressedBuffer) => {
            if (err) return reject(err);

            // Write the compressed buffer to the file
            fs.writeFile(uploadPath, compressedBuffer, (err) => {
                if (err) return reject(err);
                resolve({
                    originalName: file.originalname,
                    newFileName,
                    path: uploadPath,
                });
            });
        });
    });
}

// Specific upload functions using the generic uploadAttachment function
const uploadInvoiceAttachment = (file) => uploadAttachment(file, uploadsDirInvoiceAttachment);
const uploadBillAttachment = (file) => uploadAttachment(file, uploadsDirBillAttachment);

// Generate a random code
function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

// Check for missing keys in the request body
async function checkBody(params, req, res) {
    const missingKeys = params.filter(key => !(key in req.body));
    if (missingKeys.length > 0) {
        return res.status(400).json({ error: `Missing required keys: ${missingKeys.join(', ')}` });
    }
}

// Wrapper to handle async route handlers and catch errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Function to find the gzipped file based on a wildcard pattern
const findGzippedFile = (wildcardPattern, directory) => {
    const files = fs.readdirSync(directory);
    const escapedPattern = wildcardPattern
        .replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&') // Escape special characters
        .replace(/\\\*/g, '.*'); // Convert wildcard to regex
    const regex = new RegExp(`^${escapedPattern}$`, 'i'); // Case insensitive
    const matchingFiles = files.filter(file => regex.test(file));
    return matchingFiles.length > 0 ? matchingFiles[0] : null; // Return the first matching file
};

module.exports = {
    checkBody,
    asyncHandler,
    withfile,
    uploadInvoiceAttachment,
    generateRandomCode,
    uploadBillAttachment,
    findGzippedFile
};