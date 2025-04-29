const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  exportAlphaListTaxReport,
  exportAlphaListOutputTaxReport,
  exportEWTReport,
  exportFVATReport,
  exportWPTReport,
  exportWTCReport,
  exportDepreciation,
  exportTransactionList
} = require("../controller/ExportController");

// Route for exporting AlphaListTaxReport
router.post(
  "/alphalisttaxreport/excel",
  authenticateToken,
  exportAlphaListTaxReport
);
router.post(
  "/alphalisttaxreport/OutputTax/excel",
  authenticateToken,
  exportAlphaListOutputTaxReport
);
router.post("/exportEWTReport/excel", authenticateToken, exportEWTReport);
router.post("/exportFVATReport/excel", authenticateToken, exportFVATReport);
router.post("/exportWPTReport/excel", authenticateToken, exportWPTReport);
router.post("/exportWTCReport/excel", authenticateToken, exportWTCReport);
router.post("/exportDepreciation/excel", authenticateToken, exportDepreciation);
router.post("/exportTransactionList/excel", authenticateToken, exportTransactionList);



module.exports = router;
