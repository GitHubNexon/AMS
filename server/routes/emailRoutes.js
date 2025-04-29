const express = require("express");
const { authenticateToken } = require("../controller/authController");
const { sendEmail } = require("../controller/emailController");
const upload = require("../middleware/multerMiddleware");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Route to send an email with optional attachments
router.post("/send-email",authenticateToken, upload.array("attachments", 5), async (req, res) => {
  const { from, to, subject, text } = req.body;
  const attachments = req.files; // Access the uploaded files

  try {
    // Pass attachments as an array of objects containing necessary info
    await sendEmail({ from, to, subject, text, attachments });

    // Files successfully sent, now delete them
    attachments.forEach((file) => {
      const filePath = path.join(__dirname, "..", "uploads", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${file.filename}`, err);
        } else {
          console.log(`File deleted: ${file.filename}`);
        }
      });
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

router.get("/email-config", (req, res) => {
  res.json({ from: process.env.EMAIL_USER }); // or whatever your email config is
});

module.exports = router;
