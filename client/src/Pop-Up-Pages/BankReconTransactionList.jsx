import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import { formatReadableDate, numberToCurrencyString } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import { usePDF } from "react-to-pdf";
import moment from "moment";
import ExportApi from "../api/ExportApi";


const BankReconTransactionList = ({ isOpen, onClose, bankRecon }) => {
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

  const handleExportExcel = () => {

    const exportData = {
      bankRecon
    };

    ExportApi.exportTransactionList(exportData.bankRecon)
      .then(() => {
        showToast("Export successful!", "success");
      })
      .catch((error) => {
        console.error("Export failed", error);
        showToast("Export failed. Please try again.", "error");
      });
  };

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
      <div className="w-full h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg">
        <div
          className="bg-white p-7 text-[0.7rem]"
          id="DvToPrint"
          ref={targetRef}
        >
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
              <button
                onClick={handleExportExcel}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Export to Excel
              </button>
            </div>

            <button onClick={handleClose} className="text-gray-500 no-print">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="overflow-auto mt-5">
            <div className="flex flex-col items-start mb-4">
              <span className="text-[0.8em]">NATIONAL DEVELOPMENT COMPANY</span>
              <span className="text-[0.8em]">TRANSACTION LIST</span>
              <span className="text-[0.8em]">
                {moment(bankRecon.bankStatement.endDate).format("YYYY-MM-DD")}
              </span>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300 text-[0.8em]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-2 py-1"></th>
                  <th className="border border-gray-300 px-2 py-1">SLCODE</th>
                  <th className="border border-gray-300 px-2 py-1">ACCTCODE</th>
                  <th className="border border-gray-300 px-2 py-1">
                    ACCOUNT NAME
                  </th>
                  <th className="border border-gray-300 px-2 py-1">SLDATE</th>
                  <th className="border border-gray-300 px-2 py-1">
                    ENTRY TYPE
                  </th>
                  <th className="border border-gray-300 px-2 py-1">SLDOCNO</th>
                  <th className="border border-gray-300 px-2 py-1">
                    DESCRIPTION
                  </th>
                  <th className="border border-gray-300 px-2 py-1">CHECK NO</th>
                  <th className="border border-gray-300 px-2 py-1">DEBIT</th>
                  <th className="border border-gray-300 px-2 py-1">CREDIT</th>
                </tr>
                <tr className="bg-green-300 font-bold">
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                  <td className="border border-gray-300 px-2 py-1">
                    {" "}
                    BEGINNING BALANCE
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right"></td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {numberToCurrencyString(
                      bankRecon.bankStatement.bookBegBalance
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 py-1"></td>
                </tr>
                <tr className="bg-gray-300 font-bold">
                  <td
                    className="border border-gray-300 px-2 py-1"
                    colSpan="9"
                    align="right"
                  >
                    Total:
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {numberToCurrencyString(
                      bankRecon.bankReconTotal.debit.totalAmount
                    )}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {numberToCurrencyString(
                      bankRecon.bankReconTotal.credit.totalAmount
                    )}
                  </td>
                </tr>
              </thead>
              <tbody>
                {bankRecon.transactions.map((transaction, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {transaction.SLCODE}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {transaction.ACCTCODE}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                      {transaction.ACCOUNTNAME}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                      {formatReadableDate(transaction.SLDATE)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {transaction.EntryType}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                      {transaction.SLDOCNO}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {transaction.SLDESC}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {transaction.CheckNo}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      {numberToCurrencyString(transaction.SLDEBIT || 0)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      {numberToCurrencyString(transaction.SLCREDIT || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankReconTransactionList;
