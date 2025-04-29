const express = require("express");
const router = express.Router();
const EntriesReportController = require("../controller/EntriesReportController");
const { authenticateToken } = require("../controller/authController");



// Report for AlphaList Tax with Date Range based on AlphaList Date
router.get(
  "/AlphaListTax/report/DateRange",
  authenticateToken,
  EntriesReportController.getReportForAlphalistTax
);

router.get(
  "/AlphaListTax/report/DateRange/OutputTax",
  authenticateToken,
  EntriesReportController.getReportForAlphalistOutputTax
);

router.get(
  "/AlphaListTax/report/DateRange/EWT",
  authenticateToken,
  EntriesReportController.getReportForEWT
);

router.get(
  "/AlphaListTax/report/DateRange/FVAT",
  authenticateToken,
  EntriesReportController.getReportForFVAT
);

router.get(
  "/AlphaListTax/report/DateRange/WPT",
  authenticateToken,
  EntriesReportController.getReportForWPT
);

router.get(
  "/AlphaListTax/report/DateRange/WTC",
  authenticateToken,
  EntriesReportController.getReportForWTC
);

router.get(
  "/AlphaListTax/report/2307/:id",
  authenticateToken,
  EntriesReportController.get2307
);

module.exports = router;
