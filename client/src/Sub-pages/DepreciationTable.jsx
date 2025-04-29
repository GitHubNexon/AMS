import React, { useState, useEffect, useContext } from "react";
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
  FaUndo,
  FaArchive,
  FaChartBar,
} from "react-icons/fa";
import {
  MdDelete,
  MdArchive,
  MdCheckCircle,
  MdOutlineSubtitles,
} from "react-icons/md";
import { FaBookSkull } from "react-icons/fa6";
import { RiBankFill } from "react-icons/ri";
import { IoIosArrowDropdown } from "react-icons/io";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import DepreciationLogic from "../hooks/DepreciationLogic";
import DepreciationApi from "../api/DepreciationApi";
import { useDataPreloader } from "../context/DataPreloader";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import DepreciationModal from "../Pop-Up-Pages/DepreciationModal";
import {
  FaBoxOpen,
  FaUser,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaHourglassHalf,
  FaMoneyBill,
  FaRegCommentAlt,
} from "react-icons/fa";
import { MdLibraryBooks, MdOutlineLibraryBooks } from "react-icons/md";
import JournalModal from "../Pop-Up-Pages/JournalModal";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import axios from "axios";
import EntriesApi from "../api/EntriesApi";
import { useAuth } from "../context/AuthContext";
import InventoryDataTable from "./InventoryDataTable";

const ExpandedRowComponent = ({ data }) => {
  const { pushToGrid } = useContext(LedgerSheetContext);
  const [activeConditions, setActiveConditions] = useState([]);
  const [actionButtonText, setActionButtonText] = useState("Create Journal");
  const [loading, setLoading] = useState(true);
  const [updatedDepreciation, setUpdatedDepreciation] = useState(null);
  const { user } = useAuth();

  const fetchUpdatedDepreciation = async () => {
    try {
      setLoading(true);
      const updatedData = await DepreciationApi.getUpdatedById(data._id);
      setUpdatedDepreciation(updatedData);
      showToast("Depreciation updated successfully!", "success");
    } catch (error) {
      console.error("Error fetching updated depreciation:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMonthlyDepreciationJournal = async (item, data) => {
    const response = await EntriesApi.generateAutoNumber("Journal");
    setJournalModal({
      show: true,
      entryData: {
        EntryType: "Journal",
        JVNo: "",
        JVDate: new Date().toISOString().split("T")[0],
        CreatedBy: { name: user.name, position: user.userType, _id: user._id },
        PreparedBy: { name: user.name, position: user.userType, _id: user._id },
        ReviewedBy: { name: "", position: "", _id: "" },
        ApprovedBy1: { name: "", position: "", _id: "" },
        Particulars: `MONTHLY DEPRECIATION - ${data.AssetDescription} - ${item.month}`,
        Depreciation: {
          dpId: data._id,
          monthlyDepreciationId: item._id,
        },
        month: item.month,
        year: item.year,
      },
      onSave: () => setJournalModal({ show: false }),
      mode: "DP",
    });
    const push = [];
    push.push(
      {
        ledger: {
          code: data.AccumulatedAccount.code,
          name: data.AccumulatedAccount.name,
        },
        subledger: {
          slCode: data.Subledger.slCode,
          name: data.Subledger.name,
        },
        dr: numberToCurrencyString(item.amount),
        cr: null,
      },
      // Credit entry for Depreciation Account
      {
        ledger: {
          code: data.DepreciationAccount.code,
          name: data.DepreciationAccount.name,
        },
        subledger: {
          slCode: data.Subledger.slCode,
          name: data.Subledger.name,
        },
        dr: null,
        cr: numberToCurrencyString(item.amount),
      }
    );

    pushToGrid(push);
  };

  const openExistingJournal = async (item) => {
    if (item.linkId) {
      await openJournal(item, item.linkId);
    }
  };

  const openJournal = async (item, entryId) => {
    try {
      const response = await axios.get(`/entries/find/${entryId}`, {
        withCredentials: true,
      });

      if (response.data) {
        setJournalModal({
          show: true,
          entryData: response.data,
          onSave: (entry) => {
            console.log("saved?", entry);
          },
          mode: "edit",
        });
      } else {
        setActionButtonText("Create Journal");
        console.error("No journal entry found.");
      }
    } catch (error) {
      console.error("Error fetching journal entry:", error);
    }
  };

  const [journalModal, setJournalModal] = useState({
    show: false,
    entryData: {},
    onSave: () => {},
    mode: "DP",
  });

  useEffect(() => {
    const hasLinkId = data.MonthlyDepreciation.some((item) => item.linkId);
    setActionButtonText(hasLinkId ? "Open Journal" : "Create Journal");
  }, [data.MonthlyDepreciation]);

  if (!data.MonthlyDepreciation || data.MonthlyDepreciation.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No Monthly Depreciation Data
      </div>
    );
  }

  //   if (!condition || typeof condition !== "object") return null;

  //   const conditionMap = {
  //     Sell: "Sale",
  //     Repair: "For Repair",
  //     Disposal: "Disposal",
  //     Unserviceable: "Unserviceable",
  //     Damaged: "Damaged",
  //     Stolen: "Stolen",
  //     Lost: "Lost",
  //     WarrantyExpired: "Warranty Expired",
  //   };

  //   const activeConditions = Object.keys(conditionMap)
  //     .filter((key) => condition[key])
  //     .map((key) => <li key={key}>{conditionMap[key]}</li>);

  //   return activeConditions.length ? (
  //     <ul className="text-center">{activeConditions}</ul>
  //   ) : (
  //     "Good Condition"
  //   );
  // };

  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedDepreciationYear, setExpandedDepreciationYear] =
    useState(null);

  const handleRowClick = (year) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  const handleDepreciationRowClick = (year) => {
    setExpandedDepreciationYear(
      expandedDepreciationYear === year ? null : year
    );
  };

  return (
    <>
      <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
        <div className="mb-8">
          <div className="flex items-start gap-4 text-gray-700">
            {data.AssetImage && (
              <img
                src={data.AssetImage}
                alt="Asset Image"
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold">
                {data.Name}
                <p className="text-sm text-gray-500">
                  ({data.PropNo || "N/A"}) - Property / Plate Number
                </p>
              </h3>
              <p className="text-sm text-gray-500">
                {data.EquipmentCategory?.name || ""}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-gray-700 mt-4">
            <FaMoneyBill className="text-2xl text-blue-500" />
            <div>
              <h3 className="text-xl font-semibold">
                {numberToCurrencyString(data.UnitCost)} Unit Cost
              </h3>
              <p className="text-sm text-gray-500">
                (Quantity) {data.Quantity}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-gray-700 mt-4">
            <FaHourglassHalf className="text-2xl text-blue-500" />
            <h3 className="text-xl font-semibold">
              {data.UseFullLife} Months Use Full life
            </h3>
          </div>
          <div className="flex items-start gap-4 text-gray-700 mt-4">
            <MdOutlineSubtitles className="text-2xl text-blue-500" />
            <h3 className="text-sm font-semibold">{data.AssetDescription}</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 text-gray-700 mt-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              <span className="font-medium">Acquisition Date:</span>{" "}
              {formatReadableDate(data.AcquisitionDate)}
            </div>
            <div className="flex items-center gap-2">
              <FaFileInvoiceDollar className="text-blue-500" />
              <span className="font-medium">Acquisition Cost:</span>
              {numberToCurrencyString(data.AcquisitionCost)}
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-500" />
              <span className="font-medium">Prepared By:</span>{" "}
              {data.PreparedBy.name} ({data.PreparedBy.position})
            </div>
            <div className="flex items-center gap-2">
              <MdLibraryBooks className="text-blue-500" />
              <span className="font-medium">Accumulated Account</span> (
              {data.AccumulatedAccount?.name || ""}) -{" "}
              {data.AccumulatedAccount?.code || ""}
            </div>
            <div className="flex items-center gap-2">
              <MdOutlineLibraryBooks className="text-blue-500" />
              <span className="font-medium">Depreciation Account</span> (
              {data.DepreciationAccount?.name || ""}) -{" "}
              {data.DepreciationAccount?.code || ""}
            </div>
            <div className="flex items-center gap-2">
              <MdOutlineLibraryBooks className="text-blue-500" />
              <span className="font-medium">Subledger</span> (
              {data.Subledger?.name || ""}) - {data.Subledger?.slCode || ""}
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="w-1/2 max-h-[45vh] overflow-auto border border-gray-300 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-700 p-3 bg-gray-100">
              Monthly Depreciation
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-200 text-gray-700 z-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Reference
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Month
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Start Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.MonthlyDepreciation.map((item, index) => (
                  <tr
                    key={index}
                    className={`bg-gray-100 ${
                      item.isDepreciated ? "bg-yellow-500 text-black" : ""
                    }`}
                  >
                    {/* <td className="border border-gray-300 px-4 py-2 text-center">
                      {!data.Status.isDeleted && !data.Status.isArchived && (
                        <div className="group relative">
                          {item.linkId ? (
                            <button
                              onClick={() => openExistingJournal(item)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Open Journal
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                createMonthlyDepreciationJournal(item, data)
                              }
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Create Journal
                            </button>
                          )}
                          <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500 z-50">
                            JVNo - {item.DocNo}
                          </span>
                        </div>
                      )}
                    </td> */}
                    <td className="border border-gray-300 px-4 py-2">
                      {item.DocNo || "-"}
                    </td>

                    <td className="border border-gray-300 px-4 py-2">
                      {item.month}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {numberToCurrencyString(item.amount)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">
                      {formatReadableDate(item.startDate)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">
                      {formatReadableDate(item.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* NetBookValue Table */}
          <div className="w-1/2 max-h-[45vh] overflow-auto border border-gray-300 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-700 p-3 bg-gray-100">
              Net Book Value
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-200 text-gray-700">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Year
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Value
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.NetBookValue.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(item.Year)}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {item.Year}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {numberToCurrencyString(item.Value)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {formatReadableDate(item.Date)}
                      </td>
                    </tr>

                    {/* Show month details if the year is expanded */}
                    {expandedYear === item.Year && (
                      <tr>
                        <td
                          colSpan="3"
                          className="border border-gray-300 px-4 py-2 bg-gray-50"
                        >
                          <div className="pl-4">
                            <ul>
                              {item.Months.map((month, monthIndex) => (
                                <li
                                  key={monthIndex}
                                  // className="flex justify-between"
                                  className={`bg-gray-100 flex justify-between ${
                                    month.isDepreciated
                                      ? "bg-green-500 text-black p-2 rounded-sm"
                                      : ""
                                  }`}
                                >
                                  <span>{month.Month}</span>
                                  <span>
                                    {numberToCurrencyString(month.Value)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-1/2 max-h-[45vh] overflow-auto border border-gray-300 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-700 p-3 bg-gray-100">
              Accumulated Depreciation
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-200 text-gray-700">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Year
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Value
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.AccumulatedDepreciation.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleDepreciationRowClick(item.Year)}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {item.Year}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {numberToCurrencyString(item.Value)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {formatReadableDate(item.Date)}
                      </td>
                    </tr>

                    {/* Show month details if the year is expanded */}
                    {expandedDepreciationYear === item.Year && (
                      <tr>
                        <td
                          colSpan="3"
                          className="border border-gray-300 px-4 py-2 bg-gray-50"
                        >
                          <div className="pl-4">
                            <ul>
                              {item.Months.map((month, monthIndex) => (
                                <li
                                  key={monthIndex}
                                  // className="flex justify-between"
                                  className={`bg-gray-100 flex justify-between ${
                                    month.isDepreciated
                                      ? "bg-green-500 text-black p-2 rounded-sm"
                                      : ""
                                  }`}
                                >
                                  <span>{month.Month}</span>
                                  <span>
                                    {numberToCurrencyString(month.Value)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InventoryDataTable DataId={data._id} />
      </div>
      <JournalModal
        isOpen={journalModal.show}
        onClose={() => setJournalModal({ show: false })}
        entryData={journalModal.entryData}
        onSaveJournal={() => setJournalModal({ show: false })}
        mode={journalModal.mode}
      />
    </>
  );
};

const DepreciationTable = () => {
  const { lastClosing } = useDataPreloader();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedDepreciation, setSelectedDepreciation] = useState(null);
  const [isDepreciationModalOpen, setIsDepreciationModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    depreciation,
    totalItems,
    totalPages,
    setDepreciation,
    loading,
    searchQuery,
    setSearchQuery,
    fetchDepreciation,
    sortBy,
    sortOrder,
    toggleSortOrder,
    setSortBy,
    setSortOrder,
    date,
    setDate,
  } = DepreciationLogic(page, limit, status);

  function refreshTable() {
    fetchDepreciation();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchDepreciation();
  };

  const handlePreviewClick = (depreciation) => {
    setSelectedDepreciation(depreciation);
    // setIsBankReconPreviewOpen(true);
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
    setIsDepreciationModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDepreciationModalOpen(false);
    setSelectedDepreciation(null);
  };

  const handleDeleteEntry = async (id) => {
    const confirm = await showDialog.confirm(
      "Are you sure you want to delete this depreciation?"
    );

    if (confirm) {
      try {
        const result = await DepreciationApi.deleteDepreciation(id);

        if (result) {
          showDialog.showMessage(
            "Depreciation deleted successfully",
            "success"
          );
          fetchDepreciation();
        }
      } catch (error) {
        console.error("Failed to delete depreciation:", error);
        showDialog.showMessage("Failed to delete depreciation", "error");
      }
    }
  };

  const handleUndoDeleteEntry = async (id) => {
    const confirm = await showDialog.confirm(
      "Are you sure you want to undo the deletion of this depreciation?"
    );

    if (confirm) {
      try {
        const result = await DepreciationApi.undoDeleteDepreciation(id);

        if (result) {
          showDialog.showMessage(
            "Depreciation restoration successful",
            "success"
          );
          fetchDepreciation();
        }
      } catch (error) {
        console.error("Failed to undo deletion:", error);
        showDialog.showMessage("Failed to undo deletion", "error");
      }
    }
  };

  const handleArchiveEntry = async (id) => {
    const confirm = await showDialog.confirm(
      "Are you sure you want to archive this depreciation?"
    );

    if (confirm) {
      try {
        const result = await DepreciationApi.archiveDepreciation(id);

        if (result) {
          showDialog.showMessage(
            "Depreciation archive successfully",
            "success"
          );
          fetchDepreciation();
        }
      } catch (error) {
        console.error("Failed to archive depreciation:", error);
        showDialog.showMessage("Failed to archive depreciation", "error");
      }
    }
  };

  const handleUndoArchiveEntry = async (id) => {
    const confirm = await showDialog.confirm(
      "Are you sure you want to undo the archive of this depreciation?"
    );

    if (confirm) {
      try {
        const result = await DepreciationApi.undoArchiveDepreciation(id);

        if (result) {
          showDialog.showMessage(
            "Depreciation restoration successful",
            "success"
          );
          fetchDepreciation();
        }
      } catch (error) {
        console.error("Failed to undo archive:", error);
        showDialog.showMessage("Failed to undo archive", "error");
      }
    }
  };

  const handleMonitor = async (id) => {
    try {
      const updatedData = await DepreciationApi.getUpdatedById(id);
      showToast("Updated data fetched successfully", "success");
      setDepreciation([updatedData, ...depreciation]);
    } catch (error) {
      console.error("Error fetching updated depreciation:", error);
    }
  };

  const handleModalOpenForEdit = (depreciation) => {
    setModalMode("edit");
    setSelectedDepreciation(depreciation);
    setIsDepreciationModalOpen(true);
  };

  const handleFetchLatest = async () => {
    fetchDepreciation();
    showToast("Updated data fetched successfully", "success");
  };

  const sortByDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
  };

  const sortByAcquisitionDate = (property) => (rowA, rowB) => {
    const dateA = new Date(rowA[property]);
    const dateB = new Date(rowB[property]);
    return dateA - dateB;
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
        row.AcquisitionDate
          ? formatReadableDate(row.AcquisitionDate)
          : "No Date Yet",
    },
    {
      name: "Equipment / Property Name",
      width: "300px",
      selector: (row) => row.Name || "",
    },
    {
      name: "Property No",
      selector: (row) => row.PropNo || "",
    },

    // {
    //   name: "Created At",
    //   id: "createdAt",
    //   selector: (row) => formatReadableDate(row.createdAt),
    //   sortable: true,
    //   sortFunction: sortByDate("createdAt"),
    //   sortDirection: sortOrder,
    //   onClick: () => toggleSortOrder("createdAt"),
    // },
    {
      name: "Prepared By",
      selector: (row) => row.PreparedBy?.name || "-",
    },
    {
      name: "Reference",
      cell: (row) => (
        <div
          className="table-cell text-[0.8em] break-words"
          data-full-text={row.Reference}
        >
          {row.Reference}
        </div>
      ),
    },
    {
      name: "Asset Description",
      width: "300px",
      selector: (row) => row.AssetDescription || "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* Edit Button */}
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
          {/* Conditional Delete or Undo Button */}
          {row.Status?.isDeleted ? (
            // If the record is deleted, show the "Undo Delete" button
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

          {/* Conditional Archive or Undo Button */}
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
            // If the record is not deleted and not archived, show the "Archive" button
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
          <FaBookSkull size={20} />
          <h1 className="font-bold">Depreciation Monitoring</h1>

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
          data={depreciation}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onChangePage={setPage}
          onChangeRowsPerPage={setLimit}
          progressPending={loading}
          expandableRows
          expandableRowsComponent={ExpandedRowComponent}
          expandableRowExpanded={(row) => expandedRows.includes(row._id)}
          sortServer={true}
          sortColumn={sortBy}
          sortDirection={sortOrder}
          onSort={(column) => toggleSortOrder(column.id)}
        />

        {isDepreciationModalOpen && (
          <DepreciationModal
            mode={modalMode}
            isOpen={isDepreciationModalOpen}
            onClose={handleModalClose}
            onSaveDepreciation={fetchDepreciation}
            depreciationData={selectedDepreciation}
            refreshTable={refreshTable}
          />
        )}

        {/* {isBankReconPreviewOpen && (
      <BankReconPreview
        isOpen={isBankReconPreviewOpen}
        onClose={() => setIsBankReconPreviewOpen(false)}
        bankRecon={selectedBankRecon}
      />
    )} */}
      </div>
    </>
  );
};

export default DepreciationTable;
