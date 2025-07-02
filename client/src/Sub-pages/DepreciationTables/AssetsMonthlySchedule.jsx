import React, { useMemo } from "react";
import {
  FiX,
  FiCalendar,
  FiFile,
  FiTrendingDown,
} from "react-icons/fi";
import { FaPesoSign } from "react-icons/fa6";
import moment from "moment";
import { numberToCurrencyString } from "../../helper/helper";

const AssetsMonthlySchedule = ({ isOpen, onClose, assetData }) => {
  if (!isOpen) return null;

  // Transform the schedule data to include accumulated depreciation and book value
  const transformedScheduleData = useMemo(() => {
    if (!assetData?.schedule) return [];

    const { month, amount, startDate, endDate } = assetData.schedule;
    const unitCost = assetData.unitCost || 0;

    return month.map((monthName, index) => {
      const depreciationAmount = amount[index] || 0;
      const accumulatedDepreciation = amount
        .slice(0, index + 1)
        .reduce((sum, amt) => sum + amt, 0);
      const bookValue = unitCost - accumulatedDepreciation;

      return {
        month: monthName,
        monthNumber: index + 1,
        depreciationAmount,
        accumulatedDepreciation,
        bookValue,
        startDate: startDate[index],
        endDate: endDate[index],
        year: moment(startDate[index], "MM-DD-YYYY").format("YYYY"),
      };
    });
  }, [assetData]);

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
      <div className="flex min-h-full items-center justify-center p-4 ">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFile className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Depreciation Schedule
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FaPesoSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Unit Cost
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {numberToCurrencyString(assetData?.unitCost)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiTrendingDown className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">
                    Monthly Depreciation
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {numberToCurrencyString(assetData?.monthlyDepreciation)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="h-4 w-4 text-blue-600" />
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
                  <FiCalendar className="h-4 w-4 text-red-600" />
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
                Monthly Depreciation Schedule
              </h3>

              {transformedScheduleData && transformedScheduleData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month/Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="h-4 w-4" />
                            <span>Period</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <FiTrendingDown className="h-4 w-4" />
                            <span>Depreciation Amount</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transformedScheduleData.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.monthNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.month}</span>
                              <span className="text-xs text-gray-500">
                                {item.year}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>
                                {moment(item.startDate, "MM-DD-YYYY").format(
                                  "MMM DD"
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                to{" "}
                                {moment(item.endDate, "MM-DD-YYYY").format(
                                  "MMM DD"
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-medium text-red-600">
                              -{numberToCurrencyString(item.depreciationAmount)}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                      The depreciation schedule for this asset is not yet
                      generated.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsMonthlySchedule;
