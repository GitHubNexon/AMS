const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const EmployeeAssetsController = require("../controller/employeeAssetsController");

router.use(authenticateToken);

// Create a new employee assets record
router.post("/create", EmployeeAssetsController.createEmployeeAssetsRecord);

module.exports = router;
