import React, { useMemo } from "react";
import {
  FiX,
  FiCalendar,
  FiFile,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { FaPesoSign } from "react-icons/fa6";
import moment from "moment";
import { numberToCurrencyString } from "../../helper/helper";
import Depreciation from "./../../Pages/Depreciation";

const AssetsNetBookValueSchedule = ({ isOpen, onClose, assetData }) => {
  if (!isOpen) return null;

  // Transform the schedule data to display net book value progression
  const transformedScheduleData = useMemo(() => {
    if (!assetData?.schedule) return [];

    const { years, months, values } = assetData.schedule;
    const unitCost = assetData.unitCost || 0;
    const monthlyDepreciation = unitCost / (assetData.useFullLife || 1);

    return years.map((year, index) => {
      const month = months[index];
      const netBookValue = values[index] || 0;
      const accumulatedDepreciation = unitCost - netBookValue;
      const currentDepreciation = index === 0 ? 0 : monthlyDepreciation;

      return {
        monthNumber: index + 1,
        year,
        month,
        netBookValue,
        accumulatedDepreciation,
        currentDepreciation,
        depreciationRate:
          unitCost > 0
            ? ((accumulatedDepreciation / unitCost) * 100).toFixed(2)
            : 0,
      };
    });
  }, [assetData]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!transformedScheduleData.length) return null;

    const currentMonth = moment().format("MMMM");
    const currentYear = moment().format("YYYY");

    // Find current net book value
    const currentEntry = transformedScheduleData.find(
      (item) => item.month === currentMonth && item.year === currentYear
    );

    const currentNetBookValue =
      currentEntry?.netBookValue || assetData?.unitCost || 0;
    const totalDepreciation = (assetData?.unitCost || 0) - currentNetBookValue;

    return {
      originalCost: assetData?.unitCost || 0,
      currentNetBookValue,
      totalDepreciation,
      depreciationPercentage:
        assetData?.unitCost > 0
          ? ((totalDepreciation / assetData.unitCost) * 100).toFixed(2)
          : 0,
      remainingLife: Math.max(
        0,
        (assetData?.useFullLife || 0) -
          moment().diff(
            moment(assetData?.acquisitionDate, "MM-DD-YYYY"),
            "months"
          )
      ),
    };
  }, [transformedScheduleData, assetData]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 ">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Net Book Value Schedule and Accumulated Depreciation
                </h2>
                <p className="text-sm text-gray-600">
                  {assetData?.propName} ({assetData?.propNo})
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

          {/* Asset Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FaPesoSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Original Cost
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {numberToCurrencyString(summaryStats?.originalCost || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiTrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Current Net Book Value
                  </span>
                </div>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {numberToCurrencyString(
                    summaryStats?.currentNetBookValue || 0
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiTrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Total Depreciation
                  </span>
                </div>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {numberToCurrencyString(summaryStats?.totalDepreciation || 0)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Acquisition Date
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {moment(assetData?.acquisitionDate, "MM-DD-YYYY").format(
                    "MMM DD, YYYY"
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Useful Life
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {assetData?.useFullLife} months
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Net Book Value Schedule
              </h3>

              {transformedScheduleData && transformedScheduleData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month/Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiTrendingUp className="h-4 w-4" />
                            <span>Net Book Value</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiTrendingDown className="h-4 w-4" />
                            <span>Accumulated Depreciation</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Depreciation %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transformedScheduleData.map((item, index) => {
                        const isFullyDepreciated = item.netBookValue === 0;
                        const isCurrentMonth =
                          moment().format("MMMM YYYY") ===
                          `${item.month} ${item.year}`;

                        return (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } ${
                              isCurrentMonth
                                ? "ring-2 ring-blue-500 bg-blue-50"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center space-x-2">
                                <span>{item.monthNumber}</span>
                                {isCurrentMonth && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {item.month}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {item.year}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`font-medium ${
                                    isFullyDepreciated
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {numberToCurrencyString(item.netBookValue)}
                                </span>
                                {isFullyDepreciated && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    Fully Depreciated
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium text-red-600">
                                {numberToCurrencyString(
                                  item.accumulatedDepreciation
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {item.depreciationRate}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      parseFloat(item.depreciationRate) === 100
                                        ? "bg-red-600"
                                        : "bg-blue-600"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        parseFloat(item.depreciationRate),
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <FiFile className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No schedule data available
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      The net book value schedule for this asset is not yet
                      generated.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Footer */}
          {summaryStats && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>
                    Depreciation Progress: {summaryStats.depreciationPercentage}
                    %
                  </span>
                  <span>
                    Remaining Life: {summaryStats.remainingLife} months
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Monthly Depreciation:</span>
                  <span className="font-medium text-red-600">
                    {numberToCurrencyString(
                      assetData?.unitCost / assetData?.useFullLife || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsNetBookValueSchedule;
