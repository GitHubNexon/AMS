import axios from "axios";
import { API_BASE_URL } from "./config.js";

const assetRepairedApi = {
  createAssetsRepairedRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repaired/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets repair:", error.message);
      throw error;
    }
  },

  updateAssetsRepairedRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-repaired/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets repair:", error.message);
      throw error;
    }
  },

  getAllAssetsRepairedRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(
      `${API_BASE_URL}/assets-repaired/get-all`,
      {
        params: { page, limit, keyword, sortBy, sortOrder, status },
      }
    );
    return response.data;
  },

  deleteAssetsRepairedRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repaired/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets repair:", error.message);
      throw error;
    }
  },

  archiveAssetsRepairedRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repaired/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets repair:", error.message);
      throw error;
    }
  },

  undoDeleteAssetsRepairedRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repaired/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete assets repair:", error.message);
      throw error;
    }
  },

  undoArchiveAssetsRepairedRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-repaired/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive assets repair:", error.message);
      throw error;
    }
  },
};

export default assetRepairedApi;
