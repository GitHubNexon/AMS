import axios from "axios";
import { API_BASE_URL } from "./config.js"; // Adjust the path as necessary

axios.defaults.withCredentials = true;

const ProductsAndServicesApi = {
    // Fetch all products with optional pagination and filtering
    getProducts: async (page = 1, limit = 10, keyword = "") => {
        const response = await axios.get(`${API_BASE_URL}/products`, {
            params: { 
                page, 
                limit, 
                keyword 
            }, // Pass query params for pagination and search
        });
    
        // Adjust based on your API response structure
        const { totalItems, products } = response.data;
    
        return {
            totalItems,
            products,
        };
    },

    // Fetch a product by ID
    getProductById: async (productId) => {
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
        return response.data; // Return the product data
    },

    // Create a new product
    createProduct: async (productData) => {
        const response = await axios.post(`${API_BASE_URL}/products`, productData);
        return response.data; // Return the newly created product data
    },

    // Update a product by ID
    updateProduct: async (productId, productData) => {
        const response = await axios.patch(`${API_BASE_URL}/products/${productId}`, productData);
        return response.data; // Return the updated product data
    },

    // Delete a product by ID
    deleteProduct: async (productId) => {
        const response = await axios.delete(
            `${API_BASE_URL}/products/${productId}`
        );
        return response.data; // Return the response after deletion
    },

    // --------------------- Services API Methods --------------------- //

    // Fetch all services with optional pagination and filtering
    getServices: async (page = 1, limit = 10, keyword = "") => {
        const response = await axios.get(`${API_BASE_URL}/services`, {
            params: { 
                page, 
                limit, 
                keyword 
            }, // Pass query params for pagination and search
        });

        // Adjust based on your API response structure
        const { totalItems, services } = response.data;

        return {
            totalItems,
            services,
        };
    },

    // Fetch a service by ID
    getServiceById: async (serviceId) => {
        const response = await axios.get(`${API_BASE_URL}/services/${serviceId}`);
        return response.data; // Return the service data
    },

    // Create a new service
    createService: async (serviceData) => {
        const response = await axios.post(`${API_BASE_URL}/services`, serviceData);
        return response.data; // Return the newly created service data
    },

    // Update a service by ID
    updateService: async (serviceId, serviceData) => {
        const response = await axios.patch(`${API_BASE_URL}/services/${serviceId}`, serviceData);
        return response.data; // Return the updated service data
    },

    // Delete a service by ID
    deleteService: async (serviceId) => {
        const response = await axios.delete(
            `${API_BASE_URL}/services/${serviceId}`
        );
        return response.data; // Return the response after deletion
    },
};

export default ProductsAndServicesApi;
