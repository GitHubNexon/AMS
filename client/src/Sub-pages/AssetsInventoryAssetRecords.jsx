import React, { useMemo } from "react";
import {
  FiX,
  FiCalendar,
  FiFile,
  FiMapPin,
  FiUser,
  FiBox,
  FiClock,
} from "react-icons/fi";
import { FaPesoSign } from "react-icons/fa6";
import moment from "moment";
import { numberToCurrencyString } from "../helper/helper";

const AssetsInventoryAssetRecords = ({ isOpen, onClose, historyData }) => {
  if (!isOpen || !historyData) return null;

  // Get transaction status badge
  const getTransactionBadge = (transaction) => {
    const badgeClasses = {
      Issuance: "bg-green-100 text-green-800",
      Return: "bg-blue-100 text-blue-800",
      Disposal: "bg-red-100 text-red-800",
      "Under-Repair": "bg-yellow-100 text-yellow-800",
      "Re-Assign for Inventory": "bg-purple-100 text-purple-800",
      "Lost/Stolen": "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          badgeClasses[transaction] || "bg-gray-100 text-gray-800"
        }`}
      >
        {transaction}
      </span>
    );
  };

  // Get condition badge based on useful life
  const getConditionBadge = (useFullLife) => {
    if (!useFullLife) return null;

    if (useFullLife >= 80) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Excellent
        </span>
      );
    } else if (useFullLife >= 60) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Good
        </span>
      );
    } else if (useFullLife >= 40) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Fair
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Poor
        </span>
      );
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!historyData?.assetRecords?.length) return null;

    const totalQuantity = historyData.assetRecords.reduce(
      (sum, record) => sum + (record.quantity || 0),
      0
    );
    const totalAmount = historyData.assetRecords.reduce(
      (sum, record) => sum + (record.amount || 0),
      0
    );
    const uniqueUnits = [
      ...new Set(historyData.assetRecords.map((record) => record.unit)),
    ];

    return {
      totalQuantity,
      totalAmount,
      uniqueUnits,
      recordCount: historyData.assetRecords.length,
    };
  }, [historyData]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Asset Records Details
                </h2>
                <p className="text-sm text-gray-600">
                  PAR No: {historyData.parNo} | Transaction:{" "}
                  {historyData.transaction}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Transaction Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiFile className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    PAR Number
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {historyData.parNo}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Transaction Date
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {moment(historyData.date).format("MMM DD, YYYY")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiUser className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Issued By
                  </span>
                </div>
                <div className="mt-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {historyData.issuedBy?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {historyData.issuedBy?.position || ""}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    Transaction Type
                  </span>
                </div>
                <div className="mt-1">
                  {getTransactionBadge(historyData.transaction)}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    Fund Cluster
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {historyData.fundCluster}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    Entity Name
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {historyData.entityName || "N/A"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiClock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Created At
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {moment(historyData.createdAt).format("MMM DD, YYYY HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          {summaryStats && (
            <div className="p-6 bg-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <FiBox className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">
                      Total Records
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {summaryStats.recordCount}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Quantity
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {summaryStats.totalQuantity}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <FaPesoSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">
                      Total Amount
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₱{summaryStats.totalAmount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      Asset Types
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {summaryStats.uniqueUnits.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Asset Records Table */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Asset Records ({historyData.assetRecords?.length || 0})
              </h3>

              {historyData.assetRecords &&
              historyData.assetRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiFile className="h-4 w-4" />
                            <span>Item Details</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiBox className="h-4 w-4" />
                            <span>Quantity & Unit</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FaPesoSign className="h-4 w-4" />
                            <span>Amount</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="h-4 w-4" />
                            <span>Location</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyData.assetRecords.map((record, index) => (
                        <tr
                          key={record._id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {record.description || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Item No: {record.itemNo || "N/A"}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Asset ID: {record.assetId?.slice(-6) || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {record.quantity || 0}{" "}
                                {record.quantity === 1 ? "unit" : "units"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.unit || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₱{record.amount?.toLocaleString() || "0"}
                            </div>
                            {record.quantity > 1 && (
                              <div className="text-xs text-gray-500">
                                ₱
                                {(
                                  record.amount / record.quantity
                                )?.toLocaleString() || "0"}{" "}
                                per unit
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <FiMapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 capitalize">
                                {record.location || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              {getConditionBadge(record.useFullLife)}
                              {record.useFullLife && (
                                <div className="text-xs text-gray-500">
                                  {record.useFullLife}% life remaining
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiBox className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No asset records found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no asset records associated with this transaction.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsInventoryAssetRecords;
