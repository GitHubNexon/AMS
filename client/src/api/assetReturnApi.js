import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const assetReturnApi = {
  createAssetsReturnRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-return/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets return:", error.message);
      throw error;
    }
  },

  updateAssetsReturnRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-return/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets return:", error.message);
      throw error;
    }
  },

  getAllAssetsReturnRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets-return/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  deleteAssetsReturnRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-return/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets return:", error.message);
      throw error;
    }
  },

  archiveAssetsReturnRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-return/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets return:", error.message);
      throw error;
    }
  },

  undoDeleteAssetsReturnRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-return/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets:", error.message);
      throw error;
    }
  },

  undoArchiveAssetsReturnRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-return/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets:", error.message);
      throw error;
    }
  },
};

export default assetReturnApi;
