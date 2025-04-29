import React, { useState, useEffect, useContext, useRef } from "react";
import moment from "moment";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaFileExcel,
} from "react-icons/fa";
import DepreciationApi from "../api/DepreciationApi";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import GLInput from "../Components/GLInput";
import ExportApi from "../api/ExportApi";
import JournalModal from "../Pop-Up-Pages/JournalModal";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import axios from "axios";
import EntriesApi from "../api/EntriesApi";
import { useAuth } from "../context/AuthContext";

const DepreciationReport = () => {
  const { user } = useAuth();
  const [actionButtonText, setActionButtonText] = useState("Create Journal");
  const { pushToGrid } = useContext(LedgerSheetContext);
  const [selectedAccount, setSelectedAccount] = useState({});
  const [month, setMonth] = useState("");
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [totals, setTotals] = useState({});
  const [summary, setSummary] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedRows, setSelectedRows] = useState({});
  const [selectedDepreciation, setSelectedDepreciation] = useState({
    dpIds: [],
    monthlyDepreciationIds: [],
    cr: 0,
    dr: 0,
    month: "",
    year: "",
  });

  // const handleCheckboxToggle = (index) => {
  //   const actualIndex = (page - 1) * limit + index;

  //   setSelectedRows((prev) => {
  //     const newSelectedRows = { ...prev };
  //     if (newSelectedRows[actualIndex]) {
  //       delete newSelectedRows[actualIndex];
  //     } else {
  //       newSelectedRows[actualIndex] = summary[actualIndex];
  //     }

  //     // Log the selected row data
  //     if (!newSelectedRows[actualIndex]) {
  //       console.log("Row deselected:", summary[actualIndex]);
  //     } else {
  //       console.log("Row selected:", summary[actualIndex]);
  //     }

  //     console.log("All selected rows:", Object.values(newSelectedRows));
  //     console.log("All selected row IDs:", Object.values(newSelectedRows).map(row => row?._id));
  //     console.log(
  //       "All selected row MonthlyDepreciation IDs:",
  //       Object.values(newSelectedRows).map(row =>
  //         row?.MonthlyDepreciation?.map(dep => dep._id)
  //       )
  //     );

  //     return newSelectedRows;
  //   });
  // };

  const handleCheckboxToggle = (index) => {
    console.log(index);
    const actualIndex = (page - 1) * limit + index;

    setSelectedRows((prev) => {
      const newSelectedRows = { ...prev };
      if (newSelectedRows[actualIndex]) {
        delete newSelectedRows[actualIndex];
      } else {
        newSelectedRows[actualIndex] = summary[actualIndex];
      }

      // Extract IDs
      const dpIds = Object.values(newSelectedRows).map((row) => row?._id);
      const monthlyDepreciationIds = Object.values(newSelectedRows).flatMap(
        (row) => row?.MonthlyDepreciation?.map((dep) => dep._id) || []
      );

      // Calculate total "amount" for debit & credit
      const totalAmount = Object.values(newSelectedRows)
        .flatMap(
          (row) => row?.MonthlyDepreciation?.map((dep) => dep.amount) || []
        )
        .reduce((sum, amount) => sum + amount, 0);

      // Extract month and year (take from the first selected row)
      const firstDepreciation = Object.values(newSelectedRows).flatMap(
        (row) => row?.MonthlyDepreciation || []
      )[0]; // Get first MonthlyDepreciation entry

      const month = firstDepreciation?.month || "";
      const year = firstDepreciation?.year || "";

      // Store in state
      setSelectedDepreciation({
        dpIds,
        monthlyDepreciationIds,
        dr: totalAmount, // Total Debit
        cr: totalAmount, // Total Credit
        month, // First available month
        year, // First available year
      });

      console.log("All selected row IDs:", dpIds);
      console.log(
        "All selected row MonthlyDepreciation IDs:",
        monthlyDepreciationIds
      );
      console.log("Total DR (debit):", totalAmount);
      console.log("Total CR (credit):", totalAmount);
      console.log("Selected Month:", month);
      console.log("Selected Year:", year);

      return newSelectedRows;
    });
  };

  const createMonthlyDepreciationJournal = () => {
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
        Particulars: `MONTHLY DEPRECIATION`,
        Depreciation: {
          dpId: selectedDepreciation.dpIds,
          monthlyDepreciationId: selectedDepreciation.monthlyDepreciationIds,
          month: selectedDepreciation.month,
          year: selectedDepreciation.year,
        },
      },
      onSave: () => setJournalModal({ show: false }),
      mode: "DP-ALL",
    });
    const push = [];
    push.push(
      {
        ledger: {
          code: "10605021",
          name: "ACCUMULATED DEPRECIATION- OFFICE EQUIPMENT",
        },
        subledger: {
          slCode: "232",
          name: "CORPORATE EXPENSE",
        },
        dr: numberToCurrencyString(selectedDepreciation.dr),
        cr: null,
      },
      {
        ledger: {
          code: "50501",
          name: "DEPRECIATION",
        },
        subledger: {
          slCode: "232",
          name: "CORPORATE EXPENSE",
        },
        dr: null,
        cr: numberToCurrencyString(selectedDepreciation.cr),
      }
    );

    pushToGrid(push);
  };

  const openJournal = async (entryId) => {
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
    mode: "DP-ALL",
  });

  // useEffect(() => {
  //   if (selectedAccount) {
  //     console.log("Selected Account:", selectedAccount);
  //     console.log("Selected Account:", selectedAccount.code);
  //   }
  // }, [selectedAccount]);

  const fetchData = async () => {
    try {
      const category = selectedAccount.code;
      const data = await DepreciationApi.getSummaryDepreciation(
        year,
        month,
        category
      );
      setSelectedRows({});
      setSummary(data.summary || []);
      setTotals(data.totals || {});
      console.log(data);
      showToast("Updated data fetched successfully", "success");
    } catch (error) {
      console.error("Failed to fetch data", error);
      showToast("Failed to fetch data. Please try again.", "error");
    }
  };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const clearSelectedAccount = () => {
    setSelectedAccount({});
    setYear(currentYear);
    setMonth("");
  };

  const handleExportReport = () => {
    if (!summary.length) {
      showToast("No report data available for export.", "warning");
      return;
    }

    const exportData = {
      summary,
      totals,
    };

    ExportApi.exportDepreciation(exportData.summary, exportData.totals)
      .then(() => {
        showToast("Export successful!", "success");
      })
      .catch((error) => {
        console.error("Export failed", error);
        showToast("Export failed. Please try again.", "error");
      });
  };

  // Function to get actual index from display index
  const getActualIndex = (displayIndex) => {
    return (page - 1) * limit + displayIndex;
  };

  const totalPages = Math.ceil(summary.length / limit);
  const displayedData = summary.slice((page - 1) * limit, page * limit);

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold mb-4">DEPRECIATION SCHEDULE</h1>
        <div className="flex justify-start items-center mb-4 space-x-4">
          <button
            onClick={clearSelectedAccount}
            className="bg-red-600 text-white rounded-md px-4 py-2 text-sm hover:scale-105 transition transform duration-300"
          >
            Clear
          </button>

          <span>select a category</span>
          <GLInput
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />

          <select
            className="px-3 py-2 border rounded"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from(
              { length: currentYear - 1990 + 1000 },
              (_, i) => 1990 + i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All Months</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
          >
            <FaSync size={16} className="mr-2" />
            Fetch latest Data
          </button>

          {month === "" && (
            <div>
              <button
                onClick={handleExportReport}
                className="bg-green-500 text-white px-4 py-2 rounded self-end md:self-auto hover:bg-green-800 active:scale-110 transition-transform duration-300 relative w-full flex item-center justify-center"
              >
                <FaFileExcel size={28} />
              </button>
            </div>
          )}

          {month && (
            <div>
              <button
                onClick={() => createMonthlyDepreciationJournal()}
                className="bg-green-500 text-white px-4 py-2 rounded self-end md:self-auto hover:bg-green-800 active:scale-110 transition-transform duration-300 relative w-full flex items-center justify-center"
              >
                Create Journal
              </button>
            </div>
          )}
        </div>

        <table className="w-full border-collapse border border-gray-300 text-[0.7em]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Select</th>
              <th className="border px-4 py-2">Property No</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Acquisition Date</th>
              <th className="border px-4 py-2">Cost</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Use Full life</th>
              <th className="border px-4 py-2">Accumulated Depreciation</th>
              <th className="border px-4 py-2">Net Book Value</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => {
              const actualIndex = getActualIndex(index);
              return (
                <React.Fragment key={index}>
                  <tr
                    className={`border ${
                      selectedRows[actualIndex] ? "bg-blue-100" : ""
                    }`}
                  >
                    {/* <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={!!selectedRows[actualIndex]}
                        onChange={() => handleCheckboxToggle(index)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td> */}
                    <td className="border px-4 py-2">
                      {!item.MonthlyDepreciation?.some(
                        (dep) => dep.isDepreciated
                      ) && (
                        <input
                          type="checkbox"
                          checked={!!selectedRows[actualIndex]}
                          onChange={() => handleCheckboxToggle(index)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      )}
                    </td>

                    <td className="border px-4 py-2">{item.PropNo}</td>
                    <td className="border px-4 py-2">{item.Name}</td>
                    <td className="border px-4 py-2">
                      {formatReadableDate(item.AcquisitionDate)}
                    </td>
                    <td className="border px-4 py-2">
                      {numberToCurrencyString(item.UnitCost || 0)}
                    </td>
                    <td className="border px-4 py-2">{item.Quantity || 0}</td>
                    <td className="border px-4 py-2">{item.UseFullLife}</td>
                    <td className="border px-4 py-2">
                      {item.AccumulatedDepreciation.map((nbv) =>
                        numberToCurrencyString(nbv.Value)
                      ).join(", ")}
                    </td>
                    <td className="border px-4 py-2">
                      {item.NetBookValue.map((nbv) =>
                        numberToCurrencyString(nbv.Value)
                      ).join(", ")}
                    </td>
                    <td className="border px-4 py-2 group relative">
                      <button
                        className="px-2 py-1 bg-gray-300 rounded flex items-center gap-2"
                        onClick={() =>
                          setExpanded(
                            expanded === actualIndex ? null : actualIndex
                          )
                        }
                      >
                        {expanded === actualIndex ? (
                          <>
                            <FaEyeSlash />
                          </>
                        ) : (
                          <>
                            <FaEye />
                          </>
                        )}
                      </button>
                      <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 opacity-0 text-center group-hover:opacity-100 group-hover:block transition-all duration-500">
                        {expanded === actualIndex ? "Hide" : "View"} Monthly
                        Depreciation
                      </span>
                    </td>
                  </tr>
                  {expanded === actualIndex && (
                    <tr className="border w-full">
                      <td colSpan={10} className="p-4 bg-gray-100">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="border px-4 py-2">Reference</th>
                              <th className="border px-4 py-2">Month</th>
                              <th className="border px-4 py-2">Year</th>
                              <th className="border px-4 py-2">Amount</th>
                              <th className="border px-4 py-2">Start Date</th>
                              <th className="border px-4 py-2">End Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.MonthlyDepreciation?.map((dep, depIndex) => (
                              <tr
                                key={depIndex}
                                className={`border ${
                                  dep.isDepreciated ? "bg-yellow-500" : ""
                                }`}
                              >
                                <td className="border px-4 py-2 text-center">
                                  {dep.DocNo || "-"}
                                </td>
                                <td className="border px-4 py-2">
                                  {dep.month}
                                </td>
                                <td className="border px-4 py-2">{dep.year}</td>
                                <td className="border px-4 py-2">
                                  {numberToCurrencyString(dep.amount)}
                                </td>
                                <td className="border px-4 py-2">
                                  {formatReadableDate(dep.startDate)}
                                </td>
                                <td className="border px-4 py-2">
                                  {formatReadableDate(dep.endDate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <FaChevronLeft />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
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

export default DepreciationReport;
