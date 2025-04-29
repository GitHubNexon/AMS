import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaFile,
} from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import TaxTableLogic from "../hooks/TaxTableLogic";
import taxApi from "../api/taxApi";
import TaxModal from "../Pop-Up-Pages/TaxModal";

const TaxTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedTax, setSelectedTax] = useState(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    taxes,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchTaxes,
  } = TaxTableLogic(page, limit);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleTaxModalClose = () => {
    setIsTaxModalOpen(false);
    setSelectedTax(null);
  };

  const handleModalOpenForAdd = () => {
    setModalMode("add");
    setIsTaxModalOpen(true);
  };

  const handleModalOpenForEdit = (tax) => {
    setModalMode("edit");
    setSelectedTax(tax);
    setIsTaxModalOpen(true);
  };

  const handleDeleteTax = async (taxId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this Tax?`
    );
    if (!confirmed) return;

    try {
      await taxApi.deleteTax(taxId);
      fetchTaxes();
      showToast("Tax deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting Tax:", error);
      showToast("Failed to delete Tax. Please try again.", "error");
    }
  };

  const columns = [
    {
      name: "Code",
      selector: (row) => row.Code || "0",
      sortable: true,
    },
    {
      name: "Category",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.Category || "N/A"}
        >
          {row.Category || "N/A"}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Coverage",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.Coverage || "N/A"}
        >
          {row.Coverage  || "N/A"}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.Type || "N/A",
      sortable: true,
    },
    {
      name: "Tax Rate",
      selector: (row) => `${row.taxRate || "No Tax Rate"}%`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* Edit Button */}
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

          {/* Delete Button */}
          {/* <div className="group relative">
            <button
              onClick={() => handleDeleteTax(row._id)}
              className="text-white bg-red-600 p-2 rounded-md"
            >
              <FaTrash size={16} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              Delete
            </span>
          </div> */}
        </div>
      ),
    },
  ];

  function refreshTable() {
    fetchTaxes();
  }
  

  return (
    <>
      <div className="mx-auto p-8">
        <div className="flex flex-col sm:flex-row items-center mb-4 mx-4 sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="font-bold">Tax</h1>
          <div className="flex items-center  justify-end space-x-2">
            <input
              type="text"
              placeholder={`Search Taxes`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleModalOpenForAdd}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Add Tax
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={taxes}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
        />

        {isTaxModalOpen && (
          <TaxModal
            mode={modalMode}
            isOpen={isTaxModalOpen}
            onClose={handleTaxModalClose}
            onSaveTax={fetchTaxes}
            taxData={selectedTax}
            refreshTable={refreshTable}
          />
        )}
      </div>
    </>
  );
};

export default TaxTable;
