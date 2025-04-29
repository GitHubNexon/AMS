import { useState, useEffect } from "react";
import InvoicesApi from "../api/InvoicesApi"; // Adjust the import based on your API structure

const useInvoicesTable = (initialPage = 1, initialLimit = 10, status = 'All') => {
  // State for Invoices
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(()=>{
    fetchInvoices();
  }, [status]);

  // Fetch Invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await InvoicesApi.getAllInvoices(
        initialPage,
        initialLimit,
        searchQuery,
        status
      );
      setInvoices(response.invoices);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices on page load and whenever dependencies change
  useEffect(() => {
    fetchInvoices();
  }, [initialPage, initialLimit, searchQuery]);

  

  return {
    // Invoice-specific returns
    invoices,
    totalItems,
    totalPages,
    setInvoices,

    // Shared state and actions
    loading,
    searchQuery,
    setSearchQuery,
    fetchInvoices, // In case you need to manually refetch invoices
  };
};

export default useInvoicesTable;
