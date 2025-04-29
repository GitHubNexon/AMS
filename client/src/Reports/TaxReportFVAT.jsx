import React, { useState, useEffect } from "react";
import EntriesReportApi from "../api/EntriesReportApi";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import { FaFileAlt, FaFileExcel } from "react-icons/fa";
import ExportApi from "../api/ExportApi";
import { useLoader } from "../context/useLoader";
import { FaSync } from "react-icons/fa";
import SubledgerPicker from "../Components/SubledgerPicker";
import DatePicker from "../Components/DatePicker";
import { RiResetRightLine } from "react-icons/ri";


const TaxReportFVAT = () => {
  const { loading, setLoading } = useLoader();
  const [isAnimating, setIsAnimating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [Grandtotal, setGrandTotal] = useState(null);
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");
  const [datePickerType, setDatePickerType] = useState("normal");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reportHeader, setReportHeader] = useState("");

  const totalPages = reportData
    ? Math.ceil(reportData.length / itemsPerPage)
    : 0;

  useEffect(() => {
    console.log("Subledger Code:", slCode);
    console.log("Subledger Name:", name);
  }, [slCode, name]);

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    if (newStartDate !== startDate || newEndDate !== endDate) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      console.log(newStartDate, newEndDate);
    }
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
    setErrorMessage("");
    try {
      let formattedStartDate = startDate
        ? moment(startDate).format("YYYY-MM-DD")
        : null;
      let formattedEndDate = endDate
        ? moment(endDate).format("YYYY-MM-DD")
        : null;

      if (datePickerType === "range") {
        formattedStartDate = moment(startDate).format("YYYY-MM-DD");
        formattedEndDate = moment(endDate).format("YYYY-MM-DD");
      }

      let ownerName = slCode && name ? `${slCode} - ${name}` : null;

      const response = await EntriesReportApi.getReportForFVAT(
        formattedStartDate,
        formattedEndDate,
        ownerName
      );

      if (response.reports && response.reports.length > 0) {
        setReportData(response.reports);
        setCurrentPage(1);
        setGrandTotal({
          totalIncomePayment: response.totalIncomePayment,
          totalTaxRate: response.totalTaxRate,
          totalTaxTotal: response.totalTaxTotal,
        });
        console.log(response);
        setReportHeader(getReportHeader(formattedStartDate, formattedEndDate));
        showToast("Report fetched successfully", "success");
      } else {
        showToast("No data found for the selected period", "error");
        setErrorMessage("No data found for the selected period");
        setReportData(null);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      showToast("An error occurred while fetching the report", "error");
    } finally {
      loading(false);
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

  const handleExportReport = () => {
    ExportApi.exportFVATReport(
      reportData, // use the reportData state
      Grandtotal.totalIncomePayment, // total income payment from state
      Grandtotal.totalTaxRate, // total tax rate from state
      Grandtotal.totalTaxTotal // total tax total from state
    );
  };

  const handleFetch = async () => {
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
    setStartDate("");
    setEndDate("");
    setSLCode("");
    setName("");
    setReportData(null);
    setErrorMessage("");
    setGrandTotal(null);
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
        <h1 className="text-xl font-bold mb-4">WITHHOLDING TAX REPORT FVAT</h1>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4  items-center justify-center">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">
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
        <div>
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
        <div>
          <label htmlFor="fetchReport" className="block text-sm font-medium">
            Fetch Report
          </label>
          <button
            onClick={handleFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded self-end md:self-auto hover:bg-green-600 active:scale-110 transition-transform duration-300 relative w-full flex item-center justify-center"
          >
            <FaSync size={28} className={`mr-2 ${isAnimating ? "spin" : ""}`} />
            <FaFileAlt size={28} />
            {(reportData === null || errorMessage) && (
              <span className="animate-ping absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            )}
          </button>
        </div>
        {/* Export Button */}
        {reportData && reportData.length > 0 && !errorMessage && (
          <div>
            <label htmlFor="Export" className="block text-sm font-medium">
              Export Report
            </label>
            <button
              onClick={handleExportReport}
              className="bg-green-500 text-white px-4 py-2 rounded self-end md:self-auto hover:bg-green-800 active:scale-110 transition-transform duration-300 relative w-full flex item-center justify-center"
            >
              <FaFileExcel size={28} />
              {(reportData === null || errorMessage) && (
                <span className="animate-ping absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              )}
            </button>
          </div>
        )}
        {reportData && reportData.length > 0 && !errorMessage && (
          <div>
            <label htmlFor="reset" className="block text-sm font-medium">
              Reset Fetch
            </label>
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded self-center md:self-start hover:bg-red-700 active:scale-110 transition-transform duration-300 w-full flex item-center justify-center"
            >
              <RiResetRightLine size={28} />
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
          <div className="overflow-auto h-[45vh]">
            {reportHeader && (
              <h2 className="text-lg font-medium mb-2 text-center">
                {reportHeader}
              </h2>
            )}
            <table className="table-auto min-w-full border-collapse border border-gray-200">
              <thead className="text-[0.7em] sticky top-0">
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2">SEQ NO</th>
                  <th className="border border-gray-300 px-12 py-6">REFERENCE</th>
                  <th className="border border-gray-300 px-2 py-2">
                    TAXPAYER IDENTIFICATION NUMBER
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    CORPORATION
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    INDIVIDUAL
                  </th>
                  <th className="border border-gray-300 px-4 py-2">ATC CODE</th>
                  <th className="border border-gray-300 px-4 py-2">
                    NATURE OF PAYMENT
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    AMOUNT OF INCOME PAYMENT
                  </th>
                  <th className="border border-gray-300 px-4 py-2">TAX RATE</th>
                  <th className="border border-gray-300 px-4 py-2">
                    AMOUNT OF TAX WITHHIELD
                  </th>
                </tr>
              </thead>

              <tbody className="text-[0.7em]">
                {getCurrentPageData().map((report, index) => (
                  <tr key={index} className="bg-white">
                    <td className="border border-gray-300 px-4 py-2">
                      {report.seqNo}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.DVNo || report.CRNo || report.JVNo}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.tin}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.corporation?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.individual?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.atcCode}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.naturePayment}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(report.incomePayment || 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.taxRate || 0}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(report.taxTotal || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="font-bold">
                  <td colSpan="7" className="border border-gray-300 px-4 py-2">
                    Grand Total
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {numberToCurrencyString(Grandtotal.totalIncomePayment)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Grandtotal.totalTaxRate}%{" "}
                    {/* Assuming it's a percentage */}
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {numberToCurrencyString(Grandtotal.totalTaxTotal)}
                  </td>
                </tr>
              </tfoot>
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

export default TaxReportFVAT;
