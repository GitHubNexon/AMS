const express = require("express");
const router = express.Router();
const AssetsController = require("../controller/assetsController");
const { authenticateToken } = require("../controller/authController");

router.use(authenticateToken);

// create a new asset record
router.post("/create", AssetsController.createAssetsRecord);

// create a new asset assignment record
router.post("/create-assign/:assetsId", AssetsController.createAssetsAssignmentRecord);

// update an existing asset record
router.patch("/update/:id", AssetsController.updateAssetsRecord);

// get all asset records with pagination, sorting, and filtering
router.get("/get-all", AssetsController.getAllAssetsRecords);

//delete an asset record
router.post("/delete/:id", AssetsController.deleteAssetsRecord);

//archive an asset record
router.post("/archive/:id", AssetsController.archiveAssetsRecord);

//undo delete an asset record
router.post("/undo-delete/:id", AssetsController.undoDeleteAssetRecord);

//undo archive an asset record
router.post("/undo-archive/:id", AssetsController.undoArchiveAssetRecord);

module.exports = router;
