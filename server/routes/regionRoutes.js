// routes/regionRoutes.js
const express = require("express");
const router = express.Router();
const regionController = require("../controller/regionController");
const { authenticateToken } = require("../controller/authController");

// Get all regions
router.get("/", authenticateToken, regionController.getAllRegions);

// Get a specific region by ID
router.get("/:id", authenticateToken, regionController.getRegionById);

// Create regions
router.post("/", authenticateToken, regionController.createRegions);

module.exports = router;
