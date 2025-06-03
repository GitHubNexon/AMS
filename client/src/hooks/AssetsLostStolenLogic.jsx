import { useState, useEffect } from "react";
import assetLostStolenApi from "../api/assetLostStolenApi";

const AssetsLostStolenLogic = (
  initialPage = 1,
  initialLimit = 10,
  status = ""
) => {
  const [lostStolenRecords, setLostStolenRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchLostStolenRecords = async () => {
    setLoading(true);
    try {
      const response = await assetLostStolenApi.getAllAssetsLostStolenRecord(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setLostStolenRecords(response.lostStolenRecords);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostStolenRecords();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

  return {
    fetchLostStolenRecords,
    setLostStolenRecords,
    lostStolenRecords,
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
export default AssetsLostStolenLogic;
