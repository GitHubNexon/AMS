import React, { useState, useRef } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { numberToCurrencyString } from "../helper/helper";

const ExpandedCategory = ({ data = [] }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollContainerRef = useRef(null);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

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
          <div className="flex justify-between items-center p-2">
            <p className="text-gray-600 text-[0.8em] font-bold bg-green-200 rounded-md p-2 cursor-pointer">
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
            } overflow-y-auto`}
            ref={scrollContainerRef}
          >
            <table className="w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-green-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    CategoryName
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Budget
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Actual
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Current Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.CategoryName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.Budget}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.Actual}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.CurrentBalance}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-200 sticky bottom-0">
                <tr>
                  <td className="px-4 py-2 font-bold">Total:</td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) => total + (parseFloat(row.Budget) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-2 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) => total + (parseFloat(row.Actual) || 0),
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
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpandedCategory;
