const express = require('express');
const router = express.Router();
const {
    readBase,
    createCompanyType, updateCompanyType, deleteCompanyType,
    createTaxType, updateTaxType, deleteTaxType,
    createAccountCategory, updateAccountCategory, deleteAccountCategory,
    // createAccountType, updateAccountType, deleteAccountType,
    createUserType, updateUserType, deleteUserType,
    getBaseAccouting, updateBaseAccounting
} = require('../controller/baseController');
const { authenticateToken } = require("../controller/authController");
const { checkBody, asyncHandler } = require("../helper/helper");

// read all base data in one request
router.get('/', authenticateToken, asyncHandler( async (req, res)=>{ await readBase(req, res) }));

// account categories
// router.post('/account/category', authenticateToken, asyncHandler(async (req, res)=>{ await createAccountCategory(req, res) }));
// router.patch('/account/category/:_id', authenticateToken, asyncHandler(async (req, res)=>{ await updateAccountCategory(req, res) }));
// router.delete('/account/category/:cat', authenticateToken, asyncHandler(async (req, res)=>{ await deleteAccountCategory(req, res) }));

// account sub categories
// router.post('/account/subcategory', authenticateToken, asyncHandler(async (req, res)=>{ await createAccountType(req, res) }));
// router.patch('/account/subcategory/:_id', authenticateToken, asyncHandler(async (req, res)=>{ await updateAccountType(req, res) }));
// router.delete('/account/subcategory/:_id', authenticateToken, asyncHandler(async (req, res)=>{ await deleteAccountType(req, res) }));

// tax
router.post('/tax', authenticateToken, asyncHandler(async (req, res)=>{ await createTaxType(req, res) }));
router.patch('/tax/:_id', authenticateToken, asyncHandler(async (req, res)=>{ await updateTaxType(req, res) }));
router.delete('/tax/:_id', authenticateToken, asyncHandler(async (req, res)=>{ await deleteTaxType(req, res) }));

// company types
router.post('/company', authenticateToken, asyncHandler( async (req, res)=>{ await createCompanyType(req, res) }));
router.patch('/company/:_id', authenticateToken, asyncHandler( async (req, res)=>{ await updateCompanyType(req, res) }));
router.delete('/company/:_id', authenticateToken, asyncHandler( async (req, res)=>{ await deleteCompanyType(req, res) }));

// user types
router.post('/user', authenticateToken, asyncHandler( async (req, res)=>{ await createUserType(req, res) }));
router.patch('/user/:_id', authenticateToken, asyncHandler( async (req, res)=>{ await updateUserType(req, res) }));
router.delete('/user/:_id', authenticateToken, asyncHandler( async (req, res)=>{ await deleteUserType(req, res) }));

router.get('/accounting', authenticateToken, getBaseAccouting);
router.patch('/accounting', authenticateToken, updateBaseAccounting);

module.exports = router;