// UserApi.js
import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const UserApi = {
  // Fetch all users with pagination and optional keyword search
  getAllUsers: async (
    page = 1,
    limit = 10,
    keyword = "",
    signatoryType = ""
  ) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        params: { page, limit, keyword, signatoryType },
      });
      return response.data; // Adjust based on your API response structure
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error; // Handle error appropriately
    }
  },

  // Fetch entries filtered by user signatory type (CreatedBy, PreparedBy, etc.)
  getEntriesBySignatory: async (
    page = 1,
    limit = 10,
    keyword = "",
    signatoryType = "",
    userName = ""
  ) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/entries/signatories`,
        {
          params: { page, limit, keyword, signatoryType, name: userName },
        }
      );
      return response.data; // Adjust based on your API response structure
    } catch (error) {
      console.error("Error fetching entries:", error);
      throw error; // Handle error appropriately
    }
  },
};

export default UserApi;
