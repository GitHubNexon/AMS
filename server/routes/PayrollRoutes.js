const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const PayrollController = require("../controller/PayrollController");

router.get("/", authenticateToken, PayrollController.getPayroll);

router.post("/", authenticateToken, PayrollController.savePayroll);

router.post("/link", authenticateToken, PayrollController.link);

router.post("/settings", authenticateToken, PayrollController.saveSettings);

router.get("/settings", authenticateToken, PayrollController.getSettings);


module.exports = router;