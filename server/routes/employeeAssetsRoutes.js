const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const EmployeeAssetsController = require("../controller/employeeAssetsController");

router.use(authenticateToken);

// Create a new employee assets record
router.post("/create", EmployeeAssetsController.createEmployeeAssetsRecord);

// Update an existing employee assets record
router.patch(
  "/update/:id",
  EmployeeAssetsController.updateEmployeeAssetsRecord
);

// Get all employee assets records
router.get("/get-all", EmployeeAssetsController.getEmployeeAssetsRecord);

module.exports = router;
