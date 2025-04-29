import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const BudgetTrackApi = {
  // Create a new BudgetTrack entry
  createBudgetTrack: async (budgetData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/budget-track`,
        budgetData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating budget track:", error);
      throw error;
    }
  },

  // Update an existing BudgetTrack entry by ID
  updateBudgetTrack: async (id, updatedData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/budget-track/update/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating budget track:", error);
      throw error;
    }
  },

  // Monitor a specific BudgetTrack entry by ID
  monitorBudgetTrack: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/budget-track/monitor/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error monitoring budget track:", error);
      throw error;
    }
  },

  getAllBudgetTrack: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/budget-track`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    return response.data;
  },

  deleteBudgetById: async (entryId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/budget-track/delete/${entryId}`
    );
    return response.data;
  },

  getAllBudgetTemplate: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/budget-track/template`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    return response.data;
  },

  getTree: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/tree`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tree data:", error);
      throw error;
    }
  },

  getWorkGroupBudget: async (
    startDate,
    endDate,
    workGroupCodes,
    categoryCodes
  ) => {
    try {
      if (!startDate || !endDate || !workGroupCodes || !categoryCodes) {
        throw new Error("Missing required parameters");
      }

      if (!Array.isArray(workGroupCodes) || !Array.isArray(categoryCodes)) {
        throw new Error("workGroupCodes and categoryCodes must be arrays");
      }

      const response = await axios.post(
        `${API_BASE_URL}/BudgetReport/work-Group`, 
        {
          workGroupCodes, 
          categoryCodes, 
        },
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching workgroup budget data:", error);
      throw error;
    }
  },



  getUtilizationReport: async (
    startDate,
    endDate,
    workGroupCode,
    categoryCodes
  ) => {
    try {
  
      if (
        !startDate ||
        !endDate ||
        !workGroupCode ||
        !categoryCodes
      ) {
        throw new Error(
          "Missing required parameters: startDate, endDate, workGroupCode, or categoryCodes"
        );
      }

      const response = await axios.post(
        `${API_BASE_URL}/BudgetReport/utilization`,
        {
          categoryCodes, 
        },
        {
          params: {
            workGroupCode,
            startDate,
            endDate,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Error response from server:", error.response.data);
        throw new Error(
          `Server error: ${error.response.data.message || "Unknown error"}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response received from the server");
      } else {
        console.error("Error in the request:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
  },


  getPerAccountReport: async (
    startDate,
    endDate,
    categoryCodes,
    workGroupCodes
  ) => {
    try {
      if (!startDate || !endDate || !categoryCodes) {
        throw new Error("Missing required parameters");
      }

      const response = await axios.post(
        `${API_BASE_URL}/BudgetReport/per-Account`,
        {
          workGroupCodes, 
        },
        {
          params: { startDate, endDate, categoryCodes }, 
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching per account report:", error);
      throw error;
    }
  },
};

export default BudgetTrackApi;
