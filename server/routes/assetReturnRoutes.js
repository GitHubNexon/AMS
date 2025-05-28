const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsReturnController = require("../controller/assetsReturnController");

router.use(authenticateToken);

router.post("/create", AssetsReturnController.createAssetsReturn);

router.patch("/update/:id", AssetsReturnController.updateAssetsReturn);


router.get("/get-all", AssetsReturnController.getAllAssetsReturnRecords);

//delete an asset record
router.post("/delete/:id", AssetsReturnController.deleteAssetsReturnRecord);

//archive an asset record
router.post("/archive/:id", AssetsReturnController.archiveAssetsReturnRecord);

//undo delete an asset record
router.post("/undo-delete/:id", AssetsReturnController.undoDeleteAssetsReturnRecord);

//undo archive an asset record
router.post("/undo-archive/:id", AssetsReturnController.undoArchiveAssetsReturnRecord);

module.exports = router;

