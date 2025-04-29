import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const PaymentApi = {
  // Fetch all payment invoices
  getAllPaymentInvoices: async (page = 1, limit = 10, keyword = "",) => {
    const response = await axios.get(`${API_BASE_URL}/payments/PaymentInvoices`, {
      params: { page, limit, keyword, },
    });
    return response.data; // Adjust based on your API response structure
  },
};

export default PaymentApi;
