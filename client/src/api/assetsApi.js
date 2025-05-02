import axios from "axios";
import { API_BASE_URL } from "./config.js";

const AssetsApi = {
  createAssetsRecord: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets/create`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating assets:", error.message);
      throw error;
    }
  },

  updateAssetsRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets:", error.message);
      throw error;
    }
  },

  getAllAssetsRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    console.log(response);
    return response.data;
  },

  deleteAssetsRecord: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting assets:", error.message);
      throw error;
    }
  },

  archiveAssetsRecord: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets/archive/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error archiving assets:", error.message);
      throw error;
    }
  },

  undoDeleteAssetRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets:", error.message);
      throw error;
    }
  },

  undoArchiveAssetRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets:", error.message);
      throw error;
    }
  },
};

export default AssetsApi;
