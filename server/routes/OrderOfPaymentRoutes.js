const express = require('express');
const OrderOfPaymentController = require("../controller/OrderOfPaymentController");
const { authenticateToken } = require("../controller/authController");

const router = express.Router();

router.post('/autonumber/:count', authenticateToken, OrderOfPaymentController.autonumber);
router.post('/cancel/:id', authenticateToken, OrderOfPaymentController.cancelOrder);
router.post('/link', authenticateToken, OrderOfPaymentController.link);
// Route to add a new order of payment
router.post('/', authenticateToken, OrderOfPaymentController.saveOrder);

// Route to retrieve orders of payment
router.get('/', authenticateToken, OrderOfPaymentController.getAllOrders);


router.get('/prev/:id', authenticateToken, OrderOfPaymentController.getPrevious);

router.get('/find/:id', authenticateToken, OrderOfPaymentController.find);

router.get('/imbalance', authenticateToken, OrderOfPaymentController.imbalance);

router.get('/validate/:no', authenticateToken, OrderOfPaymentController.validate);

router.delete('/:id', authenticateToken, OrderOfPaymentController.deleteOrder);

module.exports = router;