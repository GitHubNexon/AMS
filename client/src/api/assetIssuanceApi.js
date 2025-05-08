import axios from "axios";
import { API_BASE_URL } from "./config.js";

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
};

export default assetIssuanceApi;
