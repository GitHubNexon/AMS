const express = require('express');
const router = express.Router();
const SOA = require("../controller/SOA"); 
const { authenticateToken } = require("../controller/authController");

router.get('/:sl', authenticateToken, SOA.get);
router.post('/', authenticateToken, SOA.add);
router.get('/duedate/:slCode/:month/:year', SOA.findDueDate);
router.patch('/:id', authenticateToken, SOA.edit);
router.get('/last/:slCode/:glCode', authenticateToken, SOA.last);

module.exports = router;