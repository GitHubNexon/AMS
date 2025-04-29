import React, { useState, useEffect, useContext } from "react";
import EntriesShortcut from "../Components/EntriesShortcut";
import DataTable from "react-data-table-component";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaFile,
  FaWpforms,
  FaClock,
  FaUndoAlt,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { RiFilePaper2Line } from "react-icons/ri";
import { FaPesoSign } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import JournalTableLogic from "../hooks/JournalTableLogic";
import JournalModal from "../Pop-Up-Pages/JournalModal";
import NumCheckerModal from "../Pop-Up-Pages/NumCheckerModal";
import { useNavigate } from "react-router-dom";
import ExpandableTable from "../Components/ExpandableTable";
import RentAccrualPreview from "../Pop-Up-Pages/RentAccrualPreview";
import JournalVoucher from "../Pop-Up-Pages/JournalVoucher";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import LogsModal from "../Components/LogsModal";
import { useDataPreloader } from "../context/DataPreloader";

const ExpandedRowComponent = ({ data }) => {
  return (
    <div className="p-4 flex flex-wrap border text-[0.8em]">
      <RiFilePaper2Line size={48} />

      <div className="flex-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-[0.8em]">
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Entry Type:
            </span>
            <span>{data.EntryType}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              JV Number:
            </span>
            <span>{data.JVNo}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">JV Date:</span>
            <span>{formatReadableDate(data.JVDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 text-[0.8em] mt-10">
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Particulars:
            </span>
            <span>{data.Particulars}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Prepared By:
            </span>
            <span>
              {data.PreparedBy?.name} - {data.PreparedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Reviewed By:
            </span>
            <span>
              {data.ReviewedBy?.name} - {data.ReviewedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Approved By:
            </span>
            <span>
              {data.ApprovedBy1?.name} - {data.ApprovedBy1?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Approved By:
            </span>
            <span>
              {data.ApprovedBy2?.name} - {data.ApprovedBy2?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Certified By:
            </span>
            <span>
              {data.CertifiedBy?.name} - {data.CertifiedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Attachments:
            </span>
            <span>{data.Attachments}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">Tag:</span>
            <span>{data.tag}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ExpandableTable data={data.ledgers} />
      </div>
    </div>
  );
};

const JournalEntries = () => {
  const navigate = useNavigate();
  const { lastClosing } = useDataPreloader();
  const { reset } = useContext(LedgerSheetContext);
  const location = useLocation();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchQueryFromUrl = queryParams.get("search") || "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isNumCheckerModalOpen, setIsNumCheckerModalOpen] = useState(false);

  const [logsModal, setLogsModal] = useState({ show: false, id: null });
  const handleModalOpenForLogs = (entries) => {
    console.log(entries._id);
    setLogsModal({ show: true, id: entries._id });
  };

  const handleNumCheckerModalOpen = () => {
    setIsNumCheckerModalOpen(true);
  };

  const handleNumCheckerModalClose = () => {
    setIsNumCheckerModalOpen(false);
  };

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    journals,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchJournals,
    sortBy,
    sortOrder,
    toggleSortOrder,
    date,
    setDate,
  } = JournalTableLogic(page, limit);

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     setSearchQuery(query);
  //   }, 500);
  //   return () => clearTimeout(delayDebounceFn);
  // }, [query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== searchQuery) {
        setSearchQuery(query);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (searchQueryFromUrl) {
      setSearchQuery(searchQueryFromUrl);
    }
  }, [searchQueryFromUrl]);

  const handleEntryModalClose = () => {
    setIsJournalModalOpen(false);
    setSelectedJournal(null);
  };

  const handleModalOpenForAdd = () => {
    reset();
    setModalMode("add");
    setIsJournalModalOpen(true);
  };

  const handleModalOpenForEdit = (journal) => {
    setModalMode("edit");
    setSelectedJournal(journal);
    setIsJournalModalOpen(true);
  };

  const handleModalOpenForDuplicate = (journal) => {
    setModalMode("duplicate");
    setSelectedJournal(journal);
    setIsJournalModalOpen(true);
  };

  const handleDeleteJournal = async (entryId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this Journal?`
    );
    if (!confirmed) return;

    try {
      await EntriesApi.deleteEntryById(entryId);
      fetchJournals();
      showToast("Journal deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting Journal:", error);
      showToast("Failed to delete Journal. Please try again.", "error");
    }
  };

  const handleCancelEntry = async (entry) => {
    console.log(entry);
    const confirmed = await showDialog.confirm(
      `Are you sure you want to cancel this Entry?`
    );
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/${entry._id}`, {
        withCredentials: true,
      });
      fetchJournals();
      console.log(response.data);
      showToast("Entry cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cencelling Entry:", error);
      showToast("Failed to cencelling Entry. Please try again.", "error");
    }
  };

  const handleUndoCancelEntry = async (entry) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to undo entry cancellation?`
    );
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/undo/${entry._id}`, {
        withCredentials: true,
      });
      fetchJournals();
      console.log(response.data);
      showToast("undo successfull!", "success");
    } catch (error) {
      console.error("Error cencelling Entry:", error);
      showToast("Failed to cencelling Entry. Please try again.", "error");
    }
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const sortByDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
  };

  const sortNumbers = (rowA, rowB) => {
    const valueA = rowA?.JVNo;
    const valueB = rowB?.JVNo;

    const partsA = valueA.split("-").map(Number);
    const partsB = valueB.split("-").map(Number);
    for (let i = 0; i < partsA.length; i++) {
      if (partsA[i] < partsB[i]) return -1;
      if (partsA[i] > partsB[i]) return 1;
    }

    return 0;
  };

  const columns = [
    { name: "Entry Type", selector: (row) => row.EntryType },
    {
      name: "JV Date",
      id: "JVDate",
      selector: (row) => formatReadableDate(row.JVDate),
      sortable: true,
      sortFunction: sortByDate("JVDate"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("JVDate"),
    },
    // {
    //   name: "JV Number",
    //   selector: (row) => row.JVNo,
    // },
    {
      name: "JV Number",
      id: "JVNo",
      selector: (row) => row.JVNo,
      sortable: true,
      sortFunction: sortNumbers,
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("JVNo"),
    },
    {
      name: "Prepared By",
      selector: (row) => row.PreparedBy?.name || "-",
    },
    {
      name: "Particulars",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.Particulars}
        >
          {row.Particulars}
        </div>
      ),
      width: "400px",
    },
    {
      name: "Amount",
      selector: (row) => numberToCurrencyString(row.ledgers.map(m=>Math.abs(m.cr)).reduce((pre, cur)=>pre+cur,0)),
    },
    {
      name: "Status",
      selector: (row) => (row.cancelledDate ? "cancelled" : ""),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 pr-4">
          {row.formType === "RENT ACCRUAL" ? (
            <div className="group relative">
              <button
                onClick={() => openRentalAccrual(row)}
                className="text-white bg-green-600 p-2 rounded-md"
              >
                <FaFile size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Print Preview
              </span>
            </div>
          ) : (
            <div className="group relative">
              <button
                onClick={() => openJournalVoucher(row)}
                className="text-white bg-green-600 p-2 rounded-md"
              >
                <FaFile size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Print Preview
              </span>
            </div>
          )}

          {/* if accounting period is closed hide any button related to updates */}

          {(lastClosing
            ? row.JVDate && new Date(row.JVDate) >= new Date(lastClosing)
            : true) &&
            (row.cancelledDate ? (
              <>
                {/* Cancel Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleUndoCancelEntry(row)}
                    className="text-white bg-orange-600 p-2 rounded-md"
                  >
                    <FaUndoAlt size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Undo
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Edit Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleModalOpenForEdit(row)}
                    className="text-white bg-blue-600 p-2 rounded-md"
                  >
                    <FaEdit size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Edit
                  </span>
                </div>

                {/* Duplicate Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleModalOpenForDuplicate(row)}
                    className="text-white bg-yellow-500 p-2 rounded-md"
                  >
                    <IoDuplicate size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Duplicate
                  </span>
                </div>

                {/* Cancel Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleCancelEntry(row)}
                    className="text-white bg-orange-600 p-2 rounded-md"
                  >
                    <MdCancel size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Cancel
                  </span>
                </div>
              </>
            ))}

          {/* Delete Button (if accounting period is closed this is replaced with duplicated that is dated today) */}
          {(
            lastClosing
              ? row.JVDate && new Date(row.JVDate) >= new Date(lastClosing)
              : true
          ) ? (
            <div className="group relative">
              <button
                onClick={() => handleDeleteJournal(row._id)}
                className="text-white bg-red-600 p-2 rounded-md"
              >
                <FaTrash size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Delete
              </span>
            </div>
          ) : (
            <div className="group relative">
              <button
                onClick={() =>
                  handleModalOpenForDuplicate({
                    ...row,
                    JVDate: new Date().toISOString(),
                  })
                }
                className="text-white bg-yellow-500 p-2 rounded-md"
              >
                <IoDuplicate size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Duplicate
              </span>
            </div>
          )}

          {/* logs Button */}
          <div className="group relative">
            <button
              onClick={() => handleModalOpenForLogs(row)}
              className="text-white bg-gray-500 p-2 rounded-md"
            >
              <FaClock size={12} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              Versions
            </span>
          </div>
        </div>
      ),
    },
  ];

  function refreshTable() {
    fetchJournals();
  }

  const [rentalAccrualPreview, setRentalAccrualPreview] = useState({
    show: false,
    data: "",
  });
  function openRentalAccrual(data) {
    console.log("ACCRUAL", data);
    setRentalAccrualPreview({ show: true, data: data });
  }

  const [journalVoucher, setJournalVoucher] = useState({
    show: false,
    data: "",
  });
  function openJournalVoucher(data) {
    console.log("VOUCHER", data);
    setJournalVoucher({ show: true, data: data });
  }

  return (
    <>
      <JournalVoucher
        show={journalVoucher.show}
        close={() => setJournalVoucher({ show: false, data: "" })}
        data={journalVoucher.data}
      />
      <RentAccrualPreview
        show={rentalAccrualPreview.show}
        close={() => setRentalAccrualPreview({ show: false, data: "" })}
        data={rentalAccrualPreview.data}
      />
      <EntriesShortcut />
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <h1 className="font-bold">Journal Entry</h1>
          <div className="flex flex-wrap  space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            <label htmlFor="date">Created At</label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded-md"
            />
            <button
              onClick={handleNumCheckerModalOpen}
              className="bg-blue-600 text-white rounded-md px-2 py-1 text-sm hover:scale-105 transition transform duration-300"
            >
              Check Number List
            </button>
            {/* <input
              type="text"
              placeholder={`Search Journal Entry`}
              className="border px-2 py-2 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            /> */}
            <input
              type="text"
              placeholder={`Search Journal Entry`}
              className="border px-2 py-1 rounded-md"
              value={searchQuery}
              // onChange={(e) => setQuery(e.target.value)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleModalOpenForAdd}
              className="bg-blue-600 text-white rounded-md px-2 py-1 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Add Journal Entry
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={journals}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          // selectableRows
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />
      </div>

      {isJournalModalOpen && (
        <JournalModal
          mode={modalMode}
          isOpen={isJournalModalOpen}
          onClose={handleEntryModalClose}
          onSaveJournal={fetchJournals}
          entryData={selectedJournal}
          refreshTable={refreshTable}
        />
      )}

      <NumCheckerModal
        isOpen={isNumCheckerModalOpen}
        onClose={handleNumCheckerModalClose}
      />
      <LogsModal
        show={logsModal.show}
        close={() => setLogsModal({ show: false, id: null })}
        id={logsModal.id}
      />
    </>
  );
};

export default JournalEntries;
