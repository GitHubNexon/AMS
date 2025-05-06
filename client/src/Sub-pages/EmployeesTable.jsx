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
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUserTie,
} from "react-icons/fa";
import { FaBookSkull } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import employeeApi from "../api/employeeApi";
import EmployeeLogic from "../hooks/employeeLogic";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import EmployeeModal from "../Pop-Up-Pages/EmployeeModal";
import Placeholder from "../assets/images/placeholder.png";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <Icon className="text-blue-500" />
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);
const ExpandedRowComponent = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex justify-center md:justify-start">
          <img
            src={data.employeeImage || Placeholder}
            alt={data.employeeName}
            className="w-40 h-40 object-cover rounded-full border shadow"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {data.employeeName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoRow
              icon={FaUserTie}
              label="Position"
              value={data.employeePosition}
            />
            <InfoRow icon={FaUserTie} label="Type" value={data.employeeType} />
            <InfoRow
              icon={FaUserTie}
              label="Division"
              value={data.employeeDivision}
            />
            <InfoRow
              icon={FaUserTie}
              label="Department"
              value={data.employeeDepartment}
            />
            <InfoRow
              icon={FaUserTie}
              label="Section"
              value={data.employeeSection}
            />
            <InfoRow
              icon={FaMapMarkerAlt}
              label="Address"
              value={data.address}
            />
            <InfoRow
              icon={FaPhone}
              label="Contact No."
              value={data.contactNo}
            />
            <InfoRow icon={FaEnvelope} label="Email" value={data.email} />
            <InfoRow
              icon={FaBirthdayCake}
              label="Date of Birth"
              value={new Date(data.dateOfBirth).toLocaleDateString()}
            />
          </div>

          <hr className="my-4" />

          <p className="text-xs text-gray-500">
            Created by {data.CreatedBy?.name} ({data.CreatedBy?.position}) on{" "}
            {formatReadableDate(data.createdAt)}
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {formatReadableDate(data.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

const EmployeesTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModelOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    fetchEmployees,
    employees,
    setEmployees,
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
    toggleSortOrder,
  } = EmployeeLogic(page, limit, status);

  function refreshTable() {
    fetchEmployees();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchEmployees();
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
    setIsEmployeeModelOpen(true);
  };

  const handleModalClose = () => {
    setIsEmployeeModelOpen(false);
    setSelectedEmployees(null);
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
        fetchEmployees?.();
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
      apiMethod: employeeApi.deleteEmployeeRecord,
    });

  const handleUndoDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the deletion of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo deletion",
      apiMethod: employeeApi.undoDeleteEmployeeRecord,
    });

  const handleArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to archive this assets?",
      successMessage: "assets archive successful",
      errorMessage: "Failed to archive assets",
      apiMethod: employeeApi.archiveEmployeeRecord,
    });

  const handleUndoArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the archive of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo archive",
      apiMethod: employeeApi.undoArchiveEmployeeRecord,
    });

  const handleModalOpenForEdit = (employees) => {
    setModalMode("edit");
    setSelectedEmployees(employees);
    setIsEmployeeModelOpen(true);
  };

  const handleFetchLatest = async () => {
    fetchEmployees();
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
      name: "Created At",
      selector: (row) =>
        row.createdAt ? formatReadableDate(row.createdAt) : "No Date Yet",
    },
    {
      name: "Employee Name",
      width: "300px",
      selector: (row) => row.employeeName || "",
    },
    {
      name: "Employee Type",
      selector: (row) => row.employeeType || "",
    },
    {
      name: "Employee Department",
      width: "300px",
      selector: (row) => row.employeeDepartment || "",
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
          <h1 className="font-bold">Employee Records</h1>

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
              placeholder={`Search Employees`}
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
          data={employees}
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
        {isEmployeeModalOpen && (
          <EmployeeModal
            mode={modalMode}
            isOpen={isEmployeeModalOpen}
            onClose={handleModalClose}
            onSaveEmployees={fetchEmployees}
            employeeData={selectedEmployees}
            refreshTable={refreshTable}
          />
        )}
      </div>
    </>
  );
};

export default EmployeesTable;
