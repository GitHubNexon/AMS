import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import {
  numberToCurrencyString,
  formatReadableDate,
  currencyStringToNumber,
  formatLedgers
} from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import { usePDF } from "react-to-pdf";
import PrintCR from "../Components/PrintCR";

const CRPreview = ({ isOpen, onClose, receipt, item }) => {
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

  const handleClose = () => {
    onClose();
  };
  // Fetch company settings from the API
  useEffect(() => {
    console.log(receipt);
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

  const printRef = useRef();
  const [or, setOr] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const total = ledgers[ledgers.length - 1]
    ? ledgers[ledgers.length - 1].d1
    : "";

  useEffect(() => {
    if (item) {
      fetchLinkedOR();
      if (item.ledgers) {
        setLedgers(formatLedgers(item.ledgers));
      }
    }
  }, [item]);

  // may be removed soon: added payment entity for receipt entry
  async function fetchLinkedOR() {
    const data = await axios.get(`/or/find/${item._id}`, {
      withCredentials: true,
    });
    let d = data.data;
    // sometimes they manually create the cash receipt entry even without OR
    // if payor is not found, we can check it in ledgers
    // find the subledger paired with these accounts
    const possiblePayorFromAccountCode = ['10301010B'];
    const posiblePayor = item.ledgers.filter(f=>possiblePayorFromAccountCode.includes(f.ledger.code));
    if(!d){
      // guess payor and bind amount
      if(posiblePayor.length > 0){        
        d = {
          client: { 
            name: posiblePayor[0].subledger.name,
          },
          amount: parseFloat(item.ledgers.map(m=>m.dr).reduce((pre, cur)=>pre+cur,0).toFixed(2))
        };
      }

    }
    setOr(d);
  }

  function printClick() {
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    document.body.appendChild(iframe);

    const iframeDoc =
      iframe.contentWindow ||
      iframe.contentDocument.document ||
      iframe.contentDocument;

    if (iframeDoc) {
      // Write the content and styles to the iframe
      iframeDoc.document.open();

      const printContents = printRef.current.innerHTML;
      // const newWindow = window.open('NDC AMS', '_blank');
      // newWindow.document.open();
      // newWindow.document.write(`
      iframeDoc.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${
          item.ReceiptEntryType === "Deposit Slip"
            ? "Deposit Slip Entry"
            : "Cash Receipt Entry"
        }</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .section { page-break-inside: avoid; break-inside: avoid; border: 1px solid #000; }
          table{ width: 100%; border-collapse: collapse; font-size: 0.9em; }
          table tr td{ border: 1px solid #000; padding: 5px; }
          .col { display: flex; flex-direction: column; }
          .tcenter { text-align: center; }
          .b { font-weight: bold; }
          .s { width: 80px; }
          .m { width: 110px; }
          .tright{ text-align: end; }
          .nob td{ border-top: none; border-bottom: none; }
          .nob:last-child td:nth-child(3), .nob:last-child td:nth-child(4), .nob:last-child td:nth-child(5), .nob:last-child td:nth-child(6) { border-top: 1px solid #000; }
          .signatory { padding: 15px; display: flex; font-weight: bold; font-size: 0.9em; }
          .signatory > div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .signatory > div > span:nth-child(1){ margin-bottom: 25px; }
          @media print { .hidden-on-screen { display: block; } }
         
        </style>
      </head>
      <body>
        ${printContents}
      </body>
      </html>
    `);
      // newWindow.document.close();
      // newWindow.print();
      iframeDoc.document.close();

      // Trigger print
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }

    // Remove the iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }

  return (
    <div className="fixed inset-0 flex receipts-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-[60vw] h-auto max-h-[90vh] overflow-scroll m-10 rounded-lg shadow-lg">
        <div className="bg-white p-7 text-[0.7rem]" id="CRToPrint">
          <div className="flex flex-row justify-between  receipts-center space-x-2 sticky top-0 z-10 bg-gray-200 p-1 shadow-md no-print">
            <div className="flex receipts-start justify-between space-x-5">
              <PrintCR receipt={item} rows={formatLedgers(item.ledgers)} />
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  // handlePreviewPrint();
                  printClick();
                }}
                className="bg-green-500 text-white py-2 px-4 rounded no-print"
              >
                Print
              </button> */}
            </div>
            <button onClick={handleClose} className="text-gray-500 no-print">
              <FaTimes size={20} />
            </button>
          </div>

          <div ref={printRef}>
            <div className="flex receipt-center justify-center border border-b mt-2 p- font-bold mb-2">
              {item.ReceiptEntryType === "Deposit Slip"
                ? "Deposit Slip Entry"
                : "Cash Receipt Entry"}
            </div>
            <div className="grid grid-cols-3 item-center w-full header">
              <div className="flex item-center justify-start mb-4">
                <img
                  src={"data:image/png;base64," + savedlogo}
                  alt="Company Logo"
                  className="cursor-pointer max-h-[50px]"
                />
              </div>
              <div className="flex flex-col item-center text-center">
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
            {/* first info row */}
            <div className="section info">
              <table className="w-full table-auto border-collapse">
                <tbody>
                  <tr>
                    <td rowSpan="2" className="border p-2">
                      <div className="col font-bold">
                        <span className="mr-2">
                          {item.ReceiptEntryType === "Deposit Slip"
                            ? "Account Name"
                            : "Payor"}:
                        </span>
                        <span>
                          {item.ReceiptEntryType === "Deposit Slip"
                            ? "National Development Company"
                            : or ? or.client.name : item.PaymentEntity?.name || ''}
                        </span>
                      </div>
                    </td>
                    <td colSpan="2" className="border p-2">
                      Account No:
                    </td>
                    <td className="border p-2 text-center font-bold">
                      {item.ReceiptEntryType === "Deposit Slip"
                        ? "Deposit Slip"
                        : "Official Receipt"}
                    </td>
                  </tr>
                  <tr className="font-bold">
                    <td colSpan="2" className="border p-2">
                      {item.ReceiptEntryType === "Deposit Slip"
                        ? ""
                        : "Address:"}
                    </td>
                    <td className="border p-2">Number: {item.CRNo}</td>
                  </tr>
                  <tr>
                    <td rowSpan="4" className="border p-2">
                      <div className="col">
                        <span className="font-bold mr-2">Particulars:</span>
                        <span>{item.Particulars}</span>
                      </div>
                    </td>
                    <td className="w-24 border p-2">Mode of Payment</td>
                    <td className="w-28 border p-2">Details/Reference</td>
                    <td className="font-bold border p-2">
                      Date: {formatReadableDate(new Date(item.CRDate))}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-24 border p-2">
                      {item.paymentMethods === "Cash" ? "/" : "x"} Cash
                    </td>
                    <td className="w-28 border p-2"></td>
                    <td rowSpan="3" className="font-bold border p-2">
                      Amount: {or ? numberToCurrencyString(or.amount) : total}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-24 border p-2">
                      {item.paymentMethods === "Cheque"
                        ? "/"
                        : item.ReceiptEntryType === "Deposit Slip"
                        ? "/"
                        : "x"}{" "}
                      Check
                    </td>
                    <td className="w-28 border p-2"></td>
                  </tr>
                  <tr>
                    <td className="w-24 border p-2">
                      {item.paymentMethods === "Others" ? "/" : "x"} Others
                    </td>
                    <td className="w-28 border p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <table className="w-full table-auto border-collapse">
                <tbody>
                  <tr>
                    <td colSpan="2" className="border p-2">
                      ACCOUNT DISTRIBUTIONS
                    </td>
                    <td colSpan="2" className="border p-2">
                      GENERAL LEDGER
                    </td>
                    <td colSpan="2" className="border p-2">
                      SUBSIDIARY LEDGER
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2">ACCOUNT CODE</td>
                    <td className="border p-2">ACCOUNT TITLE</td>
                    <td className="border p-2">DEBIT</td>
                    <td className="border p-2">CREDIT</td>
                    <td className="border p-2">DEBIT</td>
                    <td className="border p-2">CREDIT</td>
                  </tr>
                  {ledgers.map((item, index) => (
                    <tr className="nob" key={index}>
                      <td className="text-left border p-2">
                        {item.accountCode}
                      </td>
                      <td className="border p-2">{item.accountTitle}</td>
                      <td className="text-right border p-2">{item.d1}</td>
                      <td className="text-right border p-2">{item.c1}</td>
                      <td className="text-right border p-2">{item.d2}</td>
                      <td className="text-right border p-2">{item.c2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section signatory flex items-center justify-evenly ">
              <div className="flex flex-col items-center space-y-2">
                <span className="font-bold">Prepared By:</span>
                <span>{item.PreparedBy?.name}</span>
                <span>{item.PreparedBy?.position}</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="font-bold whitespace-nowrap">
                  Reviewed By:
                </span>
                <span>{item.ReviewedBy?.name}</span>
                <span>{item.ReviewedBy?.position}</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="font-bold">Approved By:</span>
                <span>{item.ApprovedBy1?.name}</span>
                <span>{item.ApprovedBy1?.position}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRPreview;
