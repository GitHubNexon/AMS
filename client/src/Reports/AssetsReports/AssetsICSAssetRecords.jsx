import React, { useMemo } from "react";
import {
  FiX,
  FiCalendar,
  FiFile,
  FiUser,
  FiMapPin,
  FiPackage,
  FiTrendingUp,
  FiHash,
  FiClock,
} from "react-icons/fi";
import { FaPesoSign } from "react-icons/fa6";
import moment from "moment";
import { numberToCurrencyString } from "../../helper/helper";

const AssetsICSAssetRecords = ({ isOpen, onClose, employeeData }) => {
  if (!isOpen) return null;

  // Transform asset records data for display
  const transformedAssetData = useMemo(() => {
    if (!employeeData?.assetRecords) return [];

    return employeeData.assetRecords.map((record) => ({
      ...record,
      totalValue:
        record.assetDetails?.reduce(
          (sum, asset) => sum + (asset.amount || 0),
          0
        ) || 0,
      totalAssets: record.assetDetails?.length || 0,
      formattedDate: moment(record.dateReleased).format("MMM DD, YYYY"),
    }));
  }, [employeeData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!transformedAssetData.length) return null;

    const totalRecords = transformedAssetData.length;
    const totalAssets = transformedAssetData.reduce(
      (sum, record) => sum + record.totalAssets,
      0
    );
    const totalValue = transformedAssetData.reduce(
      (sum, record) => sum + record.totalValue,
      0
    );
    const latestRecord = transformedAssetData.reduce((latest, record) =>
      moment(record.dateReleased).isAfter(moment(latest.dateReleased))
        ? record
        : latest
    );

    return {
      totalRecords,
      totalAssets,
      totalValue,
      latestRecord: latestRecord
        ? moment(latestRecord.dateReleased).format("MMM DD, YYYY")
        : "N/A",
    };
  }, [transformedAssetData]);

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
                <FiFile className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Asset Records - ICS (Inventory Custody Slip)
                </h2>
                <p className="text-sm text-gray-600">
                  {employeeData?.employeeName} •{" "}
                  {employeeData?.employeePosition} •{" "}
                  {employeeData?.employeeDivision}
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

          {/* Employee Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiFile className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Total Records
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {summaryStats?.totalRecords || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiPackage className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Total Assets
                  </span>
                </div>
                <p className="text-2xl font-semibold text-green-600 mt-1">
                  {summaryStats?.totalAssets || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FaPesoSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Total Value
                  </span>
                </div>
                <p className="text-2xl font-semibold text-purple-600 mt-1">
                  {numberToCurrencyString(summaryStats?.totalValue || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Latest Record
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {summaryStats?.latestRecord || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Asset Records List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Asset Records Details
              </h3>

              {transformedAssetData && transformedAssetData.length > 0 ? (
                <div className="space-y-6">
                  {transformedAssetData.map((record, recordIndex) => (
                    <div
                      key={recordIndex}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      {/* Record Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <FiHash className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                PAR No:
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {record.parNo}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Date Released:
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                {record.formattedDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Total Assets
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {record.totalAssets}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Total Value
                              </p>
                              <p className="text-lg font-semibold text-purple-600">
                                {numberToCurrencyString(record.totalValue)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Record Details */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FiPackage className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Fund Cluster:</span>
                            <span className="font-medium">
                              {record.fundCluster}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiTrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Entity:</span>
                            <span className="font-medium">
                              {record.entityName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiUser className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Issued By:</span>
                            <span className="font-medium">
                              {record.issuedBy?.name} (
                              {record.issuedBy?.position})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Asset Details Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Details
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity & Unit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Useful Life
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {record.assetDetails?.map((asset, assetIndex) => (
                              <tr
                                key={assetIndex}
                                className={
                                  assetIndex % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <div className="text-sm font-medium text-gray-900">
                                      {asset.description}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Item No: {asset.itemNo}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {asset.quantity}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {asset.unit}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <FiMapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900 uppercase">
                                      {asset.location}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <FiClock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">
                                      {asset.useFullLife} months
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-semibold text-green-600">
                                    {numberToCurrencyString(asset.amount)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <FiFile className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No asset records found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      This employee has no asset records assigned.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {summaryStats && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <FiUser className="h-4 w-4" />
                    <span>Employee: {employeeData?.employeeName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="h-4 w-4" />
                    <span>Department: {employeeData?.employeeDepartment}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="h-4 w-4" />
                    <span>
                      Record Created:{" "}
                      {moment(employeeData?.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Generated on {moment().format("MMM DD, YYYY [at] h:mm A")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsICSAssetRecords;
