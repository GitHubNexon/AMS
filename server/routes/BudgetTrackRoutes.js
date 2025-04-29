const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controller/authController");
const {
  postBudgetTrack,
  patchBudgetTrack,
  monitorBudgetTrack,
  getAllBudgetTrack,
  deleteBudgetById,
  getAllBudgetTemplate,
} = require("../controller/BudgetTrackController");

// Define POST route for BudgetTrack
router.post("/", authenticateToken, postBudgetTrack);

//router for PATCH for BudgetTrack
router.patch("/update/:id", authenticateToken, patchBudgetTrack);

// Define GET route for BudgetTrack monitoring
router.get("/monitor/:id", authenticateToken, monitorBudgetTrack);

// Define GET route for fetching all BudgetTrack
router.get("/", authenticateToken, getAllBudgetTrack);

// Define DELETE route for deleting BudgetTrack

router.delete("/delete/:id", authenticateToken, deleteBudgetById);

router.get("/template", authenticateToken, getAllBudgetTemplate);

module.exports = router;
