const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const employeeController = require("../controller/employeeController");

router.use(authenticateToken);

// create an record of employee
router.post("/create", employeeController.createEmployee);

//update an record of employee
router.patch("/update/:id", employeeController.updateEmployee);

//get all records of employee
router.get("/get-all", employeeController.getAllEmployeeRecords);

//delete an asset record
router.post("/delete/:id", employeeController.deleteEmployee);

//archive an asset record
router.post("/archive/:id", employeeController.archiveEmployee);

//undo delete an asset record
router.post("/undo-delete/:id", employeeController.undoDeleteEmployee);

//undo archive an asset record
router.post("/undo-archive/:id", employeeController.undoArchiveEmployee);

module.exports = router;
