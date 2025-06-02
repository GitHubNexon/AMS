const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsReportsController = require("../controller/assetsReportsController");
router.use(authenticateToken);

router.post("/history", AssetsReportsController.getAssetsHistory);

module.exports = router;
