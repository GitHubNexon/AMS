import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const EntriesApi = {
  // Create a new entry
  createEntry: async (entryData) => {
    const response = await axios.post(`${API_BASE_URL}/entries`, entryData);
    return response.data;
  },

  createTempEntry: async (entryData) => {
    const response = await axios.post(`${API_BASE_URL}/entries/temp`, entryData);
    return response.data;
  },

  // Update an existing entry by ID
  updateEntry: async (entryId, entryData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/entries/${entryId}`,
      entryData
    );
    return response.data;
  },

  updateTempEntry: async (entryId, entryData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/entries/temp/${entryId}`,
      entryData
    );
    return response.data;
  },

  // Delete an entry by ID
  deleteEntryById: async (entryId) => {
    const response = await axios.delete(`${API_BASE_URL}/entries/${entryId}`);
    return response.data;
  },

  // Fetch all entries with EntryType === "Receipt" and optional keyword search
  getAllReceipts: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/entries/receipts`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    return response.data;
  },

  // Fetch all entries with EntryType === "Payment" and optional keyword search
  getAllPayments: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/entries/payments`, {
      params: {
        page,
        limit,
        keyword,
        sortBy,
        sortOrder,
        date,
      },
    });
    return response.data;
  },

  // Fetch all entries with EntryType === "Journal" and optional keyword search
  getAllJournals: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/entries/journals`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    return response.data;
  },

  // Fetch all entries regardless of EntryType
  getAllEntries: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/entries/all`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    return response.data;
  },

  // Generate an auto-number based on EntryType
  generateAutoNumber: async (entryType) => {
    const response = await axios.get(`${API_BASE_URL}/entries/auto-number`, {
      params: { EntryType: entryType },
    });
    return response.data;
  },

  generateAutoNumberPayment: async (entryType) => {
    const response = await axios.get(
      `${API_BASE_URL}/entries/auto-number/payment`,
      {
        params: { EntryType: entryType },
      }
    );
    return response.data;
  },

  getAllUsedNumbers: async () => {
    const response = await axios.get(`${API_BASE_URL}/entries/used-numbers`);
    return response.data;
  },

  getNumber: async (numbers) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/entries/getNumber`, {
        Number: numbers,
      });
      return response.data; 
    } catch (error) {
      console.error("Error fetching numbers:", error);
      throw error; 
    }
  },
};

export default EntriesApi;
