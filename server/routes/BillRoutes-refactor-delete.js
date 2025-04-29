const BillController = require('../controller/BillController');
const express = require('express');
const router = express.Router();
const {withfile} = require('../helper/helper');

router.get('/', BillController.getBills);

router.get('/attachment/:id/:filename', BillController.downloadAttachment);

router.get('/id', BillController.generateRandomBillNo);

router.post('/', withfile, BillController.createBill);

router.post('/pay', withfile, BillController.pay);

router.post('/pay/batch', BillController.payBatch);

router.patch('/:id', withfile, BillController.editBill);

router.delete('/:id', BillController.deleteBill);

module.exports = router;