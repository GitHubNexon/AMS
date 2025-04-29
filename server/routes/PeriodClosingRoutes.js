const express = require('express');
const router = express.Router();
const PeriodClosing = require('../controller/PeriodClosingController'); 
const { authenticateToken } = require("../controller/authController");

router.get('/', authenticateToken, PeriodClosing.get);
router.get('/check/:date', authenticateToken, PeriodClosing.check);
router.post('/', authenticateToken, PeriodClosing.add);
router.patch('/:id', authenticateToken, PeriodClosing.reopen);
router.delete('/:id', authenticateToken, PeriodClosing.delete)

module.exports = router;

