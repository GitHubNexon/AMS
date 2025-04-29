import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import { formatReadableDate, numberToCurrencyString } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import { usePDF } from "react-to-pdf";
const BankReconPreview = ({ isOpen, onClose, bankRecon }) => {
  const getUnrecordedTotal = (transactions) => {
    return transactions
      .filter((transaction) => transaction.isUnrecorded)
      .reduce((sum, transaction) => sum + transaction.clearedAmount, 0);
  };
  const unrecordedTotal = getUnrecordedTotal(bankRecon.transactions);

  // const getAdjustment = (unrecordedTotal, adjustedAmount) => {
  //   if (unrecordedTotal === 0) {
  //     return adjustedAmount;
  //   }

  //   return unrecordedTotal + adjustedAmount;
  // };

  // const getOutstandingTotal = (transactions) => {
  //   return transactions
  //     .filter((transaction) => transaction.isOutstanding)
  //     .reduce(
  //       (sum, transaction) => sum + transaction.SLDEBIT + transaction.SLCREDIT,
  //       0
  //     );
  // };
  // const outstandingTotal = getOutstandingTotal(bankRecon.transactions);

  // const getAdjustedBalance = (bankRecon) => {
  //   if (!bankRecon || !bankRecon.bankStatement) return null;

  //   // PER BOOK Adjusted Balance
  //   const perBookAdjustedBalance =
  //     bankRecon.bankStatement.lastBalance +
  //     getUnrecordedTotal(bankRecon.transactions) +
  //     getAdjustment(unrecordedTotal, bankRecon.bankStatement.adjustedAmount);

  //   // PER BANK Adjusted Balance
  //   const perBankAdjustedBalance =
  //     bankRecon.bankStatement.endingBalance -
  //     getOutstandingTotal(bankRecon.transactions);

  //   return {
  //     perBook: perBookAdjustedBalance,
  //     perBank: perBankAdjustedBalance,
  //   };
  // };

  function formatDate(dateString) {
    return moment(dateString).format("MM/DD/YYYY");
  }

  const { toPDF, targetRef } = usePDF({
    options: {
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    },
    pdfOptions: {
      margin: [10, 10, 10, 10],
    },
  });

  const handlePreviewPrint = () => {
    if (!targetRef.current) {
      console.error("targetRef is not set");
      return;
    }

    const printContent = targetRef.current.innerHTML;

    // Create an iframe to isolate the print content
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();

    iframeDoc.write("<html><head><title>Print</title></head><body>");
    iframeDoc.write(printContent);
    iframeDoc.write("</body></html>");

    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach((style) => {
      const newStyle = iframeDoc.createElement(style.tagName);
      if (style.tagName.toLowerCase() === "link") {
        newStyle.setAttribute("rel", "stylesheet");
        newStyle.setAttribute("href", style.getAttribute("href"));
      } else {
        newStyle.innerHTML = style.innerHTML;
      }
      iframeDoc.head.appendChild(newStyle);
    });

    iframeDoc.close();

    iframe.contentWindow.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    iframe.contentWindow.onafterprint = () => {
      document.body.removeChild(iframe);
    };
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-[792px] h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg">
        <div
          className="bg-white p-7 text-[0.7rem]"
          id="DvToPrint"
          ref={targetRef}
        >
          {" "}
          <div className="flex flex-row justify-between  items-center space-x-2 sticky top-0 z-10 bg-gray-200 p-1 shadow-md no-print">
            <div className="flex items-start justify-between space-x-5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handlePreviewPrint();
                }}
                className="bg-green-500 text-white py-2 px-4 rounded no-print"
              >
                Print
              </button>
            </div>

            <button onClick={handleClose} className="text-gray-500 no-print">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="overflow-auto mt-5">
            <div className="flex item-center justify-center flex-col text-center space-y-1 ">
              <span className="text-[0.8em]">NATIONAL DEVELOPMENT COMPANY</span>
              <span className="text-[0.8em]">
                BANK RECONCILIATION STATEMENT
              </span>
              <span className="text-[0.8em]">
                ( LBP TORDESILLAS 5322110687)
              </span>
              <span className="text-[0.8em]">
                {formatReadableDate(bankRecon.bankStatement.endDate)}
              </span>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2"></th>
                    <th className="border border-gray-300 p-2">PER BOOK</th>
                    <th className="border border-gray-300 p-2">PER BANK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">
                      UNADJUSTED BALANCE
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {/* {numberToCurrencyString(
                        bankRecon.bankStatement.lastBalance
                      )} */}
                      {numberToCurrencyString(
                        bankRecon.bankReport.unadjustedBalance.perBook
                      ) || 0}
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {/* {numberToCurrencyString(
                        bankRecon.bankStatement.endingBalance
                      )} */}
                      {numberToCurrencyString(
                        bankRecon.bankReport.unadjustedBalance.perBank
                      ) || 0}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100 ">
                    <td className="border border-gray-300 p-2">
                      ADD (DEDUCT) RECONCILING ITEMS:
                    </td>
                    <td className="border border-gray-300 p-2 text-end"></td>
                    <td className="border border-gray-300 p-2 text-end"></td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 text-end">
                      {bankRecon.bankStatement.remarks}
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {numberToCurrencyString(
                        bankRecon.bankReport.unrecordedAmount ?? 0
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-end"></td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 text-end">
                      UNRECORDED COLLECTIONS
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {numberToCurrencyString(unrecordedTotal || 0)}
                    </td>

                    <td className="border border-gray-300 p-2 text-end"></td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 text-end">
                      OUTSTANDING CHECKS
                    </td>
                    <td className="border border-gray-300 p-2 text-end"></td>
                    <td className="border border-gray-300 p-2 text-end">
                      {/* {numberToCurrencyString(outstandingTotal)} */}
                      {numberToCurrencyString(
                        bankRecon.bankReport.outstandingChecks
                      ) || 0}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">
                      ADJUSTED BALANCE
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {/* {" "}
                      {numberToCurrencyString(
                        getAdjustedBalance(bankRecon)?.perBook
                      )} */}
                      {numberToCurrencyString(
                        bankRecon.bankReport.adjustedBalance.perBook
                      ) || 0}
                    </td>
                    <td className="border border-gray-300 p-2 text-end">
                      {/* {numberToCurrencyString(
                        getAdjustedBalance(bankRecon)?.perBank
                      )} */}
                      {numberToCurrencyString(
                        bankRecon.bankReport.adjustedBalance.perBank
                      ) || 0}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 p-2 text-center">
                      Prepared by:
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      Reviewed by:
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      Approved by:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4 h-12 ">
                      <div className="text-center flex flex-col items-center justify-center">
                        <span>{bankRecon.PreparedBy.name}</span>
                        <span>{bankRecon.PreparedBy.position}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 h-12 ">
                      <div className="text-center flex flex-col items-center justify-center">
                        <span>{bankRecon.ReviewedBy.name}</span>
                        <span>{bankRecon.ReviewedBy.position}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 h-12">
                      <div className="text-center flex flex-col items-center justify-center">
                        <span>{bankRecon.ApprovedBy1.name}</span>
                        <span>{bankRecon.ApprovedBy1.position}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankReconPreview;
