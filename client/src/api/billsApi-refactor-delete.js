import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const billsApi = {
  // // Fetch all bills with pagination, filtering, and status options
  getAllBills: async (
    start = 0,
    limit = 1000,
    status = "",
    query = "",
    filter = "",
  ) => {
    const response = await axios.get(`${API_BASE_URL}/bills`, {
      params: { start, limit, status, query, filter,  },
    });
    return response.data; // Adjust if your response structure differs
  },

  // Fetch a specific bill by ID
  getBillById: async (billId) => {
    const response = await axios.get(`${API_BASE_URL}/bills/${billId}`);
    return response.data; // Adjust if your response structure differs
  },

  // Create a new bill with optional attachments
  createBill: async (billData, files) => {
    const formData = new FormData();
    formData.append("json", JSON.stringify(billData));
    if (files) {
      [...files].forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/bills`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // Adjust if your response structure differs
  },

  // Update an existing bill by ID with optional attachments
  updateBill: async (billId, billData, files) => {
    const formData = new FormData();
    formData.append("json", JSON.stringify(billData));
    if (files) {
      [...files].forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await axios.patch(
      `${API_BASE_URL}/bills/${billId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data; // Adjust if your response structure differs
  },

  // Delete a bill by ID
  deleteBillById: async (billId) => {
    const response = await axios.delete(`${API_BASE_URL}/bills/${billId}`);
    return response.data; // Adjust if your response structure differs
  },

  // Download an attachment for a specific bill by filename
  downloadAttachment: async (billId, filename) => {
    const response = await axios.get(
      `${API_BASE_URL}/bills/attachment/${billId}/${filename}`,
      {
        responseType: "blob",
      }
    );
    return response.data; // Handle blob data as needed for download
  },

  // Make a payment on a bill with optional attachments
  payBill: async (paymentData, files) => {
    const formData = new FormData();
    formData.append(
      "json",
      JSON.stringify({
        vendor: paymentData.vendor,
        paymentDate: paymentData.paymentDate,
        method: paymentData.method,
        referenceNo: paymentData.referenceNo,
        amount: paymentData.amount,
        billId: paymentData.billId,
      })
    );
    if (files) {
      [...files].forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/bills/pay`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default billsApi;
