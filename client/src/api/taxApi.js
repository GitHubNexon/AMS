import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const TaxApi = {
  // Fetch all taxes with pagination and optional keyword search
  getAllTaxes: async (page = 1, limit = 10, keyword = "") => {
    const response = await axios.get(`${API_BASE_URL}/tax/getAll`, {
      params: { page, limit, keyword },
    });
    return response.data;
  },

  // Fetch specific tax by tax ID
  getTaxById: async (taxId) => {
    const response = await axios.get(`${API_BASE_URL}/tax/get/${taxId}`);
    return response.data;
  },

  // Submit new tax data
  createTax: async (taxData) => {
    const response = await axios.post(`${API_BASE_URL}/tax`, taxData);
    return response.data;
  },

  // Update existing tax data
  updateTax: async (taxId, taxData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/tax/update/${taxId}`,
      taxData
    );
    return response.data;
  },

  // Delete a tax entry
  deleteTax: async (taxId) => {
    const response = await axios.delete(`${API_BASE_URL}/tax/delete/${taxId}`);
    return response.data;
  },
};

export default TaxApi;
