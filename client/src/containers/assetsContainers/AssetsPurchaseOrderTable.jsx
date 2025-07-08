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
import assetsPOApi from "../../api/assetsPOApi";
import AssetsPOLogic from "../../hooks/AssetsPOLogic";
import {
  numberToCurrencyString,
  formatReadableDate,
} from "../../helper/helper";
import AssetsPRModal from "../../Pop-Up-Pages/AssetsModals/AssetsPRModal";
import AssetsPRForm from "../../Components/AssetsForm/AssetsPRForm";

const AssetsPurchaseOrderTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  // const [selectedAssetsPO, setSelectedAssetPO] = useState([]);
  const [selectedAssetsPO, setSelectedAssetPO] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isFormModalOpen, setIsFormModelOpen] = useState(false);
  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    fetchPORecords,
    setPoRecords,
    poRecords,
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
  } = AssetsPOLogic(page, limit, status);

  function refreshTable() {
    fetchPORecords();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchPORecords();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalOpen = () => {
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAssetPO(null);
  };

  const handleFormModalOpen = (row) => {
    setSelectedAssetPO(row);
    setIsFormModelOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModelOpen(false);
    setSelectedAssetPO(null);
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
        fetchPORecords?.();
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
      apiMethod: assetsPOApi.softDeletePurchaseOrder,
    });

  const handleUndoDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the deletion of this Record?",
      successMessage: "Record restoration successful",
      errorMessage: "Failed to undo deletion",
      apiMethod: assetsPOApi.undoDeletePurchaseOrder,
    });

  const handleArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to archive this Record?",
      successMessage: "Record archive successful",
      errorMessage: "Failed to archive assets",
      apiMethod: assetsPOApi.softArchivePurchaseOrder,
    });

  const handleUndoArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the archive of this Record?",
      successMessage: "Record restoration successful",
      errorMessage: "Failed to undo archive",
      apiMethod: assetsPOApi.undoArchivePurchaseOrder,
    });

  const handleFetchLatest = async () => {
    fetchPORecords();
    showToast("Updated data fetched successfully", "success");
  };

  const handleModalOpenForEdit = (PORecords) => {
    setModalMode("edit");
    setSelectedAssetPO(PORecords);
    setIsModalOpen(true);
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
        if (row?.isApproved) {
          return (
            <span className="text-green-500 flex items-center">Approved</span>
          );
        }
        return (
          <span className="text-gray-500 flex items-center">For Approval</span>
        );
      },
      width: "120px",
    },
    {
      name: "Purchase Order Date",
      selector: (row) =>
        row.prDate ? formatReadableDate(row.poDate) : "No Date Yet",
    },
    {
      name: "Purchase Order No",
      width: "200px",
      selector: (row) => row.poNo || "",
    },
    {
      name: "EntityName",
      width: "200px",
      selector: (row) => row.entityName || "",
    },
    {
      name: "Supplier",
      selector: (row) => row.supplier || "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* View Button */}
          <div className="group relative">
            <button
              onClick={() => handleFormModalOpen(row)}
              className="text-white bg-green-600 p-2 rounded-md"
            >
              <FaEye size={16} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              View FORM
            </span>
          </div>

          {/* Edit Button */}
          {!row.status?.isDeleted &&
            !row.status?.isArchived &&
            !row.isApproved && (
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

          {/* Delete Button */}
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
          ) : !row.status?.isArchived && !row.isApproved ? (
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
          data={poRecords}
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
        {/* {isModalOpen && (
          <AssetsPRModal
            mode={modalMode}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={fetchPORecords}
            initialData={selectedAssetsPO}
            refreshTable={refreshTable}
          />
        )}

        {isFormModalOpen && (
          <AssetsPRForm
            isOpen={isFormModalOpen}
            onClose={handleFormModalClose}
            data={selectedAssetsPO}
          />
        )} */}
      </div>
    </>
  );
};

export default AssetsPurchaseOrderTable;
