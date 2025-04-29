import { useState, useEffect } from "react";
import UserApi from "../api/UserApi";

const SignatoriesTableLogic = (initialPage = 1, initialLimit = 10) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [signatoryType, setSignatoryType] = useState("");
  const [userName, setUserName] = useState("");

  const FetchEntriesBySignatory = async () => {
    setLoading(true);
    try {
      const response = await UserApi.getEntriesBySignatory(
        initialPage,
        initialLimit,
        searchQuery,
        signatoryType,
        userName
      );
      setEntries(response.entries);
      setTotalItems(response.totalItems);
      setTotalPages(Math.ceil(response.totalItems / initialLimit));
      console.log(response);
    } catch (error) {
      console.error("Error fetching User Entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchEntriesBySignatory();
  }, [initialPage, initialLimit, searchQuery, signatoryType, userName]);

  return {
    entries,
    totalItems,
    totalPages,
    setEntries,
    setLoading,
    loading,
    searchQuery,
    setSearchQuery,
    FetchEntriesBySignatory,
    signatoryType,
    setSignatoryType,
    setUserName,
    userName,
  };
};

export default SignatoriesTableLogic;
