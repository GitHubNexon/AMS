const express = require("express");
const router = express.Router();
const { authenticateToken, authenticate } = require("../controller/authController");
const  CashAdvance = require("../controller/CashAdvanceController");

// file maintenance related routes
router.get('/FileMaintenance/:slCode/:date', authenticateToken, CashAdvance.FindFile);
router.get('/FileMaintenance/sl', authenticateToken, CashAdvance.GetSLList);
router.get('/FileMaintenance', authenticateToken, CashAdvance.GetFileMaintenance);
router.post('/FileMaintenance', authenticateToken, CashAdvance.AddFileMaintenance);
router.patch('/FileMaintenance/:id', authenticateToken, CashAdvance.EditFileMaintenance);
router.delete('/FileMaintenance/:id', authenticateToken, CashAdvance.DeleteFileMaintenance);

// cash advances
router.get('/CashAdvance/unliquidated/:id', authenticateToken, CashAdvance.findUnliquidatedCA);
router.get('/CashAdvance/no', authenticateToken, CashAdvance.CANoAutoGenerate);
router.get('/CashAdvance', authenticateToken, CashAdvance.GetCA);
router.post('/CashAdvance/liquidate/:id', authenticateToken, CashAdvance.liquidate);
router.post('/CashAdvance', authenticateToken, CashAdvance.AddCA);
router.post('/CashAdvance/link', authenticateToken, CashAdvance.link);
router.delete('/CashAdvance/:id', authenticateToken, CashAdvance.deleteCA);

module.exports = router;