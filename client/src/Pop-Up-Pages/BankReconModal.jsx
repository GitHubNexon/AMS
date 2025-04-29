import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatMMMDDYYYY } from "../helper/helper";
import BankReconApi from "../api/BankReconApi";
import SubledgerPicker from "../Components/SubledgerPicker";
import AccountPicker from "./../Components/AccountPicker";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import Transaction from "../Sub-pages/Transaction";
import moment from "moment";
import { useDataPreloader } from "../context/DataPreloader";
import CurrencyInput from "../Components/CurrencyInput";

const BankReconModal = ({
  isOpen,
  onClose,
  onSaveBankRecon,
  bankReconData,
  mode,
}) => {
  const { lastClosing } = useDataPreloader();
  const { user } = useAuth();

  const [formData, setFormData] = useState(() => ({
    statementNo: "",
    glAccount: { code: "", name: "" },
    slAccount: { slCode: "", name: "" },
    bankReport: "",
    bankStatement: {
      remarks: "",
      adjustedAmount: 0,
      bookBegBalance: 0,
      bookEndBalance: 0,
      bankEndBalance: 0,
      clearedBalance: 0,
      difference: 0,
      // endDate: new Date().toISOString().split("T")[0],
      endDate: "",
      // endDate: moment().endOf("month").format("YYYY-MM-DD"),
    },
    transactions: [],
    bankReconTotal: {
      debit: {
        totalNo: 0,
        totalAmount: 0,
      },
      credit: {
        totalNo: 0,
        totalAmount: 0,
      },
    },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    ApprovedBy1: { name: "", position: "", _id: "" },
    ReviewedBy: { name: "", position: "", _id: "" },
    reconciled: false,
    reconciledDate: moment().format("YYYY-MM-DD"),
    reconciliationNotes: "",
  }));
  const [selectedAccount, setSelectedAccount] = useState({
    code: "",
    name: "",
  });

  // bankReport;
  // useEffect(() => {
  //   const calculateBankReport = () => {
  //     let unrecordedAmount = 0;
  //     let outstandingChecks = formData.bankStatement.difference || 0;

  //     unrecordedAmount = formData.bankStatement.adjustedAmount;

  //     const unadjustedBalance = {
  //       perBook: formData.bankStatement.bookEndBalance,
  //       perBank: formData.bankStatement.bankEndBalance,
  //     };

  //     const adjustedBalance = {
  //       perBook: parseFloat(
  //         (formData.bankStatement.bookEndBalance + unrecordedAmount).toFixed(2)
  //       ),
  //       perBank: parseFloat(
  //         (formData.bankStatement.bankEndBalance - outstandingChecks).toFixed(2)
  //       ),
  //     };

  //     const updatedBankReport = {
  //       unadjustedBalance: {
  //         perBook: parseFloat(unadjustedBalance.perBook.toFixed(2)),
  //         perBank: parseFloat(unadjustedBalance.perBank.toFixed(2)),
  //       },
  //       unrecordedAmount: parseFloat(unrecordedAmount.toFixed(2)),
  //       outstandingChecks: parseFloat(outstandingChecks.toFixed(2)),
  //       adjustedBalance,
  //     };

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       bankReport: updatedBankReport,
  //     }));

  //     // Log the bankReport data
  //     console.log(updatedBankReport);
  //   };

  //   calculateBankReport();
  // }, [formData.transactions, formData.bankStatement]);

  useEffect(() => {
    const calculateBankReport = () => {
      let unrecordedAmount = Number(formData.bankStatement.adjustedAmount) || 0;
      let outstandingChecks = Number(formData.bankStatement.difference) || 0;

      const unadjustedBalance = {
        perBook: Number(formData.bankStatement.bookEndBalance) || 0,
        perBank: Number(formData.bankStatement.bankEndBalance) || 0,
      };

      const adjustedBalance = {
        perBook: parseFloat(
          (unadjustedBalance.perBook + unrecordedAmount).toFixed(2)
        ),
        perBank: parseFloat(
          (unadjustedBalance.perBank - outstandingChecks).toFixed(2)
        ),
      };

      const updatedBankReport = {
        unadjustedBalance: {
          perBook: parseFloat(unadjustedBalance.perBook.toFixed(2)),
          perBank: parseFloat(unadjustedBalance.perBank.toFixed(2)),
        },
        unrecordedAmount: parseFloat(unrecordedAmount.toFixed(2)),
        outstandingChecks: parseFloat(outstandingChecks.toFixed(2)),
        adjustedBalance,
      };

      setFormData((prevFormData) => ({
        ...prevFormData,
        bankReport: updatedBankReport,
      }));

      console.log(updatedBankReport);
    };

    calculateBankReport();
  }, [formData.transactions, formData.bankStatement]);


  //BookEndingBalance
  useEffect(() => {
    const fetchBookEndingBalance = async () => {
      if (!formData.bankStatement.endDate) return;

      try {
        const response = await BankReconApi.getBookEndingBalance({
          endDate: formData.bankStatement.endDate,
          SLCODE: formData.slAccount.slCode,
          ACCTCODE: formData.glAccount.code,
        });

        if (response.success && response.data) {
          const { bookEndingBalance } = response.data;

          // Update the formData with the fetched bookEndingBalance
          setFormData((prevFormData) => ({
            ...prevFormData,
            bankStatement: {
              ...prevFormData.bankStatement,
              bookEndBalance: bookEndingBalance, // Set bookEndBalance to the fetched value
            },
          }));
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch Book Ending Balance:", error);
      }
    };

    fetchBookEndingBalance();
  }, [
    formData.bankStatement.endDate,
    formData.slAccount.slCode,
    formData.glAccount.code,
  ]);
  

  //BookBeginningBalance

  useEffect(() => {
    const fetchBookBeginningBalance = async () => {
      if (!formData.bankStatement.endDate) return;

      try {
        const response = await BankReconApi.getBookBeginningBalance({
          endDate: formData.bankStatement.endDate,
          SLCODE: formData.slAccount.slCode,
          ACCTCODE: formData.glAccount.code,
        });

        if (response.success && response.data) {
          const { bookBeginningBalance } = response.data;

          setFormData((prevFormData) => ({
            ...prevFormData,
            bankStatement: {
              ...prevFormData.bankStatement,
              bookBegBalance: bookBeginningBalance, 
            },
          }));
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Failed to fetch Book Ending Balance:", error);
      }
    };

    fetchBookBeginningBalance();
  }, [
    formData.bankStatement.endDate,
    formData.slAccount.slCode,
    formData.glAccount.code,
  ]);

  const handleSelectedTransactions = (selectedTransactions) => {
    setFormData((prevData) => ({
      ...prevData,
      transactions: [...selectedTransactions],
    }));
  };

  const handleReconcile = async () => {
    if (
      formData.bankReport?.adjustedBalance?.perBook !==
      formData.bankReport?.adjustedBalance?.perBank
    ) {
      showToast("Adjusted Balance is not equal.", "warning");
      return false;
    }

    if (formData.bankStatement.bankEndBalance == 0) {
      showToast("Cannot reconcile the  Bank Ending Balance is 0", "error");
      return;
    }

    setFormData((prevData) => {
      const updatedTransactions = prevData.transactions.map((transaction) => {
        if (!transaction.isReconciled) {
          return { ...transaction, isOutstanding: true };
        }
        return transaction;
      });

      return {
        ...prevData,
        reconciled: true,
        transactions: updatedTransactions,
      };
    });

    showToast("Bank Reconciliation marked as reconciled!", "success");
  };

  const handleUnmarkReconcile = async () => {
    setFormData((prevData) => {
      const updatedTransactions = prevData.transactions.map((transaction) => {
        return { ...transaction, isOutstanding: false }; // Clear isOutstanding
      });

      return {
        ...prevData,
        reconciled: false,
        transactions: updatedTransactions, // Update transactions
      };
    });

    showToast("Bank Reconciliation unmarked!", "warning");
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      glAccount: selectedAccount,
    }));
  }, [selectedAccount]);

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  useEffect(() => {
    if (mode === "edit" && bankReconData) {
      const glAccount = bankReconData.glAccount || { code: "", name: "" };
      const slAccount = bankReconData.slAccount || { slCode: "", name: "" };
      console.log(bankReconData);
      const formattedDate = bankReconData.bankStatement.endDate
        ? new Date(bankReconData.bankStatement.endDate)
            .toISOString()
            .split("T")[0]
        : "";
      const formattedReconciledDate = bankReconData.reconciledDate
        ? new Date(bankReconData.reconciledDate).toISOString().split("T")[0]
        : "";
      setFormData({
        ...bankReconData,
        reconciledDate: formattedReconciledDate,
        bankStatement: {
          ...bankReconData.bankStatement,
          endDate: formattedDate,
        },
        glAccount: {
          code: glAccount.code || "",
          name: glAccount.name || "",
        },
        slAccount: {
          slCode: slAccount.slCode || "",
          name: slAccount.name || "",
        },
      });
    }
  }, [mode, bankReconData]);

  useEffect(() => {
    const debitTransactions = formData.transactions.filter(
      (transactions) =>
        transactions.isReconciled === true &&
        transactions.clearedAmount === transactions.SLDEBIT
    );

    const creditTransactions = formData.transactions.filter(
      (transactions) =>
        transactions.isReconciled === true &&
        transactions.clearedAmount === transactions.SLCREDIT
    );

    // Update the debit totals
    const debitTotalNo = debitTransactions.length;
    const debitTotalAmount = debitTransactions.reduce(
      (sum, transactions) => sum + (transactions.clearedAmount || 0),
      0
    );

    // Update the credit totals
    const creditTotalNo = creditTransactions.length;
    const creditTotalAmount = creditTransactions.reduce(
      (sum, transactions) => sum + (transactions.clearedAmount || 0),
      0
    );

    // Set the updated bankReconTotal values
    setFormData((prevData) => ({
      ...prevData,
      bankReconTotal: {
        debit: {
          totalNo: debitTotalNo,
          totalAmount: debitTotalAmount,
        },
        credit: {
          totalNo: creditTotalNo,
          totalAmount: creditTotalAmount,
        },
      },
    }));
  }, [formData.transactions]);


  useEffect(() => {
    const debitTransactions = formData.transactions.filter(
      (transactions) =>
        transactions.isReconciled === true &&
        transactions.clearedAmount === transactions.SLDEBIT
    );
  
    const creditTransactions = formData.transactions.filter(
      (transactions) =>
        transactions.isReconciled === true &&
        transactions.clearedAmount === transactions.SLCREDIT
    );
  
    // Get the bank statement data (accessing through formData)
    const bookBegBalance = formData.bankStatement?.bookBegBalance || 0;
  
    // Update the debit totals
    const debitTotalNo = debitTransactions.length;
    const debitTotalAmount = debitTransactions.reduce(
      (sum, transactions) =>
        sum + (transactions.clearedAmount || 0),
      0
    );
  
    // Update the credit totals
    const creditTotalNo = creditTransactions.length;
    const creditTotalAmount = creditTransactions.reduce(
      (sum, transactions) => sum + (transactions.clearedAmount || 0),
      0
    );

  
    // Set the updated bankReconTotal values
    setFormData((prevData) => ({
      ...prevData,
      bankReconTotal: {
        debit: {
          totalNo: debitTotalNo,
          totalAmount: debitTotalAmount + bookBegBalance,
          // totalAmount: debitTotalAmount + (prevData.bankReconTotal?.debit?.totalAmount ? 0 : bookBegBalance),
        },
        credit: {
          totalNo: creditTotalNo,
          totalAmount: creditTotalAmount,
        },
      },
    }));
    console.log("debitTotalAmount", debitTotalAmount)

  }, [formData.transactions, formData.bankStatement?.bookBegBalance]);
  

  
  
  useEffect(() => {
    const clearedBalanceSum = formData.transactions.reduce(
      (sum, transaction) => {
        if (transaction.isReconciled) {
          return sum + (transaction.SLDEBIT - transaction.SLCREDIT || 0);
        }
        return sum;
      },
      0
    );

    const difference =
      formData.bankStatement.bankEndBalance - clearedBalanceSum.toFixed(2);

    setFormData((prevData) => ({
      ...prevData,
      bankStatement: {
        ...prevData.bankStatement,
        clearedBalance: clearedBalanceSum,
        difference: difference,
      },
    }));
  }, [formData.transactions, formData.bankStatement.bankEndBalance]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name === "endDate") {
  //     const endDate = moment(value);
  //     const startDate = endDate.startOf("month");

  //     setFormData((prevData) => ({
  //       ...prevData,
  //       bankStatement: {
  //         ...prevData.bankStatement,
  //         [name]: value,
  //         endDate: value,
  //       },
  //       startDate: startDate.format("YYYY-MM-DD"),
  //     }));
  //   } else {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "reconciliationNotes"){
      setFormData((prevData) => ({
       ...prevData,
       reconciliationNotes: value,
      }));
    }

    if (name === "reconciledDate") {
      setFormData((prevData) => ({
        ...prevData,
        reconciledDate: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        bankStatement: {
          ...prevData.bankStatement,
          [name]: value,
        },
      }));
    }

    if (name === "endDate") {
      const endDate = moment(value);
      const startDate = endDate.startOf("month").format("YYYY-MM-DD");

      setFormData((prevData) => ({
        ...prevData,
        bankStatement: {
          ...prevData.bankStatement,
          endDate: value,
        },
        startDate,
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      glAccount: { code: "", name: "" },
      slAccount: { slCode: "", name: "" },
      bankStatement: {
        bookEndBalance: 0,
        bankEndBalance: 0,
        clearedBalance: 0,
        difference: 0,
        endDate: "",
      },
      reconciled: false,
      reconciledDate: moment().format("YYYY-MM-DD"),
      reconciliationNotes: "",
      reconciliationStatus: "",
    });
  };

  const validateForm = () => {
    if (!formData || !formData.bankStatement.bankEndBalance) {
      showToast("Bank Ending Balance is required.", "warning");
      return false;
    }
    if (!formData.ApprovedBy1) {
      showToast("ApprovedBy1 By is required.", "warning");
      return false;
    }

    if (
      formData.bankStatement.adjustedAmount &&
      !formData.bankStatement.remarks
    ) {
      showToast(
        "Remarks are required when Adjusted Amount is provided.",
        "warning"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Remove ApprovedBy1 or ApprovedBy2 if they're empty (to avoid server validation errors)
    if (!formData.ApprovedBy1?.name || !formData.ApprovedBy1?.position) {
      delete formData.ApprovedBy1;
    }

    try {
      if (mode === "edit") {
        console.log("updating data:", bankReconData._id, formData);
        await BankReconApi.updateBankReconciliation(
          bankReconData._id,
          formData
        );
        showToast("Bank Reconciliation update succesfully!", "success");
      } else {
        console.log("Creating new data:", formData);
        await BankReconApi.createBankReconciliation(formData);
        showToast("Bank Reconciliation created succesfully!", "success");
      }
      onSaveBankRecon(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Bank Reconciliation:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-6 rounded-lg w-full m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit"
              ? "Update BankRecon"
              : "Create Bank Reconciliation"}
          </h2>
          <button
            onClick={async () => {
              const confirmed = await showDialog.confirm(
                "Are you sure you want to close without saving?"
              );
              if (confirmed) {
                onClose();
              }
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={25} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={`space-y-4 max-h-[25rem] overflow-scroll ${
            formData.reconciled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 text-[0.7em] ${
              mode === "edit" ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="flex flex-col ">
              <label className="text-gray-700">Ledger</label>
              <AccountPicker
                selectedAccount={formData.glAccount}
                setSelectedAccount={(selectedAccount) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    glAccount: {
                      code: selectedAccount.code,
                      name: selectedAccount.name,
                    },
                  }));
                }}
                filter={[
                  "ASSETS",
                  "LIABILITIES",
                  "CAPITAL",
                  "REVENUES/INCOME",
                  "EXPENSES",
                ]}
              />
            </div>
            <div className="flex flex-col z-[20]">
              <label htmlFor="PaymentEntity" className="text-gray-700">
                Subledger
              </label>
              <SubledgerPicker
                slCode={formData.slAccount.slCode || ""}
                setSLCode={(slCode) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    slAccount: { ...prevData.slAccount, slCode },
                  }))
                }
                name={formData.slAccount.name || ""}
                setName={(name) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    slAccount: { ...prevData.slAccount, name },
                  }))
                }
                callback={() => console.log("SubledgerPicker refreshed!")}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.bankStatement.endDate}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="PreparedBy" className="text-gray-700">
                Prepared By
              </label>
              <SignatoriesPicker
                signatoryType="PreparedBy"
                value={formData.PreparedBy || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "PreparedBy")
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="ReviewedBy" className="text-gray-700">
                Reviewed By
              </label>
              <SignatoriesPicker
                signatoryType="ReviewedBy"
                value={formData.ReviewedBy || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ReviewedBy")
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="ApprovedBy1" className="text-gray-700">
                Approved By
              </label>
              <SignatoriesPicker
                signatoryType="ApprovedBy1"
                value={formData.ApprovedBy1 || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ApprovedBy1")
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="reconciliationNotes" className="text-gray-700">
                Reconciliation Notes
              </label>
              <textarea
                type="text"
                id="reconciliationNotes"
                name="reconciliationNotes"
                value={formData.reconciliationNotes}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="reconciledDate" className="text-gray-700">
                Reconciliation Date
              </label>
              <input
                type="date"
                id="reconciledDate"
                name="reconciledDate"
                value={formData.reconciledDate}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          <div className="sticky top-0 bg-white z-10 mb-10">
            {/* Bank Statement */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="debitTotalNo" className="text-gray-700">
                  Debit Total No
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {formData.bankReconTotal.debit.totalNo || 0}
                </p>
              </div>
              <div className="flex flex-col">
                <label htmlFor="debitTotalAmount" className="text-gray-700">
                  Debit Total Amount
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReconTotal.debit.totalAmount || 0
                  )}
                </p>
              </div>
              <div className="flex flex-col">
                <label htmlFor="creditTotalNo" className="text-gray-700">
                  Credit Total No
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {formData.bankReconTotal.credit.totalNo || 0}
                </p>
              </div>
              <div className="flex flex-col">
                <label htmlFor="creditTotalAmount" className="text-gray-700">
                  Credit Total Amount
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReconTotal.credit.totalAmount || 0
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 text-[0.7em] ">
            <div className="flex flex-col">
                <label htmlFor="bookBegBalance" className="text-gray-700">
                  Book Beginning Balance
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {formData.bankStatement.bookBegBalance !== null
                    ? numberToCurrencyString(formData.bankStatement.bookBegBalance)
                    : 0}
                </p>
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="bookEndBalance" className="text-gray-700">
                  Book Ending Balance
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {formData.bankStatement.bookEndBalance !== null
                    ? numberToCurrencyString(formData.bankStatement.bookEndBalance)
                    : 0}
                </p>
              </div>

              <div className="flex flex-col">
                <label htmlFor="Bank Ending Balance" className="text-gray-700">
                  Bank Ending Balance
                </label>
                <CurrencyInput
                  val={formData.bankStatement.bankEndBalance} // accessing the nested value
                  setVal={(value) =>
                    setFormData({
                      ...formData,
                      bankStatement: {
                        ...formData.bankStatement,
                        bankEndBalance: parseFloat(value),
                      },
                    })
                  }
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 "
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="adjustedAmount" className="text-gray-700">
                  Adjusted Amount
                </label>
                <CurrencyInput
                  val={formData.bankStatement.adjustedAmount}
                  setVal={(value) =>
                    setFormData({
                      ...formData,
                      bankStatement: {
                        ...formData.bankStatement,
                        adjustedAmount: parseFloat(value),
                      },
                    })
                  }
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 "
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="remarks" className="text-gray-700">
                  Remarks
                </label>
                <input
                  type="text"
                  id="remarks"
                  name="remarks"
                  value={formData.bankStatement.remarks}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="clearedBalance" className="text-gray-700">
                  Cleared Balance
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankStatement.clearedBalance
                  )}
                </p>
              </div>
              <div className="flex flex-col">
                <label htmlFor="difference" className="text-gray-700">
                  Difference
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(formData.bankStatement.difference)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 text-[0.7em]">
              {/* Unadjusted Balance (Per Book & Per Bank) */}
              <div className="flex flex-col">
                <label className="text-gray-700">
                  Unadjusted Balance (Per Book)
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.unadjustedBalance?.perBook || 0
                  )}
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">
                  Unadjusted Balance (Per Bank)
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.unadjustedBalance?.perBank || 0
                  )}
                </p>
              </div>

              {/* Unrecorded Amount */}
              <div className="flex flex-col">
                <label className="text-gray-700">Unrecorded Amount</label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.unrecordedAmount || 0
                  )}
                </p>
              </div>

              {/* Outstanding Checks */}
              <div className="flex flex-col">
                <label className="text-gray-700">Outstanding Checks</label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.outstandingChecks || 0
                  )}
                </p>
              </div>

              {/* Adjusted Balance (Per Book & Per Bank) */}
              <div className="flex flex-col">
                <label className="text-gray-700">
                  Adjusted Balance (Per Book)
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.adjustedBalance?.perBook || 0
                  )}
                </p>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700">
                  Adjusted Balance (Per Bank)
                </label>
                <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                  {numberToCurrencyString(
                    formData.bankReport?.adjustedBalance?.perBank || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Component */}
          <div className="mt-6  pt-4 ">
            <Transaction
              mode={mode}
              startDate={formData.startDate}
              endDate={formData.bankStatement.endDate}
              SLCODE={formData.slAccount.slCode}
              ACCTCODE={formData.glAccount.code}
              onSelectTransactions={handleSelectedTransactions}
              transactions={formData.transactions}
            />
          </div>
        </form>

          <>
            <div className="flex justify-end space-x-4 mt-6">
              {!formData.reconciled && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-red-600 text-white py-2 px-4 rounded-md"
                >
                  Reset
                </button>
              )}
              {formData.reconciled ? (
                <button
                  onClick={handleUnmarkReconcile}
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Unmark Reconciled
                </button>
              ) : (
                <button
                  onClick={handleReconcile}
                  type="button"
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Mark as Reconciled
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                {mode === "edit"
                  ? "Update Bank Reconciliation"
                  : "Save Bank Reconciliation"}
              </button>
            </div>
          </>
      
      </div>
    </div>
  );
};

export default BankReconModal;
