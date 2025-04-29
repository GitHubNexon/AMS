import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

const VendorApi = {
 // Fetch all vendors with pagination and optional keyword search
getAllVendors: async (page = 1, limit = 10, keyword = "") => {
  const response = await axios.get(`${API_BASE_URL}/vendors`, {
    params: { page, limit, keyword },
  });
  return response.data;
},


  // Fetch specific vendor by vendor ID
  getVendorById: async (vendorId) => {
    const response = await axios.get(`${API_BASE_URL}/vendors/${vendorId}`);
    return response.data;
  },

  // Submit new vendor data
  createVendor: async (vendorData) => {
    const response = await axios.post(`${API_BASE_URL}/vendors`, vendorData);
    return response.data;
  },

  // Update existing vendor data
  updateVendor: async (vendorId, vendorData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/vendors/${vendorId}`,
      vendorData
    );
    return response.data;
  },

  // Delete a vendor
  deleteVendor: async (vendorId) => {
    const response = await axios.delete(`${API_BASE_URL}/vendors/${vendorId}`);
    return response.data;
  },

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
    const response = await axios.get(
      `${API_BASE_URL}/municipality/${municipalityId}`
    );
    return response.data;
  },

  // Fetch specific barangay by barangay ID
  getBarangayById: async (barangayId) => {
    const response = await axios.get(`${API_BASE_URL}/barangays/${barangayId}`);
    return response.data;
  },
};

export default VendorApi;
