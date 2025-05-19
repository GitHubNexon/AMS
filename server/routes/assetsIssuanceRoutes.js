const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsIssuanceController = require("../controller/assetsIssuanceController");

router.use(authenticateToken);

//create Assets issuance records
router.post("/create", AssetsIssuanceController.createAssetsIssuance);

router.patch(
  "/update/:id",
  AssetsIssuanceController.updateAssetsIssuance
);

router.get("/get-all", AssetsIssuanceController.getAllAssetsIssuanceRecords);


//delete an asset record
router.post("/delete/:id", AssetsIssuanceController.deleteAssetsIssuanceRecord);

//archive an asset record
router.post("/archive/:id", AssetsIssuanceController.archiveAssetsIssuanceRecord);

//undo delete an asset record
router.post("/undo-delete/:id", AssetsIssuanceController.undoDeleteAssetsIssuanceRecord);

//undo archive an asset record
router.post("/undo-archive/:id", AssetsIssuanceController.undoArchiveAssetsIssuanceRecord);

router.get("/validate-assets/:id", AssetsIssuanceController.validateAssetsRecord)
module.exports = router;
