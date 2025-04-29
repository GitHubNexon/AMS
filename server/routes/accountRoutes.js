const express = require('express');
const router = express.Router();
const { checkBody, asyncHandler } = require("../helper/helper");
const { authenticateToken } = require('../controller/authController');
const {
    addNewAccount,
    getAccounts,
    updateAccount,
    archiveAccount
} = require('../controller/accountController');

router.post('/', authenticateToken, asyncHandler(async (req, res)=>{
    await addNewAccount(req, res);
}));

router.patch('/:id', authenticateToken, asyncHandler(async (req, res)=>{
    await updateAccount(req, res);
}));

router.get('/', authenticateToken, asyncHandler(async (req, res)=>{
    await getAccounts(req, res);
}));

router.delete('/:id', authenticateToken, asyncHandler(async (req, res)=>{
    await archiveAccount(req, res);
}));

// router.post('/', authenticateToken, asyncHandler(async (req, res)=>{
//     checkBody(['code', 'description', 'name', 'account', 'taxes'], req, res);
//     await addNewAccount(req, res);
// }));


// router.get('/', authenticateToken, asyncHandler(async (req, res)=>{
//     await getAccounts(req, res);
// }));

// router.patch('/', authenticateToken, asyncHandler(async (req, res)=>{
//     checkBody(['code', 'description', 'name', 'account', 'taxes'], req, res);
//     await updateAccount(req, res);
// }));

// router.patch('/archive/:id', authenticateToken, asyncHandler(async (req, res)=>{
//     await archiveAccount(req, res);
// }));

module.exports = router;