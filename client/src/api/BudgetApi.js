import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const budgetApi = {
  // Create a new budget
  createBudget: async (budgetData) => {
    const response = await axios.post(`${API_BASE_URL}/budget/create-budget`, budgetData);
    return response.data; // Adjust if your response structure differs
  },

  // Create or update the BudgetedExpenses for a specific budget using its ID
  createExistingBudget: async (budgetId, budgetData) => {
    const response = await axios.post(
      `${API_BASE_URL}/budget/create-budget/${budgetId}`,
      budgetData
    );
    return response.data; // Adjust if your response structure differs
  },

  // Create or update the ActualExpenses for a specific budget using its ID
  createExpenses: async (budgetId, expensesData) => {
    const response = await axios.post(
      `${API_BASE_URL}/budget/create-expenses/${budgetId}`,
      expensesData
    );
    return response.data; // Adjust if your response structure differs
  },

  // Fetch a specific budget by ID
  getBudgetById: async (budgetId) => {
    const response = await axios.get(`${API_BASE_URL}/budget/${budgetId}`);
    return response.data; // Adjust if your response structure differs
  },

  // Fetch all budgets
  getAllBudgets: async (page = 1, limit = 10, keyword = "") => {
    const response = await axios.get(`${API_BASE_URL}/budget`, {
      params: { page, limit, keyword },
    });
    return response.data; // Adjust based on your API response structure
  },
  

  // Delete a specific budget by ID
  deleteBudgetById: async (budgetId) => {
    const response = await axios.delete(`${API_BASE_URL}/budget/${budgetId}`);
    return response.data; // Adjust if your response structure differs
  },
};

export default budgetApi;
