import { useState, useEffect } from "react";
import assetRepairedApi from "../api/assetsRepairedApi";

const AssetsRepairLogic = (initialPage = 1, initialLimit = 10, status = "") => {
  const [repairedRecords, setRepairedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchRepairedRecords = async () => {
    setLoading(true);
    try {
      const response = await assetRepairedApi.getAllAssetsRepairedRecord(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setRepairedRecords(response.repairedRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairedRecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchRepairedRecords,
    setRepairedRecords,
    repairedRecords,
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

export default AssetsRepairLogic;
