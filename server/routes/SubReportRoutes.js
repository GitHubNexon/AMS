const express = require('express');
const router = express.Router();
const SubReportController = require('../controller/SubReportController');
const { authenticateToken } = require("../controller/authController");

// default subreport
router.get('/', authenticateToken, SubReportController.get);
router.post('/', authenticateToken, SubReportController.add);
router.patch('/:id', authenticateToken, SubReportController.update);

router.get('/EC', authenticateToken, SubReportController.ECget);
router.post('/EC', authenticateToken, SubReportController.ECupsert);

module.exports = router;