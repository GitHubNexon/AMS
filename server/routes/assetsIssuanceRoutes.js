const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsIssuanceController = require("../controller/assetsIssuanceController");

router.use(authenticateToken);

//create Assets issuance records
router.post("/create", AssetsIssuanceController.createAssetsIssuance);

router.get("/get-all", AssetsIssuanceController.getAllAssetsIssuanceRecords);

module.exports = router;
