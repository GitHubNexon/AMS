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
} from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import BudgetTableLogic from "../hooks/BudgetTableLogic";
import BudgetTrackApi from "../api/BudgetTrackApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import ExpandableBudgetTable from "../Components/ExpandableBudgetTable";
import BudgetTrackModal from "../Pop-Up-Pages/BudgetTrackModal";
import BudgetReportNav from "../Reports/BudgetReportNav";
import { useDataPreloader } from "../context/DataPreloader";

const ExpandedRowComponent = ({ data }) => {
  // State to track selected categories or funds
  const [selectedCategories, setSelectedCategories] = useState(
    data.Funds.reduce((acc, fund) => {
      acc[fund._id] = false; // Start with all checkboxes unchecked
      return acc;
    }, {})
  );

  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prevState) => ({
      ...prevState,
      [categoryId]: !prevState[categoryId],
    }));
  };

  const renderData = (value) => {
    if (typeof value === "string") {
      return value.trim() === "" ? "N/A" : value;
    }
    return value === 0 || !value ? 0 : value;
  };

  const toggleModal = () => {
    // // Reset all checkboxes to unchecked when modal is opened
    // setSelectedCategories(
    //   data.Funds.reduce((acc, fund) => {
    //     acc[fund._id] = false;
    //     return acc;
    //   }, {})
    // );
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border text-[0.9em]">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">Description:</span>
          <span className="text-gray-500">{renderData(data.Description)}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">WorkGroup:</span>
          <span className="text-gray-500">
            {renderData(data.WorkGroup?.acronym)} -{" "}
            {renderData(data.WorkGroup?.fullName)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">WorkGroup:</span>
          <span className="text-gray-500">
            {renderData(data.WorkGroup?.code)}
          </span>
        </div>

        {/* Prepared By */}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">Prepared By:</span>
          <span className="text-gray-500">
            {renderData(data.PreparedBy?.name)} -{" "}
            {renderData(data.PreparedBy?.position)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto mt-4 max-h-[40vh]">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Funds Name</th>
              <th className="py-2 px-4 border">Funds Code</th>
              <th className="py-2 px-4 border">Funds Budget</th>
              <th className="py-2 px-4 border">Funds Expense</th>
              <th className="py-2 px-4 border">Funds Allocated</th>
              <th className="py-2 px-4 border">Unutilized Amount</th>
              <th className="py-2 px-4 border">Funds Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.Funds.map((fund) => (
              <tr key={fund._id}>
                <td className="py-2 px-4 border">
                  {renderData(fund.FundsName)}
                </td>
                <td className="py-2 px-4 border">
                  {renderData(fund.FundsCode)}
                </td>
                <td className="py-2 px-4 border">
                  {numberToCurrencyString(renderData(fund.FundsBudget))}
                </td>
                <td className="py-2 px-4 border">
                  {numberToCurrencyString(renderData(fund.FundsExpense))}
                </td>
                <td className="py-2 px-4 border">
                  {numberToCurrencyString(renderData(fund.FundsAllocated))}
                </td>
                <td className="py-2 px-4 border">
                  {numberToCurrencyString(renderData(fund.UnutilizedAmount))}
                </td>
                <td className="py-2 px-4 border">
                  {numberToCurrencyString(renderData(fund.FundsPercentage))}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Funds and Categories
        </h3>

        <div className="mt-4">
          <h4 className="text-md font-semibold text-gray-700">
            Select Funds to Display
          </h4>
          <button
            onClick={toggleModal}
            className="text-blue-500 hover:text-blue-700"
          >
            Select Funds
          </button>

          {/* Modal for selecting funds */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[75vh] overflow-auto">
                <h4 className="text-lg font-semibold text-gray-700">
                  Select Funds Categories
                </h4>
                <div className="space-y-2 mt-4">
                  {data.Funds.map((fund) => (
                    <label
                      key={fund._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories[fund._id]}
                        onChange={() => handleCategoryToggle(fund._id)}
                        className="transform scale-150"
                      />
                      <span>{fund.FundsName}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={toggleModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto mt-4">
        {data.Funds.filter((fund) => selectedCategories[fund._id]) // Only show selected funds
          .map((fund) => (
            <div key={fund._id} className="mt-6">
              <h4 className="text-lg font-semibold text-gray-700">
                Categories for {fund.FundsName}
              </h4>
              <ExpandableBudgetTable data={fund.Category} />
            </div>
          ))}
      </div>
    </div>
  );
};

const BudgetTable = () => {
  const { lastClosing } = useDataPreloader();
  const [expandedRows, setExpandedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isBudgetReportModalOpen, setIsBudgetReportModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    budgets,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchBudgets,
    sortBy,
    sortOrder,
    toggleSortOrder,
    date,
    setDate,
  } = BudgetTableLogic(page, limit);

  // Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalOpen = () => {
    // showToast("Not working Yet!!!", "warning");
    setModalMode("add");
    setIsBudgetModalOpen(true);
  };

  const handleModalClose = () => {
    setIsBudgetModalOpen(false);
    setSelectedBudget(null);
  };

  const handleModalOpenForEdit = (budget) => {
    setModalMode("edit");
    setSelectedBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteEntry = async (budgetId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this Entry?`
    );
    if (!confirmed) return;

    try {
      await BudgetTrackApi.deleteBudgetById(budgetId);
      fetchBudgets();
      showToast("Budget deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting Budget:", error);
      showToast("Failed to delete Budget. Please try again.", "error");
    }
  };

  const handleMonitorBudget = async (id) => {
    try {
      const data = await BudgetTrackApi.monitorBudgetTrack(id);
      showToast("Budget track data fetched successfully", "success");

      setExpandedRows((prev) => {
        return prev.includes(id) ? prev : [...prev, id];
      });

      fetchBudgets();
      console.log("Fetched data:", data);
    } catch (error) {
      showToast("Failed to fetch budget track data.", "error");
      console.error("Error monitoring budget track:", error);
    }
  };

  const toggleModal = () => {
    setIsBudgetReportModalOpen(!isBudgetReportModalOpen);
  };

  const handleFetchLatest = async () => {
    fetchBudgets();
    showToast("Budget track data fetched successfully", "success");
  };

  const sortByDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
  };

  const columns = [
    {
      name: "Work Group Code",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.WorkGroup?.code}
        >
          {row.WorkGroup?.code}
        </div>
      ),
      width: "100px",
    },
    {
      name: "Work Group",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.WorkGroup?.acronym}
        >
          {row.WorkGroup?.acronym} - {row.WorkGroup?.fullName}
        </div>
      ),
      width: "300px",
    },
    {
      name: "Start Date",
      id: "startDate",
      selector: (row) => formatReadableDate(row.startDate),
      sortable: true,
      sortFunction: sortByDate("startDate"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("startDate"),
    },
    {
      name: "End Date",
      id: "endDate",
      selector: (row) => formatReadableDate(row.endDate),
      sortable: true,
      sortFunction: sortByDate("endDate"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("endDate"),
    },
    {
      name: "Total Budget",
      selector: (row) => numberToCurrencyString(row.TotalBudget || 0),
    },
    {
      name: "Total Allocated",
      selector: (row) => numberToCurrencyString(row.TotalAllocated || 0),
    },
    {
      name: "Total Expense",
      selector: (row) => numberToCurrencyString(row.TotalExpense || 0),
    },
    {
      name: "Total Unutilized",
      selector: (row) => numberToCurrencyString(row.TotalUnutilized || 0),
    },
    {
      name: "Total Percentage",
      selector: (row) => `${numberToCurrencyString(row.TotalPercentage || 0)}%`,
    },
    // {
    //   name: "Actions",
    //   cell: (row) => (
    //     <div className="flex space-x-2">
    //       {/* Edit Button */}
    //       <div className="group relative">
    //         <button
    //           onClick={() => handleModalOpenForEdit(row)}
    //           className="text-white bg-blue-600 p-2 rounded-md"
    //         >
    //           <FaEdit size={16} />
    //         </button>
    //         <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //           Edit
    //         </span>
    //       </div>

    //       {/* Monitor Button */}
    //       <div className="group relative">
    //         <button
    //           onClick={() => handleDeleteEntry(row._id)}
    //           className="text-white bg-red-600 p-2 rounded-md"
    //         >
    //           <FaTrash size={16} />
    //         </button>
    //         <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //           Delete
    //         </span>
    //       </div>

    //       <div className="group relative">
    //         <button
    //           onClick={() => handleMonitorBudget(row._id)}
    //           className="text-white bg-green-600 p-2 rounded-md"
    //         >
    //           <FaChartBar size={16} />
    //         </button>
    //         <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
    //           Monitor
    //         </span>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      name: "Actions",
      cell: (row) => {
        const isAllowed = lastClosing
          ? row.startDate && new Date(row.startDate) >= new Date(lastClosing)
          : true;

        return isAllowed ? (
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

            {/* Monitor Button */}
            <div className="group relative">
              <button
                onClick={() => handleMonitorBudget(row._id)}
                className="text-white bg-green-600 p-2 rounded-md"
              >
                <FaChartBar size={16} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Monitor
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center text-gray-500 text-[0.9em]">
            <span>Accounting Period Closed ({lastClosing.slice(0, 10)})</span>
          </div>
        );
      },
    },
  ];

  function refreshTable() {
    fetchBudgets();
  }

  return (
    <>
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <h1 className="font-bold">All Budget Monitoring</h1>

          <div className="flex flex-wrap space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            {/* <label htmlFor="date">Created At</label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded-md"
            /> */}
            <button
              onClick={toggleModal}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              Budget Report
            </button>
            <button
              onClick={handleFetchLatest}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaSync size={16} className="mr-2" />
              Fetch latest Data
            </button>
            <input
              type="text"
              placeholder={`Search Entries`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleModalOpen}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Allocate Budget
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={budgets}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          expandableRowExpanded={(row) => expandedRows.includes(row._id)}
          // selectableRows
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />

        {isBudgetModalOpen && (
          <BudgetTrackModal
            mode={modalMode}
            isOpen={isBudgetModalOpen}
            onClose={handleModalClose}
            onSaveBudget={fetchBudgets}
            budgetData={selectedBudget}
            refreshTable={refreshTable}
          />
        )}

        {isBudgetReportModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md w-full m-10 shadow-lg h-[95vh]">
              <button
                onClick={toggleModal}
                className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
              ></button>
              <BudgetReportNav toggleModal={toggleModal} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BudgetTable;
