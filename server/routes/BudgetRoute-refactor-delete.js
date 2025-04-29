const express = require("express");
const router = express.Router();
const {
  createBudget,
  createExpenses,
  createExistingBudget,
  getBudgetById,
  getAllBudget,
  deleteBudget,
} = require("../controller/BudgetController");

// Route to set new TotalBudget
router.post("/create-budget", createBudget);

// Route to set or update the BudgetedExpenses for a specific budget using its ID
router.post("/create-budget/:id", createExistingBudget);

// Route to set or update the ActualExpenses for a specific budget using its ID
router.post("/create-expenses/:id", createExpenses);


// Route to get a specific budget by its ID
router.get('/:id', getBudgetById);

// Route to get all budgets
router.get('/', getAllBudget);

// Route to delete a specific budget by its ID
router.delete('/:id', deleteBudget);

module.exports = router;
