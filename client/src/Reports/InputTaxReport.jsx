import React, { useState, useEffect } from "react";
import EntriesReportApi from "../api/EntriesReportApi";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import { FaFileAlt, FaFileExcel } from "react-icons/fa";
import ReportNavigation from "../Reports/ReportNavigation";
import ExportApi from "../api/ExportApi";
import { useLoader } from "../context/useLoader";
import { FaSync } from "react-icons/fa";
import TaxReportNav from "./TaxReportNav";
import { RiResetRightLine } from "react-icons/ri";

const InputTaxReport = () => {
  const { loading, setLoading } = useLoader();
  const [isAnimating, setIsAnimating] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [Grandtotal, setGrandTotal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalPages = reportData
    ? Math.ceil(reportData.length / itemsPerPage)
    : 0;

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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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

      const response = await EntriesReportApi.getAlphaListTaxReport(
        formattedStartDate,
        formattedEndDate
      );

      if (response.message === "Report fetched successfully") {
        setReportData(response.individualAlphaListEntries);
        setGrandTotal(response.Grandtotal);
        showToast("Report fetched successfully", "success");
      } else {
        showToast("Error: " + response.message, "error");
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
    ExportApi.exportAlphaListTaxReport(Grandtotal, reportData);
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
    setReportData(null);
    setErrorMessage("");
    setGrandTotal(null);
  };

  return (
    <>
      {/* <ReportNavigation /> */}
      <div className="mx-auto p-4 overflow-auto">
        {/* <button
          onClick={toggleModal}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition-colors"
        >
          List of BIR Withholding Taxes
        </button> */}
        <h1 className="text-xl font-bold mb-4">LIST OF INPUT TAXES</h1>

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
              <FaSync
                size={28}
                className={`mr-2 ${isAnimating ? "spin" : ""}`}
              />
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

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {errorMessage}
          </p>
        )}

        <div
          className={`overflow-x-auto ${isAnimating ? "animate-pulse" : ""}`}
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

          {/* Report Table */}
          {!isAnimating && reportData && (
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="table-auto min-w-full border-collapse border border-gray-200 ">
                <thead className="text-[0.6em] sticky top-0 bg-gray-100 z-10">
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-8 py-6 ">
                      TAXABLE MONTH
                    </th>
                    <th className="border border-gray-300 px-12 py-6">
                      REFERENCE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      TAXPAYER IDENTIFICATION NUMBER
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      REGISTERED NAME
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      NAME OF SUPPLIER
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      SUPPLIER'S ADDRESS
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      GROSS PURCHASE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      EXEMPT PURCHASE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      ZERO RATE PURCHASE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      AMOUNT OF TAXABLE PURCHASE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      SERVICES PURCHASE
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      CAPITAL GOODS
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      GOODS OTHER THAN CAPITAL
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      INPUT TAX AMOUNT
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      GROSS TAXABLE PURCHASE
                    </th>
                  </tr>
                </thead>

                <tbody className="text-[0.6em]">
                  {/* {reportData.map((entry, index) => ( */}
                  {getCurrentPageData().map((entry, index) => (
                    <tr key={index} className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {entry.date}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {entry.DVNo || entry.CRNo || entry.JVNo}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {entry.tin}
                      </td>

                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {entry.registeredName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {entry.supplierName}
                      </td>
                      <td className="border border-gray-300 px-4 py text-center-2 text-center">
                        {entry.supplierAddress}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.grossPurchase)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.exemptPurchase)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.zeroRatePurchase)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.amountOfTaxablePurchase)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.servicesPurchase)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.capitalGoods)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.goodsOtherThanCapital)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.inputTaxAmount)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {numberToCurrencyString(entry.grossTaxablePurchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="font-bold">
                    <td
                      colSpan="6"
                      className="border border-gray-300 px-4 py-2"
                    >
                      Grand Total
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.grossPurchase)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.exemptPurchase)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.zeroRatePurchase)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(
                        Grandtotal.amountOfTaxablePurchase
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.servicesPurchase)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.capitalGoods)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.goodsOtherThanCapital)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.inputTaxAmount)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {numberToCurrencyString(Grandtotal.grossTaxablePurchase)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
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
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-full m-10 shadow-lg h-[95vh]">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            ></button>
            <TaxReportNav toggleModal={toggleModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default InputTaxReport;
