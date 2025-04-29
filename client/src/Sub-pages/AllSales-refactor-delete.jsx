import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash, FaPlus, FaFileExcel, FaFile } from "react-icons/fa";
import { RiFileHistoryFill } from "react-icons/ri";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import * as XLSX from "xlsx";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import useInvoicesTable from "../context/useInvoicesTable"; // Adjust the import based on your hooks structure
import InvoicesApi from "../api/InvoicesApi";
import DatePickerModal from "../Pop-Up-Pages/DatePickerModal";
import InvoicePaymentHistoryModal from "../Pop-Up-Pages/InvoicePaymentHistoryModal";
import "../styles/custom.css";
import {
  numberToCurrencyString,
  formatReadableDate,
  formatDateToDays,
  getStatusColor,
} from "../helper/helper";
import InvoiceStatusOverview from "../Components/InvoiceStatusOverview";
import SalesShortcuts from "../Components/SalesShortcuts";

const AllSales = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] =
    useState(false); // State for payment history modal
  const [selectedInvoice, setSelectedInvoice] = useState(null); // State to hold selected invoice data
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatusButton, setSelectedStatusButton] = useState(null);
  const [fileName, setFileName] = useState("Sales");
  const [filterOption, setFilterOption] = useState("all");
  const [filteredInvoicesCount, setFilteredInvoicesCount] = useState(0); 
  const { invoices, loading, totalItems, error, fetchInvoices, setSearchQuery } =
    useInvoicesTable(page, limit);

  const handleDateSelect = (selectedDate) => {
    setSelectedDate(selectedDate);

    setIsDatePickerModalOpen(false);
    setFilterOption("custom-date");
  };

  // Function to handle status button clicks
  const handleStatusButtonClick = (statusType) => {
    setSelectedStatusButton(statusType);
  };

  const filteredInvoices = () => {
    const dateFiltered = filteredDateDropdownInvoices();
    const statusFiltered = dateFiltered.filter((invoice) =>
      filteredStatusDropdownInvoices().includes(invoice)
    );

    // Add the button-based filtering (overdue, open, recent)
    if (selectedStatusButton) {
      return filteredButtonTable(statusFiltered);
    }

    return statusFiltered;
  };


  const filteredButtonTable = (invoices) => {
    const currentDate = new Date(); // Get the current date

    switch (selectedStatusButton) {
      case "overdue":
        return invoices.filter(
          (invoice) =>
            (invoice.status.type === "Past Due" ||
              new Date(invoice.dueDate) < currentDate) &&
            invoice.status.type !== "Paid"
        );
      case "open":
        return invoices.filter((invoice) => invoice.status.type !== "Paid");
      case "recent":
        // Filter invoices that are partially paid
        return invoices.filter(
          (invoice) =>
            invoice.status.type === "Partially Paid" ||
            invoice.status.type === "Paid"
        );
      default:
        return invoices; // Default case shows all invoices
    }
  };

  const getStatusInformation = (
    invoiceDateString,
    dueDateString,
    statusType
  ) => {
    const invoiceDate = new Date(invoiceDateString);
    const dueDate = new Date(dueDateString);
    const currentDate = new Date();

    const timeFromInvoiceToCurrent = currentDate - invoiceDate;
    // const daysSinceInvoice = Math.ceil(
    //   timeFromInvoiceToCurrent / (1000 * 60 * 60 * 24)
    // );

    const overdueDays =
      currentDate > dueDate
        ? Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24))
        : null;

    let statusInfo = "";
    const daysUntilDue = Math.ceil(
      (dueDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    if (statusType === "Paid") {
      statusInfo = "Payment received.";
    } else if (statusType === "Pending") {
      if (daysUntilDue > 0) {
        statusInfo = `Due in ${daysUntilDue} ${
          daysUntilDue === 1 ? "day" : "days"
        }.`;
      } else if (daysUntilDue === 0) {
        statusInfo = "Due today!";
      } else {
        statusInfo = formatDateToDays(dueDateString);
      }
    } else if (statusType === "Partially Paid") {
      if (currentDate > dueDate) {
        statusInfo = (
          <span className="text-red-500">
            This invoice has been past due for {overdueDays}{" "}
            {overdueDays === 1 ? "day" : "days"}.
          </span>
        );
      } else {
        statusInfo = `Due in ${daysUntilDue} ${
          daysUntilDue === 1 ? "day" : "days"
        }.`;
      }
    } else if (statusType === "Void") {
      statusInfo = "This order has been voided.";
    } else if (statusType === "Past Due") {
      statusInfo = `This invoice has been past due for ${overdueDays} ${
        overdueDays === 1 ? "day" : "days"
      }.`;
    }

    return statusInfo;
  };

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const filteredDateDropdownInvoices = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const thisWeekStart = getStartOfWeek(new Date());
    const lastWeekStart = getStartOfWeek(
      new Date(new Date().setDate(today.getDate() - 7))
    );
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYearStart = new Date(today.getFullYear(), 0, 1);

    switch (filterOption) {
      case "all":
        return invoices;
      case "today":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate).toLocaleDateString() ===
            today.toLocaleDateString()
        );
      case "yesterday":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate).toLocaleDateString() ===
            yesterday.toLocaleDateString()
        );
      case "this-week":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate) >= thisWeekStart &&
            new Date(invoice.invoiceDate) <= today
        );
      case "last-week":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate) >= lastWeekStart &&
            new Date(invoice.invoiceDate) <= lastWeekEnd
        );
      case "this-month":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate) >= thisMonthStart &&
            new Date(invoice.invoiceDate) <= today
        );
      case "this-year":
        return invoices.filter(
          (invoice) =>
            new Date(invoice.invoiceDate) >= thisYearStart &&
            new Date(invoice.invoiceDate) <= today
        );
      case "custom-date":
        if (selectedDate) {
          const selected = new Date(selectedDate).toLocaleDateString();
          return invoices.filter(
            (invoice) =>
              new Date(invoice.invoiceDate).toLocaleDateString() === selected
          );
        }
      default:
        return invoices;
    }
  };

  const filteredStatusDropdownInvoices = () => {
    switch (filterOption) {
      case "all":
        return invoices;
      case "view-invoices":
        return invoices.filter((invoice) =>
          ["Pending", "Partially Paid", "Past Due", "Void"].includes(
            invoice.status.type
          )
        );
      case "view-payments":
        return invoices.filter((invoice) =>
          ["Paid", "Partially Paid"].includes(invoice.status.type)
        );
      default:
        return invoices;
    }
  };

  const exportToExcel = (name) => {
    const dataToExport = invoices.map((invoice) => ({
      TemporaryInvoiceNumber: invoice.temporaryInvoiceNumber,
      OfficialInvoiceNumber: invoice.officialInvoiceNumber,
      CustomerName: invoice.customer.customerDisplayName,
      Email: invoice.customer.email,
      PaidDate: invoice.paidDate || "N/A",
      Status: invoice.status.type,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleExportClick = () => {
    setIsFileNameModalOpen(true);
  };

  const handleFileNameSave = (name) => {
    setFileName(name);
    exportToExcel(name);
    setIsFileNameModalOpen(false);
  };

  const openPaymentHistoryModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentHistoryModalOpen(true);
  };

  const columns = [
    {
      name: "Invoices Number",
      selector: (row) =>
        row.temporaryInvoiceNumber || row.officialInvoiceNumber,
      sortable: true,
      cell: (row) => (
        <div
          className="table-cell"
          data-full-text={
            row.temporaryInvoiceNumber || row.officialInvoiceNumber
          }
        >
          {row.temporaryInvoiceNumber || row.officialInvoiceNumber}
        </div>
      ),
    },
    {
      name: "Customer Name",
      selector: (row) => row.customer.customerDisplayName,
      sortable: true,
      cell: (row) => (
        <div
          className="table-cell"
          data-full-text={row.customer.customerDisplayName}
        >
          {row.customer.customerDisplayName}
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.customer.email,
      sortable: true,
      cell: (row) => (
        <div className="table-cell" data-full-text={row.customer.email}>
          {row.customer.email}
        </div>
      ),
    },
    {
      name: "Invoice Date",
      selector: (row) => formatReadableDate(row.invoiceDate),
      sortable: true,
      cell: (row) => (
        <div className="table-cell">{formatReadableDate(row.invoiceDate)}</div>
      ),
    },
    {
      name: "Due Date",
      selector: (row) => formatReadableDate(row.dueDate),
      sortable: true,
      cell: (row) => (
        <div className="table-cell">{formatReadableDate(row.dueDate)}</div>
      ),
    },
    {
      name: "Status and Information",
      selector: (row) =>
        `${row.status.type}: ${getStatusInformation(
          row.invoiceDate,
          row.dueDate,
          row.status.type
        )}`,
      sortable: true,
      cell: (row) => {
        const statusInfo = getStatusInformation(
          row.invoiceDate,
          row.dueDate,
          row.status.type
        );

        const textColor = getStatusColor(row.status.type);

        return (
          <div className="table-cell">
            <div className={`font-bold ${textColor}`}>{row.status.type}</div>
            <div className={textColor}>{statusInfo}</div>
          </div>
        );
      },
    },

    {
      name: "Total",
      selector: (row) => {
        const total = row.total || 0;
        return `PHP ${numberToCurrencyString(total)}`;
      },
      sortable: true,
      cell: (row) => (
        <div className="table-cell">
          {`PHP ${numberToCurrencyString(row.total || 0)}`}
        </div>
      ),
    },
    {
      name: "Balance",
      selector: (row) => {
        const total = row.total || 0;
        const payments = row.payment
          ? row.payment
              .map((payment) => payment.amount)
              .reduce((pre, cur) => pre + cur, 0)
          : 0;
        const balance = total - payments;
        return `PHP ${numberToCurrencyString(balance)}`;
      },
      sortable: true,
      cell: (row) => (
        <div className="table-cell">
          {`PHP ${numberToCurrencyString(
            (row.total || 0) -
              (row.payment
                ? row.payment
                    .map((payment) => payment.amount)
                    .reduce((pre, cur) => pre + cur, 0)
                : 0)
          )}`}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="table-cell">
          <div className="flex space-x-2">
            <button
              onClick={() => openPaymentHistoryModal(row)}
              className="text-white bg-green-500 p-2 rounded-md"
            >
              <RiFileHistoryFill size={16} />
            </button>
            {/* Add more buttons here as needed */}
          </div>
        </div>
      ),
    },
  ];


  return (
    <>
    <SalesShortcuts />
    <div className="mx-auto p-8">
      <div className="mb-[50px]">
        <InvoiceStatusOverview onButtonClick={handleStatusButtonClick} />
      </div>
      <div className="flex flex-col sm:flex-row items-center mb-4 justify-end space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder={`Search transactions`}
          className="border p-1 rounded-md mr-4"
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Dropdown for date filtering */}
        <div className="mb-4">
          <select
            id="dateFilter"
            value={filterOption}
            onChange={(e) => {
              const selectedOption = e.target.value;
              setFilterOption(selectedOption);
              if (selectedOption === "custom-date") {
                setIsDatePickerModalOpen(true);
              }
            }}
            className="border p-1 rounded mr-4"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
            <option value="this-month">This Month</option>
            <option value="this-year">This Year</option>
            <option value="custom-date">--Custom Date--</option>{" "}
            {/* Custom date option */}
          </select>
        </div>

        {/* Dropdown for filtering invoices */}
        <div className="mb-4">
          <select
            id="invoiceFilter"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="border p-1 rounded mr-4"
          >
            <option value="all">All Transactions</option>
            <option value="view-invoices">View Invoices</option>
            <option value="view-payments">View Payments</option>
          </select>
        </div>

        <div className="flex justify-between mb-4">
          <button
            onClick={handleExportClick}
            className="bg-green-600 text-white px-2 py-1 rounded-md flex items-center"
          >
            <FaFileExcel size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>
   

      <DataTable
        columns={columns}
        data={filteredInvoices()}
        pagination
        paginationServer
        paginationTotalRows={totalItems}
        onChangePage={setPage}
        onChangeRowsPerPage={setLimit}
        progressPending={loading}
        highlightOnHover
        striped
        responsive
      />
        

      {/* DatePicker Modal */}
      {isDatePickerModalOpen && (
        <DatePickerModal
          isOpen={isDatePickerModalOpen}
          onClose={() => setIsDatePickerModalOpen(false)}
          onDateSelect={handleDateSelect}
        />
      )}

      {isFileNameModalOpen && (
        <FileNameModal
          isOpen={isFileNameModalOpen}
          onClose={() => setIsFileNameModalOpen(false)}
          onSave={handleFileNameSave}
        />
      )}

      {isPaymentHistoryModalOpen && (
        <InvoicePaymentHistoryModal
          isOpen={isPaymentHistoryModalOpen}
          onClose={() => setIsPaymentHistoryModalOpen(false)}
          invoiceData={selectedInvoice}
        />
      )}
    </div>
    </>
  );
};

export default AllSales;
