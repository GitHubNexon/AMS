import React, { useState } from "react";
import assetReportApi from "../api/assetReportApi";
import EmployeePicker from "../Components/EmployeePicker";
import AssetsPicker from "../Components/AssetsPicker";
import {
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { numberToCurrencyString } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import moment from "moment";

const FILTER_OPTIONS = [
  { key: "Issuance", label: "Issuance" },
  { key: "Return", label: "Return" },
  { key: "Disposal", label: "Disposal" },
  { key: "Under-Repair", label: "Under-Repair" },
  { key: "Lost/Stolen", label: "Lost/Stolen" },
];

const AssetsHistory = () => {
  const [form, setForm] = useState({
    asset: null,
    employee: null,
    filter: {
      Issuance: false,
      Return: false,
      Disposal: false,
      "Under-Repair": false,
      "Lost/Stolen": false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleAssetSelect = (asset) =>
    setForm((prev) => ({
      ...prev,
      asset,
    }));

  const handleEmployeeSelect = (employee) =>
    setForm((prev) => ({
      ...prev,
      employee,
    }));

  const handleFilterChange = (key) =>
    setForm((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        [key]: !prev.filter[key],
      },
    }));

  const handleReset = () => {
    setForm({
      asset: null,
      employee: null,
      filter: {
        Issuance: false,
        Return: false,
        Disposal: false,
        "Under-Repair": false,
        "Lost/Stolen": false,
      },
    });
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    if (!form.asset || !form.asset._id) {
      setError("Please select an Asset.");
      setLoading(false);
      return;
    }

    try {
      const data = await assetReportApi.getAssetsHistory(
        form.asset._id,
        form.employee?._id || null,
        form.filter
      );
      setResponse(data);
      if (!data.inventoryHistory?.length) {
        showToast("No history found.", "info");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch history.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaSearch className="text-blue-500" /> Assets History
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Asset</label>
            <AssetsPicker
              value={{ asset: form.asset }}
              onSelectAsset={handleAssetSelect}
              isInventoryEnabled={false}
            />
          </div>
          <div>
            <label className="font-semibold">Employee</label>
            <EmployeePicker
              value={form.employee}
              onSelect={handleEmployeeSelect}
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Filter Transaction</label>
          <div className="flex flex-wrap gap-4">
            {FILTER_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.filter[opt.key]}
                  onChange={() => handleFilterChange(opt.key)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            <FaSearch /> {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            <FaSyncAlt /> Reset
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-600 flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}
      </form>

      {response && (
        <div className="overflow-x-auto border rounded-lg bg-gray-50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Transaction
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Employee
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Asset Info
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Asset Location
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {response.inventoryHistory?.length > 0 ? (
                response.inventoryHistory.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    className="hover:bg-blue-50 transition"
                  >
                    <td className="px-3 py-2 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs">{item.transaction}</td>
                    <td className="px-3 py-2 text-xs">
                      {item.date
                        ? moment(item.date).format("MMMM D, YYYY")
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div>{item.employeeName || "-"}</div>
                      <div className="text-gray-500 text-xs">
                        {item.employeePosition || ""}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {item.assetRecords?.length > 0 ? (
                        <div>
                          <div className="font-semibold">
                            {item.assetRecords[0].description}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.assetRecords[0].itemNo}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {item.assetRecords?.length > 0 ? (
                        <div>
                          <div className="font-semibold">
                            {item.assetRecords[0].location}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {item.assetRecords?.length > 0
                        ? numberToCurrencyString(item.assetRecords[0].amount)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {item.transaction === "Issuance" ? (
                        <span className="inline-flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" /> Issued
                        </span>
                      ) : item.transaction === "Return" ? (
                        <span className="inline-flex items-center text-blue-600">
                          <FaCheckCircle className="mr-1" /> Returned
                        </span>
                      ) : item.transaction === "Disposal" ? (
                        <span className="inline-flex items-center text-red-600">
                          <FaTimesCircle className="mr-1" /> Disposed
                        </span>
                      ) : item.transaction === "Under-Repair" ? (
                        <span className="inline-flex items-center text-yellow-600">
                          <FaSyncAlt className="mr-1" /> Under Repair
                        </span>
                      ) : item.transaction === "Lost/Stolen" ? (
                        <span className="inline-flex items-center">
                          <FaTrash className="mr-1" /> Lost/Stolen
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-gray-400"
                  >
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssetsHistory;
