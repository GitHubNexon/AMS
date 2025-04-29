import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const CustomerFormApi = {
  // Fetch all regions
  getRegions: async () => {
    const response = await axios.get(`${API_BASE_URL}/region`);
    return response.data;
  },

  // Fetch provinces by region ID
  getProvinces: async (regionId) => {
    const response = await axios.get(
      `${API_BASE_URL}/province/by-region?region_id=${regionId}`
    );
    return response.data;
  },

  // Fetch municipalities by province ID
  getMunicipalities: async (provinceId) => {
    const response = await axios.get(
      `${API_BASE_URL}/municipality/by-province?province_id=${provinceId}`
    );
    return response.data;
  },

  // Fetch barangays by municipality ID
  getBarangays: async (municipalityId) => {
    const response = await axios.get(
      `${API_BASE_URL}/barangays/by-municipality?municipality_id=${municipalityId}`
    );
    return response.data;
  },

  // Fetch specific region by region ID
  getRegionById: async (regionId) => {
    const response = await axios.get(`${API_BASE_URL}/region/${regionId}`);
    return response.data;
  },

  // Fetch specific province by province ID
  getProvinceById: async (provinceId) => {
    const response = await axios.get(`${API_BASE_URL}/province/${provinceId}`);
    return response.data;
  },

  // Fetch specific municipality by municipality ID
  getMunicipalityById: async (municipalityId) => {
    const response = await axios.get(`${API_BASE_URL}/municipality/${municipalityId}`);
    return response.data;
  },

  // Fetch specific barangay by barangay ID
  getBarangayById: async (barangayId) => {
    const response = await axios.get(`${API_BASE_URL}/barangays/${barangayId}`);
    return response.data;
  },

  // Fetch specific customer by customer ID
  getCustomerById: async (customerId) => {
    const response = await axios.get(`${API_BASE_URL}/customers/${customerId}`);
    return response.data;
  },

  // Submit customer data
  submitCustomer: async (customerData) => {
    const response = await axios.post(`${API_BASE_URL}/customers`, customerData);
    return response.data;
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await axios.patch(`${API_BASE_URL}/customers/${customerId}`, customerData);
    return response.data;
  },

  getCredit: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/customers/credit/${id}`, {withCredentials: true});
    return response.data;
  },

  getInvoices: async (id, s=0, e=1000, q='') => {
    const response = await axios.get(`${API_BASE_URL}/customers/invoice/${id}?s=${s}&e=${e}&q=${q}`);
    return response.data;
  },

};

export default CustomerFormApi;
