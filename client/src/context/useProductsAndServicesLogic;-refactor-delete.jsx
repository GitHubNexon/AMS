import { useState, useEffect } from "react";
import ProductsAndServicesApi from "../api/ProductsAndServicesApi";

const useProductsAndServicesLogic = (initialPage = 1, initialLimit = 10) => {
  // State for Products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // State for Services
  const [services, setServices] = useState([]);
  const [totalServiceItems, setTotalServiceItems] = useState(0);
  const [totalServicePages, setTotalServicePages] = useState(0);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductsAndServicesApi.getProducts(
        initialPage,
        initialLimit,
        searchQuery
      );
      setProducts(response.products);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await ProductsAndServicesApi.getServices(
        initialPage,
        initialLimit,
        searchQuery
      );
      setServices(response.services);
      setTotalServiceItems(response.totalItems);
      setTotalServicePages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch both products and services on page load and whenever dependencies change
  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, [initialPage, initialLimit, searchQuery]);

  return {
    // Product-specific returns
    products,
    totalItems,
    totalPages,
    setProducts,
    
    // Service-specific returns
    services,
    totalServiceItems,
    totalServicePages,
    setServices,

    // Shared state and actions
    loading,
    searchQuery,
    setSearchQuery,
    fetchProducts,  // In case you need to manually refetch products
    fetchServices,  // In case you need to manually refetch services
  };
};

export default useProductsAndServicesLogic;
