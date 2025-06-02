const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsRepairController = require("../controller/assetsRepairController");

router.use(authenticateToken);

router.post("/create", AssetsRepairController.createAssetsRepair);
router.patch("/update/:id", AssetsRepairController.updateAssetsRepair);
router.get("/get-all", AssetsRepairController.getAllAssetsRepairs);

//delete an asset record
router.post("/delete/:id", AssetsRepairController.deleteAssetsRepairRecord);

//archive an asset record
router.post(
  "/archive/:id",
  AssetsRepairController.archiveAssetsRepairRecord
);

//undo delete an asset record
router.post(
  "/undo-delete/:id",
  AssetsRepairController.undoDeleteAssetsRepairRecord
);

//undo archive an asset record
router.post(
  "/undo-archive/:id",
  AssetsRepairController.undoArchiveAssetsRepairRecord
);

module.exports = router;
