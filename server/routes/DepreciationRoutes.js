const express = require("express");
const router = express.Router();
const DepreciationController = require("../controller/DepreciationController");
const { authenticateToken } = require("../controller/authController");

router.post(
  "/create",
  authenticateToken,
  DepreciationController.createDepreciation
);
router.patch(
  "/update/:id",
  authenticateToken,
  DepreciationController.updateDepreciation
);
router.post(
  "/delete/:id",
  authenticateToken,
  DepreciationController.deleteDepreciation
);
router.post(
  "/archive/:id",
  authenticateToken,
  DepreciationController.archiveDepreciation
);
router.post(
  "/undo-delete/:id",
  authenticateToken,
  DepreciationController.undoDeleteDepreciation
);
router.post(
  "/undo-archive/:id",
  authenticateToken,
  DepreciationController.undoArchiveDepreciation
);
router.get(
  "/all",
  authenticateToken,
  DepreciationController.getAllDepreciations
);
router.patch(
  "/monitor/monthly/:id",
  authenticateToken,
  DepreciationController.getUpdatedMonthlyDepreciation
);

router.get(
  "/summary",
  authenticateToken,
  DepreciationController.getSummaryDepreciation
);

router.post(
  "/link",
  authenticateToken,
  DepreciationController.getLinkDepreciation
);

router.post(
  "/all-link",
  authenticateToken,
  DepreciationController.getAllLinkDepreciation
);

router.get(
  "/updated/:id",
  authenticateToken,
  DepreciationController.getUpdatedById
);

router.post("/sell", authenticateToken, DepreciationController.sellItem);

router.get(
  "/inventory",
  authenticateToken,
  DepreciationController.getInventoryTable
);

router.get(
  "/reference",
  authenticateToken,
  DepreciationController.getReference
);

router.post(
  "/update-condition",
  authenticateToken,
  DepreciationController.updateCondition
);

router.post("/sell-item", authenticateToken, DepreciationController.sellItem);

router.patch(
  "/update-sell-item/:id",
  authenticateToken,
  DepreciationController.updateSellItem
);

router.delete(
  "/delete-sell-item/:id",
  authenticateToken,
  DepreciationController.deleteSellItem
);
module.exports = router;
