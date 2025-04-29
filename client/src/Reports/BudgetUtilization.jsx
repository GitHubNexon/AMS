import React, { useState, useEffect } from "react";
import moment from "moment";
import { FaSync } from "react-icons/fa";
import { FaFileAlt, FaFileExcel } from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";
import DatePicker from "../Components/DatePicker";
import SubledgerPicker from "../Components/SubledgerPicker";
import AccountPicker from "../Components/AccountPicker";
import BudgetTrackApi from "../api/BudgetTrackApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import { RiResetLeftFill } from "react-icons/ri";
import { useLoader } from "../context/useLoader";

const BudgetUtilization = () => {
  const { loading, setLoading } = useLoader();
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");
  const [categoryCodes, setCategoryCodes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [workGroupCode, setWorkGroupCode] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [datePickerType, setDatePickerType] = useState("normal");
  const [isAnimating, setIsAnimating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reportHeader, setReportHeader] = useState("");

  const totalPages = reportData
    ? Math.ceil(reportData.length / itemsPerPage)
    : 0;

  // useEffect(() => {
  //   if (slCode && !workGroupCodes.includes(slCode)) {
  //     setWorkGroupCodes((prev) => [...prev, slCode]);
  //   }
  // }, [slCode]);

  useEffect(() => {
    if (slCode && slCode !== workGroupCode) {
      setWorkGroupCode(slCode); // Set the workGroupCode to the new code
    }
  }, [slCode]);

  useEffect(() => {
    if (
      selectedAccount &&
      selectedAccount.code &&
      !categoryCodes.includes(selectedAccount.code)
    ) {
      setCategoryCodes((prev) => [...prev, selectedAccount.code]);
    }
  }, [selectedAccount]);

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    if (newStartDate !== startDate || newEndDate !== endDate) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      console.log(newStartDate, newEndDate);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "startDate") {
      setStartDate(value);
    } else if (id === "endDate") {
      setEndDate(value);
    }
  };

  const handleRemoveCategoryCode = (code) => {
    setCategoryCodes((prev) => prev.filter((c) => c !== code));
  };

  // const handleRemoveWorkGroupCode = (code) => {
  //   setWorkGroupCodes((prev) => prev.filter((c) => c !== code));
  // };

  const handleRemoveWorkGroupCode = () => {
    setWorkGroupCode(""); // Remove the selected code
  };

  const getReportHeader = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = moment(startDate);
    const end = moment(endDate);

    if (start.isSame(end, "month")) {
      return `FOR THE MONTH OF ${start
        .format("MMMM")
        .toUpperCase()}, ${start.format("YYYY")}`;
    }

    if (end.diff(start, "months") <= 2) {
      return `FOR THE QUARTER ENDING ${end
        .format("MMMM")
        .toUpperCase()}, ${end.format("YYYY")}`;
    }

    return `FOR THE PERIOD FROM ${start
      .format("MMMM D, YYYY")
      .toUpperCase()} TO ${end.format("MMMM D, YYYY").toUpperCase()}`;
  };

  const handleFetchReport = async () => {
    loading(true);

    if (!startDate || !endDate) {
      showToast("Please select both start and end date", "warning");
      return;
    }

    setErrorMessage("");

    try {
      let formattedStartDate = moment(startDate).format("YYYY-MM-DD");
      let formattedEndDate = moment(endDate).format("YYYY-MM-DD");

      console.log(formattedStartDate);
      console.log(formattedEndDate);

      if (datePickerType === "range") {
        formattedStartDate = moment(startDate).format("YYYY-MM-DD");
        formattedEndDate = moment(endDate).format("YYYY-MM-DD");
      }
      const response = await BudgetTrackApi.getUtilizationReport(
        formattedStartDate,
        formattedEndDate,
        workGroupCode,
        categoryCodes
      );

      console.log("Response:", response);

      if (Array.isArray(response) && response.length > 0) {
        const reports = response[0].reports;

        if (Array.isArray(reports) && reports.length > 0) {
          setReportData(reports);
          setCurrentPage(1);
          setReportHeader(
            getReportHeader(formattedStartDate, formattedEndDate)
          );
          showToast("Report fetched successfully", "success");
        }
      } else {
        showToast(
          "No data found for the selected period or WorkGroup",
          "error"
        );
        setErrorMessage("No data found for the selected period or Work Group");
        setReportData(null);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      if (error.response) {
        if (
          error.response.data.message.includes(
            "startDate and endDate are required"
          )
        ) {
          showToast("Both start date and end date are required.", "error");
        } else if (
          error.response.data.message.includes(
            "startDate cannot be later than endDate"
          )
        ) {
          showToast("Start date cannot be later than end date.", "error");
        } else if (
          error.response.data.message.includes(
            "No data found for the given period"
          )
        ) {
          setReportData(null);
          setErrorMessage("No data found for the selected period.");
        } else {
          showToast("Error: " + error.response.data.message, "error");
        }
      } else {
        showToast("An error occurred while fetching the report", "error");
      }
    } finally {
      loading(false);
    }
  };

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      showToast("Please select both start and end date", "warning");
      return;
    }

    setIsAnimating(true);
    setErrorMessage("");
    setTimeout(async () => {
      try {
        await handleFetchReport();
      } catch (error) {
        showToast("Failed to Fetch Report", "error");
      } finally {
        setIsAnimating(false);
      }
    }, 2000);
  };

  const handleReset = () => {
    setDatePickerType("normal");
    setStartDate("");
    setEndDate("");
    setSLCode("");
    setName("");
    setSelectedAccount(null);
    setCategoryCodes([]);
    setWorkGroupCode("");
    setReportData(null);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getCurrentPageData = () => {
    if (!reportData) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reportData.slice(startIndex, endIndex);
  };

  return (
    <>
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold">Budget Utilization Report</h1>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col text-[0.7em]">
          <div>
            <label className="block text-sm font-medium">
              Date Picker Type
            </label>
            <select
              value={datePickerType}
              onChange={(e) => setDatePickerType(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="normal">Normal Date Picker</option>
              <option value="range">Date Range Picker</option>
            </select>
          </div>

          {datePickerType === "range" ? (
            <DatePicker onDateRangeChange={handleDateRangeChange} />
          ) : (
            <div className="flex flex-col md:flex-row md:space-x-4 w-full">
              <div className="flex flex-col w-full md:w-1/2">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="flex flex-col w-full md:w-1/2">
                <label htmlFor="endDate" className="block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center space-x-5">
          <div className="text-[0.8em]">
            <h3>Selected Category Codes</h3>
            <ul>
              {categoryCodes.length > 0 ? (
                categoryCodes.map((code, index) => (
                  <li key={index}>
                    {code}{" "}
                    <button
                      onClick={() => handleRemoveCategoryCode(code)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-[0.8em]">No Category selected</p>
              )}
            </ul>
          </div>

          <div className="text-[0.8em]">
            <h3>Selected WorkGroup Code</h3>
            {workGroupCode ? (
              <ul>
                <li>
                  {workGroupCode}{" "}
                  <button
                    onClick={handleRemoveWorkGroupCode}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              </ul>
            ) : (
              <p className="text-[0.8em]">No WorkGroup selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 text-[0.7em] mb-10">
        <div className="flex flex-col ">
          <label className="mb-1 font-medium">Select a work group</label>
          <SubledgerPicker
            slCode={slCode}
            setSLCode={setSLCode}
            name={name}
            setName={setName}
            callback={() => {
              /* callback logic if needed */
            }}
          />
        </div>

        <div className="flex flex-col ">
          <label className="mb-1 font-medium">Select Categories</label>
          <AccountPicker
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            filter={[
              "ASSETS",
              "LIABILITIES",
              "CAPITAL",
              "REVENUES/INCOME",
              "EXPENSES",
            ]}
          />
        </div>

        <div className="flex flex-col ">
          <label htmlFor="fetchReport" className="block text-sm font-medium">
            Fetch Report
          </label>
          <button
            onClick={handleFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded self-center md:self-start hover:bg-green-600 active:scale-110 transition-transform duration-300 w-full flex items-center justify-center"
          >
            <FaSync size={28} className={`mr-2 ${isAnimating ? "spin" : ""}`} />
            <FaFileAlt size={28} />
            {(reportData === null || errorMessage) && (
              <span className="animate-ping absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            )}
          </button>
        </div>
        {reportData && reportData.length > 0 && !errorMessage && (
          <div className="flex flex-col">
            <label htmlFor="reset" className="block text-sm font-medium">
              Reset Fetch
            </label>
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded self-center md:self-start hover:bg-red-800 active:scale-110 transition-transform duration-300 w-full flex items-center justify-center"
            >
              <RiResetLeftFill size={28} />
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
      )}

      <div
        className={`overflow-auto h-[75vh] ${
          isAnimating ? "animate-pulse" : ""
        }`}
      >
        {isAnimating && (
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
            <div className="h-8 bg-gray-300 animate-pulse"></div>
          </div>
        )}

        {!isAnimating && reportData && (
          <div className="overflow-x-auto h-[35vh]">
            {reportHeader && (
              <h2 className="text-lg font-medium mb-2 text-center">
                {reportHeader}
              </h2>
            )}

            <table className="table-auto min-w-full border-collapse border border-gray-200 table-layout-fixed">
              <thead className="text-[0.9em]">
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">
                    Workgroup
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Total Budget
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Total Allocated
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Total Unutilized
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Total Percentage
                  </th>
                </tr>
              </thead>

              <tbody className="text-[0.9em]">
                {getCurrentPageData().map((report, index) => (
                  <React.Fragment key={index}>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2">
                        {report.workGroupCode}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {numberToCurrencyString(report.totalBudget)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {numberToCurrencyString(report.totalAllocated)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {numberToCurrencyString(report.totalUnutilized)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {numberToCurrencyString(report.totalPercentage)}%
                      </td>
                    </tr>

                    {/* Funds Table Rows */}
                    {Array.isArray(report.funds) &&
                      report.funds.length > 0 &&
                      report.funds.map((fund, fundIndex) => (
                        <React.Fragment key={fundIndex}>
                          <tr className="bg-white">
                            <td colSpan="5" className="px-4 py-2">
                              <strong>{fund.fundsName}</strong>
                              <div className="min-w-full border-collapse border border-gray-300 mt-2">
                                {/* Category Table Rows */}
                                {Array.isArray(fund.categories) &&
                                  fund.categories.length > 0 && (
                                    <table className="min-w-full border-collapse border border-gray-300 mt-2">
                                      <thead className="text-[0.7em]">
                                        <tr className="bg-gray-100">
                                          <th className="border border-gray-300 px-2 py-2">
                                            Category Code
                                          </th>
                                          <th className="border border-gray-300 px-2 py-2">
                                            Category
                                          </th>
                                          <th className="border border-gray-300 px-4 py-2">
                                            Budget
                                          </th>
                                          <th className="border border-gray-300 px-4 py-2">
                                            Allocated
                                          </th>
                                          <th className="border border-gray-300 px-4 py-2">
                                            Unutilized
                                          </th>

                                        </tr>
                                      </thead>

                                      <tbody className="text-[0.7em]">
                                        {fund.categories.map(
                                          (category, categoryIndex) => (
                                            <tr
                                              key={categoryIndex}
                                              className="bg-white"
                                            >
                                              <td className="border border-gray-300 px-4 py-2">
                                                {category.categoryCode}
                                              </td>
                                              <td className="border border-gray-300 px-4 py-2">
                                                {category.categoryName}
                                              </td>
                                              <td className="border border-gray-300 px-4 py-2">
                                                {numberToCurrencyString(
                                                  category.totalBudget
                                                )}
                                              </td>
                                              <td className="border border-gray-300 px-4 py-2">
                                                {numberToCurrencyString(
                                                  category.totalAllocated
                                                )}
                                              </td>
                                              <td className="border border-gray-300 px-4 py-2">
                                                {numberToCurrencyString(
                                                  category.totalUnutilized
                                                )}
                                              </td>

                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div className="flex items-start mt-10 font-bold">
              --- END OF REPORT ---
            </div>

            {!isAnimating && reportData && (
              <div className="flex justify-between items-center m-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 bg-blue-500 text-white rounded ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 bg-blue-500 text-white rounded ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BudgetUtilization;
