import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const AlphaListTaxApi = {
  // Fetch all AlphaListTax items
  getAllAlphaListTax: async (page = 1, limit = 10, keyword = "") => {
    const response = await axios.get(`${API_BASE_URL}/alphaListTax`, {
      params: { page, limit, keyword },
    });
    return response.data;
  },

  // Fetch specific AlphaListTax by ID
  getAlphaListTaxById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/alphaListTax/${id}`);
    return response.data;
  },

  // Create a new AlphaListTax
  createAlphaListTax: async (alphaListTaxData) => {
    const response = await axios.post(
      `${API_BASE_URL}/alphaListTax`,
      alphaListTaxData
    );
    return response.data;
  },

  // Update an existing AlphaListTax by ID
  updateAlphaListTax: async (id, alphaListTaxData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/alphaListTax/${id}`,
      alphaListTaxData
    );
    return response.data;
  },

  // Delete an AlphaListTax by ID
  deleteAlphaListTaxById: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/alphaListTax/${id}`);
    return response.data;
  },

  // Fetch AlphaListTax totals by date range
  getAlphaListTaxByDateRange: async (startDate, endDate) => {
    const response = await axios.get(`${API_BASE_URL}/getTotal/by-date`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default AlphaListTaxApi;
