import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const assetLostStolenApi = {
  createAssetsLostStolenRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-lost-stolen/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets lost/stolen:", error.message);
      throw error;
    }
  },
  updateAssetsLostStolenRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/assets-lost-stolen/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assets lost/stolen:", error.message);
      throw error;
    }
  },
  getAllAssetsLostStolenRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(
      `${API_BASE_URL}/assets-lost-stolen/get-all`,
      {
        params: { page, limit, keyword, sortBy, sortOrder, status },
      }
    );
    return response.data;
  },
  deleteAssetsLostStolenRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-lost-stolen/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting assets lost/stolen:", error.message);
      throw error;
    }
  },
  archiveAssetsLostStolenRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-lost-stolen/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving assets lost/stolen:", error.message);
      throw error;
    }
  },
  undoDeleteAssetsLostStolenRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-lost-stolen/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error undoing delete for assets lost/stolen:",
        error.message
      );
      throw error;
    }
  },
  undoArchiveAssetsLostStolenRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-lost-stolen/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error undoing archive for assets lost/stolen:",
        error.message
      );
      throw error;
    }
  },
};

export default assetLostStolenApi;
