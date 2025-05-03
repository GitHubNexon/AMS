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


//delete an asset record
router.post("/delete/:id", EmployeeAssetsController.deleteEmployeeAsset);

//archive an asset record
router.post("/archive/:id", EmployeeAssetsController.archiveEmployeeAsset);

//undo delete an asset record
router.post("/undo-delete/:id", EmployeeAssetsController.undoDeleteEmployeeAsset);

//undo archive an asset record
router.post("/undo-archive/:id", EmployeeAssetsController.undoArchiveEmployeeAsset);

module.exports = router;

