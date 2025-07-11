import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const assetsPRApi = {
  createPurchaseRequest: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-pr/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets pr:", error.message);
      throw error;
    }
  },

  updatePurchaseRequest: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-pr/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets pr:", error.message);
      throw error;
    }
  },

  getAllPurchaseRequest: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets-pr/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  softDeletePurchaseRequest: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-pr/soft-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error soft deleting assets pr:", error.message);
      throw error;
    }
  },

  softArchivePurchaseRequest: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-pr/soft-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error soft archive assets pr:", error.message);
      throw error;
    }
  },

  undoDeletePurchaseRequest: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-pr/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undo delete assets pr:", error.message);
      throw error;
    }
  },

  undoArchivePurchaseRequest: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-pr/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undo archive assets pr:", error.message);
      throw error;
    }
  },
};
export default assetsPRApi;
