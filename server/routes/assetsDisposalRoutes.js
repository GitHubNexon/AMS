const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsDisposalController = require("../controller/assetsDisposalController");

router.use(authenticateToken);

router.post("/create", AssetsDisposalController.createAssetsDisposal);
router.patch("/update/:id", AssetsDisposalController.updateAssetsDisposal);
router.get("/get-all", AssetsDisposalController.getAllAssetsDisposals);

//delete an asset record
router.post("/delete/:id", AssetsDisposalController.deleteAssetsDisposalRecord);

//archive an asset record
router.post(
  "/archive/:id",
  AssetsDisposalController.archiveAssetsDisposalRecord
);

//undo delete an asset record
router.post(
  "/undo-delete/:id",
  AssetsDisposalController.undoDeleteAssetsDisposalRecord
);

//undo archive an asset record
router.post(
  "/undo-archive/:id",
  AssetsDisposalController.undoArchiveAssetsDisposalRecord
);

module.exports = router;
