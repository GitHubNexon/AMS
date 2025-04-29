import React, { useState, useEffect, useRef } from "react";
import BankReconApi from "../api/BankReconApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { showToast } from "../utils/toastNotifications";
import { CiCircleRemove } from "react-icons/ci";

const Transaction = ({
  mode,
  startDate,
  endDate,
  SLCODE,
  ACCTCODE,
  onSelectTransactions,
  transactions: initialTransactions,
}) => {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [SLDOCNO, setSLDOCNO] = useState([]);
  const [inputValue, setInputValue] = useState("");
  console.log("Mode in Transactions:", mode);
  const [showAdjustment, setShowAdjustment] = useState(false); // Toggle state

  const [isMaximized, setIsMaximized] = useState(false);
  const scrollContainerRef = useRef(null);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const fetchTransactions = async () => {
    if (!startDate || !endDate || !SLCODE || !ACCTCODE) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await BankReconApi.getTransactions({
        startDate,
        endDate,
        SLCODE,
        ACCTCODE,
      });

      console.log("API Response:", data);
      setTransactions(data.transactions || []);
      setTotalCount(data.transactions ? data.transactions.length : 0);
      onSelectTransactions(data.transactions);
    } catch (error) {
      setError("Error fetching transactions.");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const { data } = await BankReconApi.getUnRecordedTransaction({
        SLDOCNO,
        SLCODE,
        ACCTCODE,
      });

      if (data.transactions && data.transactions.length > 0) {
        setTransactions((prev) => {
          const updatedTransactions = [...data.transactions, ...prev];
          setTotalCount(updatedTransactions.length);
          setSLDOCNO("");

          const uniqueTransactions = Array.from(
            new Map(updatedTransactions.map((t) => [t._id, t])).values()
          );

          return uniqueTransactions;
        });
      } else {
        console.log("No new transactions fetched.");
      }
    } catch (error) {
      console.error("Error fetching unrecorded transactions:", error);

      // Extract error message
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred.";

      // Check if it matches the specific error message
      if (
        errorMessage ===
        "An unrecorded transaction already exists for this SLDOCNO in BankReconModel."
      ) {
        showToast("Already reconciled for this SLDOCNO", "error");
      } else {
        showToast("An unexpected error occurred. Please try again.", "error");
      }
    }
  };

  const handleRemoveTransaction = (id) => {
    setTransactions((prev) => {
      const updatedTransactions = prev.filter(
        (transaction) => !(transaction._id === id && transaction.isUnrecorded)
      );
      setTotalCount(updatedTransactions.length);
      onSelectTransactions(updatedTransactions);
      return updatedTransactions;
    });
  };

  useEffect(() => {
    setTransactions(initialTransactions || []);
    setTotalCount(initialTransactions ? initialTransactions.length : 0);

    if (initialTransactions && initialTransactions.length > 0 && page === 0) {
      setPage(1);
    }
  }, [initialTransactions, limit]);

  useEffect(() => {
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalCount, limit, page]);

  useEffect(() => {
    if (startDate && endDate && SLCODE && ACCTCODE) {
      fetchTransactions();
    }
  }, [startDate, endDate, SLCODE, ACCTCODE]);

  // function checkRow(e, transaction) {
  //   setSelected((prevSelected) => {
  //     if (e.target.checked) {
  //       return [...prevSelected, transaction];
  //     } else {
  //       return prevSelected.filter((f) => f._id !== transaction._id);
  //     }
  //   });
  // }

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAllChecked(isChecked);

    const updatedTransactions = transactions.map((transaction) => ({
      ...transaction,
      isReconciled: selectAllChecked,
      clearedAmount: isChecked
        ? transaction.SLDEBIT > 0
          ? transaction.SLDEBIT
          : transaction.SLCREDIT > 0
          ? transaction.SLCREDIT
          : 0
        : 0,
    }));

    setSelected(selectAllChecked ? updatedTransactions : []);
    onSelectTransactions(updatedTransactions);
    return updatedTransactions;
  };

  function checkRow(e, transaction) {
    // Update transactions with the new isReconciled and clearedAmount values
    setTransactions((prevTransactions) => {
      const updatedTransactions = prevTransactions.map((t) =>
        t._id === transaction._id
          ? {
              ...t,
              isReconciled: e.target.checked, // Set isReconciled to true when checked
              clearedAmount:
                e.target.checked &&
                (t.SLDEBIT > 0 ? t.SLDEBIT : t.SLCREDIT > 0 ? t.SLCREDIT : 0),
            }
          : t
      );

      setSelectAllChecked(updatedTransactions);

      onSelectTransactions(updatedTransactions);

      return updatedTransactions; // Update the state with the modified transactions
    });
  }

  useEffect(() => {
    console.log("Updated Selected Transactions", selected);
  }, [selected]);

  const handlePageChange = (direction) => {
    setPage((prevPage) => {
      if (direction === "next" && prevPage * limit < totalCount)
        return prevPage + 1;
      if (direction === "prev" && prevPage > 1) return prevPage - 1;
      return prevPage;
    });
  };

  // Slice the transactions to show only the current page
  const renderTableRows = () => {
    const currentTransactions = transactions.slice(
      (page - 1) * limit,
      page * limit
    );

    return currentTransactions.map((transaction, index) => (
      <tr
        key={`${transaction._id}-${index}`}
        className={`text-[0.9em]  
    ${
      transaction.isReconciled && transaction.isUnrecorded
        ? "bg-yellow-500 text-black"
        : ""
    }
    ${
      transaction.isReconciled && !transaction.isUnrecorded
        ? "bg-green-500 text-white"
        : ""
    }
    ${
      !transaction.isReconciled && transaction.isOutstanding
        ? "bg-gray-500 text-white"
        : ""
    }
  `}
      >
        {/* <td className="border-r p-1 text-center">

          <input
            type="checkbox"
            checked={transaction.isReconciled || false} // Keep track of isReconciled state
            onChange={(e) => checkRow(e, transaction)}
          />
        </td>

        <td className="border-r p-1 text-center">
          {transaction.isUnrecorded && (
            <button
              className="bg-red-500 text-white px-2 py-1 text-sm rounded"
              onClick={(e) => {
                e.preventDefault();
                handleRemoveTransaction(transaction._id);
              }}
            >
              <CiCircleRemove />
            </button>
          )}
        </td> */}

        <td className="border-r p-1 text-center">
          <div className="flex items-center justify-center space-x-2">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={transaction.isReconciled || false}
              onChange={(e) => checkRow(e, transaction)}
            />

            {/* Remove Button - Only show if transaction.isUnrecorded is true */}
            {/* {transaction.isUnrecorded && mode !== "edit" && ( */}
            {transaction.isUnrecorded && (
              <button
                className=" text-red-500 px-2 py-1 text-sm rounded"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveTransaction(transaction._id);
                }}
              >
                <CiCircleRemove size={20} />
              </button>
            )}
          </div>
        </td>

        <td className="py-2 px-4 border max-w-40">{transaction.SLCODE}</td>
        <td className="py-2 px-4 border max-w-40">{transaction.ACCTCODE}</td>
        <td className="py-2 px-4 border max-w-40">{transaction.ACCOUNTNAME}</td>
        <td className="py-2 px-4 border max-w-40">
          {formatReadableDate(transaction.SLDATE)}
        </td>
        <td className="py-2 px-4 border max-w-40">{transaction.EntryType}</td>
        <td className="py-2 px-4 border max-w-40">{transaction.SLDOCNO}</td>
        <td className="py-2 px-4 border max-w-72">
          {transaction.PaymentEntity?.name}
        </td>
        <td className="py-2 px-4 border max-w-72">{transaction.SLDESC}</td>
        <td className="py-2 px-4 border max-w-32">{transaction.CheckNo}</td>

        <td className="py-2 px-4 border">
          {numberToCurrencyString(transaction.SLDEBIT || 0)}
        </td>
        <td className="py-2 px-4 border">
          {numberToCurrencyString(transaction.SLCREDIT || 0)}
        </td>
        {/* {transaction.isReconciled && (
          <td className="py-2 px-4 border">
            {numberToCurrencyString(transaction.clearedAmount || 0)}
          </td>
        )} */}
      </tr>
    ));
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
          } bg-white shadow-lg rounded-md w-full transition-all duration-300 `}
        >
          <div className="flex justify-between items-center p-2 ">
            <p className="text-gray-600 text-[0.8em] font-bold bg-green-200 rounded-md p-2 cursor-pointer ">
              Transaction
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleMaximize();
              }}
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
              isMaximized ? "max-h-[65vh] " : "h-60"
            } overflow-y-auto`}
            ref={scrollContainerRef}
          >
            <div className="mx-auto p-4">
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              <div className="flex justify-start items-center p-2 space-x-2">
                <input
                  type="text"
                  value={SLDOCNO}
                  onChange={(e) => setSLDOCNO(e.target.value)}
                  placeholder="Enter SLDOCNO"
                  className="border p-2"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddTransaction();
                  }}
                  className="bg-blue-500 text-white px-4 py-2"
                >
                  Add
                </button>
              </div>
              <div className="h-[75vh] text-[0.7em]">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100 sticky top-0 mt-10">
                    <tr>
                      <th className="py-2 px-4 border">
                        <input
                          type="checkbox"
                          checked={
                            transactions.length > 0 &&
                            transactions.every((t) => t.isReconciled)
                          }
                          onChange={(e) => handleSelectAll(e)}
                        />
                      </th>
                      {/* <th className="py-2 px-4 border">Select</th> */}
                      <th className="py-2 px-4 border">SLCODE</th>
                      <th className="py-2 px-4 border">ACCTCODE</th>
                      <th className="py-2 px-4 border">ACCOUNT NAME</th>
                      <th className="py-2 px-4 border">SLDATE</th>
                      <th className="py-2 px-4 border">SLDOCCODE</th>
                      <th className="py-2 px-4 border">SLDOCNO</th>
                      <th className="py-2 px-4 border">Payee</th>
                      <th className="py-2 px-4 border">SLDESC</th>
                      <th className="py-2 px-4 border">Check No.</th>
                      <th className="py-2 px-4 border">SLDEBIT</th>
                      <th className="py-2 px-4 border">SLCREDIT</th>
                      {/* <th className="py-2 px-4 border">Cleared Amount</th> */}
                    </tr>
                  </thead>
                  <tbody>{renderTableRows()}</tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 p-2">
            <div>
              <span>Total Transactions: {totalCount}</span>{" "}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange("prev");
                }}
                className="p-2 bg-gray-200 rounded-lg disabled:bg-gray-400"
                disabled={page === 1}
              >
                <FaArrowLeft />
              </button>
              <span>
                Page {page} of {Math.ceil(totalCount / limit)}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange("next");
                }}
                className="p-2 bg-gray-200 rounded-lg disabled:bg-gray-400"
                disabled={page === Math.ceil(totalCount / limit)}
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transaction;
