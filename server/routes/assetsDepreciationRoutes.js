const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const assetsDepreciationController = require("../controller/assetsDepreciationController");

router.use(authenticateToken);

router.get(
  "/get-monthly/:assetId",
  assetsDepreciationController.generateMonthlyDepreciation
);

router.get(
  "/get-all-monthly",
  assetsDepreciationController.generateAllMonthlyAssetsDepreciation
);

module.exports = router;
