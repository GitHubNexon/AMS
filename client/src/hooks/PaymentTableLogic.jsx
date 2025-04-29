import { useState, useEffect } from "react";
import EntriesApi from "../api/EntriesApi";

const PaymentTableLogic = (initialPage = 1, initialLimit = 10) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  // Fetch Payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await EntriesApi.getAllPayments(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date
      );
      setPayments(response.entries);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, date]);

  const toggleSortOrder = (column) => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => {
        const newOrder = prevOrder === "asc" ? "desc" : "asc";
        console.log(column, newOrder);
        return newOrder;
      });
    } else {
      setSortBy(column);
      setSortOrder("asc");
      console.log(column, "asc");
    }
  };

  return {
    payments,
    totalItems,
    totalPages,
    setPayments,

    loading,
    searchQuery,
    setSearchQuery,
    fetchPayments,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  };
};

export default PaymentTableLogic;
