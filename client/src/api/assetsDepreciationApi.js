import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const generateMonthlyDepreciation = async (assetId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-monthly/${assetId}`);
    return response.data;
  } catch (error) {
    console.error("Error generating monthly depreciation:", error);
    throw error.response?.data || error;
  }
};

const generateAllMonthlyAssetsDepreciation = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      sortBy = "createdAt",
      sortOrder = "asc",
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(keyword && { keyword }),
      sortBy,
      sortOrder,
    });

    const response = await axios.get(
      `${API_BASE_URL}/get-all-monthly?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error("Error generating all monthly assets depreciation:", error);
    throw error.response?.data || error;
  }
};

const assetsDepreciationApi = {
  generateMonthlyDepreciation,
  generateAllMonthlyAssetsDepreciation,
};

export default assetsDepreciationApi;
