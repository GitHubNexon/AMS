import React, { useState, useRef } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { numberToCurrencyString } from "../helper/helper";

const ExpandableBudgetTable = ({ data = [] }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollContainerRef = useRef(null);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  console.log(data);
  return (
    <>
      {/* Background overlay for maximized mode */}
      {isMaximized && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}

      <div
        className={`${
          isMaximized
            ? "fixed inset-0 z-50 flex items-center justify-center m-10 p-10"
            : "flex items-center justify-center"
        }`}
      >
        <div
          className={`${
            isMaximized
              ? "absolute inset-0 z-50 p-5 bg-white shadow-lg transition duration-300 "
              : "relative"
          } bg-white shadow-lg rounded-md w-full transition-all duration-300`}
        >
          {/* Container for button to avoid absolute positioning */}
          <div className="flex justify-between items-center p-2">
            <p className="text-white text-[0.8em] font-bold bg-gray-500 rounded-md p-2 cursor-pointer">
              Categories
            </p>
            <button
              onClick={toggleMaximize}
              className="text-gray-600 hover:text-gray-800 focus:outline-none z-50 relative group"
            >
              {isMaximized ? (
                <MdFullscreenExit size={24} />
              ) : (
                <MdFullscreen size={24} />
              )}
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                {isMaximized ? "Zoom Out" : "Zoom In"}
              </span>
            </button>
          </div>

          <div
            className={`${
              isMaximized ? "max-h-[75vh] " : "h-40"
            } overflow-y-auto`} // Removed max height and set h-full for maximized state
            ref={scrollContainerRef}
          >
            <table className="w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Category Name
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Category Code
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Category Budget
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Category Actual
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Current Balance
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Category Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => {
                  const isOverBudget =
                    parseFloat(item.CategoryActual) >
                    parseFloat(item.CategoryBudget);
                  return (
                    <tr
                      key={index}
                      className={`text-center ${
                        isOverBudget ? "bg-yellow-200 " : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 text-left relative group">
                        {item.CategoryName}
                        {isOverBudget && (
                          <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                            Budget Overrun
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                        {item.CategoryCode}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                        {numberToCurrencyString(item.CategoryBudget)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                        {numberToCurrencyString(item.CategoryActual)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                        {numberToCurrencyString(item.CurrentBalance)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                        {numberToCurrencyString(item.CategoryPercentage)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-gray-200 sticky bottom-0">
                <tr>
                  <td colSpan="2" className="px-4 py-2 font-bold text-center">
                    Total:
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) =>
                          total + (parseFloat(row.CategoryBudget) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) =>
                          total + (parseFloat(row.CategoryActual) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) =>
                          total + (parseFloat(row.CurrentBalance) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) =>
                          total + (parseFloat(row.CategoryPercentage) || 0),
                        0
                      ) / data.length || 0
                    )}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpandableBudgetTable;
