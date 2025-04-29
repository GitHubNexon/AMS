import { useState, useEffect } from "react";
import EntriesApi from "../api/EntriesApi";
const ReceiptTableLogic = (initialPage = 1, initialLimit = 10) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  // Fetch Receipts
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await EntriesApi.getAllReceipts(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date
      );
      setReceipts(response.entries);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
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
    receipts,
    totalItems,
    totalPages,
    setReceipts,

    loading,
    searchQuery,
    setSearchQuery,
    fetchReceipts,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  };
};

export default ReceiptTableLogic;
