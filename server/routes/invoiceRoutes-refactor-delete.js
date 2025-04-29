const express = require("express");
const router = express.Router();
const invoiceController = require("../controller/InvoicesController"); // Adjust the path as needed
const { authenticateToken } = require("../controller/authController");
const { withfile } = require("../helper/helper");

// Route for getting a temporary invoice number
router.get(
  "/temporary",
  authenticateToken,
  invoiceController.getTemporaryInvoiceNumber
);

// Route for creating a new invoice
router.post("/", withfile, authenticateToken, invoiceController.createInvoice);

// Route for getting all invoices
router.get("/", authenticateToken, invoiceController.getAllInvoices);

// Route for updating an invoice by ID
router.patch(
  "/:id",
  authenticateToken,
  withfile,
  invoiceController.updateInvoice
);

// Route for getting an invoice by ID
router.get("/:id", authenticateToken, invoiceController.getInvoiceById);

// Route for getting invoices by customer ID
router.post(
  "/customer/:id",
  authenticateToken,
  invoiceController.getInvoiceByCustomerId
);

// Route for deleting an invoice by ID
router.delete("/:id", authenticateToken, invoiceController.deleteInvoiceById);

// invoice payment recording process
router.post("/pay", authenticateToken, withfile, invoiceController.payInvoices);

// get attachment files from payments
router.get(
  "/pay/attachment/:id/:filename",
  authenticateToken,
  invoiceController.downloadPaymentAttachment
);

// Export the router
module.exports = router;
