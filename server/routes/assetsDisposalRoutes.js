const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsDisposalController = require("../controller/assetsDisposalController");

router.use(authenticateToken);

router.post("/create", AssetsDisposalController.createAssetsDisposal);
router.patch("/update/:id", AssetsDisposalController.updateAssetsDisposal);

module.exports = router;
