const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  getWorkGroupBudget,
  getUtilizationReport,
  getPerAccountReport,
} = require("../controller/BudgetReportController");

router.post("/work-Group", authenticateToken, getWorkGroupBudget);

router.post("/utilization", authenticateToken, getUtilizationReport);

router.post("/per-Account", authenticateToken, getPerAccountReport);

module.exports = router;
