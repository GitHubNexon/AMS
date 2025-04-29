const express = require("express");
const router = express.Router();
const municipalityController = require("../controller/municipalityController");
const { authenticateToken } = require("../controller/authController");

// Get all municipalities
router.get("/", authenticateToken, municipalityController.getAllMunicipalities);

// Route to get municipalities by province ID
router.get(
  "/by-province",
  authenticateToken,
  municipalityController.getMunicipalitiesByProvince
);

// Get a specific municipality by ID
router.get(
  "/:id",
  authenticateToken,
  municipalityController.getMunicipalityById
);

// Create municipalities
router.post(
  "/",
  authenticateToken,
  municipalityController.createMunicipalities
);

module.exports = router;
