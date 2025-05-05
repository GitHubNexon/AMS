const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const employeeController = require("../controller/employeeController");

router.use(authenticateToken);

// create an record of employee
router.post("/create", employeeController.createEmployee);

//update an record of employee
router.patch("/update/:id", employeeController.updateEmployee);

module.exports = router;
