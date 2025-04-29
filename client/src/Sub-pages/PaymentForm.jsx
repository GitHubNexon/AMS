import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaWrench } from "react-icons/fa";
import { usePaymentFormLogic } from "../context/usePaymentFormLogic";

const PaymentForm = () => {
  const {
    selectedMode,
    ledgers,
    taxes,
    handlePaymentFormSubmit,
    handleAddLedger,
    handleDeleteLedger,
    handleAddTax,
    handleDeleteTax,
    handleReset,
  } = usePaymentFormLogic();

  const showOtherInput = selectedMode === "others";
  return (
    <>
      {/* Buttons */}
      {/* <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow-md">
        <Link to="/Payment" className="group flex items-center space-x-2">
          <FaArrowLeft
            size={40}
            className="p-2 bg-gray-200 text-gray-600 rounded-full group-hover:bg-green-500 group-hover:text-white transition-all duration-300"
          />
          <span className="text-gray-600 font-medium text-lg group-hover:text-green-500 transition-all duration-300">
            Go Back
          </span>
        </Link>

        <Link to="/Config" className="group flex items-center space-x-2">
          <FaWrench
            size={40}
            className="p-2 bg-gray-200 text-gray-600 rounded-full group-hover:bg-green-500 group-hover:text-white transition-all duration-300"
          />
          <span className="text-gray-600 font-medium text-lg group-hover:text-green-500 transition-all duration-300">
            Configuration
          </span>
        </Link>
      </div> */}

      <form className="space-y-8 p-4" onSubmit={handlePaymentFormSubmit}>
        {/* Main Information */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
          Main Information
        </h2>
        <div className="bg-gray-200 text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex flex-col justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400 text-white p-4 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="dvNo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dv No:
              </label>
              <input
                type="text"
                id="dvNo"
                placeholder="Enter Dv No"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="checkNo"
                className="block text-sm font-semibold mb-2 text-gray-700 "
              >
                Check No:
              </label>
              <input
                type="text"
                id="checkNo"
                placeholder="Enter Check No"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="dvDate"
                className="block text-sm font-semibold mb-2 text-gray-700"
              >
                DV Date:
              </label>
              <input
                type="date"
                id="dvDate"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="paymentEntity"
                className="block text-sm font-semibold mb-2 text-gray-700"
              >
                Payment Entity:
              </label>
              <select
                id="paymentEntity"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="entity1">Entity 1</option>
                <option value="entity2">Entity 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* LEDGERS & TAXES */}
        <div className="text-white p-4 rounded-md bg-gray-200 shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex flex-col justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400">
          <h2 className="text-lg font-semibold m-4 p-1 text-white bg-[#16a34a] rounded-md text-center">
            LEDGERS & TAXES
          </h2>
          <div className="flex justify-between items-center">
            <br />
            <div className="space-x-2">
              <button
                type="button"
                onClick={handleAddLedger}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 hover:scale-105 transform transition"
              >
                Add Ledger
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDeleteLedger(ledgers[ledgers.length - 1]?.id)
                }
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 hover:scale-105 transform transition"
              >
                Delete Ledger
              </button>
              <button
                type="button"
                onClick={handleAddTax}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 hover:scale-105 transform transition"
              >
                Add Tax
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTax(taxes[taxes.length - 1]?.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 hover:scale-105 transform transition"
              >
                Delete Tax
              </button>
            </div>
          </div>

          {/* Render Ledgers */}
          {ledgers.map((ledger) => (
            <div
              key={ledger.id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div>
                <label
                  htmlFor="ledgerType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Type
                </label>
                <select
                  id="ledgerType"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="cr">Cr</option>
                  <option value="dr">Dr</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="ledger"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  LEDGER
                </label>
                <select
                  id="ledger"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ledger1">LEDGER 1</option>
                  <option value="ledger2">LEDGER 2</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="subLedger"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SUB LEDGER
                </label>
                <select
                  id="subLedger"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="subledger1">SUB-LEDGER 1</option>
                  <option value="subledger2">SUB-LEDGER 2</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="total"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Total
                </label>
                <input
                  type="text"
                  id="total"
                  placeholder="Enter Total"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          ))}

          {/* Render Taxes */}
          {taxes.map((tax) => (
            <div
              key={tax.id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div>
                <label
                  htmlFor="taxLedger"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  LEDGER
                </label>
                <select
                  id="taxLedger"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ledger1">LEDGER 1</option>
                  <option value="ledger2">LEDGER 2</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="taxSubLedger"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SUB LEDGER
                </label>
                <select
                  id="taxSubLedger"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="subledger1">SUB-LEDGER 1</option>
                  <option value="subledger2">SUB-LEDGER 2</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="taxCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  TAX CODE
                </label>
                <input
                  type="text"
                  id="taxCode"
                  placeholder="Enter Tax Code"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label
                  htmlFor="taxBase"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  TAX BASE
                </label>
                <input
                  type="text"
                  id="taxBase"
                  placeholder="Enter Tax Base"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label
                  htmlFor="tax"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  TAX
                </label>
                <input
                  type="text"
                  id="tax"
                  placeholder="Enter Tax"
                  className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          ))}
        </div>

        <div className=" text-white p-4 rounded-md bg-gray-200 text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex flex-col  justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400">
          <h2 className="text-lg font-semibold m-4 p-1 text-white bg-[#16a34a] rounded-md">
            OTHERS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="particulars"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Particulars
              </label>
              <input
                type="text"
                id="particular"
                placeholder="Enter particular"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Attachment
              </label>
              <input
                type="file"
                id="file"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="preparedBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Prepared by
              </label>
              <select
                id="preparedBy"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reviewedBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reviewed by
              </label>
              <select
                id="reviewedBy"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="approvedBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Approved by
              </label>
              <select
                id="approvedBy"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="tag"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tag
              </label>
              <select
                id="tag"
                className="w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="reset"
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default PaymentForm;
