import { useState, useEffect } from "react";
import taxApi from "../api/taxApi";

const TaxTableLogic = (initialPage = 1, initialLimit = 10) => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const response = await taxApi.getAllTaxes(
        initialPage,
        initialLimit,
        searchQuery
      );
      console.log(response);
      setTaxes(response.taxes);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
    } catch (error) {
      console.error("Error fetching taxes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [initialPage, initialLimit, searchQuery]);

  return {
    taxes,
    totalItems,
    totalPages,
    setTaxes,

    loading,
    searchQuery,
    setSearchQuery,
    fetchTaxes,
  };
};

export default TaxTableLogic;
