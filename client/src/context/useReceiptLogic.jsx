// useReceiptLogic.js
// this is for testing purposes
import { useState, useMemo } from "react";

const useReceiptLogic = (data) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const rowsPerPage = 10;

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year}`;
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesText = row.crNo
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const formattedSearchDate = searchDate ? formatDate(searchDate) : "";
      const matchesDate = formattedSearchDate
        ? row.crDate === formattedSearchDate
        : true;
      return matchesText && matchesDate;
    });
  }, [data, searchText, searchDate]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  return {
    currentPage,
    setCurrentPage,
    searchText,
    setSearchText,
    searchDate,
    setSearchDate,
    paginatedData,
    rowsPerPage,
    filteredData,
  };
};

export default useReceiptLogic;
