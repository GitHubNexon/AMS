import { useState, useEffect, useCallback } from "react";
import billsApi from "../api/billsApi";

const useBillstable = (status = "All") => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch Bills
  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const start = (page - 1) * limit;
      const response = await billsApi.getAllBills(
        start,
        limit,
        status === "All" ? "" : status,
        searchQuery
      );

      if (response && response.bills) {
        setBills(response.bills);
        setTotalItems(response.count);
      } else {
        console.warn("No bills found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, searchQuery]); // Add necessary dependencies

  // Use Effect to fetch bills when needed
  useEffect(() => {
    fetchBills();
  }, [fetchBills]); // Fetch when fetchBills changes

  return {
    bills,
    totalItems,
    setBills,
    loading,
    searchQuery,
    setSearchQuery,
    fetchBills,
    page,
    setPage,
    limit,
    setLimit,
  };
};

export default useBillstable;
