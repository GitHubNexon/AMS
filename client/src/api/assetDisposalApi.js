import axios from "axios";
import { API_BASE_URL } from "./config.js";

const assetDisposalApi = {
  createAssetsDisposalRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-disposal/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets disposal:", error.message);
      throw error;
    }
  },

  updateAssetsDisposalRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-disposal/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets disposal:", error.message);
      throw error;
    }
  },

  getAllAssetsDisposalRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets-disposal/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  deleteAssetsDisposalRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-disposal/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets disposal:", error.message);
      throw error;
    }
  },

  archiveAssetsDisposalRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-disposal/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets disposal:", error.message);
      throw error;
    }
  },

  undoDeleteAssetsDisposalRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-disposal/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets disposal:", error.message);
      throw error;
    }
  },

  undoArchiveAssetsDisposalRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-disposal/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets disposal:", error.message);
      throw error;
    }
  },
};

export default assetDisposalApi;
