import axios from "axios";
import { API_BASE_URL } from "./config.js";

const BankReconApi = {
  getTransactions: async ({ startDate, endDate, SLCODE, ACCTCODE }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bank-recon/transactions`,
        {
          startDate,
          endDate,
          SLCODE,
          ACCTCODE,
        }
      );

      console.log(response);
      return response;
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
      throw error;
    }
  },

  getBookEndingBalance: async ({endDate, SLCODE, ACCTCODE }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bank-recon/BookEndingBalance`, {
        endDate,
        SLCODE,
        ACCTCODE,
      });

      console.log("Book Ending Balance Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Book Ending Balance:", error.message);
      throw error;
    }
  },

  getBookBeginningBalance: async ({endDate, SLCODE, ACCTCODE }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bank-recon/BookBeginningBalance`, {
        endDate,
        SLCODE,
        ACCTCODE,
      });

      console.log("Book Beginning Balance Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Book Beginning Balance:", error.message);
      throw error;
    }
  },

  getUnRecordedTransaction: async ({ SLDOCNO, SLCODE, ACCTCODE }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bank-recon/Unrecorded_transactions`,
        {
          SLDOCNO,
          SLCODE,
          ACCTCODE,
        }
      );

      console.log(response);
      return response;
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
      throw error;
    }
  },

  // ✅ Add getOutstandingTransactionsById
  getOutstandingTransactionsById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bank-recon/Outstanding/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching outstanding transactions:", error.message);
      throw error;
    }
  },

  // ✅ Add getUnrecordedTransactionsById
  getUnrecordedTransactionsById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bank-recon/Unrecorded/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching unrecorded transactions:", error.message);
      throw error;
    }
  },

  createBankReconciliation: async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bank-recon/create`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating bank reconciliation:", error.message);
      throw error;
    }
  },

  updateBankReconciliation: async (id, data) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/bank-recon/update/${id}`,
        data
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating bank reconciliation:", error.message);
      throw error;
    }
  },

  deleteBankReconciliation: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/bank-recon/delete/${id}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting bank reconciliation:", error.message);
      throw error;
    }
  },

  getAllBankReconciliation: async (
    page = 1,
    limit = 10,
    keyword = "",
    sortBy = "",
    sortOrder = "asc",
    date = ""
  ) => {
    const response = await axios.get(`${API_BASE_URL}/bank-recon/all`, {
      params: { page, limit, keyword, sortBy, sortOrder, date },
    });
    console.log(response);
    return response.data;
  },
};

export default BankReconApi;
