import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDollarSign,
  FiFile,
} from "react-icons/fi";
import assetsDepreciationApi from "../../api/assetsDepreciationApi";
import moment from "moment";
import { showToast } from "../../utils/toastNotifications";
import { numberToCurrencyString } from "../../helper/helper";

const AssetsMonthlyDepreciation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data function
  const fetchData = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const response =
          await assetsDepreciationApi.generateAllMonthlyAssetsDepreciation({
            page: pagination.currentPage,
            limit: pagination.limit,
            keyword: debouncedSearchTerm,
            sortBy: sortConfig.sortBy,
            sortOrder: sortConfig.sortOrder,
            ...params,
          });

        if (response.success) {
          setData(response.data);
          setPagination((prev) => ({
            ...prev,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalItems: response.totalItems,
            limit: response.limit,
          }));
        } else {
          showToast(
            "error",
            response.message || "Failed to fetch depreciation data"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast(
          "error",
          error.message || "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage, pagination.limit, debouncedSearchTerm, sortConfig]
  );

  // Initial load and search effect
  useEffect(() => {
    fetchData({ page: 1 });
  }, [debouncedSearchTerm, sortConfig]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchData({ page: newPage });
  };

  // Handle sort change
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Handle export (placeholder)
  const handleExport = () => {
    showToast("info", "Export functionality will be implemented later");
  };

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("propNo")}
        >
          <div className="flex items-center space-x-1">
            <FiFile className="h-4 w-4" />
            <span>Property No.</span>
          </div>
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("propName")}
        >
          Property Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <FiDollarSign className="h-4 w-4" />
            <span>Unit Cost</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Useful Life (Months)
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <FiDollarSign className="h-4 w-4" />
            <span>Monthly Depreciation</span>
          </div>
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("acquisitionDate")}
        >
          <div className="flex items-center space-x-1">
            <FiCalendar className="h-4 w-4" />
            <span>Acquisition Date</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <FiCalendar className="h-4 w-4" />
            <span>Final Depreciation</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (item, index) => (
    <tr
      key={item.assetId}
      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {item.propNo}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.propName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {numberToCurrencyString(item.unitCost)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.useFullLife}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {numberToCurrencyString(item.monthlyDepreciation)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {moment(item.acquisitionDate, "MM-DD-YYYY").format("MMM DD, YYYY")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {moment(item.finalDepreciationDate, "MM-DD-YYYY").format(
          "MMM DD, YYYY"
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <button
          onClick={() => handleViewSchedule(item)}
          className="text-blue-600 hover:text-blue-900 font-medium"
        >
          View Schedule
        </button>
      </td>
    </tr>
  );

  // Handle view schedule
  const handleViewSchedule = (item) => {
    // This could open a modal or navigate to detailed view
    showToast("info", `Viewing schedule for ${item.propName}`);
    console.log("Schedule data:", item.schedule);
  };

  // Render pagination
  const renderPagination = () => (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalItems
              )}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span>{" "}
            results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 &&
                  page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.currentPage
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return (
                  <span
                    key={page}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Assets Monthly Depreciation
          </h1>
          <p className="text-gray-600">
            Manage and view monthly depreciation schedules for all assets
          </p>
        </div>

        {/* Search and Export Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by property number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {renderTableHeader()}
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-500">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No depreciation data found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => renderTableRow(item, index))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && data.length > 0 && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default AssetsMonthlyDepreciation;
