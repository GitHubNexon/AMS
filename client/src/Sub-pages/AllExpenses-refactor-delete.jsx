import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFileExcel } from "react-icons/fa";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import * as XLSX from "xlsx";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import ExpensesShortcuts from "../Components/ExpensesShortcuts";
import useBillstable from "../context/useBillstable";

const AllExpenses = () => {
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Expenses");
  const [query, setQuery] = useState("");
  const {
    bills,
    loading,
    totalItems,
    fetchBills,
    setSearchQuery,
    page,
    setPage,
    limit,
    setLimit
  } = useBillstable("All");

  // Fetch once on mount
  useEffect(() => {
    fetchBills(); // Fetch bills on mount
  }, [fetchBills]); // Add fetchBills to the dependency array

  // Handle query search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
      fetchBills(); // Fetch bills whenever searchQuery changes
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, setSearchQuery]);

  const exportToExcel = (name) => {
    const dataToExport = bills.map((bill) => ({
      BillNumber: bill.billNo || "N/A",
      Vendor: bill.vendor.vendorName,
      BillDate: formatReadableDate(bill.billDate),
      DueDate: formatReadableDate(bill.dueDate),
      TotalAmount: `PHP ${numberToCurrencyString(bill.totalAmount)}`,
      Status: bill.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const handleExportClick = () => {
    setIsFileNameModalOpen(true);
  };

  const handleFileNameSave = (name) => {
    setFileName(name);
    exportToExcel(name);
    setIsFileNameModalOpen(false);
  };

  const columns = [
    {
      name: "Bill Date",
      selector: (row) => formatReadableDate(row.billDate),
      sortable: true,
    },
    {
      name: "Bill Number",
      selector: (row) => row.billNo || "N/A",
      sortable: true,
    },
    {
      name: "Reference",
      selector: (row) => row.reference || "N/A",
      sortable: true,
    },
    {
      name: "Vendor",
      selector: (row) => row.vendor.vendorName,
      sortable: true,
    },
    {
      name: "Due Date",
      selector: (row) => formatReadableDate(row.dueDate),
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => `PHP ${numberToCurrencyString(row.totalAmount)}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
  ];

  return (
    <>
      <ExpensesShortcuts />
      <div className="mx-auto p-8">
        <div className="flex flex-col sm:flex-row items-center mb-4 justify-between space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder={`Search Expenses`}
            className="border p-1 rounded-md mr-4"
            onChange={(e) => setQuery(e.target.value)} // Simplified to avoid multiple state updates
          />
          <button
            onClick={handleExportClick}
            className="bg-green-600 text-white px-2 py-1 rounded-md flex items-center"
          >
            <FaFileExcel size={16} className="mr-2" />
            Export
          </button>
        </div>

        <DataTable
          columns={columns}
          data={bills}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading} // This shows loading spinner while fetching
          highlightOnHover
          striped
          responsive
        />

        {isFileNameModalOpen && (
          <FileNameModal
            isOpen={isFileNameModalOpen}
            onClose={() => setIsFileNameModalOpen(false)}
            onSave={handleFileNameSave}
          />
        )}
      </div>
    </>
  );
};

export default AllExpenses;
