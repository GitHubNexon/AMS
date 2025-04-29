import axios from "axios";
import { API_BASE_URL } from "./config.js";

const DepreciationApi = {
  createDepreciation: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/create`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating depreciation:", error.message);
      throw error;
    }
  },

  updateDepreciation: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/depreciation/update/${id}`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating reconciliation:", error.message);
      throw error;
    }
  },

  getAllDepreciations: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = "",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/depreciation/all`, {
      params: { page, limit, keyword, sortBy, sortOrder, date, status },
    });
    console.log(response);
    return response.data;
  },

  deleteDepreciation: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/delete/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting depreciation:", error.message);
      throw error;
    }
  },

  archiveDepreciation: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/archive/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error archiving depreciation:", error.message);
      throw error;
    }
  },

  undoDeleteDepreciation: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/undo-delete/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error undoing delete depreciation:", error.message);
      throw error;
    }
  },

  undoArchiveDepreciation: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/undo-archive/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error undoing archive depreciation:", error.message);
      throw error;
    }
  },

  getSummaryDepreciation: async (year, month, category = null) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      if (category) params.category = category;

      const response = await axios.get(`${API_BASE_URL}/depreciation/summary`, {
        params: params,
      });

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching depreciation summary:", error.message);
      throw error;
    }
  },

  updateCondition: async (depreciationId, inventoryId, conditionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/condition/${depreciationId}`,
        {
          InventoryId: inventoryId,
          Condition: conditionData,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating condition:", error);
      throw error;
    }
  },

  getUpdatedById: async (depreciationId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/depreciation/updated/${depreciationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching updated depreciation:", error);
      throw error;
    }
  },

  getInventoryTable: async (page = 1, limit = 10, _id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/depreciation/inventory`,
        {
          params: { page, limit, _id },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory table:", error.message);
      throw error;
    }
  },

  getReference: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/depreciation/reference`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching references:", error.message);
      throw error;
    }
  },

  updateCondition: async (inventoryId, conditionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/update-condition`, // Correct endpoint
        {
          inventoryId, // Sending inventoryId as a parameter
          conditionUpdates: conditionData, // Sending the condition updates
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating condition:", error.message);
      throw error;
    }
  },

  sellItem: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/depreciation/sell-item`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error selling item:", error.message);
      throw error;
    }
  },

  updateSellItem: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/depreciation/update-sell-item/${id}`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating sold item:", error.message);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/depreciation/delete-sell-item/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting item:", error.message);
      throw error;
    }
  },
};
export default DepreciationApi;
