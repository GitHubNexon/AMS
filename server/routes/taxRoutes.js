const express = require("express");
const router = express.Router();
const taxController = require("../controller/taxController");
const { authenticateToken } = require("../controller/authController");
// Import the controller

// POST route for creating a new tax
router.post("/", authenticateToken, taxController.createTax);

// DELETE route for deleting a tax entry by id
router.delete("/delete/:id", authenticateToken, taxController.deleteTax);

// GET route for fetching all taxes
router.get("/getAll", authenticateToken, taxController.getAllTaxes);

// GET route for fetching a specific tax by ID
router.get("/get/:id", authenticateToken, taxController.getTaxById);

// PATCH route for updating a tax by ID
router.patch("/update/:id", authenticateToken, taxController.updateTax);

module.exports = router;
