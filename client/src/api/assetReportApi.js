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

  getInventoryStatus: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets-reports/inventory-status`
      );
      return response.data; // { labels, data }
    } catch (error) {
      console.error("Error fetching inventory status:", error.message);
      throw error;
    }
  },

  getAssetsInventoriesReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.keyword) queryParams.append("keyword", params.keyword);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const response = await axios.get(
        `${API_BASE_URL}/assets-reports/get-inventories-history?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assets inventory reports:", error.message);
      throw error;
    }
  },
};

export default assetReportApi;
