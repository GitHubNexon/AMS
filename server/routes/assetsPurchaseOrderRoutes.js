const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const assetsPurchaseOrderController = require("../controller/assetsPurchaseOrderController");
router.use(authenticateToken);

router.post("/create", assetsPurchaseOrderController.createPurchaseOrder);

router.patch("/update/:id", assetsPurchaseOrderController.updatePurchaseOrder);

router.get("/get-all", assetsPurchaseOrderController.getAllPurchaseOrder);

// Soft delete
router.post(
  "/soft-delete/:id",
  assetsPurchaseOrderController.softDeletePurchaseOrder
);

// Soft archive
router.post(
  "/soft-archive/:id",
  assetsPurchaseOrderController.softArchivePurchaseOrder
);

// Undo delete
router.post(
  "/undo-delete/:id",
  assetsPurchaseOrderController.undoDeletePurchaseOrder
);

// Undo archive
router.post(
  "/undo-archive/:id",
  assetsPurchaseOrderController.undoArchivePurchaseOrder
);

module.exports = router;
