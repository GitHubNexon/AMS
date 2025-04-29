const express = require("express");
const router = express.Router();
const customerController = require("../controller/customerController");
const { authenticateToken } = require("../controller/authController");

// Create a new customer
router.post("/", authenticateToken, customerController.createCustomer);

// Get all customers
router.get("/", authenticateToken, customerController.getAllCustomers);

// Update a customer
router.patch("/:id", authenticateToken, customerController.patchCustomer);

// Delete a customer
router.delete("/:id", authenticateToken, customerController.deleteCustomer);

// Get a specific customer by ID
router.get("/:id", authenticateToken, customerController.getCustomerById);

// get customer credit
router.get("/credit/:id", authenticateToken, customerController.getCredit);

// get list of customer invoice transactions with optional query ?s=0&e=10&q=invoiceid (start, end, query. default is: 0, 1000, '')
router.get("/invoice/:id", authenticateToken, customerController.getCustomerTransactions);

module.exports = router;