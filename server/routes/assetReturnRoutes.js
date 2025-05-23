const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsReturnController = require("../controller/assetsReturnController");


router.use(authenticateToken);


router.post("/create", AssetsReturnController.createAssetsReturn);

module.exports = router;