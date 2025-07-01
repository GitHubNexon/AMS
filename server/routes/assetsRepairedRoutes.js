const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const AssetsRepairedController = require("../controller/assetsRepairedController");

router.use(authenticateToken);

router.post("/create", AssetsRepairedController.createAssetsRepaired);

router.patch("/update/:id", AssetsRepairedController.updateAssetsRepaired);

router.get("/get-all", AssetsRepairedController.getAllAssetsRepairedRecords);



//delete an asset record
router.post("/delete/:id", AssetsRepairedController.softDeleteRepaired);

//archive an asset record
router.post(
  "/archive/:id",
  AssetsRepairedController.softArchiveRepaired
);

//undo delete an asset record
router.post(
  "/undo-delete/:id",
  AssetsRepairedController.undoDeleteRepaired
);

//undo archive an asset record
router.post(
  "/undo-archive/:id",
  AssetsRepairedController.undoArchiveRepaired
);

module.exports = router;
