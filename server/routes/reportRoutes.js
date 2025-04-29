const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  getSimpleInvoiceStatusReport,
  getBook,
  // getBookSummary,
  getTrialBalance,
  getStraighSchedule,
  exportStraighSchedule,
  // fullStraightSchedule,
  // fullTrialBalance,
  // valuesPrevMonthCurrentINCDEC,
  fixedTrialBalance,
  fetchTree,

  trialBalance,
  straightschedule,
  exportEntries,
  searchEntries,
  getEntryYears,
  bookBalance

} = require("../controller/reportController");
const custom = require("../controller/CustomReportController");

const OtherReports = require("../controller/OtherReportsController");

// Apply authentication to the root route
router.get("/", authenticateToken, async (req, res) => {
  res.send("test");
});

// Apply authentication to the invoice status report route
router.get("/invoice/status/simple", authenticateToken, async (req, res) => {
  getSimpleInvoiceStatusReport(req, res);
});


// REFACTORING MAY BE DELETED LATER
// get transactions on book
router.get("/book", authenticateToken, async (req, res)=>{
  const {entry='', ledger='', subledger='', from='', to=''} = req.query;
  const response = await getBook(entry, ledger, subledger, from, to);
  res.json(response);
});
// get book credit and debit only
// router.get("/book/summary", authenticateToken, async (req, res)=>{
//   const {entry='', ledger='', subledger='', from='', to=''} = req.query;
//   const response = await getBookSummary(entry, ledger, subledger, from, to);
//   res.json(response);
// });
// router.get('/trialbalance/:date', authenticateToken, getTrialBalance);
router.get('/trialbalance', authenticateToken, getTrialBalance);
router.get('/straightschedule/:start/:end', authenticateToken, getStraighSchedule);
router.post('/straightschedule/export/:start/:end', authenticateToken, exportStraighSchedule);
// 

// refactoring...
router.post('/custom', authenticateToken, custom.create);

// optimized refactored functions

// customized report
router.get('/custom/:title', authenticateToken, custom.get);
router.patch('/custom/:title', authenticateToken, custom.edit);
router.post('/custom/layout1/:title', authenticateToken, custom.valuesPrevMonthCurrentINCDEC);

// accounts tree related reports
router.post('/fullStraightSchedule', authenticateToken, straightschedule);
router.get('/fullTrialBalance/:start/:end', authenticateToken, trialBalance);

// experimental
router.get('/fixedTrialBalance/:start/:end', authenticateToken, fixedTrialBalance);

router.get('/tree', authenticateToken, fetchTree);

router.get('/entries/export', authenticateToken, exportEntries);
router.get('/entries/search', authenticateToken, searchEntries);

router.get('/entries/years', authenticateToken, getEntryYears);

router.get('/book/summary', authenticateToken, bookBalance);

// other reports
router.post('/other/transactionList', authenticateToken, OtherReports.getTransactionList);
router.post('/other/transactionList/export', authenticateToken, OtherReports.getTransactionListExport);

router.post('/other/generalLedger', authenticateToken, OtherReports.getGeneralLedger);
router.post('/other/generalLedger/export', authenticateToken, OtherReports.getGeneralLedgerExport);

router.get('/other/depositSlip', authenticateToken, OtherReports.getDepostSlip);
router.get('/other/depositSlip/export', authenticateToken, OtherReports.getDepostSlipExport);

router.get('/other/cashReceipt', authenticateToken, OtherReports.getCashReceipt);
router.get('/other/cashReceipt/export', authenticateToken, OtherReports.getCashReceiptExport);

router.get('/other/disbursementVoucher', authenticateToken, OtherReports.getDisbursementVoucher);
router.get('/other/disbursementVoucher/export', authenticateToken, OtherReports.getDisbursementVoucherExport);

router.get('/other/journalVoucher', authenticateToken, OtherReports.getJournalVoucher);
router.get('/other/journalVoucher/export', authenticateToken, OtherReports.getJournalVoucherExport);

router.post('/other/subsidiary', authenticateToken, OtherReports.getSubsidiary);
router.post('/other/subsidiary/export', authenticateToken, OtherReports.getSubsidiaryExport);

module.exports = router;