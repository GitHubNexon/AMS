import { useState, useEffect } from "react";
import assetsPOApi from "../api/assetsPOApi";
const AssetsPOLogic = (initialPage = 1, initialLimit = 10, status = "") => {
  const [poRecords, setPoRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchPORecords = async () => {
    setLoading(true);
    try {
      const response = await assetsPOApi.getAllPurchaseOrder(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setPoRecords(response.poRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPORecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchPORecords,
    setPoRecords,
    poRecords,
    totalItems,
    totalPages,
    loading,
    setLoading,
    setTotalItems,
    setTotalPages,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
};

export default AssetsPOLogic;
