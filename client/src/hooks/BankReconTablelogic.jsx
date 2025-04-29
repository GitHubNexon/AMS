import { useState, useEffect } from "react";
import BankReconApi from "../api/BankReconApi";

const BankReconTablelogic = (initialPage = 1, initialLimit = 10) => {
  const [bankReconciliation, setBankReconciliation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [date, setDate] = useState("");

  const fetchBankRecon = async () => {
    setLoading(true);
    try {
      const response = await BankReconApi.getAllBankReconciliation(
        initialPage,
        initialLimit,
        searchQuery,
        sortBy,
        sortOrder,
        date
      );
      setBankReconciliation(response.bankReconciliation);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
      console.log("bankReconciliation fetched successfully", response.bankReconciliation);
    } catch (error) {
      console.error("Error fetching bankReconciliation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankRecon();
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
    bankReconciliation,
    totalItems,
    totalPages,
    setBankReconciliation,

    loading,
    searchQuery,
    setSearchQuery,
    fetchBankRecon,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  };
};

export default BankReconTablelogic;
