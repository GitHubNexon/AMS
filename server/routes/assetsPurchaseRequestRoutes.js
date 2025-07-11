const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const assetsPurchaseRequestController = require("../controller/assetsPurchaseRequestController");
router.use(authenticateToken);

router.post("/create", assetsPurchaseRequestController.createPurchaseRequest);

router.patch(
  "/update/:id",
  assetsPurchaseRequestController.updatePurchaseRequest
);

router.get("/get-all", assetsPurchaseRequestController.getAllPurchaseRequest);

// Soft delete
router.post(
  "/soft-delete/:id",
  assetsPurchaseRequestController.softDeletePurchaseRequest
);

// Soft archive
router.post(
  "/soft-archive/:id",
  assetsPurchaseRequestController.softArchivePurchaseRequest
);

// Undo delete
router.post(
  "/undo-delete/:id",
  assetsPurchaseRequestController.undoDeletePurchaseRequest
);

// Undo archive
router.post(
  "/undo-archive/:id",
  assetsPurchaseRequestController.undoArchivePurchaseRequest
);

module.exports = router;
