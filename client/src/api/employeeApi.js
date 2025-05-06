import axios from "axios";
import { API_BASE_URL } from "./config.js";

const employeeApi = {
  createEmployeeRecord: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/create`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error.message);
      throw error;
    }
  },

  updateEmployeeRecord: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/employee/update/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating employee:", error.message);
      throw error;
    }
  },

  getAllEmployeeRecord: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    status = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/employee/get-all`, {
      params: { page, limit, keyword, sortBy, sortOrder, status },
    });
    return response.data;
  },

  deleteEmployeeRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting employee:", error.message);
      throw error;
    }
  },

  archiveEmployeeRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error archiving employee:", error.message);
      throw error;
    }
  },

  undoDeleteEmployeeRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/undo-delete/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing delete employee:", error.message);
      throw error;
    }
  },

  undoArchiveEmployeeRecord: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/employee/undo-archive/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error undoing archive employee:", error.message);
      throw error;
    }
  },
};

export default employeeApi;
