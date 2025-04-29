// routes/provinceRoutes.js
const express = require("express");
const router = express.Router();
const provinceController = require("../controller/provincesController");
const { authenticateToken } = require("../controller/authController");

// Get all provinces
router.get("/", authenticateToken, provinceController.getAllProvinces);

// Route to get provinces by region ID
router.get(
  "/by-region",
  authenticateToken,
  provinceController.getProvincesByRegion
); // Changed route to /by-region

// Get a specific province by ID
router.get("/:id", authenticateToken, provinceController.getProvinceById);

// Create provinces
router.post("/", authenticateToken, provinceController.createProvinces);

module.exports = router;
