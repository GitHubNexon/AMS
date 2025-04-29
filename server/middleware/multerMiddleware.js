const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Use an absolute path to the uploads folder
  },
  filename: (req, file, cb) => {
    // Save the file with a unique name (timestamp + original name)
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix); // Rename the file
  },
});

// Initialize upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/; // Define accepted file types
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File type not supported");
  },
});

// Middleware to handle file uploads, allowing multiple attachments
upload.array("attachments", 10); // Adjust max files if needed

module.exports = upload;
