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
} from "react-icons/fa";
import { FaBookSkull } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import assetsApi from "../api/assetsApi";
import AssetsLogic from "../hooks/AssetsLogic";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import AssetsModal from "../Pop-Up-Pages/AssetsModal";
const ExpandedRowComponent = ({ data }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-full mx-auto my-4 border border-gray-200 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaBox className="text-blue-500" />
          {data.propName || "Unnamed Asset"}
        </h3>
        <div className="flex gap-2">
          {data.Status.isArchived ? (
            <span className="text-yellow-600 flex items-center gap-1 text-sm">
              <FaArchive /> Archived
            </span>
          ) : data.Status.isDeleted ? (
            <span className="text-red-600 flex items-center gap-1 text-sm">
              <FaTrash /> Deleted
            </span>
          ) : (
            <span className="text-green-600 text-sm">Active</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-gray-600">
            <FaTag className="text-gray-400" />
            <span className="font-semibold">Property No:</span> {data.propNo}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaFileAlt className="text-gray-400" />
            <span className="font-semibold">Description:</span>{" "}
            {data.propDescription || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaDollarSign className="text-gray-400" />
            <span className="font-semibold">Unit Cost:</span>{" "}
            {numberToCurrencyString(data.unitCost)}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaCalendarAlt className="text-gray-400" />
            <span className="font-semibold">Acquisition Date:</span>{" "}
            {formatReadableDate(data.acquisitionDate)}
          </p>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-gray-600">
            <FaBox className="text-gray-400" />
            <span className="font-semibold">Quantity:</span> {data.quantity}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaFolder className="text-gray-400" />
            <span className="font-semibold">Category:</span>{" "}
            {data.category || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaFileAlt className="text-gray-400" />
            <span className="font-semibold">Reference:</span>{" "}
            {data.reference || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <FaCalendarAlt className="text-gray-400" />
            <span className="font-semibold">Useful Life:</span>{" "}
            {data.useFullLife} months
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="flex items-center gap-2 text-gray-600">
          <FaFileAlt className="text-gray-400" />
          <span className="font-semibold">Accumulated Account:</span>{" "}
          {data.accumulatedAccount || "N/A"}
        </p>
        <p className="flex items-center gap-2 text-gray-600 mt-2">
          <FaFileAlt className="text-gray-400" />
          <span className="font-semibold">Depreciation Account:</span>{" "}
          {data.depreciationAccount || "N/A"}
        </p>
        <p className="flex items-center gap-2 text-gray-600 mt-2">
          <FaFileAlt className="text-gray-400" />
          <span className="font-semibold">Attachments:</span>
          {data.attachments.length > 0
            ? `${data.attachments.length} files`
            : "None"}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets Assigned Table (Left) */}
          {data.assetsAssigned && data.assetsAssigned.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Assets Assigned Details
              </h4>
              <div className="overflow-auto">
                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Employee Name
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Description
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Quantity
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Amount
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Date Acquired
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.assetsAssigned.map((ass) =>
                      ass.assetRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 border-b">
                            {ass.employeeName || "N/A"}
                          </td>
                          <td className="px-3 py-2 border-b">
                            {record.description}
                          </td>
                          <td className="px-3 py-2 border-b">
                            {record.quantity}
                          </td>
                          <td className="px-3 py-2 border-b">
                            {numberToCurrencyString(record.amount)}
                          </td>
                          <td className="px-3 py-2 border-b">
                            {formatReadableDate(record.dateAcquired)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.inventory && data.inventory.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaBox className="text-blue-500" /> Inventory Details
              </h4>
              <div className="overflow-auto">
                <table className="min-w-full border border-gray-300 text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Inventory No
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Name
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Assigned
                      </th>
                      <th className="px-3 py-2 border-b border-gray-300">
                        Condition
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inventory.map((inv) => (
                      <tr key={inv._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border-b">
                          {inv.invNo || "N/A"}
                        </td>
                        <td className="px-3 py-2 border-b">
                          {inv.invName || "N/A"}
                        </td>
                        <td className="px-3 py-2 border-b">
                          {inv.isAssigned ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-2 border-b">
                          {inv.condition && inv.condition.length > 0
                            ? inv.condition.map((cond, index) => (
                                <span key={index}>
                                  {cond.isGood
                                    ? "Good"
                                    : cond.forSale
                                    ? "For Sale"
                                    : cond.forDisposal
                                    ? "For Disposal"
                                    : cond.forRepair
                                    ? "For Repair"
                                    : cond.lost
                                    ? "Lost"
                                    : "Unknown"}
                                </span>
                              ))
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AssetsTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    fetchAssets,
    assets,
    totalItems,
    totalPages,
    setAssets,
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
    toggleSortOrder,
  } = AssetsLogic(page, limit, status);

  function refreshTable() {
    fetchAssets();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchAssets();
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
    setIsAssetsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAssetsModalOpen(false);
    setSelectedAssets(null);
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
        fetchAssets?.();
      }
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      showDialog.showMessage(errorMessage, "error");
    }
  };

  const handleDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to delete this assets?",
      successMessage: "assets deleted successfully",
      errorMessage: "Failed to delete assets",
      apiMethod: assetsApi.deleteAssetsRecord,
    });

  const handleUndoDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the deletion of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo deletion",
      apiMethod: assetsApi.undoDeleteAssetRecord,
    });

  const handleArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to archive this assets?",
      successMessage: "assets archive successful",
      errorMessage: "Failed to archive assets",
      apiMethod: assetsApi.archiveAssetsRecord,
    });

  const handleUndoArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the archive of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo archive",
      apiMethod: assetsApi.undoArchiveAssetRecord,
    });

  const handleModalOpenForEdit = (assets) => {
    setModalMode("edit");
    setSelectedAssets(assets);
    setIsAssetsModalOpen(true);
  };

  const handleFetchLatest = async () => {
    fetchAssets();
    showToast("Updated data fetched successfully", "success");
  };

  const columns = [
    {
      name: "Status",
      cell: (row) => {
        if (row.Status?.isDeleted) {
          return (
            <span className="text-red-500 flex items-center">Deleted</span>
          );
        }
        if (row.Status?.isArchived) {
          return (
            <span className="text-orange-500 flex items-center">Archived</span>
          );
        }
        return <span className="text-green-500 flex items-center">Active</span>;
      },
      width: "120px",
    },
    {
      name: "Acquisition Date",
      selector: (row) =>
        row.acquisitionDate
          ? formatReadableDate(row.acquisitionDate)
          : "No Date Yet",
    },
    {
      name: "Equipment / Property Name",
      width: "300px",
      selector: (row) => row.propName || "",
    },
    {
      name: "Property No",
      selector: (row) => row.propNo || "",
    },
    {
      name: "Asset Description",
      width: "300px",
      selector: (row) => row.propDescription || "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {!row.Status?.isDeleted && !row.Status?.isArchived && (
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
          {row.Status?.isDeleted ? (
            <div className="group relative">
              <button
                onClick={() => handleUndoDeleteEntry(row._id)}
                className="text-white bg-yellow-600 p-2 rounded-md"
              >
                <FaUndo size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Undo Delete
              </span>
            </div>
          ) : !row.Status?.isArchived ? (
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
          ) : null}

          {row.Status?.isArchived ? (
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
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          {/* <FaBookSkull size={20} /> */}
          <h1 className="font-bold">Assets Management</h1>

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
          data={assets}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          //   expandableRowExpanded={(row) => expandedRows.includes(row._id)}
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />
        {isAssetsModalOpen && (
          <AssetsModal
            mode={modalMode}
            isOpen={isAssetsModalOpen}
            onClose={handleModalClose}
            onSaveAssets={fetchAssets}
            assetsData={selectedAssets}
            refreshTable={refreshTable}
          />
        )}
      </div>
    </>
  );
};

export default AssetsTable;
