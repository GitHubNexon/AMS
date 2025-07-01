import React from "react";
import { FaFileAlt, FaTimes } from "react-icons/fa";
import { formatReadableDate, numberToCurrencyString } from "../../helper/helper";

const PARReturn= ({ isOpen, onClose, employeeAssetsData }) => {
  if (!isOpen || !employeeAssetsData) return null;

  const {
    entityName,
    fundCluster,
    parNo,
    assetRecords,
    ApprovedBy1,
    employeeName,
    employeePosition,
  } = employeeAssetsData;

  const totalAmount = assetRecords.reduce(
    (total, record) => total + record.amount,
    0
  );

  const handlePrint = () => {
    const printContent = document.getElementById("print-content").innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow || iframe;
    const iframeDoc = iframeWindow.document;

    iframeDoc.open();
    iframeDoc.write("<html><head><title>Print</title>");

    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach((style) => {
      const clonedStyle = style.cloneNode(true);
      iframeDoc.head.appendChild(clonedStyle);
    });

    iframeDoc.write(`
      <style>
        @media print {
          .no-print { display: none; }
          body { 
            font-size: 9pt; 
            margin: 5mm; 
            width: 190mm; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            table-layout: fixed; 
            font-size: 8pt; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 2px 3px; 
            word-wrap: break-word; 
            overflow-wrap: break-word; 
          }
          th { 
            white-space: normal; 
          }
          .signatory-box { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 15px; 
          }
          .signatory { 
            width: 45%; 
            text-align: center; 
          }
          .signatory p { 
            margin: 3px 0; 
            font-size: 8pt; 
          }
          .signature-line { 
            border-top: 1px solid #000; 
            margin: 8px 0; 
          }
          .header-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 1.5rem; 
            margin-bottom: 1.5rem; 
          }
          @page { 
            size: A4; 
            margin: 5mm; 
          }
          .overflow-x-auto { 
            max-width: 100%; 
            overflow: hidden; 
          }
        }
      </style>
    `);

    iframeDoc.write("</head><body>");
    iframeDoc.write(printContent);
    iframeDoc.write("</body></html>");
    iframeDoc.close();

    iframe.onload = () => {
      iframeWindow.focus();
      iframeWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="w-[70vw] h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg bg-white p-7 text-[0.8rem]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
          <div className="flex items-center">
            <FaFileAlt className="text-blue-600 mr-2" size={20} />
            <h2 className="text-xl font-bold text-gray-800 mr-5">PAR FORM Return</h2>
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Print
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 no-print"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div id="print-content">
            {/* ICS Header Information */}
            <div className="header-grid grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Entity Name:</label>
                  <span className="font-semibold text-gray-800">
                    {entityName}
                  </span>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Fund Cluster:</label>
                  <span className="font-semibold text-gray-800">
                    {fundCluster}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">PAR No:</label>
                  <span className="font-semibold text-gray-800">{parNo}</span>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Date:</label>
                  <span className="font-semibold text-gray-800">
                    {formatReadableDate(new Date())}
                  </span>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 border text-left">Quantity</th>
                    <th className="py-2 px-3 border text-left">Unit</th>
                    <th className="py-2 px-3 border text-left">Description</th>
                    <th className="py-2 px-3 border text-left">
                      Inventory Item No
                    </th>
                    {/* <th className="py-2 px-3 border text-left">
                      Estimated Useful Life
                    </th> */}
                    <th className="py-2 px-3 border text-right">Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {assetRecords &&
                    assetRecords.map((asset, index) => (
                      <tr
                        key={asset._id || index}
                        className={index % 2 === 0 ? "bg-gray-50" : ""}
                      >
                        <td className="py-2 px-3 border">{asset.quantity}</td>
                        <td className="py-2 px-3 border">{asset.unit}</td>
                        <td className="py-2 px-3 border">
                          {asset.description}
                        </td>
                        <td className="py-2 px-3 border">{asset.itemNo}</td>
                        {/* <td className="py-2 px-3 border">
                          {asset.useFullLife}
                        </td> */}
                        <td className="py-2 px-3 border text-right">
                          {numberToCurrencyString(asset.amount)}
                        </td>
                      </tr>
                    ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="4" className="py-2 px-3 border text-right">
                      Total:
                    </td>
                    <td className="py-2 px-3 border text-right">
                      {numberToCurrencyString(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatories */}
            <div className="signatory-box flex justify-between mt-10">
              <div className="signatory w-[45%] text-center">
                <p className="text-sm text-gray-600">Approved By:</p>
                <div className="signature-line h-10 border-t border-gray-800 mt-2"></div>
                <p className="font-semibold text-gray-800 mt-2">
                  {ApprovedBy1.name}
                </p>
                <p className="text-sm text-gray-600">
                  Signature over Printed Name
                </p>
                <p className="text-sm text-gray-600">
                  Position: {ApprovedBy1.position}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatReadableDate(new Date())}
                </p>
              </div>
              {/* <div className="signatory w-[45%] text-center">
                <p className="text-sm text-gray-600">Received By:</p>
                <div className="signature-line h-10 border-t border-gray-800 mt-2"></div>
                <p className="font-semibold text-gray-800 mt-2">
                  {employeeName}
                </p>
                <p className="text-sm text-gray-600">
                  Signature over Printed Name
                </p>
                <p className="text-sm text-gray-600">
                  Position: {employeePosition}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatReadableDate(new Date())}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PARReturn;
