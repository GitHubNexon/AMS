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
import { FaPesoSign } from "react-icons/fa6";
import InvoiceModal from "../Pop-Up-Pages/InvoicesModal";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import ImageModal from "../Pop-Up-Pages/ImageModal";
import * as XLSX from "xlsx";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import useInvoicesTable from "../context/useInvoicesTable"; // Adjust the import for your hook
import InvoicesApi from "../api/InvoicesApi";
import InvoicePaymentModal from "../Pop-Up-Pages/InvoicePaymentModal";
import InvoicesSlipModal from "../Pop-Up-Pages/InvoicesSlipModal"; // Adjust the import path as necessary
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import SalesShortcuts from "../Components/SalesShortcuts";

// Expanded Row Component to show additional data
const ExpandedRowComponent = ({ data }) => {
  console.log(data);
  return (
    <div className="p-4 flex flex-wrap border text-[0.9em]">
      <div className="flex-2">
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Invoice Number:
          </span>
          <span>
            {data.temporaryInvoiceNumber || data.officialInvoiceNumber}
          </span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Customer:</span>
          <span>{data.customer.customerDisplayName}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Email:</span>
          <span>{data.customer.email}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Mobile Number:
          </span>
          <span>{data.customer.mobileNumber}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Message:</span>
          <span className="w-[300px] mr-2 text-start">{data.message}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Reference:</span>
          <span className="w-[300px] mr-2 text-start ">{data.reference}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Invoice Date:
          </span>
          <span>{formatReadableDate(data.invoiceDate)}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Due Date:</span>
          <span>{formatReadableDate(data.dueDate)}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Payment Terms:
          </span>
          <span>{data.paymentTerms}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">Status:</span>
          <span>{data.status.type}</span>
        </div>
        <div className="flex">
          <span className="w-[180px] mr-2 font-bold text-end">
            Status Information:
          </span>
          <span>{data.status.message}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Total Amount:
          </span>
          <span>PHP {numberToCurrencyString(data.total)}</span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Paid Amount:
          </span>
          <span>
            PHP{" "}
            {numberToCurrencyString(
              data.payment
                .map((m) => m.amount)
                .reduce((pre, cur) => pre + cur, 0)
            )}
          </span>
        </div>
        <div className="flex">
          <span className="w-[130px] mr-2 font-bold text-end">
            Open Balance:
          </span>
          <span>
            PHP{" "}
            {numberToCurrencyString(
              data.total -
                data.payment
                  .map((m) => m.amount)
                  .reduce((pre, cur) => pre + cur, 0)
            )}
          </span>
        </div>
        <div className="flex flex-col p-4">
          <span className="font-bold text-[1em]">Items:</span>
          <table>
            <thead>
              <tr className="border-b">
                <th className="border-r">Description</th>
                <th className="border-r">Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="text-center border-r">{item.id.name}</td>
                  <td className="text-center border-r">
                    PHP {numberToCurrencyString(item.price)}
                  </td>
                  <td className="text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InvoiceTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("All");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [fileName, setFileName] = useState("invoices");
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    show: false,
    invoice: { customer: null },
  });

  // State for search query
  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  // Use the custom hook for invoices
  const {
    invoices,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchInvoices,
  } = useInvoicesTable(page, limit, status);

  // Debounce the search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleInvoiceModalClose = () => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleModalOpenForAdd = () => {
    setModalMode("add");
    setIsInvoiceModalOpen(true);
  };

  const handleModalOpenForEdit = (invoice) => {
    setModalMode("edit");
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDelete = async (invoiceId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this invoice?`
    );
    if (!confirmed) return;

    await InvoicesApi.deleteInvoiceById(invoiceId);
    fetchInvoices(); // Refetch invoices after deletion
    showToast("Invoice deleted successfully!", "success");
  };

  // const handleSaveInvoice = (invoice) => {
  //   if (modalMode === "add") {
  //     // Logic for adding invoice
  //     showToast("Invoice added successfully!", "success");

  //   } else if (modalMode === "edit") { // Change made here
  //     // Logic for updating invoice
  //     showToast("Invoice updated successfully!", "success");

  //   }
  //   handleInvoiceModalClose();
  //   fetchInvoices(); // Refetch invoices after adding/updating
  // };

  const exportToExcel = (name) => {
    const dataToExport = invoices.map((invoice) => ({
      InvoiceNumber:
        invoice.temporaryInvoiceNumber || invoice.officialInvoiceNumber,
      CustomerName: invoice.customer.customerDisplayName,
      TotalAmount: invoice.total,
      InvoiceDate: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleString()
        : "N/A",
      DueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleString()
        : "N/A",
      PaymentTerms: invoice.paymentTerms,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(ws, wb, "Invoices");
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

  const handleViewInvoice = async (invoiceId) => {
    try {
      const invoiceDetails = await InvoicesApi.getInvoiceById(invoiceId);
      setSelectedInvoiceDetails(invoiceDetails);
      setIsSlipModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const columns = [
    {
      name: "Invoice Number",
      selector: (row) =>
        row.temporaryInvoiceNumber || row.officialInvoiceNumber,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.customer.customerDisplayName,
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => (
        <div className="flex flex-col">
          <span>PHP {numberToCurrencyString(row.total)}</span>
          {row.payment
            .map((m) => m.amount)
            .reduce((pre, cur) => pre + cur, 0) != 0 && (
            <span className="text-green-500 text-[0.85em]">
              (Paid:{" "}
              {numberToCurrencyString(
                row.payment
                  .map((m) => m.amount)
                  .reduce((pre, cur) => pre + cur, 0)
              )}
              )
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Open Balance",
      selector: (row) => (
        <span>
          PHP{" "}
          {numberToCurrencyString(
            row.total -
              row.payment
                .map((m) => m.amount)
                .reduce((pre, cur) => pre + cur, 0)
          )}
        </span>
      ),
    },
    {
      name: "Due Date",
      selector: (row) => (
        <div
          className={`
            flex flex-col ${
              new Date(row.dueDate) < new Date() &&
              row.total >
                (row.payment
                  ?.map((m) => m.amount)
                  .reduce((pre, cur) => pre + cur, 0) || 0)
                ? "text-red-500"
                : ""
            }
          `}
        >
          <span>{formatReadableDate(row.dueDate)}</span>
          <span className="text-[0.8em]">
            {`
              ${row.status.type} ${
              new Date(row.dueDate) < new Date() &&
              row.total >
                (row.payment
                  ?.map((m) => m.amount)
                  .reduce((pre, cur) => pre + cur, 0) || 0)
                ? "(Overdue)"
                : ""
            }
            `}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">

          {row.status.type !== "Paid" && (
          <button
            className="p-2 rounded-md text-white bg-green-600"
            onClick={() => setPaymentModal({ show: true, invoice: row })}
          >
            <FaPesoSign size={16} />
          </button>
          )}
          
          {row.status.type !== "Paid" && (
            <button
              onClick={() => handleModalOpenForEdit(row)}
              className="text-white bg-blue-600 p-2 rounded-md"
            >
              <FaEdit size={16} />
            </button>
          )}

          {row._id && ( // Changed from row.InvoiceId to row._id
            <button
              onClick={() => handleViewInvoice(row._id)} // Pass the correct ID
              className="text-white bg-yellow-500 p-2 rounded-md"
            >
              <FaFile size={16} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row._id)}
            className="text-white bg-red-600 p-2 rounded-md"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  function refreshTable() {
    fetchInvoices();
  }

  return (
    <>
      <SalesShortcuts />
      <div className="mx-auto p-8">
        <div className="flex flex-col sm:flex-row items-center mb-4 mx-4 sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="font-bold">Invoices</h1>
          <div className="flex items-center space-x-2">
            <select
              className="border rounded px-2 py-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <input
              type="text"
              placeholder={`Search Invoices`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={handleModalOpenForAdd}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Add Invoice
            </button>

            <button
              onClick={handleExportClick}
              className="bg-green-600 text-white p-2 rounded-md flex items-center"
            >
              <FaFileExcel size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows // Enable expandable rows
          expandableRowsComponent={ExpandedRowComponent} // Assign the custom expanded row component
        />

        {isInvoiceModalOpen && (
          <InvoiceModal
            mode={modalMode}
            isOpen={isInvoiceModalOpen}
            onClose={handleInvoiceModalClose}
            onSaveInvoice={fetchInvoices}
            invoiceData={selectedInvoice}
            refreshTable={refreshTable}
          />
        )}

        {isFileNameModalOpen && (
          <FileNameModal
            isOpen={isFileNameModalOpen}
            onClose={() => setIsFileNameModalOpen(false)}
            onSave={handleFileNameSave}
          />
        )}

        {isSlipModalOpen && (
          <InvoicesSlipModal
            isOpen={isSlipModalOpen}
            mode={modalMode}
            onClose={() => setIsSlipModalOpen(false)}
            invoiceDetails={selectedInvoiceDetails}
          />
        )}

        {paymentModal.show && (
          <InvoicePaymentModal
            selectedCustomer={paymentModal.invoice.customer}
            closeCallback={() =>
              setPaymentModal({ show: false, invoice: { customer: null } })
            }
            refreshTable={refreshTable}
          />
        )}
      </div>
    </>
  );
};

export default InvoiceTable;
