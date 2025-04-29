import axios from "axios";
import { API_BASE_URL } from "./config";
axios.defaults.withCredentials = true;

const EntriesReportApi = {
  // Fetch payment report for a specific date range
  getPaymentReport: async (startDate, endDate) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/Payment/report/DateRange`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },
  // Fetch AlphaList Tax report for a specific date range
  getAlphaListTaxReport: async (startDate, endDate) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  getAlphaListOutPutTaxReport: async (startDate, endDate) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange/OutputTax`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  getReportForEWT: async (startDate, endDate, ownerName) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange/EWT`,
      {
        params: { startDate, endDate, ownerName },
      }
    );
    return response.data;
  },

  getReportForFVAT: async (startDate, endDate, ownerName) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange/FVAT`,
      {
        params: { startDate, endDate, ownerName },
      }
    );
    return response.data;
  },

  getReportForWPT: async (startDate, endDate, ownerName) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange/WPT`,
      {
        params: { startDate, endDate, ownerName },
      }
    );
    return response.data;
  },

  getReportForWTC: async (startDate, endDate, ownerName) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/DateRange/WTC`,
      {
        params: { startDate, endDate, ownerName },
      }
    );
    return response.data;
  },

  getReport2307: async (id) => {
    const response = await axios.get(
      `${API_BASE_URL}/EntriesReport/AlphaListTax/report/2307/${id}`
    );
    return response.data;
  },
};

export default EntriesReportApi;
