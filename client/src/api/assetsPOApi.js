import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const assetsPOApi = {
  createPurchaseOrder: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-po/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets po:", error.message);
      throw error;
    }
  },

  updatePurchaseOrder: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-po/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets po:", error.message);
      throw error;
    }
  },

  getAllPurchaseOrder: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets-po/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  softDeletePurchaseOrder: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-po/soft-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error soft deleting assets po:", error.message);
      throw error;
    }
  },

  softArchivePurchaseOrder: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-po/soft-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error soft archive assets po:", error.message);
      throw error;
    }
  },

  undoDeletePurchaseOrder: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-po/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undo delete assets po:", error.message);
      throw error;
    }
  },

  undoArchivePurchaseOrder: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-po/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undo archive assets po:", error.message);
      throw error;
    }
  },
};
export default assetsPOApi;
