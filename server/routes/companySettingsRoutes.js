const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  createOrUpdateSettings,
  getCompanySettings,
  updateCompanySettings,
} = require("../controller/companySettingsController");

// Wrapper to handle async route handlers and catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create or Update Company Settings
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await createOrUpdateSettings(req, res);
  })
);

// Get Company Settings
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await getCompanySettings(req, res);
  })
);

// Update Company Settings
router.put(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await updateCompanySettings(req, res);
  })
);

module.exports = router;
