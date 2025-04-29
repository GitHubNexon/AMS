import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

export const getAllCustomers = async (page = 1, limit = 10, keyword = "") => {
  const response = await axios.get(`${API_BASE_URL}/customers`, {
    params: { page, limit, keyword },
  });
  return response.data;
};

export const getCustomerById = async (customerId) => {
  const response = await axios.get(`${API_BASE_URL}/customers/${customerId}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await axios.post(`${API_BASE_URL}/customers`, customerData);
  return response.data;
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await axios.put(
    `${API_BASE_URL}/customers/${customerId}`,
    customerData
  );
  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/customers/${customerId}`
  );
  return response.data;
};
