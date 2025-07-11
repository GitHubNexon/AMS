import { useState, useEffect } from "react";
import assetsPRApi from "./../api/assetsPRApi";

const AssetsPRLogic = (initialPage = 1, initialLimit = 10, status = "") => {
  const [prRecords, setPrRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchPRRecords = async () => {
    setLoading(true);
    try {
      const response = await assetsPRApi.getAllPurchaseRequest(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setPrRecords(response.prRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRRecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchPRRecords,
    setPrRecords,
    prRecords,
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

export default AssetsPRLogic;
