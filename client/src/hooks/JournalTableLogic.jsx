import { useState, useEffect } from "react";
import EntriesApi from "../api/EntriesApi"; // Make sure the API functions are correctly imported

const JournalTableLogic = (initialPage = 1, initialLimit = 10) => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  // Fetch Journals
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const response = await EntriesApi.getAllJournals(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date
      );
      setJournals(response.entries);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching journals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
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
    journals,
    totalItems,
    totalPages,
    setJournals,

    loading,
    searchQuery,
    setSearchQuery,
    fetchJournals,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  };
};

export default JournalTableLogic;
