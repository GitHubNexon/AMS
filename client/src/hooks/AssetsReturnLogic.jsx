import { useState, useEffect } from "react";
import assetsReturnApi from "../api/assetReturnApi";

const AssetsReturnLogic = (initialPage = 1, initialLimit = 10, status = "") => {
  const [returnRecords, setReturnRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchReturnRecords = async () => {
    setLoading(true);
    try {
      const response = await assetsReturnApi.getAllAssetsReturnRecord(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setReturnRecords(response.returnRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchReturnRecords,
    setReturnRecords,
    returnRecords,
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

export default AssetsReturnLogic;
