import { useState, useEffect } from "react";
import assetsApi from "../api/assetsApi";

const EmployeeAssetsLogic = (
  initialPage = 1,
  initialLimit = 10,
  status = ""
) => {
  const [EmployeeAssets, setEmployeeAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchEmployeeAssets = async () => {
    setLoading(true);
    try {
      const response = await assetsApi.getAllEmployeeAssetsRecord(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        status
      );
      setEmployeeAssets(response.employeeAssets);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching employee assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeAssets();
  }, [initialPage, initialLimit, searchQuery, sortBy, sortOrder, status]);

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
    fetchEmployeeAssets,
    EmployeeAssets,
    totalItems,
    totalPages,
    setEmployeeAssets,
    loading,
    setLoading,
    setTotalItems,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    toggleSortOrder,
  };
};

export default EmployeeAssetsLogic;
