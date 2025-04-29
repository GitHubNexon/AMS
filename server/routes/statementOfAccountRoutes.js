const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const statementOfAccount = require("../controller/StatementOfAccountController");

router.get('/total/:asof/:sl/:acc', authenticateToken, statementOfAccount.total);
router.get('/last/:id/:sl', authenticateToken, statementOfAccount.lastRow);
router.get('/recalc/:id/:acc', authenticateToken, statementOfAccount.sync);
router.get('/billing/:asof', authenticateToken, statementOfAccount.billing);
router.get('/:from/:to/:account/:client', authenticateToken, statementOfAccount.get);
router.post('/', authenticateToken, statementOfAccount.add);

router.patch('/:id', authenticateToken, statementOfAccount.update);

router.delete('/:id', authenticateToken, statementOfAccount.delete);

module.exports = router;