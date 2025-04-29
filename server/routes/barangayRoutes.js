// routes/barangayRoutes.js
const express = require("express");
const router = express.Router();
const barangayController = require("../controller/barangayController");
const { authenticateToken } = require("../controller/authController");

// Get all barangays
router.get("/", authenticateToken, barangayController.getAllBarangays);

// Get barangays by municipality ID
router.get(
  "/by-municipality",
  authenticateToken,
  barangayController.getBarangaysByMunicipality
);

// Get a specific barangay by ID
router.get("/:id", authenticateToken, barangayController.getBarangayById);

// Create barangays
router.post("/", authenticateToken, barangayController.createBarangays);

module.exports = router;
