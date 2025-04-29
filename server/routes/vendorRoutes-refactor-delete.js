const express = require("express");
const router = express.Router();
const vendorController = require("../controller/vendorController");
const { authenticateToken } = require("../controller/authController");

// Create a new vendor
router.post("/", authenticateToken, vendorController.createVendor);

// Get all vendors
router.get("/", authenticateToken, vendorController.getAllVendors);

// Update a vendor
router.patch("/:id", authenticateToken, vendorController.patchVendor);

// Delete a vendor (assuming this method will be created in the controller)
router.delete("/:id", authenticateToken, vendorController.deleteVendor);

// Get a specific vendor by ID
router.get("/:id", authenticateToken, vendorController.getVendorById);


module.exports = router;
