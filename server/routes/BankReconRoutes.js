const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  getTransaction,
  createBankReconciliation,
  updateBankReconciliation,
  deleteBankReconciliation,
  getAllBankReconciliation,
  getUnRecordedTransaction,
  getOutstandingById,
  getUnrecordedById,
  getBookEndingBalance,
  getBookBeginingBalance
} = require("../controller/BankReconController");

// Route for getting transactions
router.post("/transactions", authenticateToken, getTransaction);

router.post("/BookEndingBalance", authenticateToken, getBookEndingBalance);
router.post("/BookBeginningBalance", authenticateToken, getBookBeginingBalance);


// Route for getting transactions
router.post(
  "/Unrecorded_transactions",
  authenticateToken,
  getUnRecordedTransaction
);

// Route for getting transactions
router.get("/Outstanding/:id", authenticateToken, getOutstandingById);

// Route for getting transactions
router.get("/Unrecorded/:id", authenticateToken, getUnrecordedById);

// Route for creating a bank reconciliation
router.post("/create", authenticateToken, createBankReconciliation);

// Route for updating a bank reconciliation
router.patch("/update/:id", authenticateToken, updateBankReconciliation);

// Route for deleting a bank reconciliation
router.delete("/delete/:id", authenticateToken, deleteBankReconciliation);

//Route for get all bank reconciliation

router.get("/all", authenticateToken, getAllBankReconciliation);

module.exports = router;
