import axios from "axios";
import { API_BASE_URL } from "./config";

axios.defaults.withCredentials = true;

const NotificationApi = {
  fetchEntriesByUser: async (
    name,
    signatoryType,
    taskDate,
    page = 1,
    limit = 10
  ) => {
    try {
      // Build the query string with the new parameters
      const query = `?name=${name}${
        signatoryType ? `&signatoryType=${signatoryType}` : ""
      }${taskDate ? `&taskDate=${taskDate}` : ""}&page=${page}&limit=${limit}`;

      // Make the API call with the constructed query
      const response = await axios.get(
        `${API_BASE_URL}/notifications/user/entries${query}`
      );

      const { totalEntries, entries } = response.data;
      return { totalEntries, entries };
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  },

  fetchOrderOfPayments: async (keyword = "", page = 1, limit = 10) => {
    try {
      // Build the query string
      const query = `?keyword=${keyword}&page=${page}&limit=${limit}`;

      // Make the API call
      const response = await axios.get(
        `${API_BASE_URL}/notifications/order-of-payments${query}`
      );

      const {
        data,
        page: currentPage,
        totalPages,
        totalRecords,
      } = response.data;

      return { data, currentPage, totalPages, totalRecords };
    } catch (error) {
      console.error("Error fetching order of payments:", error);
    }
  },
};

export default NotificationApi;
