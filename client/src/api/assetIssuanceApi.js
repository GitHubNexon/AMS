import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const assetIssuanceApi = {
  createAssetsIssuanceRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-issuance/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets issuance:", error.message);
      throw error;
    }
  },

  updateAssetsIssuanceRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-issuance/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets:", error.message);
      throw error;
    }
  },

  getAllAssetsIssuanceRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(
      `${API_BASE_URL}/assets-issuance/get-all`,
      {
        params: { page, limit, keyword, sortBy, sortOrder, status },
      }
    );
    return response.data;
  },

  deleteAssetsIssuanceRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-issuance/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets:", error.message);
      throw error;
    }
  },

  archiveAssetsIssuanceRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-issuance/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets:", error.message);
      throw error;
    }
  },

  undoDeleteAssetsIssuanceRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-issuance/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets:", error.message);
      throw error;
    }
  },

  undoArchiveAssetsIssuanceRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-issuance/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets:", error.message);
      throw error;
    }
  },

  validateAssetRecords: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets-issuance/validate-assets/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error validating asset records:", error.message);
      throw error;
    }
  },
};

export default assetIssuanceApi;
