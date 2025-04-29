import React from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import { usePDF } from "react-to-pdf";
import moment from "moment";
import { formatReadableDate, numberToCurrencyString } from "../helper/helper";

const OutstandingTransaction = ({ isOpen, data, onClose }) => {
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

  if (!isOpen || !data || data.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-[70vw] h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg bg-white p-7 text-[0.8rem]">
        <div
          className="bg-white p-7 text-[0.6rem]"
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
            </div>

            <button onClick={handleClose} className="text-gray-500 no-print">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="text-center font-bold mt-10">
            <p className="text-[1.5em]">NATIONAL DEVELOPMENT COMPANY</p>
            <p className="text-[1.5em]">SUMMARY OF RECONCILING ITEMS</p>
            <p className="text-[1.5em]">
              {data?.endDate ? formatReadableDate(data.endDate) : "NO DATE"}
            </p>
          </div>
          <div className="overflow-auto">
            <h2 className="text-lg font-bold mb-4">Outstanding Checks</h2>
            <table className="w-full border-collapse border border-gray-300 text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-4 ">Date</th>
                  <th className="border p-2">Document No</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Payee</th>
                  <th className="border p-2">Check No</th>
                  <th className="border p-2">Debit</th>
                  <th className="border p-2">Credit</th>
                </tr>
              </thead>
              <tbody>
                {data?.transactions?.map((transaction) => (
                  <tr key={transaction._id} className="border">
                    <td className="border p-2 whitespace-nowrap">
                      {formatReadableDate(transaction.SLDATE)}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {transaction.SLDOCNO}
                    </td>
                    <td className="border p-2">{transaction.SLDESC}</td>
                    <td className="border p-2">
                      {transaction.PaymentEntity?.name}
                    </td>
                    <td className="border p-2">{transaction.CheckNo || "-"}</td>
                    <td className="border p-2">
                      {numberToCurrencyString(transaction.SLDEBIT || 0)}
                    </td>
                    <td className="border p-2">
                      {numberToCurrencyString(transaction.SLCREDIT || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td colSpan="5" className="border p-2 text-right">
                    Total Outstanding Checks as Of:
                  </td>
                  <td className="border p-2">
                    {numberToCurrencyString(data?.totalSLDEBIT || 0)}
                  </td>
                  <td className="border p-2">
                    {numberToCurrencyString(data?.totalSLCREDIT || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutstandingTransaction;
