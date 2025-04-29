import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import { formatReadableDate, numberToCurrencyString, formatLedgers } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import { usePDF } from "react-to-pdf";
import PrintDV from "../Components/PrintDV";

const DVPreview = ({ isOpen, onClose, payment }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  const savedlogo = localStorage.getItem("logo");
  const [companyLogo, setCompanyLogo] = useState("");

  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem("checkedItems");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("checkedItems", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCheckboxChange = (item) => {
    const updatedCheckedItems = {
      ...checkedItems,
      [item]: !checkedItems[item],
    };
    setCheckedItems(updatedCheckedItems);
    localStorage.setItem("checkedItems", JSON.stringify(updatedCheckedItems));
  };

  const handleClose = () => {
    setCheckedItems({});
    localStorage.removeItem("checkedItems");
    onClose();
  };

  // Fetch company settings from the API
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/company-settings`);
        const settings = response.data;

        // Update the state with the fetched settings
        setCompanyName(settings.companyName || "");
        setCompanyEmail(settings.companyEmail || "");
        setCompanyPhone(settings.companyPhone || "");
        setCompanyWebsite(settings.companyWebsite || "");
        setStreetAddress(settings.streetAddress || "");
        setCity(settings.city || "");
        setRegion(settings.region || "");
        setBarangay(settings.barangay || "");
        setZipCode(settings.zipCode || "");
      } catch (error) {
        console.error("Error fetching company settings:", error);
      }
    };

    fetchCompanySettings();
  }, []);

  const formatCompanyAddress = () => {
    return `${streetAddress}, ${barangay}, ${city}, ${region}, ${zipCode}`;
  };

  const totalDebitLedger = payment.ledgers
    .filter((ledger) => ledger.type === "DR")
    .reduce((sum, ledger) => sum + (ledger.dr || 0), 0);

  const totalCreditLedger = payment.ledgers
    .filter((ledger) => ledger.type === "CR")
    .reduce((sum, ledger) => sum + (ledger.cr || 0), 0);

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

  const handleDirectPrint = () => {
    const DvContainer = document.getElementById("DvToPrint");
    const noPrintElements = DvContainer.querySelectorAll(".no-print");
    noPrintElements.forEach((element) => {
      element.style.display = "none";
    });
    toPDF().then((pdfBlob) => {
      noPrintElements.forEach((element) => {
        element.style.display = "";
      });
    });
  };
  const divRef = useRef();

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-[792px] h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg">
        <div
          className="bg-white p-7 text-[0.7rem]"
          id="DvToPrint"
          ref={targetRef}
        >
          <div className="flex flex-row justify-between  items-center space-x-2 sticky top-0 z-10 bg-gray-200 p-1 shadow-md no-print">
            <div className="flex items-start justify-between space-x-5">
              <PrintDV dv={payment} />
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  handlePreviewPrint();
                }}
                className="bg-green-500 text-white py-2 px-4 rounded no-print"
              >
                Print
              </button> */}
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDirectPrint();
                }}
                className="bg-green-500 text-white py-2 px-4 rounded no-print"
              >
                Direct Print
              </button> */}
            </div>

            <button onClick={handleClose} className="text-gray-500 no-print">
              <FaTimes size={20} />
            </button>
          </div>
          <hr className="border border-gray-100 m-5 no-print" />
          <div className="grid grid-cols-3 items-center w-full">
            <div className="flex items-center justify-start mb-4">
              <img
                src={"data:image/png;base64," + savedlogo}
                alt="Company Logo"
                className="cursor-pointer max-h-[50px]"
              />
            </div>

            <div className="flex flex-col items-center text-center">
              <h2 className="text-[1em] font-bold">{companyName}</h2>
              <p className="text-[0.9em] font-semibold">
                {formatCompanyAddress()}
              </p>
              <h3 className="text-[0.9em]">
                {companyEmail} | {companyPhone}
              </h3>
              <h4 className="text-[0.9em]">{companyWebsite}</h4>
            </div>
          </div>

          <div className="flex item-center justify-center border border-b mt-2 p-1 font-bold">
            DISBURSMENT VOUCHER
          </div>

          {/* 1 */}
          <div className="flex items-center justify-between border border-b p-1">
            <div className="flex flex-col w-[80%]">
              <h1 className="text-[0.9em] font-semibold">MODE OF PAYMENT</h1>
              <div className="flex space-x-4 mt-2">
                {["Check", "Draft", "Memo", "Others"].map((item) => (
                  <label key={item} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checkedItems[item] || false}
                      onChange={() => handleCheckboxChange(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col w-[20%] pl-1">
              <div className="flex">
                <p className="text-[0.8em] font-semibold mr-2">DV No:</p>
                <p className="text-[0.8em]">{payment.DVNo}</p>
              </div>
              <div className="flex">
                <p className="text-[0.8em] font-semibold mr-2">Check No:</p>
                <p className="text-[0.8em]">{payment.CheckNo}</p>
              </div>
              <div className="flex">
                <p className="text-[0.8em] font-semibold mr-2">Date:</p>
                <p className="text-[0.8em]">
                  {formatReadableDate(payment.DVDate)}
                </p>
              </div>
            </div>
          </div>

          {/* 2 */}
          <div className="flex items-center justify-between border border-b p-1">
            <div className="flex flex-col w-[60%]">
              <h1 className="text-[0.9em] font-semibold">Payee/Office:</h1>
              <p className="text-[0.8em]">{payment.PaymentEntity.name}</p>
            </div>
            <div className="flex flex-col w-[20%] pl-1">
              <h1 className="text-[0.9em] font-semibold">TIN / Employee No.</h1>
              <span className="text-[0.8em] font-normal break-words">
                {payment.PaymentEntity.tin}
              </span>
            </div>
            <div className="border-l h-12"></div>

            <div className="flex flex-col w-[20%] pl-1">
              <h1 className="text-[0.9em] font-semibold">
                Reference No. <span className="text-[0.9em] font-normal"></span>
              </h1>
              <h1 className="text-[0.9em] font-semibold">
                Date <span className="text-[0.9em] font-normal"></span>
              </h1>
            </div>
          </div>

          {/* 3 */}
          <div className="flex items-center justify-between border border-b p-1">
            <div className="flex flex-col w-[70%]">
              <h1 className="text-[0.9em] font-semibold">Address:</h1>
              <p className="text-[0.8em] font-normal break-words max-w-fit">
                {payment.PaymentEntity.address}
              </p>
            </div>
            <div className="border-l h-12"></div>
            <div className="flex flex-col w-[30%]">
              <h1 className="text-[0.9em] font-semibold text-center mb-4">
                Responsibility Center
              </h1>
              <div className="flex flex-row pl-1 justify-evenly space-x-4">
                <h1 className="text-[0.9em] font-semibold text-center">
                  Group:
                </h1>
                <h1 className="text-[0.9em] font-semibold text-start">Code:</h1>
              </div>
            </div>
          </div>

          {/* 4 */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              {/* Table Header */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-center bg-gray-200 border border-gray-300 w-[70%]">
                    PARTICULARS
                  </th>
                  <th className="px-4 py-2 text-center bg-gray-200 border border-gray-300 w-[30%]">
                    AMOUNT
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                <tr className="bg-white">
                  {/* Particulars Column */}
                  <td className="px-2 py-2 border border-gray-300 align-top">
                    <p className="text-[0.8em] font-normal">
                      {payment.Particulars}
                    </p>
                  </td>
                  <td className="px-2 py-2 border border-gray-300 align-top">
                    <ol className="list-decimal space-y-1 text-[0.9em]">
                      <li className="flex justify-between text-[0.9em] font-semibold">
                        <span>PHP</span>
                        <span className="text-[0.9em] font-bold">
                          {numberToCurrencyString(totalDebitLedger)}
                        </span>
                      </li>

                      {/* Loop through each ledger and render the wt and od object details */}
                      {payment.ledgers.map((ledger, index) => (
                        <React.Fragment key={index}>
                          {ledger.wt && (
                            <li className="flex justify-between text-[0.9em] font-semibold">
                              <span>
                                {ledger.wt.taxType} ({ledger.wt.taxRate}% x{" "}
                                {numberToCurrencyString(ledger.wt.taxBase)})
                              </span>
                              <span className="text-[0.9em] font-bold">
                                ({numberToCurrencyString(ledger.wt.taxTotal)})
                              </span>
                            </li>
                          )}

                          {ledger.od && ledger.od.amount && (
                            <li className="flex justify-between text-[0.9em] font-semibold">
                              <span>{ledger.od.description}</span>
                              <span className="text-[0.9em] font-bold">
                                ({numberToCurrencyString(ledger.od.amount)})
                              </span>
                            </li>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Calculate the final amount due */}
                      <li className="flex justify-between text-[0.9em] font-semibold">
                        <span>AMOUNT DUE:</span>
                        <span className="text-[0.9em] font-bold">
                          {
                              numberToCurrencyString(
                                  totalDebitLedger - (
                                    payment.ledgers
                                    .filter(m => m.wt) // Ensure m.wt exists
                                    .reduce((pre, cur) => pre + (cur.wt?.taxTotal || 0), 0) + 
                                    payment.ledgers
                                    .filter(m => m.od) // Ensure m.od exists
                                    .reduce((pre, cur) => pre + (cur.od?.amount || 0), 0)
                                  )
                              )
                          }
                        </span>
                      </li>
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto " ref={divRef}>
            <table className="min-w-full table-auto border-collapse border border-gray-300 break-after-auto  break-before-auto break-inside-auto">
              <thead className="bg-gray-100 table-header-group">
                <tr>
                  <th
                    colSpan={2}
                    className="px-4 py-2 text-center bg-gray-200 border border-gray-300"
                  >
                    ACCOUNT DISTRIBUTION
                  </th>
                  <th
                    colSpan={2}
                    className="px-4 py-2 text-center bg-gray-200 border border-gray-300"
                  >
                    GENERAL LEDGER
                  </th>
                  <th
                    colSpan={2}
                    className="px-4 py-2 text-center bg-gray-200 border border-gray-300"
                  >
                    SUBSIDIARY LEDGER
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Code
                  </th>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Account Title
                  </th>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Debit
                  </th>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Credit
                  </th>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Debit
                  </th>
                  <th className="px-4 py-2 text-center border border-gray-300">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody>
  
                {formatLedgers(payment.ledgers).slice(0, -1).map((item, index)=>
                  <tr key={index}>
                    <td className="border-r border-dotted text-end p-1">{item.accountCode}</td>
                    <td className="border-r">{item.accountTitle}</td>
                    <td className="border-r">{item.d1}</td>
                    <td className="border-r">{item.c1}</td>
                    <td className="border-r">{item.d2}</td>
                    <td>{item.c2}</td>
                  </tr>
                )}
                
                {/* {Object.entries(
                  payment.ledgers.reduce((groups, ledger) => {
                    const code = ledger.ledger.code;
                    if (!groups[code]) {
                      groups[code] = [];
                    }
                    groups[code].push(ledger);
                    return groups;
                  }, {})
                )
                  .sort(([codeA, groupA], [codeB, groupB]) => {
                    const drCountA = groupA.filter(
                      (ledger) => ledger.type === "DR"
                    ).length;
                    const drCountB = groupB.filter(
                      (ledger) => ledger.type === "DR"
                    ).length;

                    if (drCountB !== drCountA) {
                      return drCountB - drCountA;
                    }

                    const hasChildrenA = groupA.length > 1;
                    const hasChildrenB = groupB.length > 1;
                    return hasChildrenB - hasChildrenA;
                  })
                  .map(([code, group], index) => {
                    const totalDR = group.reduce(
                      (sum, ledger) =>
                        sum + (ledger.type === "DR" ? ledger.dr : 0),
                      0
                    );
                    const totalCR = group.reduce(
                      (sum, ledger) =>
                        sum + (ledger.type === "CR" ? ledger.cr : 0),
                      0
                    );

                    return (
                      <React.Fragment key={code}>
                        <tr
                          className={
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          }
                        >
                          <td className="px-4 py-2 border border-gray-300">
                            {code}
                          </td>
                          <td className="px-4 py-2 border border-gray-300">
                            {group[0].ledger.name}
                          </td>
                          <td className="px-4 py-2 border border-gray-300">
                            {totalDR > 0 ? numberToCurrencyString(totalDR) : ""}
                          </td>
                          <td className="px-4 py-2 border border-gray-300">
                            {totalCR > 0 ? numberToCurrencyString(totalCR) : ""}
                          </td>
                          <td className="px-4 py-2 border border-gray-300"></td>
                          <td className="px-4 py-2 border border-gray-300"></td>
                        </tr>
                        {group.map((ledger, subIndex) => (
                          <tr
                            key={`${ledger._id}-subledger`}
                            className={
                              subIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }
                          >
                            <td className="px-4 py-2 border border-gray-300 text-right">
                              {ledger.subledger?.slCode || ""}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              {ledger.subledger?.name || ""}
                            </td>
                            <td className="px-4 py-2 border border-gray-300"></td>
                            <td className="px-4 py-2 border border-gray-300"></td>
                            <td className="px-4 py-2 border border-gray-300">
                              {ledger.type === "DR"
                                ? numberToCurrencyString(ledger.dr)
                                : ""}
                            </td>
                            <td className="px-4 py-2 border border-gray-300">
                              {ledger.type === "CR"
                                ? numberToCurrencyString(ledger.cr)
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })} */}


              </tbody>

              <tfoot className="bg-gray-200">
                <tr>
                  <td
                    className="px-4 py-2 font-bold border border-gray-300"
                    colSpan={2}
                  >
                    Total
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {numberToCurrencyString(totalDebitLedger)}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {numberToCurrencyString(totalCreditLedger)}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {numberToCurrencyString(totalDebitLedger)}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {numberToCurrencyString(totalCreditLedger)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 6 */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              {/* Table Header */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-center bg-gray-200 border border-gray-300">
                    CERTIFIED
                  </th>
                  <th className="px-4 py-2 text-center bg-gray-200 border border-gray-300">
                    APPROVED FOR PAYMENT
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                <tr className="bg-white">
                  {/* CERTIFIED Column */}
                  <td className="px-2 py-2 border border-gray-300 w-[50%]">
                    <div className="mt-2 flex ">
                      <ul className="list-none space-y-2 text-[0.9em]">
                        {[
                          "Supporting documents complete",
                          "Account codes Proper",
                          "Previous cash advance liquidated",
                          "Fund Available",
                        ].map((item) => (
                          <li key={item} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={checkedItems[item] || false}
                              onChange={() => handleCheckboxChange(item)}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[0.9em] mt-2">
                      <div className="grid grid-cols-1">
                        <div className="flex justify-between">
                          <h1 className="font-semibold">Signature:</h1>
                          <div></div> {/* Signature line */}
                        </div>
                        <div className="flex justify-between">
                          <h1 className="font-semibold">Printed Name:</h1>
                          <div>{payment.CertifiedBy?.name || ""}</div>
                        </div>
                        <div className="flex justify-between">
                          <h1 className="font-semibold">Position:</h1>
                          <div>{payment.CertifiedBy?.position || ""}</div>
                        </div>
                        <div className="flex justify-between">
                          <h1 className="font-semibold">Date:</h1>
                          <div></div> {/* Signature line */}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 border border-gray-300 w-[50%]">
                    {/* <div className="flex items-center justify-center invisible"></div> */}
                    <div className="text-[0.9em] mt-24">
                      <div className="grid grid-cols-1">
                        {/* If both ApprovedBy1 and ApprovedBy2 are available, render both */}
                        {payment.ApprovedBy1 && payment.ApprovedBy2 && (
                          <>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Signature:</h3>
                              <div></div> {/* Signature line */}
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Printed Name:</h3>
                              <div>{payment.ApprovedBy1.name || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Position:</h3>
                              <div>{payment.ApprovedBy1.position || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Date:</h3>
                              <div>{payment.ApprovedBy1.date || ""}</div>
                            </div>

                            <div className="flex justify-between">
                              <h3 className="font-semibold">Signature:</h3>
                              <div></div> {/* Signature line */}
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Printed Name:</h3>
                              <div>{payment.ApprovedBy2.name || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Position:</h3>
                              <div>{payment.ApprovedBy2.position || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Date:</h3>
                              <div>{payment.ApprovedBy2.date || ""}</div>
                            </div>
                          </>
                        )}

                        {/* If only ApprovedBy1 is available, render it */}
                        {payment.ApprovedBy1 && !payment.ApprovedBy2 && (
                          <>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Signature:</h3>
                              <div></div> {/* Signature line */}
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Printed Name:</h3>
                              <div>{payment.ApprovedBy1.name || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Position:</h3>
                              <div>{payment.ApprovedBy1.position || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Date:</h3>
                              <div>{payment.ApprovedBy1.date || ""}</div>
                            </div>
                          </>
                        )}

                        {/* If only ApprovedBy2 is available, render it */}
                        {payment.ApprovedBy2 && !payment.ApprovedBy1 && (
                          <>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Signature:</h3>
                              <div></div> {/* Signature line */}
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Printed Name:</h3>
                              <div>{payment.ApprovedBy2.name || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Position:</h3>
                              <div>{payment.ApprovedBy2.position || ""}</div>
                            </div>
                            <div className="flex justify-between">
                              <h3 className="font-semibold">Date:</h3>
                              <div>{payment.ApprovedBy2.date || ""}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 7 */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">
                    RECEIVED PAYMENT
                  </th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">
                    FOR ACCOUNTING USE
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-2 border border-gray-300 w-[70%] ">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[0.9em]">
                      <div>
                        <h1 className="font-medium">Signature:</h1>
                        <span></span>
                      </div>
                      <div>
                        <h1 className="font-medium">Payment Reference No:</h1>
                        <span></span>
                      </div>
                      <div>
                        <h1 className="font-medium">Printed Name:</h1>
                        <span></span>
                      </div>
                      <div>
                        <h1 className="font-medium">Date Issued:</h1>
                        <span></span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2 border border-gray-300 w-[30%]">
                    {/* Approved for Payment Section */}
                    <div className="grid gap-y-4 text-[0.9em]">
                      <div className="flex justify-between">
                        <h1 className="font-medium">Prepared By:</h1>
                        <span>{payment.PreparedBy?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <h1 className="font-medium">Date:</h1>
                        <span>{formatReadableDate(payment.DVDate)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DVPreview;
