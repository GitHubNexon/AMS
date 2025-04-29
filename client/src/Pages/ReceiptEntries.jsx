import React, { useState, useEffect, useContext, useRef } from "react";
import EntriesShortcut from "../Components/EntriesShortcut";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaFile,
  FaClock,
  FaUndoAlt,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { RiFilePaper2Line } from "react-icons/ri";
import { FaPesoSign } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import {
  numberToCurrencyString,
  formatReadableDate,
  currencyStringToNumber,
  formatLedgers
} from "../helper/helper";
import ReceiptTableLogic from "../hooks/ReceiptTableLogic";
import ReceiptModal from "../Pop-Up-Pages/ReceiptModal";
import NumCheckerModal from "../Pop-Up-Pages/NumCheckerModal";
import ExpandableTable from "../Components/ExpandableTable";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import logo from "../assets/images/NDC_BG.png";
import axios from "axios";
import LogsModal from "../Components/LogsModal";
import { useDataPreloader } from "../context/DataPreloader";
import CRPreview from "../Pop-Up-Pages/CRPreview";

const PrintVoucher = ({ item }) => {
  const printRef = useRef();
  const [or, setOr] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const total = ledgers[ledgers.length - 1]
    ? ledgers[ledgers.length - 1].d1
    : "";

  useEffect(() => {
    if (item) {
      fetchLinkedOR();
      if (item.ledgers) {
        setLedgers(formatLedgers(item.ledgers));
      }
    }
  }, [item]);

  async function fetchLinkedOR() {
    const data = await axios.get(`/or/find/${item._id}`, {
      withCredentials: true,
    });
    setOr(data.data);
  }

  function printClick() {
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    document.body.appendChild(iframe);

    const iframeDoc =
      iframe.contentWindow ||
      iframe.contentDocument.document ||
      iframe.contentDocument;

    if (iframeDoc) {
      // Write the content and styles to the iframe
      iframeDoc.document.open();

      const printContents = printRef.current.innerHTML;
      // const newWindow = window.open('NDC AMS', '_blank');
      // newWindow.document.open();
      // newWindow.document.write(`
      iframeDoc.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${
          item.ReceiptEntryType === "Deposit Slip"
            ? "Deposit Slip Entry"
            : "Cash Receipt Entry"
        }</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { display: flex; }
          .header > div{ flex: 1; }
          .header > div:nth-child(2){ flex: 3; text-align: center; display: flex; flex-direction: column; }
          .header h1 { font-size: 1em; }
          .header span { font-size: 0.8em; }
          .header .logo { height: 4em; }
          .section { page-break-inside: avoid; break-inside: avoid; border: 1px solid #000; }
          table{ width: 100%; border-collapse: collapse; font-size: 0.9em; }
          table tr td{ border: 1px solid #000; padding: 5px; }
          .col { display: flex; flex-direction: column; }
          .tcenter { text-align: center; }
          .b { font-weight: bold; }
          .s { width: 80px; }
          .m { width: 110px; }
          .tright{ text-align: end; }
          .nob td{ border-top: none; border-bottom: none; }
          .nob:last-child td:nth-child(3), .nob:last-child td:nth-child(4), .nob:last-child td:nth-child(5), .nob:last-child td:nth-child(6) { border-top: 1px solid #000; }
          .signatory { padding: 15px; display: flex; font-weight: bold; font-size: 0.9em; }
          .signatory > div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .signatory > div > span:nth-child(1){ margin-bottom: 25px; }
          @media print { .hidden-on-screen { display: block; } }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
      </html>
    `);
      // newWindow.document.close();
      // newWindow.print();
      iframeDoc.document.close();

      // Trigger print
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }

    // Remove the iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  return (
    <div>
      <button
        onClick={printClick}
        className="text-white bg-green-600 p-2 rounded-md"
      >
        <FaFile size={12} />
      </button>
      <div ref={printRef} className="hidden">
        <div className="header">
          <div>
            <img src={logo} className="logo" />
          </div>
          <div>
            <h1>NATIONAL DEVELOPMENT COMPANY</h1>
            <span>
              116 Tordesillas St. Salcedo Village Makati City Philippines
            </span>
            <span>Cash Receipt Enry</span>
          </div>
          <div></div>
        </div>
        {/* first info row */}
        <div className="section info">
          <table className="table1">
            <tbody>
              <tr>
                <td rowSpan="2">
                  <div className="col b">
                    <span>
                      {item.ReceiptEntryType === "Deposit Slip"
                        ? "Account Name"
                        : "Payor"}
                    </span>
                    <span>
                      {item.ReceiptEntryType === "Deposit Slip"
                        ? "National Development Company"
                        : or && or.client.name}
                    </span>
                  </div>
                </td>
                <td colSpan="2">Account No</td>
                <td className="center b">
                  {item.ReceiptEntryType === "Deposit Slip"
                    ? "Deposit Slip"
                    : "Official Receipt"}
                </td>
              </tr>
              <tr className="b">
                <td colSpan="2">
                  {item.ReceiptEntryType === "Deposit Slip" ? "" : "Address:"}
                </td>
                <td>Number: {item.CRNo}</td>
              </tr>
              <tr>
                <td rowSpan="4">
                  <div className="col flex">
                    <span className="b">Particulars</span>
                    <span>{item.Particulars}</span>
                  </div>
                </td>
                <td className="s">Mode of Payment</td>
                <td className="m">Details/Reference</td>
                <td className="b">
                  Date: {formatReadableDate(new Date(item.CRDate))}
                </td>
              </tr>
              <tr>
                <td className="s">
                  {item.paymentMethods === "Cash" ? "/" : "x"} Cash
                </td>
                <td className="m"></td>
                <td rowSpan="3" className="b">
                  Amount: {or ? numberToCurrencyString(or.amount) : total}
                </td>
              </tr>
              <tr>
                <td className="s">
                  {item.paymentMethods === "Cheque"
                    ? "/"
                    : item.ReceiptEntryType === "Deposit Slip"
                    ? "/"
                    : "x"}{" "}
                  Check
                </td>
                <td className="m"></td>
              </tr>
              <tr>
                <td className="s">
                  {item.paymentMethods === "Others" ? "/" : "x"} Others
                </td>
                <td className="m"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="section">
          <table>
            <tbody>
              <tr>
                <td colSpan="2">ACCOUNT DISTRIBUTIONS</td>
                <td colSpan="2">GENERAL LEDGER</td>
                <td colSpan="2">SUBSIDIARY LEDGER</td>
              </tr>
              <tr>
                <td>ACCOUNT CODE</td>
                <td>ACCOUNT TITLE</td>
                <td>DEBIT</td>
                <td>CREDIT</td>
                <td>DEBIT</td>
                <td>CREDIT</td>
              </tr>
              {ledgers.map((item, index) => (
                <tr className="nob" key={index}>
                  <td className="tright">{item.accountCode}</td>
                  <td>{item.accountTitle}</td>
                  <td className="tright">{item.d1}</td>
                  <td className="tright">{item.c1}</td>
                  <td className="tright">{item.d2}</td>
                  <td className="tright">{item.c2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="section signatory">
          <div>
            <span>Prepared By:</span>
            <span>{item.PreparedBy?.name}</span>
            <span>{item.PreparedBy?.position}</span>
          </div>
          <div>
            <span>Certified By:</span>
            <span>{item.CertifiedBy?.name}</span>
            <span>{item.CertifiedBy?.position}</span>
          </div>
          <div>
            <span>Approved By:</span>
            <span>{item.ApprovedBy1?.name}</span>
            <span>{item.ApprovedBy1?.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpandedRowComponent = ({ data }) => {
  return (
    <div className="p-4 flex flex-wrap border text-[0.8em]">
      <RiFilePaper2Line size={48} />
      <div className="flex-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-[0.8em]">
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Entry Type:
            </span>
            <span>{data.EntryType}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Receipt Entry Type:
            </span>
            <span>{data.ReceiptEntryType}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Payment Methods:
            </span>
            <span>{data.paymentMethods || "N/A"}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              CR Number:
            </span>
            <span>{data.CRNo}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">CR Date:</span>
            <span>{formatReadableDate(data.CRDate)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 text-[0.8em] mt-10">
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Particulars:
            </span>
            <span>{data.Particulars}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Prepared By:
            </span>
            <span>
              {data.PreparedBy?.name} - {data.PreparedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Reviewed By:
            </span>
            <span>
              {data.ReviewedBy?.name} - {data.ReviewedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Approved By:
            </span>
            <span>
              {data.ApprovedBy1?.name} - {data.ApprovedBy1?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Approved By:
            </span>
            <span>
              {data.ApprovedBy2?.name} - {data.ApprovedBy2?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Certified By:
            </span>
            <span>
              {data.CertifiedBy?.name} - {data.CertifiedBy?.position}
            </span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">
              Attachments:
            </span>
            <span>{data.Attachments}</span>
          </div>
          <div className="flex">
            <span className="w-[130px] mr-2 font-bold text-end">Tag:</span>
            <span>{data.tag}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ExpandableTable data={data.ledgers} />
      </div>
    </div>
  );
};

const ReceiptEntries = () => {
  const { lastClosing } = useDataPreloader();
  const { reset } = useContext(LedgerSheetContext);
  const location = useLocation();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchQueryFromUrl = queryParams.get("search") || "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isNumCheckerModalOpen, setIsNumCheckerModalOpen] = useState(false);
  const [isCRPreviewOpen, setIsCRPreviewOpen] = useState(false);

  const handlePreviewClick = (receipt) => {
    setSelectedReceipt(receipt);
    setIsCRPreviewOpen(true);
  };

  const [logsModal, setLogsModal] = useState({ show: false, id: null });
  const handleModalOpenForLogs = (entries) => {
    console.log(entries._id);
    setLogsModal({ show: true, id: entries._id });
  };

  const handleNumCheckerModalOpen = () => {
    setIsNumCheckerModalOpen(true);
  };

  const handleNumCheckerModalClose = () => {
    setIsNumCheckerModalOpen(false);
  };

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    receipts,
    totalItems,
    loading,
    searchQuery,
    setSearchQuery,
    fetchReceipts,
    sortBy,
    sortOrder,
    toggleSortOrder,
    date,
    setDate,
  } = ReceiptTableLogic(page, limit);

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     setSearchQuery(query);
  //   }, 500);
  //   return () => clearTimeout(delayDebounceFn);
  // }, [query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== searchQuery) {
        setSearchQuery(query);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (searchQueryFromUrl) {
      setSearchQuery(searchQueryFromUrl);
    }
  }, [searchQueryFromUrl]);

  const handleEntryModalClose = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleModalOpenForAdd = () => {
    reset();
    setModalMode("add");
    setIsReceiptModalOpen(true);
  };

  const handleModalOpenForEdit = (receipt) => {
    setModalMode("edit");
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const handleModalOpenForDuplicate = (receipt) => {
    setModalMode("duplicate");
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const handleDeleteReceipt = async (entryId) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to delete this receipt?`
    );
    if (!confirmed) return;

    try {
      await EntriesApi.deleteEntryById(entryId);
      fetchReceipts();
      showToast("Receipt deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting receipt:", error);
      showToast("Failed to delete receipt. Please try again.", "error");
    }
  };

  const handleCancelEntry = async (entry) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to cancel this Entry?`
    );
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/${entry._id}`, {
        withCredentials: true,
      });
      fetchReceipts();
      console.log(response.data);
      showToast("Entry cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cencelling Entry:", error);
      showToast("Failed to cencelling Entry. Please try again.", "error");
    }
  };

  const handleUndoCancelEntry = async (entry) => {
    const confirmed = await showDialog.confirm(
      `Are you sure you want to undo entry cancellation?`
    );
    if (!confirmed) return;
    try {
      console.log(entry);
      const response = await axios.patch(`/entries/cancel/undo/${entry._id}`, {
        withCredentials: true,
      });
      fetchReceipts();
      console.log(response.data);
      showToast("undo successfull!", "success");
    } catch (error) {
      console.error("Error cencelling Entry:", error);
      showToast("Failed to cencelling Entry. Please try again.", "error");
    }
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const sortByDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
  };

  const columns = [
    {
      name: "Entry Type",
      selector: (row) => row.EntryType,
    },
    {
      name: "CR Date",
      id: "CRDate",
      selector: (row) => formatReadableDate(row.CRDate),
      sortable: true,
      sortFunction: sortByDate("CRDate"),
      sortDirection: sortOrder,
      onClick: () => toggleSortOrder("CRDate"),
    },
    {
      name: "CR Number",
      selector: (row) => row.CRNo,
    },
    {
      name: "Prepared By",
      selector: (row) => row.PreparedBy?.name || "-",
    },
    {
      name: "Payment Method",
      selector: (row) => row.paymentMethods || "-",
      width: "200px",
    },
    {
      name: "Particulars",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.Particulars}
        >
          {row.Particulars}
        </div>
      ),
      width: "400px",
    },
    {
      name: "Receipt Entry Type",
      selector: (row) => row.ReceiptEntryType || "-",
    },
    {
          name: "Amount",
          selector: (row) => numberToCurrencyString(row.ledgers.map(m=>Math.abs(m.cr)).reduce((pre, cur)=>pre+cur,0)),
        },
    {
      name: "Status",
      selector: (row) => (row.cancelledDate ? "cancelled" : ""),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 pr-4">
          {/* <PrintVoucher item={row} /> */}
          <div className="group relative">
            <button
              onClick={() => handlePreviewClick(row)}
              className="text-white bg-green-600 p-2 rounded-md"
            >
              <FaFile size={12} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              Print Preview
            </span>
          </div>

          {(lastClosing
            ? row.CRDate && new Date(row.CRDate) >= new Date(lastClosing)
            : true) &&
            (row.cancelledDate ? (
              <>
                {/* Cancel Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleUndoCancelEntry(row)}
                    className="text-white bg-orange-600 p-2 rounded-md"
                  >
                    <FaUndoAlt size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Undo
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Edit Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleModalOpenForEdit(row)}
                    className="text-white bg-blue-600 p-2 rounded-md"
                  >
                    <FaEdit size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Edit
                  </span>
                </div>

                {/* Duplicate Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleModalOpenForDuplicate(row)}
                    className="text-white bg-yellow-500 p-2 rounded-md"
                  >
                    <IoDuplicate size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Duplicate
                  </span>
                </div>

                {/* Cancel Button */}
                <div className="group relative">
                  <button
                    onClick={() => handleCancelEntry(row)}
                    className="text-white bg-orange-600 p-2 rounded-md"
                  >
                    <MdCancel size={12} />
                  </button>
                  <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                    Cancel
                  </span>
                </div>
              </>
            ))}

          {/* Delete Button (if accounting period is closed this is replaced with duplicated that is dated today) */}
          {(
            lastClosing
              ? row.CRDate && new Date(row.CRDate) >= new Date(lastClosing)
              : true
          ) ? (
            <div className="group relative">
              <button
                onClick={() => handleDeleteReceipt(row._id)}
                className="text-white bg-red-600 p-2 rounded-md"
              >
                <FaTrash size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Delete
              </span>
            </div>
          ) : (
            <div className="group relative">
              <button
                onClick={() =>
                  handleModalOpenForDuplicate({
                    ...row,
                    CRDate: new Date().toISOString(),
                  })
                }
                className="text-white bg-yellow-500 p-2 rounded-md"
              >
                <IoDuplicate size={12} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Duplicate
              </span>
            </div>
          )}

          {/* logs Button */}
          <div className="group relative">
            <button
              onClick={() => handleModalOpenForLogs(row)}
              className="text-white bg-gray-500 p-2 rounded-md"
            >
              <FaClock size={12} />
            </button>
            <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
              Versions
            </span>
          </div>
          <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
            History
          </span>
        </div>
      ),
    },
  ];

  function openVoucher(row) {
    console.log(row);
  }

  function refreshTable() {
    fetchReceipts();
  }

  return (
    <>
      <EntriesShortcut />
      <div className="mx-auto p-8">
        <div className="flex flex-col overflow-auto">
          <h1 className="font-bold">Receipt Entry</h1>
          <div className="flex flex-wrap space-y-3 md:space-y-0 md:space-x-2 overflow-x-auto p-3 items-center justify-end space-x-2">
            <label htmlFor="date">Created At</label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border px-2 py-1 rounded-md"
            />
            <button
              onClick={handleNumCheckerModalOpen}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300"
            >
              Check Number List
            </button>
            {/* <input
              type="text"
              placeholder={`Search Receipt Entry`}
              className="border px-2 py-1 rounded-md"
              onChange={(e) => setQuery(e.target.value)}
            /> */}
            <input
              type="text"
              placeholder={`Search Receipt Entry`}
              className="border px-2 py-1 rounded-md"
              value={searchQuery}
              // onChange={(e) => setQuery(e.target.value)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleModalOpenForAdd}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
            >
              <FaPlus size={16} className="mr-2" />
              Add Receipt Entry
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={receipts}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          // selectableRows
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />
      </div>

      {isReceiptModalOpen && (
        <ReceiptModal
          mode={modalMode}
          isOpen={isReceiptModalOpen}
          onClose={handleEntryModalClose}
          onSaveReceipt={fetchReceipts}
          entryData={selectedReceipt}
          refreshTable={refreshTable}
        />
      )}

      {isCRPreviewOpen && (
        <CRPreview
          isOpen={isCRPreviewOpen}
          onClose={() => setIsCRPreviewOpen(false)}
          receipt={selectedReceipt}
          item={selectedReceipt}
        />
      )}

      <NumCheckerModal
        isOpen={isNumCheckerModalOpen}
        onClose={handleNumCheckerModalClose}
      />

      <LogsModal
        show={logsModal.show}
        close={() => setLogsModal({ show: false, id: null })}
        id={logsModal.id}
      />
    </>
  );
};

export default ReceiptEntries;
