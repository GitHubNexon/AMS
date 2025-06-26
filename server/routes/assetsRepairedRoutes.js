const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsRepairedController = require("../controller/assetsRepairedController");

router.use(authenticateToken);

router.post("/create", AssetsRepairedController.createAssetsRepaired);

router.patch("/update/:id", AssetsRepairedController.updateAssetsRepaired);

router.get("/get-all", AssetsRepairedController.getAllAssetsRepairedRecords);

module.exports = router;
