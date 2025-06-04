import axios from "axios";
import { API_BASE_URL } from "./config.js";

const assetReportApi = {
  getAssetsHistory: async (assetId, employeeId, filter) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets-reports/history`,
        {
          assetId,
          employeeId,
          filter,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating assets history:", error.message);
      throw error;
    }
  },
};

export default assetReportApi;
