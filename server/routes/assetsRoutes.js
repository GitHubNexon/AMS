const express = require("express");
const router = express.Router();
const AssetsController = require("../controller/assetsController");
const { authenticateToken } = require("../controller/authController");

router.use(authenticateToken);

router.get("/generate-parNo/:type", AssetsController.generateAutoPARNo);

// create a new asset record
router.post("/create", AssetsController.createAssetsRecord);

router.get("/get-list", AssetsController.getAllAssetRecordsList);
router.get(
  "/get-list/under-repair",
  AssetsController.getAllAssetRecordsListUnderRepair
);

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

router.get(
  "/employee-assets/:employeeId",
  AssetsController.getEmployeeAssetsRecords
);

module.exports = router;
