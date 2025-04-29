const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailModel"); // Assuming you've created the model
require("dotenv").config();

// Reusable email controller with logging
const sendEmail = async ({
  from,
  to,
  subject,
  text,
  html,
  attachments = [], // Default to empty array if no attachments
}) => {
  try {
    // Create the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Change to your email service
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email
        pass: process.env.EMAIL_PASS, // Use environment variable for app password
      },
    });

    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to, // Recipient's email
      subject, // Subject of the email
      text, // Plain text body (optional)
      html, // HTML version of the body (optional)
      attachments: attachments.map((att) => ({
        filename: att.originalname, // Use original name for the email
        path: att.path, // Path to the saved file
        contentType: att.mimetype, // MIME type from the uploaded file
      })),
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log the email as sent
    const emailLog = new EmailLog({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      body: text || html, // Log the body (text or html)
      attachments: mailOptions.attachments.map((att) => ({
        filename: att.filename,
        contentType: att.contentType, // Only log essential info
      })),
      attachments: mailOptions.attachments, // Store the detailed attachment objects
      status: "sent", // Email successfully sent
    });
    await emailLog.save();

    console.log("Email sent and logged successfully");
  } catch (error) {
    console.error("Error sending email:", error);

    // Log the email as failed
    const emailLog = new EmailLog({
      from: process.env.EMAIL_USER, // Fallback to default email if 'from' is missing
      to,
      subject,
      body: text || html, // Log the body (text or html)
      status: "failed", // Email failed
      errorMessage: error.message, // Capture the error message
    });
    await emailLog.save();

    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
