import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const generateMonthlyDepreciation = async (assetId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/assets-depreciation/get-monthly/${assetId}`
    );
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
      `${API_BASE_URL}/assets-depreciation/get-all-monthly?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error("Error generating all monthly assets depreciation:", error);
    throw error.response?.data || error;
  }
};

const generateAllAssetsNetBookValue = async (params = {}) => {
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
      `${API_BASE_URL}/assets-depreciation/get-all-netbook-value?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error("Error generating all assets net book value:", error);
    throw error.response?.data || error;
  }
};

const assetsDepreciationApi = {
  generateMonthlyDepreciation,
  generateAllMonthlyAssetsDepreciation,
  generateAllAssetsNetBookValue,
};

export default assetsDepreciationApi;
