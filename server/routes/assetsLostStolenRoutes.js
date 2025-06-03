const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsLostStolenController = require("../controller/assetsLostStolenController");

router.use(authenticateToken);

router.post("/create", AssetsLostStolenController.createAssetsLostStolen);
router.patch("/update/:id", AssetsLostStolenController.updateAssetsLostStolen);
router.get("/get-all", AssetsLostStolenController.getAllAssetsLostStolen);
router.delete("/delete/:id", AssetsLostStolenController.deleteAssetsLostStolenRecord);
router.post("/archive/:id", AssetsLostStolenController.archiveAssetsLostStolenRecord);
router.post("/undo-delete/:id", AssetsLostStolenController.undoDeleteAssetsLostStolenRecord);
router.post("/undo-archive/:id", AssetsLostStolenController.undoArchiveAssetsLostStolenRecord);

module.exports = router;