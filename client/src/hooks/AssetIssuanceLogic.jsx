import { useState, useEffect } from "react";
import assetIssuanceApi from "../api/assetIssuanceApi";

const AssetIssuanceLogic = (
  initialPage = 1,
  initialLimit = 10,
  status = ""
) => {
  const [issuanceRecords, setIssuanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchIssuanceRecords = async () => {
    setLoading(true);
    try {
      const response = await assetIssuanceApi.getAllAssetsIssuanceRecord(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setIssuanceRecords(response.issuanceRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuanceRecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchIssuanceRecords,
    setIssuanceRecords,
    issuanceRecords,
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

export default AssetIssuanceLogic;
