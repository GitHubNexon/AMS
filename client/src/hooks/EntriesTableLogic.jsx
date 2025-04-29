import { useState, useEffect } from "react";
import EntriesApi from "../api/EntriesApi"; // Make sure this is imported correctly
import { useDataPreloader } from "../context/DataPreloader";

const EntriesTableLogic = (initialPage = 1, initialLimit = 10) => {
  const {getLastClosing} = useDataPreloader();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  // Fetch Entries
  const fetchEntries = async () => {
    setLoading(true);
    getLastClosing();
    try {
      const response = await EntriesApi.getAllEntries(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date
      );
      setEntries(response.entries);
      setTotalItems(response.totalItems); // Assuming response includes totalItems
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
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
    entries,
    totalItems,
    totalPages,
    loading,
    searchQuery,
    setSearchQuery,
    fetchEntries,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    setEntries,
    date,
    setDate,
  };
};

export default EntriesTableLogic;
