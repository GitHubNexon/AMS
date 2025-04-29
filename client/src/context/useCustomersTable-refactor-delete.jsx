import { useState, useEffect } from "react";
import { getAllCustomers, deleteCustomer } from "../api/CustomersTable"; 
import axios from "axios";
import { showToast } from "../utils/toastNotifications";

axios.defaults.withCredentials = true;

const useCustomersTable = (page = 1, limit = 10) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState(""); 

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await getAllCustomers({
          params: { page, limit, keyword: search },
        });

        setCustomers(response.customers);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages); // Correctly access totalPages
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, limit, search]);

  const handleDelete = async (customerId) => {
    setLoading(true);
    try {
      await deleteCustomer(customerId); // Call the API function to delete the customer
      // Update the local state to remove the deleted customer
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== customerId)
      );
      toast.success("Deleted Successfully"); // Use toast for notifications
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer"); // Notify the user of the error
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  

  return {
    customers,
    loading,
    totalItems,
    totalPages,
    search, 
    setSearch,
    handleDelete, // Return handleDelete to use in the component
  };
};

export default useCustomersTable;
