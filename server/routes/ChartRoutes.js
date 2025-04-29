const express = require("express");
const router = express.Router();
const {
  getAccountsReceivableChart,
  getAccountsPayableChart,
} = require("../controller/ChartController");

router.get("/receivable", getAccountsReceivableChart);

router.get("/payable", getAccountsPayableChart);

module.exports = router;
