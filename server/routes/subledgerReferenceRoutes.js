const express = require('express');
const router = express.Router();
const subledgerReference = require('../controller/subledgerReferenceController');
const { authenticateToken } = require("../controller/authController");

// this also handles data for lessee

router.get('/', authenticateToken, subledgerReference.search);

router.get('/paginated', authenticateToken, subledgerReference.paginated);

router.get('/escalation/:date', authenticateToken, subledgerReference.getBillFor);

router.post('/', authenticateToken, subledgerReference.create);

router.patch('/:id', authenticateToken, subledgerReference.update);

module.exports = router;