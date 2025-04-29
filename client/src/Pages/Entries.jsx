import React, { useState, useEffect } from "react";
import EntriesShortcut from "../Components/EntriesShortcut";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowRight,
  FaFileExcel,
  FaEye,
  FaFile,
  FaClock,
  FaUndoAlt
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { FaPesoSign } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import EntriesTableLogic from "../hooks/EntriesTableLogic";
import { RiFilePaper2Line } from "react-icons/ri";
import PaymentModal from "../Pop-Up-Pages/PaymentModal";
import ReceiptModal from "../Pop-Up-Pages/ReceiptModal";
import JournalModal from "../Pop-Up-Pages/JournalModal";
import NumCheckerModal from "../Pop-Up-Pages/NumCheckerModal";
import ExpandableTable from "../Components/ExpandableTable";
import DeletedEntries from "../Components/DeletedEntries";
import LogsModal from "../Components/LogsModal";
import axios from "axios";
import { useDataPreloader } from "../context/DataPreloader";

const ExpandedRowComponent = ({ data }) => {
  // Helper function to return N/A if data is not available
  const renderData = (value) => (value ? value : "N/A");

  return (
    <div className="p-4 flex flex-wrap border text-[0.8em]">
      <RiFilePaper2Line size={48} />
      <div className="flex-2">
        {/* Conditional rendering based on EntryType */}
        {data.EntryType === "Payment" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-[0.8em]">
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Entry Type:
                </span>
                <span>{renderData(data.EntryType)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  DV Number:
                </span>
                <span>{renderData(data.DVNo)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  DV Date:
                </span>
                <span>
                  {renderData(
                    data.DVDate ? formatReadableDate(data.DVDate) : null
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Check Number:
                </span>
                <span>{renderData(data.CheckNo)}</span>
              </div>
            </div>
          </>
        )}

        {data.EntryType === "Receipt" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-[0.8em]">
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Entry Type:
                </span>
                <span>{renderData(data.EntryType)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Receipt Entry Type:
                </span>
                <span>{renderData(data.ReceiptEntryType)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Payment Methods:
                </span>
                <span>{renderData(data.paymentMethods) || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  CR Number:
                </span>
                <span>{renderData(data.CRNo)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  CR Date:
                </span>
                <span>
                  {renderData(
                    data.CRDate ? formatReadableDate(data.CRDate) : null
                  )}
                </span>
              </div>
            </div>
          </>
        )}

        {data.EntryType === "Journal" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-[0.8em]">
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  Entry Type:
                </span>
                <span>{renderData(data.EntryType)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  JV Number:
                </span>
                <span>{renderData(data.JVNo)}</span>
              </div>
              <div className="flex">
                <span className="w-[130px] mr-2 font-bold text-end">
                  JV Date:
                </span>
                <span>{renderData(data.JVDate)}</span>
              </div>
            </div>
          </>
        )}

        {/* Common Fields for all EntryTypes */}
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

const Entries = () => {
  const {lastClosing, getLastClosing} = useDataPreloader();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedEntries, setSelectedEntries] = useState(null);
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalType, setModalType] = useState("");
  const [isNumCheckerModalOpen, setIsNumCheckerModalOpen] = useState(false);

  useEffect(() => {
    console.log('will get last closing');
    getLastClosing();
  }, []);

  // Open and close the NumCheckerModal
  const handleNumCheckerModalOpen = () => {
    setIsNumCheckerModalOpen(true);
  };

  const handleNumCheckerModalClose = () => {
    setIsNumCheckerModalOpen(false);
  };

  // State for search query
  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    entries,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchEntries,
    sortBy,
    sortOrder,
    toggleSortOrder,
    date,
    setDate,
    setEntries,
  } = EntriesTableLogic(page, limit);

  // Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Dropdown state for modal type
  const [selectedModalType, setSelectedModalType] = useState("Payment");

  // Open the selected modal
  const handleModalOpen = () => {
    setModalType(selectedModalType);
    setModalMode("add");
    setIsEntriesModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEntriesModalOpen(false);
    setSelectedEntries(null);
    setModalType("");
  };

  const handleModalOpenForEdit = (entries) => {
    setModalMode("edit");
    setSelectedEntries(entries);
    setModalType(entries.EntryType);
    setIsEntriesModalOpen(true);
  };

  const handleModalOpenForDuplicate = (entries) => {
    setModalMode("duplicate");
    setSelectedEntries(entries);
    setModalType(entries.EntryType);
    setIsEntriesModalOpen(true);
  };

  const [logsModal, setLogsModal] = useState({ show: false, id: null });
  const handleModalOpenForLogs = (entries) => {
    console.log(entries);
    setLogsModal({show: true, id: entries._id});
  };

  const renderModal = () => {
    switch (modalType) {
      case "Payment":
        return (
          <PaymentModal
            mode={modalMode}
            isOpen={isEntriesModalOpen}
            onClose={handleModalClose}
            onSavePayment={fetchEntries}
            entryData={selectedEntries}
            refreshTable={refreshTable}
          />
        );
      case "Receipt":
        return (
          <ReceiptModal
            mode={modalMode}
            isOpen={isEntriesModalOpen}
            onClose={handleModalClose}
            onSaveReceipt={fetchEntries}
            entryData={selectedEntries}
            refreshTable={refreshTable}
          />
        );
      case "Journal":
        return (
          <JournalModal
            mode={modalMode}
            isOpen={isEntriesModalOpen}
            onClose={handleModalClose}
            onSaveJournal={fetchEntries}
            entryData={selectedEntries}
            refreshTable={refreshTable}
          />
        );
      default:
        return null;
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this Entry?`
    );
    if (!confirmed) return;

    try {
      await EntriesApi.deleteEntryById(entryId);
      fetchEntries();
      showToast("Entry deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting Entry:", error);
      showToast("Failed to delete Entry. Please try again.", "error");
    }
  };


  const handleCancelEntry = async (entry) => {
    const confirmed = await showDialog.confirm(`Are you sure you want to cancel this Entry?`);
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/${entry._id}`, { withCredentials: true });
      fetchEntries();
      console.log(response.data);
      showToast("Entry cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cencelling Entry:", error);
      showToast("Failed to cencelling Entry. Please try again.", "error");
    }
  };

  const handleUndoCancelEntry = async (entry) => {
    const confirmed = await showDialog.confirm(`Are you sure you want to undo entry cancellation?`);
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/undo/${entry._id}`, { withCredentials: true });
      fetchEntries();
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

  const getNo = (row) => {
    return row.JVNo || row.DVNo || row.CRNo || "N/A";
  };

  const columns = [
    {
      name: "Entry Type",
      selector: (row) => row.EntryType,
    },
    {
      name: "No(JV, DV, CR)",
      selector: (row) => getNo(row),
      width: "200px",
    },
    {
      name: "Created At",
      id: "createdAt",
      selector: (row) => formatReadableDate(row.createdAt),
      sortable: true,
      sortFunction: sortByDate("createdAt"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("createdAt"),
    },
    {
      name: "Updated At",
      id: "updatedAt",
      selector: (row) => formatReadableDate(row.updatedAt),
      sortable: true,
      sortFunction: sortByDate("updatedAt"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("updatedAt"),
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
      name: "Prepared By",
      selector: (row) => row.PreparedBy?.name || "-"
    },
    {
      name: "Amount",
      selector: (row) => numberToCurrencyString(row.ledgers.map(m=>Math.abs(m.cr)).reduce((pre, cur)=>pre+cur,0)),
    },
    {
      name: "Status",
      selector: (row) => row.cancelledDate ? 'cancelled' : ''
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 pr-4">


          {
            (lastClosing ? true && new Date(row.DVDate || row.JVDate || row.CRDate) >= new Date(lastClosing) : true) && (
            row.cancelledDate ?
            <>
            {/* Cancel Button */}
            <div className="group relative">
                <button
                  onClick={() => handleUndoCancelEntry(row)}
                  className="text-white bg-orange-600 p-2 rounded-md"
                >
                  <FaUndoAlt  size={12} />
                </button>
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Undo
                </span>
              </div>
            </>
            :
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
                  <MdCancel  size={12} />
                </button>
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Cancel
                </span>
              </div>
            </>
            )
          }

          {/* Delete Button (if accounting period is closed this is replaced with duplicated that is dated today) */}
          {
              (lastClosing ? true && new Date(row.DVDate || row.JVDate || row.CRDate) >= new Date(lastClosing) : true) ? (
              <div className="group relative">
                <button
                  onClick={() => handleDeleteEntry(row._id)}
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
                  onClick={() => {
                    const newDate = new Date().toISOString(); // Get current date
                    const updatedRow = {
                      ...row,
                      ...(row.DVDate && { DVDate: newDate }),
                      ...(row.JVDate && { JVDate: newDate }),
                      ...(row.CRDate && { CRDate: newDate }),
                    };
                    handleModalOpenForDuplicate(updatedRow);
                  }}
                  className="text-white bg-yellow-500 p-2 rounded-md"
                >
                  <IoDuplicate size={12} />
                </button>
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Duplicate
                </span>
              </div>
            )
          }

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
    fetchEntries();
  }

  return (
    <>
      <EntriesShortcut />
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <h1 className="font-bold">All Entry</h1>
          <div className="flex flex-wrap space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            <label htmlFor="date">Created At</label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded-md"
            />
            <button
              onClick={handleNumCheckerModalOpen}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300"
            >
              Check Number List
            </button>
            <input
              type="text"
              placeholder={`Search Entries`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />
            {/* NumCheckerModal positioned behind the search input */}
            <div className="absolute top-full w-full z-10 bg-white shadow-lg mt-1 rounded-md overflow-hidden">
              <NumCheckerModal />
            </div>
            <span className="text-[0.8em] flex items-center">
              Select Entry
              <FaArrowRight size={12} className="ml-1" />
            </span>
            <select
              className="border px-2 py-1 rounded-md"
              value={selectedModalType}
              onChange={(e) => setSelectedModalType(e.target.value)}
            >
              <option value="Payment">Payment</option>
              <option value="Receipt">Receipt</option>
              <option value="Journal">Journal</option>
            </select>
            <button
              onClick={handleModalOpen}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Add {selectedModalType} Entry
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={entries}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />

        <div className="mt-4">
          <DeletedEntries refresh={refreshTable} />
        </div>

        {renderModal()}

        <NumCheckerModal
          isOpen={isNumCheckerModalOpen}
          onClose={handleNumCheckerModalClose}
        />
      </div>
      <LogsModal
        show={logsModal.show}
        close={() => setLogsModal({ show: false, id: null })}
        id={logsModal.id}
      />
    </>
  );
};

export default Entries;
