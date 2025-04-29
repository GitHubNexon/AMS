const express = require('express');
const { authenticateToken } = require("../controller/authController");
const CustomizedReport = require("../controller/CustomizedReportController");
const router = express.Router();

router.get('/', authenticateToken, CustomizedReport.list);

router.get('/:id', authenticateToken, CustomizedReport.report);

router.patch('/:id', authenticateToken, CustomizedReport.update)

router.post('/', authenticateToken, CustomizedReport.add);

module.exports = router;