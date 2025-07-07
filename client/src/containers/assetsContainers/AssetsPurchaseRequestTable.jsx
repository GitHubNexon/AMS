import React, { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaPlus,
  FaArrowRight,
  FaFileExcel,
  FaEye,
  FaFile,
  FaSync,
  FaUndo,
  FaArchive,
  FaChartBar,
  FaTag,
  FaBox,
  FaCalendarAlt,
  FaDollarSign,
  FaFileAlt,
  FaFolder,
  FaTrash,
  FaHistory,
} from "react-icons/fa";
import { FaBookSkull } from "react-icons/fa6";
import { showToast } from "../../utils/toastNotifications";
import showDialog from "../../utils/showDialog";
import assetsPRApi from "../../api/assetsPRApi";
import AssetsPRLogic from "../../hooks/AssetsPRLogic";
import {
  numberToCurrencyString,
  formatReadableDate,
} from "../../helper/helper";
// import AssetsIssuanceModal from "../../Pop-Up-Pages/AssetsModals/AssetsIssuanceModal";
// import PARModal from "../Pop-Up-Pages/PARModal";
// import PARIssuance from "../../Components/AssetsForm/PARIssuance";

const AssetsPurchaseRequestTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [selectedAssetsPR, setSelectedAssetPR] = useState([]);
  const [isAssetsIssuanceModalOpen, setIsAssetsIssuanceModalOpen] =
    useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isPARModalOpen, setIsPARModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    fetchPRRecords,
    setPrRecords,
    prRecords,
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
  } = AssetsPRLogic(page, limit, status);

  function refreshTable() {
    fetchPRRecords();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchPRRecords();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalOpen = () => {
    setModalMode("add");
    setIsAssetsIssuanceModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAssetsIssuanceModalOpen(false);
    setSelectedAssetPR(null);
  };

  const handlePARModalOpen = (row) => {
    setSelectedAssetPR(row);
    setIsPARModalOpen(true);
  };

  const handlePARModalClose = () => {
    setIsPARModalOpen(false);
    setSelectedAssetPR(null);
  };

  const handleActionButtons = async ({
    id,
    confirmMessage,
    successMessage,
    errorMessage,
    apiMethod,
  }) => {
    try {
      const confirmed = await showDialog.confirm(confirmMessage);
      if (!confirmed) return;

      const result = await apiMethod(id);

      if (result) {
        showDialog.showMessage(successMessage, "success");
        fetchPRRecords?.();
      }
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      showDialog.showMessage(errorMessage, "error");
    }
  };

  const handleDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to delete this Record?",
      successMessage: "Record deleted successfully",
      errorMessage: "Failed to delete assets",
      apiMethod: assetsPRApi.softDeletePurchaseRequest,
    });

  const handleUndoDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the deletion of this Record?",
      successMessage: "Record restoration successful",
      errorMessage: "Failed to undo deletion",
      apiMethod: assetsPRApi.undoDeletePurchaseRequest,
    });

  const handleArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to archive this Record?",
      successMessage: "Record archive successful",
      errorMessage: "Failed to archive assets",
      apiMethod: assetsPRApi.softArchivePurchaseRequest,
    });

  const handleUndoArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the archive of this Record?",
      successMessage: "Record restoration successful",
      errorMessage: "Failed to undo archive",
      apiMethod: assetsPRApi.undoArchivePurchaseRequest,
    });

  const handleFetchLatest = async () => {
    fetchPRRecords();
    showToast("Updated data fetched successfully", "success");
  };

  const handleModalOpenForEdit = (PRRecords) => {
    setModalMode("edit");
    setSelectedAssetPR(PRRecords);
    setIsAssetsIssuanceModalOpen(true);
  };

  const columns = [
    {
      name: "Status",
      cell: (row) => {
        if (row.status?.isDeleted) {
          return (
            <span className="text-red-500 flex items-center">Deleted</span>
          );
        }
        if (row.status?.isArchived) {
          return (
            <span className="text-orange-500 flex items-center">Archived</span>
          );
        }
        return <span className="text-green-500 flex items-center">Active</span>;
      },
      width: "120px",
    },
    {
      name: "Purchase Request Date",
      selector: (row) =>
        row.prDate ? formatReadableDate(row.prDate) : "No Date Yet",
    },
    {
      name: "Purchase Request No",
      width: "200px",
      selector: (row) => row.prNo || "",
    },
    {
      name: "EntityName",
      width: "200px",
      selector: (row) => row.entityName || "",
    },
    {
      name: "Office/Section",
      selector: (row) => row.officeSection || "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <div className="group relative">
            <button
              onClick={() => handlePARModalOpen(row)}
              className="text-white bg-green-600 p-2 rounded-md"
            >
              <FaEye size={16} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              View PAR FORM
            </span>
          </div>
          {!row.status?.isDeleted &&
            !row.status?.isArchived &&
            row.docType !== "Approved" && (
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
            )}
          {row.status?.isDeleted ? (
            <div className="group relative">
              <button
                onClick={() => handleUndoDeleteEntry(row._id)}
                className="text-white bg-yellow-600 p-2 rounded-md"
              >
                <FaUndo size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Undo Delete / Cancelled
              </span>
            </div>
          ) : !row.status?.isArchived && row.docType !== "Approved" ? (
            <div className="group relative">
              <button
                onClick={() => handleDeleteEntry(row._id)}
                className="text-white bg-red-600 p-2 rounded-md"
              >
                <FaTrash size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Delete / Cancelled
              </span>
            </div>
          ) : null}

          {/* {row.Status?.isArchived ? (
              <div className="group relative">
                <button
                  onClick={() => handleUndoArchiveEntry(row._id)}
                  className="text-white bg-yellow-600 p-2 rounded-md"
                >
                  <FaUndo size={16} />
                </button>
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Undo Archive
                </span>
              </div>
            ) : !row.Status?.isDeleted ? (
              <div className="group relative">
                <button
                  onClick={() => handleArchiveEntry(row._id)}
                  className="text-white bg-orange-600 p-2 rounded-md"
                >
                  <FaArchive size={16} />
                </button>
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  Archive
                </span>
              </div>
            ) : null} */}
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <h1 className="font-bold">Purchase Request Records </h1>
          <div className="flex flex-wrap space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            <button
              onClick={handleFetchLatest}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaSync size={16} className="mr-2" />
              Fetch latest Data
            </button>
            {/* Status Filter Dropdown */}
            <select
              className="border px-2 py-1 rounded-md"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">All</option>
              <option value="isDeleted">Deleted</option>
              <option value="isArchived">Archived</option>
            </select>

            <input
              type="text"
              placeholder={`Search Property`}
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
          data={prRecords}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          // expandableRows
          // expandableRowsComponent={ExpandedRowComponent}
          //   expandableRowExpanded={(row) => expandedRows.includes(row._id)}
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
        />
        {/* {isAssetsIssuanceModalOpen && (
          <AssetsIssuanceModal
            mode={modalMode}
            isOpen={isAssetsIssuanceModalOpen}
            onClose={handleModalClose}
            onSaveAssetIssuance={fetchIssuanceRecords}
            assetsIssuanceData={selectedAssetIssuance}
            refreshTable={refreshTable}
          />
        )} */}
        {/* 
        {isPARModalOpen && (
          <PARIssuance
            isOpen={isPARModalOpen}
            onClose={handlePARModalClose}
            employeeAssetsData={selectedAssetIssuance}
          />
        )} */}
      </div>
    </>
  );
};

export default AssetsPurchaseRequestTable;
