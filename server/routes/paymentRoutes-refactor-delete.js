const express = require("express");
const router = express.Router();
const paymentController = require("../controller/PaymentController"); // Adjust the path as needed
const { authenticateToken } = require("../controller/authController");

router.get(
  "/PaymentInvoices",
  authenticateToken,
  paymentController.getALLinvoicesPayments
);

// Export the router
module.exports = router;
