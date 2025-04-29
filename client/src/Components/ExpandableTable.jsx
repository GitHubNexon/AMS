import React, { useState, useRef } from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { numberToCurrencyString } from "../helper/helper";

const ExpandableTable = ({ data = [] }) => {
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
          {/* Container for button to avoid absolute positioning */}
          <div className="flex justify-between items-center p-2">
            <p className="text-gray-600 text-[0.8em] font-bold bg-green-200 rounded-md p-2 cursor-pointer">
              Transaction
            </p>
            <button
              onClick={toggleMaximize}
              className="text-gray-600 hover:text-gray-800 focus:outline-none z-50 relative group"
            >
              {isMaximized ? (
                <MdFullscreenExit size={24}  />
              ) : (
                <MdFullscreen size={24}  />
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
              <thead className="bg-green-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    SL Code
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Subledger Name
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Ledger Category
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Ledger Code
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Ledger Name
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    DR
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    CR
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.subledger.slCode}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.subledger.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.type}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.ledger.category}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.ledger.code}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.ledger.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.dr ? numberToCurrencyString(item.dr) : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.cr ? numberToCurrencyString(item.cr) : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-200">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-200 sticky bottom-0">
                <tr>
                  <td colSpan="6" className="px-4 py-2 font-bold">
                    Total:
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) => total + (parseFloat(row.dr) || 0),
                        0
                      )
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {numberToCurrencyString(
                      data.reduce(
                        (total, row) => total + (parseFloat(row.cr) || 0),
                        0
                      )
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpandableTable;
