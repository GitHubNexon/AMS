import React, { useRef } from "react";
import { FaFileAlt, FaTimes } from "react-icons/fa";
import {
  formatReadableDate,
  numberToCurrencyString,
} from "../../helper/helper";

const AssetsPRForm = ({ isOpen, onClose, data }) => {
  // A ref to the part of the component we want to print
  const printRef = React.useRef();

  // Function to handle the print action
  const handlePrint = () => {
    const printableContent = printRef.current.innerHTML;

    // Create a new hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // Write the content to the iframe
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Purchase Request</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
              /* Ensure table borders are visible when printing */
              table, th, td {
                border-color: #000 !important;
              }
            }
          </style>
        </head>
        <body onload="window.print(); setTimeout(function() { window.close(); }, 100);">
          ${printableContent}
        </body>
      </html>
    `);
    doc.close();

    // Clean up the iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  };

  // Guard clause for when the modal is not open
  if (!isOpen || !data) {
    return null;
  }

  // Ensure items is an array
  const items = Array.isArray(data.items) ? data.items : [];

  // Create an array of 20 rows, filling with item data or empty cells
  const tableRows = Array.from({ length: 20 }, (_, index) => {
    const item = items[index];
    if (item) {
      return (
        <tr key={item._id?.$oid || index} className="border border-black">
          <td className="border border-black p-1 text-center text-sm">
            {item.propertyNo || ""}
          </td>
          <td className="border border-black p-1 text-center text-sm">
            {item.unit || ""}
          </td>
          <td className="border border-black p-1 text-sm">
            {item.description || ""}
          </td>
          <td className="border border-black p-1 text-center text-sm">
            {item.quantity || ""}
          </td>
          <td className="border border-black p-1 text-right text-sm">
            {numberToCurrencyString(item.unitCost)}
          </td>
          <td className="border border-black p-1 text-right text-sm">
            {numberToCurrencyString(item.totalCost)}
          </td>
        </tr>
      );
    }
    // Render empty rows to ensure there are always 20
    return (
      <tr key={`empty-${index}`} className="border border-black h-8">
        <td className="border border-black">&nbsp;</td>
        <td className="border border-black">&nbsp;</td>
        <td className="border border-black">&nbsp;</td>
        <td className="border border-black">&nbsp;</td>
        <td className="border-black border">&nbsp;</td>
        <td className="border border-black">&nbsp;</td>
      </tr>
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="w-[70vw] h-auto max-h-[90vh] overflow-y-scroll my-10 rounded-lg shadow-lg bg-white">
        {/* Header for controls - will not be printed */}
        <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-gray-200 no-print z-10">
          <div className="flex items-center">
            <FaFileAlt className="text-blue-600 mr-2" size={20} />
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow"
            >
              Print
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* This is the content that will be printed */}
        <div ref={printRef} className="p-7">
          <h1 className="text-center font-bold text-2xl mb-4">
            PURCHASE REQUEST
          </h1>

          <table className="w-full border-collapse border border-black mb-1">
            <tbody>
              <tr>
                <td className="border border-black p-0" colSpan="3">
                  <div className="flex">
                    <div className="w-1/2 p-2 border-r border-black">
                      <span className="font-bold">Entity Name:</span>{" "}
                      {data.entityName || "_________________"}
                    </div>
                    <div className="w-1/2 p-2">
                      <span className="font-bold">Fund Cluster:</span>{" "}
                      {data.fundCluster || "_________________"}
                    </div>
                  </div>
                </td>
              </tr>

              {/* ROW 2: Unchanged, defines the three-column structure */}
              <tr>
                {/* Column 1 */}
                <td className="border border-black p-2">
                  <span className="font-bold">Office/Section:</span>{" "}
                  {data.officeSection || "_________________"}
                </td>

                {/* Column 2 */}
                <td className="border border-black p-2">
                  <div>
                    <span className="font-bold">PR No.:</span>{" "}
                    {data.prNo || "_________________"}
                  </div>
                  <div>
                    <span className="font-bold">
                      Responsibility Center Code:
                    </span>{" "}
                    {data.ResponsibilityCenterCode || "_________________"}
                  </div>
                </td>

                {/* Column 3 */}
                <td className="border border-black p-2">
                  <span className="font-bold">Date:</span>{" "}
                  {formatReadableDate(data.prDate)}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="border border-black bg-gray-100">
                <th className="border border-black p-1 w-[10%]">
                  Property No.
                </th>
                <th className="border border-black p-1 w-[10%]">Unit</th>
                <th className="border border-black p-1 w-[40%]">Description</th>
                <th className="border border-black p-1 w-[10%]">Quantity</th>
                <th className="border border-black p-1 w-[15%]">Unit Cost</th>
                <th className="border border-black p-1 w-[15%]">Total Cost</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
            <tfoot>
              <tr className="border border-black">
                <td className="p-2" colSpan="6">
                  <span className="font-bold">Purpose:</span>
                  <p className="whitespace-pre-wrap">{data.purpose || "-"}</p>
                </td>
              </tr>
            </tfoot>
          </table>

          <table className="w-full mt-1">
            <tbody>
              <tr>
                <td className="w-1/2 align-top p-2 border border-black">
                  <div className="font-bold">Requested By:</div>
                  <div className="mt-8">
                    <span className="font-bold">Signature:</span>
                    <span className="inline-block w-3/4 border-b border-black"></span>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold">Printed Name:</span>
                    <span className="inline-block w-3/4 border-b border-black"></span>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold">Designation:</span>
                    <span className="inline-block w-3/4 border-b border-black"></span>
                  </div>
                </td>
                <td className="w-1/2 align-top p-2 border border-black">
                  <div className="font-bold">Approved By:</div>
                  <div className="mt-8">
                    <span className="font-bold">Signature:</span>
                    <span className="inline-block w-3/4 border-b border-black"></span>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold">Printed Name:</span>
                    <span className="inline-block w-3/4 border-b border-black text-center font-semibold">
                      {data.ApprovedBy1?.name || ""}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="font-bold">Designation:</span>
                    <span className="inline-block w-3/4 border-b border-black"></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetsPRForm;
