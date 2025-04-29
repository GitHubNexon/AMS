const express = require('express');
const { authenticateToken } = require('../controller/authController');
const router = express.Router();

const TrialBalance = require('../controller/TrialBalanceController');

router.get('/', authenticateToken, TrialBalance.getStructure);

router.get('/:date', authenticateToken, TrialBalance.getReport)

router.post('/', authenticateToken, TrialBalance.addLine);

router.patch('/:id', authenticateToken, TrialBalance.updateLine);

module.exports = router;