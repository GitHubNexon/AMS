const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsReportsController = require("../controller/assetsReportsController");
router.use(authenticateToken);

router.post("/history", AssetsReportsController.getAssetsHistory);

// New route for inventory status counts for Polar Area chart
router.get("/inventory-status", AssetsReportsController.getAssetsConditions);

router.post("/get-ics-report", AssetsReportsController.getICSReport);
router.post("/get-wmr-report", AssetsReportsController.getWMRReport);

router.get(
  "/get-inventories-history",
  AssetsReportsController.getAssetsInventoriesReports
);

module.exports = router;
