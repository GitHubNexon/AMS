import React, { useState, useEffect } from "react";
import EntriesShortcut from "../Components/EntriesShortcut";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaFile,
  FaWpforms,
} from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import SignatoriesTableLogic from "../hooks/SignatoriesTableLogic";
import { useNavigate } from "react-router-dom";
import UserPicker from "../Components/UserPicker";
import { useLoader } from "../context/useLoader";

const SignatoriesTable = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  // const handleModalOpenForView = (row) => {
  //   let route = "";

  //   switch (row.EntryType) {
  //     case "Journal":
  //       route = "/journalEntries";
  //       break;
  //     case "Receipt":
  //       route = "/receiptEntries";
  //       break;
  //     case "Payment":
  //       route = "/paymentEntries";
  //       break;
  //     default:
  //       showToast("Invalid Entry Type!", "error");
  //       return;
  //   }

  //   navigate(route);
  // };

  const handleModalOpenForView = (row) => {
    let route = "";
    let searchQuery = "";

    switch (row.EntryType) {
      case "Journal":
        route = "/journalEntries";
        searchQuery = row.JVNo || "";
        break;
      case "Receipt":
        route = "/receiptEntries";
        searchQuery = row.CRNo || "";
        break;
      case "Payment":
        route = "/paymentEntries";
        searchQuery = row.DVNo || "";
        break;
      default:
        showToast("Invalid Entry Type!", "error");
        return;
    }

    navigate(`${route}?search=${searchQuery}`);
  };

  const {
    entries,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    FetchEntriesBySignatory,
    signatoryType,
    setSignatoryType,
    setUserName,
    userName,
  } = SignatoriesTableLogic(page, limit);

  const handleUserSelection = (selectedUser) => {
    setUserName(selectedUser.name);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getNo = (row) => {
    return row.JVNo || row.DVNo || row.CRNo || "N/A";
  };

  const getDate = (row) => {
    return row.JVDate || row.DVDate || row.CRDate || "N/A";
  };

  const columns = [
    {
      name: "Actions",
      width: "200px",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* View Button */}
          <div className="group relative">
            <button
              onClick={() => handleModalOpenForView(row)}
              className="text-white bg-blue-600 p-2 rounded-md"
            >
              <FaEye size={16} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              View
            </span>
          </div>
        </div>
      ),
    },
    { name: "Entry Type", selector: (row) => row.EntryType, sortable: true },
    {
      name: "No(JV, DV, CR)",
      selector: (row) => getNo(row),
      width: "200px",
    },
    {
      name: "Date(JV, DV, CR)",
      selector: (row) => formatReadableDate(getDate(row)),
      width: "200px",
    },
    {
      name: "CreatedBy",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.CreatedBy?.name}
        >
          {row.CreatedBy?.name}
        </div>
      ),
    },
    {
      name: "PreparedBy",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.PreparedBy?.name}
        >
          {row.PreparedBy?.name}
        </div>
      ),
    },
    {
      name: "ReviewedBy",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.ReviewedBy?.name}
        >
          {row.ReviewedBy?.name}
        </div>
      ),
    },
    {
      name: "CertifiedBy",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.CertifiedBy?.name}
        >
          {row.CertifiedBy?.name}
        </div>
      ),
    },
    {
      name: "ApprovedBy - 1",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.ApprovedBy1?.name}
        >
          {row.ApprovedBy1?.name}
        </div>
      ),
    },
    {
      name: "ApprovedBy - 2",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.ApprovedBy2?.name}
        >
          {row.ApprovedBy2?.name}
        </div>
      ),
    },
  ];

  const signatoryTypes = [
    "CreatedBy",
    "PreparedBy",
    "ReviewedBy",
    "CertifiedBy",
    "ApprovedBy1",
    "ApprovedBy2",
  ];

  const handleSignatoryTypeChange = (e) => {
    setSignatoryType(e.target.value);
  };

  const handleReset = () => {
    setSignatoryType("");
    setUserName("");
    FetchEntriesBySignatory();
  };

  return (
    <div className="mx-auto p-8 container m-2 border-none">
      <div className="flex flex-col overflow-auto w-full">
        <h1 className="font-bold">All Entries and Signatories</h1>
        {!isAnimating && (
          <div className="flex flex-wrap space-y-2 md:space-y-2 md:space-x-2 overflow-x-auto p-2 items-end justify-end space-x-2 text-[0.7em]">
            <input
              type="text"
              placeholder={`Search...`}
              className="border border-gray-300 p-2 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />
            {/* Dropdown for selecting signatory type */}
            <select
              className="border border-gray-300 p-2 rounded-md"
              value={signatoryType}
              onChange={handleSignatoryTypeChange}
            >
              <option value="">Select Signatory Type</option>
              {signatoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <UserPicker value={userName} onSelectUser={handleUserSelection} />
            <button
              className="bg-gray-500 p-2 rounded-md text-white"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {isAnimating && (
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 animate-pulse"></div>
          <div className="h-8 bg-gray-300 animate-pulse"></div>
          <div className="h-8 bg-gray-300 animate-pulse"></div>
          <div className="h-8 bg-gray-300 animate-pulse"></div>
          <div className="h-8 bg-gray-300 animate-pulse"></div>
          <div className="h-8 bg-gray-300 animate-pulse"></div>
        </div>
      )}

      {!isAnimating && (
        <DataTable
          columns={columns}
          data={entries}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          // selectableRows
        />
      )}
    </div>
  );
};

export default SignatoriesTable;
