import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

const InvoicesApi = {
  // Fetch all customers
  getCustomers: async () => {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    return response.data.customers; // Adjust based on your API response structure
  },

  // Fetch customer by ID
  getCustomerById: async (customerId) => {
    const response = await axios.get(`${API_BASE_URL}/customers/${customerId}`);
    return response.data; // Adjust based on your API response structure
  },

  // Fetch temporary invoice number
  getTemporaryInvoiceNumber: async () => {
    const response = await axios.get(`${API_BASE_URL}/invoices/temporary`);
    return response.data; // Adjust based on your API response structure
  },

  // Fetch all invoices
  getAllInvoices: async (page = 1, limit = 10, keyword = "", status = "All") => {
    const response = await axios.get(`${API_BASE_URL}/invoices`, {
      params: { page, limit, keyword, status },
    });
    return response.data; // Adjust based on your API response structure
  },

  // Fetch invoice by ID
  getInvoiceById: async (invoiceId) => {
    const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`);
    return response.data; // Adjust based on your API response structure
  },

  // FEtch invoice by customer ID
  getInvoiceByCustomerId: async (customerId, filter) => {
    const response = await axios.post(`${API_BASE_URL}/invoices/customer/${customerId}`, {filter: filter}, {withCredentials: true});    
    return response.data;
  },

  // Create a new invoice
  createInvoice: async (invoiceData, files) => {

    const formdata = new FormData();
    formdata.append('json', JSON.stringify(invoiceData));
    [...files].forEach((file)=>{
      formdata.append('files', file);
    });

    const response = await axios.post(`${API_BASE_URL}/invoices`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data; // Adjust based on your API response structure
  },
  // Update an existing invoice by ID
  updateInvoice: async (invoiceId, invoiceData, files) => {

    const formdata = new FormData();
    formdata.append('json', JSON.stringify(invoiceData));
    [...files].forEach((file)=>{
      formdata.append('files', file);
    });

    const response = await axios.patch(
      `${API_BASE_URL}/invoices/${invoiceId}`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data; // Adjust based on your API response structure
  },

  // Delete an invoice by ID
  deleteInvoiceById: async (invoiceId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/invoices/${invoiceId}`
    );
    return response.data; // Adjust based on your API response structure
  },

  // Fetch all products
  getProducts: async () => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data.products; // Adjust based on your API response structure
  },

  // Fetch product by ID
  getProductById: async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data; // Adjust based on your API response structure
  },

  // Fetch all services
  getServices: async () => {
    const response = await axios.get(`${API_BASE_URL}/services`);
    return response.data.services; // Adjust based on your API response structure
  },

  // Fetch service by ID
  getServiceById: async (serviceId) => {
    const response = await axios.get(`${API_BASE_URL}/services/${serviceId}`);
    return response.data; // Adjust based on your API response structure
  },

  pay: async (data) => {
    const formdata = new FormData();
    formdata.append('json', JSON.stringify({
      paymentInfo: data.paymentInfo,
      paidInvoices: data.paidInvoices
    }));
    [...data.attachment].forEach((file)=>{
      formdata.append('files', file);
    });
    const response = await axios.post(`${API_BASE_URL}/invoices/pay`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  }
};

export default InvoicesApi;
