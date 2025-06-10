const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const assetExportController = require("../controller/assetsExportController");

router.use(authenticateToken);

router.post("/history", assetExportController.exportAssetHistory);

module.exports = router;
