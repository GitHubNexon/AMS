import { useState, useEffect } from "react";
import DepreciationApi from "../api/DepreciationApi";

const DepreciationLogic = (initialPage = 1, initialLimit = 10, status = "") => {
  const [depreciation, setDepreciation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  const fetchDepreciation = async () => {
    setLoading(true);
    try {
      const response = await DepreciationApi.getAllDepreciations(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date,
        status
      );
      setDepreciation(response.depreciation);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
      console.log("depreciation fetched successfully", response.depreciation);
    } catch (error) {
      console.error("Error fetching depreciation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepreciation();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, date, status]);

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
    depreciation,
    totalItems,
    totalPages,
    setDepreciation,
    loading,
    searchQuery,
    setSearchQuery,
    fetchDepreciation,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  };
};

export default DepreciationLogic;
