import React, { useState, useEffect } from "react";
import EntriesReportApi from "../api/EntriesReportApi";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";

const PaymentReports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [totals, setTotals] = useState({ totalDr: 0, totalCr: 0 });
  const [errorMessage, setErrorMessage] = useState("");

  const handleFetchReport = async () => {
    if (!startDate || !endDate) {
      showToast("Please select both start and end date", "warning");
      return;
    }

    setErrorMessage("");
    try {
      const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
      const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

      const response = await EntriesReportApi.getPaymentReport(
        formattedStartDate,
        formattedEndDate
      );
      console.log(response);

      if (response.message === "Report fetched successfully") {
        setReportData(response.data);
        setTotals(response.totals);
        showToast("Report fetched successfully", "success");
      } else {
        showToast("Error: " + response.message, "error");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      // Check if error response contains specific messages from backend
      if (error.response) {
        // Check specific error messages from the backend
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

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Payment Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col">
          <label
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700"
          >
            From:
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="endDate"
            className="text-sm font-medium text-gray-700"
          >
            To:
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>
        <button
          onClick={handleFetchReport}
          className="bg-blue-600 text-white  rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        >
          Fetch Report
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 text-red-600 text-center">{errorMessage}</div>
      )}

      {reportData && !errorMessage && (
        <div className="mt-6 ">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Report Entries
          </h3>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg ">
            <table className="min-w-full table-auto ">
              <thead className="bg-gray-100 ">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    DV No
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    DV Date
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Particulars
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Check No
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Owner Name
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Amount (Dr)
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                    Amount (Cr)
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {entry.DVNo}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {formatReadableDate(entry.DVDate)}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {entry.Particulars}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {entry.CheckNo}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {entry.DisbursementTransaction[0]?.OwnerName}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {numberToCurrencyString(
                        entry.ledgers
                          ?.filter((l) => l.type === "DR")
                          .reduce((sum, l) => sum + (l.dr || 0), 0)
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {numberToCurrencyString(
                        entry.ledgers
                          ?.filter((l) => l.type === "CR")
                          .reduce((sum, l) => sum + (l.cr || 0), 0)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              Total Dr: {numberToCurrencyString(totals.totalDr)}
            </h4>
            <h4 className="text-lg font-semibold text-gray-800">
              Total Cr: {numberToCurrencyString(totals.totalCr)}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReports;
