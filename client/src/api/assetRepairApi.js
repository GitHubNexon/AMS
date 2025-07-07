import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const assetRepairApi = {
  createAssetsRepairRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repair/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets repair:", error.message);
      throw error;
    }
  },

  updateAssetsRepairRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-repair/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets repair:", error.message);
      throw error;
    }
  },

  getAllAssetsRepairRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/assets-repair/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  deleteAssetsRepairRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repair/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets repair:", error.message);
      throw error;
    }
  },

  archiveAssetsRepairRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repair/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets repair:", error.message);
      throw error;
    }
  },

  undoDeleteAssetsRepairRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repair/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets repair:", error.message);
      throw error;
    }
  },

  undoArchiveAssetsRepairRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repair/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets repair:", error.message);
      throw error;
    }
  },
};

export default assetRepairApi;
