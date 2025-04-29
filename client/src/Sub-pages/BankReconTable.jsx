import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowRight,
  FaFileExcel,
  FaEye,
  FaFile,
  FaSync,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import Transaction from "../Sub-pages/Transaction";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import BankReconApi from "../api/BankReconApi";
import BankReconTableLogic from "../hooks/BankReconTablelogic";
import BankReconModal from "../Pop-Up-Pages/BankReconModal";
import OutstandingTransaction from "../Pop-Up-Pages/OutstandingTransaction";
import UnRecordedTransaction from "../Pop-Up-Pages/UnRecordedTransaction";
import BankReconPreview from "../Pop-Up-Pages/BankReconPreview";
import { useDataPreloader } from "../context/DataPreloader";
import BankReconTransactionList from "../Pop-Up-Pages/BankReconTransactionList";

const BankReconTable = () => {
  const { lastClosing } = useDataPreloader();
  const [expandedRows, setExpandedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedBankRecon, setSelectedBankRecon] = useState(null);
  const [isBankReconModalOpen, setIsBankReconModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [unrecordedTransaction, setUnrecordedTransaction] = useState([]);
  const [outstandingTransactions, setOutstandingTransactions] = useState([]);
  const [selectedBankReconId, setSelectedBankReconId] = useState(null);
  const [isOutstandingModalOpen, setIsOutstandingModalOpen] = useState(false);
  const [isUnrecordedTransactionOpen, setIsUnrecordedTransactionOpen] =
    useState(false);
  const [isBankReconPreviewOpen, setIsBankReconPreviewOpen] = useState(false);
  const [isBankTransactionListOpen, setIsBankTransactionListOpen] =
    useState(false);

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
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
  } = BankReconTableLogic(page, limit);

  const fetchOutstandingTransactions = async (id) => {
    try {
      const data = await BankReconApi.getOutstandingTransactionsById(id);
      console.log("Data", data);
      setOutstandingTransactions(data);
      setSelectedBankReconId(id);
      setIsOutstandingModalOpen(true);
    } catch (error) {
      showToast("Failed to fetch outstanding transactions.", "error");
      console.error("Error fetching outstanding transactions:", error);
    }
  };

  const handlePreviewClick = (bankRecon) => {
    setSelectedBankRecon(bankRecon);
    setIsBankReconPreviewOpen(true);
  };

  const handleBankTransactionListClick = (bankRecon) => {
    setSelectedBankRecon(bankRecon);
    setIsBankTransactionListOpen(true);
  };

  const fetchUnrecordedTransactions = async (id) => {
    try {
      const data = await BankReconApi.getUnrecordedTransactionsById(id);
      console.log("Data", data);
      setUnrecordedTransaction(data);
      setSelectedBankReconId(id);
      setIsUnrecordedTransactionOpen(true);
    } catch (error) {
      showToast("Failed to fetch outstanding transactions.", "error");
      console.error("Error fetching outstanding transactions:", error);
    }
  };

  // Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalOpen = () => {
    setModalMode("add");
    setIsBankReconModalOpen(true);
  };

  const handleModalClose = () => {
    setIsBankReconModalOpen(false);
    setSelectedBankRecon(null);
  };

  const handleModalOpenForEdit = (bankRecon) => {
    setModalMode("edit");
    setSelectedBankRecon(bankRecon);
    setIsBankReconModalOpen(true);
  };

  const handleDeleteEntry = async (bankReconId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this Entry?`
    );
    if (!confirmed) return;

    try {
      await BankReconApi.deleteBankReconciliation(bankReconId);
      fetchBankRecon();
      showToast("BankRecon deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting BankRecon:", error);
      showToast("Failed to delete BankRecon. Please try again.", "error");
    }
  };

  const handleFetchLatest = async () => {
    fetchBankRecon();
    showToast("Updated data fetched successfully", "success");
  };

  const sortByDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
  };

  const columns = [
    {
      name: "Reconciled",
      selector: (row) => row.reconciled,
      cell: (row) =>
        row.reconciled ? (
          <FaCheckCircle color="green" size={20} />
        ) : (
          <FaTimesCircle color="red" size={20} />
        ),
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
      name: "Prepared By",
      selector: (row) => row.PreparedBy?.name || "-",
    },
    {
      name: "Account",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.glAccount?.name}
        >
          {row.glAccount?.name}
        </div>
      ),
      width: "300px",
    },
    // {
    //   name: "Start Date",
    //   id: "startDate",
    //   selector: (row) => formatReadableDate(row.startDate),
    //   sortable: true,
    //   sortFunction: sortByDate("startDate"),
    //   sortDirection: sortOrder,
    //   onClick: () => toggleSortOrder("startDate"),
    // },
    // {
    //   name: "End Date",
    //   id: "endDate",
    //   selector: (row) => formatReadableDate(row.endDate),
    //   sortable: true,
    //   sortFunction: sortByDate("endDate"),
    //   sortDirection: sortOrder,
    //   onClick: () => toggleSortOrder("endDate"),
    // },
    {
      name: "Reconciled Date",
      selector: (row) =>
        row.reconciledDate
          ? formatReadableDate(row.reconciledDate)
          : "No Date Yet",
    },
    {
      name: "Reconciliation Notes",
      width: "300px",
      selector: (row) => row.reconciliationNotes || "",
    },
    // {
    //   name: "Actions",
    //   cell: (row) => (
    //     <div className="flex space-x-2 justify-between">
    //     {/* These buttons should always be displayed */}
    //     <div className="group relative">
    //       <button
    //         onClick={() => handlePreviewClick(row)}
    //         className="text-white bg-green-600 p-2 rounded-md"
    //       >
    //         <FaFile size={16} />
    //       </button>
    //       <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //         Preview
    //       </span>
    //     </div>
    //     <div className="group relative">
    //       <button
    //         onClick={() => fetchUnrecordedTransactions(row._id)}
    //         className="text-white bg-gray-600 p-2 rounded-md"
    //       >
    //         <FaFile size={16} />
    //         <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //           Unrecorded checks
    //         </span>
    //       </button>
    //     </div>
    //     <div className="group relative">
    //       <button
    //         onClick={() => fetchOutstandingTransactions(row._id)}
    //         className="text-white bg-green-600 p-2 rounded-md"
    //       >
    //         <FaFile size={16} />
    //         <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //           Outstanding checks
    //         </span>
    //       </button>
    //     </div>
    //         <div className="group relative">
    //           <button
    //             onClick={() => handleModalOpenForEdit(row)}
    //             className="text-white bg-blue-600 p-2 rounded-md"
    //           >
    //             <FaEdit size={16} />
    //           </button>
    //           <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //             Edit
    //           </span>
    //         </div>
    //         <div className="group relative">
    //           <button
    //             onClick={() => handleDeleteEntry(row._id)}
    //             className="text-white bg-red-600 p-2 rounded-md"
    //           >
    //             <FaTrash size={16} />
    //           </button>
    //           <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //             Delete
    //           </span>
    //         </div>
    //   </div>
    //   ),
    // }
    // },
    {
      name: "Actions",
      cell: (row) => {
        const isAllowed = lastClosing
          ? row.startDate && new Date(row.startDate) >= new Date(lastClosing)
          : true;

        return (
          <div className="flex space-x-2 justify-between">
            {/* These buttons should always be displayed */}
            <div className="group relative">
              <button
                onClick={() => handleBankTransactionListClick(row)}
                className="text-white bg-orange-600 p-2 rounded-md"
              >
                <FaFile size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Transaction list
              </span>
            </div>
            <div className="group relative">
              <button
                onClick={() => handlePreviewClick(row)}
                className="text-white bg-green-600 p-2 rounded-md"
              >
                <FaFile size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Preview
              </span>
            </div>
            <div className="group relative">
              <button
                onClick={() => fetchUnrecordedTransactions(row._id)}
                className="text-white bg-gray-600 p-2 rounded-md"
              >
                <FaFile size={16} />
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Unrecorded checks
                </span>
              </button>
            </div>
            <div className="group relative">
              <button
                onClick={() => fetchOutstandingTransactions(row._id)}
                className="text-white bg-green-600 p-2 rounded-md"
              >
                <FaFile size={16} />
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Outstanding checks
                </span>
              </button>
            </div>


              <>
                <div className="group relative">
                  <button
                    onClick={() => handleModalOpenForEdit(row)}
                    className="text-white bg-blue-600 p-2 rounded-md"
                  >
                    <FaEdit size={16} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Edit
                  </span>
                </div>
                <div className="group relative">
                  <button
                    onClick={() => handleDeleteEntry(row._id)}
                    className="text-white bg-red-600 p-2 rounded-md"
                  >
                    <FaTrash size={16} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Delete
                  </span>
                </div>
              </>
       
          </div>
        );
      },
    },
  ];

  function refreshTable() {
    fetchBankRecon();
  }

  return (
    <>
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <RiBankFill size={20} />
          <h1 className="font-bold">Bank Reconciliation</h1>

          <div className="flex flex-wrap space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            <button
              onClick={handleFetchLatest}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaSync size={16} className="mr-2" />
              Fetch latest Data
            </button>
            <input
              type="text"
              placeholder={`Search Reconciliation`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleModalOpen}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Create
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bankReconciliation}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          //   expandableRows
          //   expandableRowsComponent={ExpandedRowComponent}
          //   expandableRowExpanded={(row) => expandedRows.includes(row._id)}
          // selectableRows
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />

        {isBankReconModalOpen && (
          <BankReconModal
            mode={modalMode}
            isOpen={isBankReconModalOpen}
            onClose={handleModalClose}
            onSaveBankRecon={fetchBankRecon}
            bankReconData={selectedBankRecon}
            refreshTable={refreshTable}
          />
        )}

        {isOutstandingModalOpen && (
          <OutstandingTransaction
            isOpen={isOutstandingModalOpen}
            data={outstandingTransactions}
            onClose={() => setIsOutstandingModalOpen(false)}
          />
        )}

        {isUnrecordedTransactionOpen && (
          <UnRecordedTransaction
            isOpen={isUnrecordedTransactionOpen}
            data={unrecordedTransaction}
            onClose={() => setIsUnrecordedTransactionOpen(false)}
          />
        )}

        {isBankReconPreviewOpen && (
          <BankReconPreview
            isOpen={isBankReconPreviewOpen}
            onClose={() => setIsBankReconPreviewOpen(false)}
            bankRecon={selectedBankRecon}
          />
        )}

        {isBankTransactionListOpen && (
          <BankReconTransactionList
            isOpen={isBankTransactionListOpen}
            onClose={() => setIsBankTransactionListOpen(false)}
            bankRecon={selectedBankRecon}
          />
        )}
      </div>
    </>
  );
};

export default BankReconTable;
