const BudgetModel = require("../models/BudgetModel");

// Controller to create a new TotalBudget (always creates a new entry)
const createBudget = async (req, res) => {
  try {
    const { TotalBudget } = req.body;

    if (TotalBudget === undefined) {
      return res.status(400).json({ error: "TotalBudget is required" });
    }

    const totalBudget = parseFloat(TotalBudget);
    if (isNaN(totalBudget)) {
      return res
        .status(400)
        .json({ error: "TotalBudget must be a valid number" });
    }

    const newBudget = new BudgetModel({
      TotalBudget: totalBudget,
      ActualExpenses: 0, 
    });

    await newBudget.save();

    return res.status(201).json(newBudget);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to create or update the TotalBudget for an existing budget using its ID
const createExistingBudget = async (req, res) => {
  try {
    const { id } = req.params; 
    const { TotalBudget } = req.body; 

    if (TotalBudget === undefined) {
      return res.status(400).json({ error: "TotalBudget is required" });
    }

    const totalBudget = parseFloat(TotalBudget);
    if (isNaN(totalBudget)) {
      return res
        .status(400)
        .json({ error: "TotalBudget must be a valid number" });
    }

    const budget = await BudgetModel.findById(id);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    budget.TotalBudget = totalBudget;

    await budget.save();

    return res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to update the ActualExpenses
const createExpenses = async (req, res) => {
  try {
    const { id } = req.params; 
    const { ActualExpenses } = req.body; 

    if (ActualExpenses === undefined) {
      return res.status(400).json({ error: "ActualExpenses is required" });
    }

    const actualExpenses = parseFloat(ActualExpenses);
    if (isNaN(actualExpenses)) {
      return res
        .status(400)
        .json({ error: "ActualExpenses must be a valid number" });
    }

    const budget = await BudgetModel.findById(id);
    if (!budget) {
      return res
        .status(404)
        .json({ error: "Budget not found. Please set the TotalBudget first." });
    }

    budget.ActualExpenses = actualExpenses;

    await budget.save();

    return res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params; 

    const budget = await BudgetModel.findById(id);

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    return res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to get all budgets
const getAllBudget = async (req, res) => {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { TotalBudget: { $regex: keyword, $options: "i" } },
        { ActualExpenses: { $regex: keyword, $options: "i" } },
      ];
    }

    const totalItems = await BudgetModel.countDocuments(params);

    const budgets = await BudgetModel.find(params)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit) 
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      budgets, 
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to delete a specific budget by its ID
const deleteBudget = async (req, res) => {
    try {
      const { id } = req.params; 
  
      const budget = await BudgetModel.findByIdAndDelete(id);
  
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
  
      return res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

module.exports = {
  createBudget,
  createExpenses,
  createExistingBudget,
  getBudgetById,
  getAllBudget,
  deleteBudget,
};
