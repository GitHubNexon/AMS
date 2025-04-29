import React from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import { formatReadableDate, numberToCurrencyString } from "../helper/helper";
import BIR_LOGO from "../assets/images/BIR_LOGO.png";
import BIR_BARCODE from "../assets/images/BIR_QR.png";
import { usePDF } from "react-to-pdf";
import moment from "moment";
import DateSVG from "../Components/SVG/DateSVG";
import TinSVG from "../Components/SVG/TinSVG";
import ZipCodeSVG from "../Components/SVG/ZipCodeSVG";
import TaxApi from "./../api/taxApi";
import BIR_2307 from "../templates/BIR_2307-2ndPage.pdf"




const BIR2307 = ({ isOpen, onClose, data }) => {
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

  // const handlePreviewPrint = () => {
  //   if (!targetRef.current) {
  //     console.error("targetRef is not set");
  //     return;
  //   }

  //   const printContent = targetRef.current.innerHTML;

  //   // Create an iframe to isolate the print content
  //   const iframe = document.createElement("iframe");
  //   iframe.style.position = "absolute";
  //   iframe.style.width = "0px";
  //   iframe.style.height = "0px";
  //   iframe.style.border = "none";
  //   iframe.style.visibility = "hidden";
  //   document.body.appendChild(iframe);

  //   const iframeDoc = iframe.contentWindow.document;
  //   iframeDoc.open();

  //   iframeDoc.write("<html><head><title>Print</title></head><body>");
  //   iframeDoc.write(printContent);
  //   iframeDoc.write("</body></html>");

  //   const styles = document.querySelectorAll('link[rel="stylesheet"], style');
  //   styles.forEach((style) => {
  //     const newStyle = iframeDoc.createElement(style.tagName);
  //     if (style.tagName.toLowerCase() === "link") {
  //       newStyle.setAttribute("rel", "stylesheet");
  //       newStyle.setAttribute("href", style.getAttribute("href"));
  //     } else {
  //       newStyle.innerHTML = style.innerHTML;
  //     }
  //     iframeDoc.head.appendChild(newStyle);
  //   });

  //   iframeDoc.close();

  //   iframe.contentWindow.onload = () => {
  //     iframe.contentWindow.focus();
  //     iframe.contentWindow.print();
  //   };

  //   iframe.contentWindow.onafterprint = () => {
  //     document.body.removeChild(iframe);
  //   };
  // };

  const handlePreviewPrint = () => {
    if (!targetRef.current) {
      console.error("targetRef is not set");
      return;
    }
  
    const printContent = targetRef.current.innerHTML;
  
    // Create an iframe to isolate the print content for the first page
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
  
      // Now add the second page (BIR_2307-2ndPage.pdf) as a second print job
      const secondIframe = document.createElement("iframe");
      secondIframe.style.position = "absolute";
      secondIframe.style.width = "0px";
      secondIframe.style.height = "0px";
      secondIframe.style.border = "none";
      secondIframe.style.visibility = "hidden";
      document.body.appendChild(secondIframe);
  
      secondIframe.src = BIR_2307;
      secondIframe.onload = () => {
        secondIframe.contentWindow.focus();
        secondIframe.contentWindow.print();
  
        // Clean up after printing the second page
        secondIframe.contentWindow.onafterprint = () => {
          document.body.removeChild(secondIframe);
        };
      };
    };
  };




  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !data) return null; // Ensure data exists before rendering

  const {
    from,
    to,
    docNo,
    PayeeInformation,
    incomePayments,
    moneyPayments,
    incomeTaxBaseTotal,
    incomeTaxTotal,
    moneyTaxBaseTotal,
    moneyTaxTotal,
    CertifiedByDetails,
    CertifiedBy
  } = data;

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
          <div>
            <div className="grid grid-cols-3 items-center w-full">
              <div className="flex items-center justify-start space-x-5">
                <div>
                  <span className="block font-semibold">For BIR </span>
                  <span className="block font-semibold">Use Only</span>
                </div>
                <div>
                  <span className="block font-semibold">BCS </span>
                  <span className="block font-semibold">Item:</span>
                </div>
              </div>

              {/* Centered Logo + Text */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center space-x-3">
                  <img src={BIR_LOGO} alt="BIR Logo" className="w-16" />
                  <div>
                    <p className="text-lg font-semibold">
                      Republic of the Philippines
                    </p>
                    <p className="text-lg font-semibold">
                      Department of Finance
                    </p>
                    <p className="text-lg font-semibold">
                      Bureau of Internal Revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="grid items-center w-full border border-black"
              style={{ gridTemplateColumns: "20% auto 20%" }}
            >
              <div className="p-2 border-r-2 border-black text-center">
                <span className="block font-semibold">BIR Form No.</span>
                <span className="block font-bold text-4xl">2307</span>
                <span className="block font-semibold">January 2018 (ENCS)</span>
              </div>

              <div className="p-2 border-r-2 h-auto border-black text-center">
                <span className="block font-bold text-2xl">
                  Certificate of Creditable Tax
                </span>
                <span className="block font-bold text-2xl">
                  Withheld at Source
                </span>
              </div>

              {/* <div className="p-2 flex justify-center  border-black">
                <img
                  src={BIR_BARCODE}
                  alt="BIR_QR"
                  className="object-fill h-12"
                />
              </div> */}
              <div className="relative pb-5 pt-3">
                {/* Barcode image */}
                <div className="p-1 flex justify-center border-black">
                  <img
                    src={BIR_BARCODE}
                    alt="BIR_QR"
                    className="object-fill h-12"
                  />
                </div>

                {/* Text below the barcode, aligned to right */}
                <span className="absolute bottom-1 right-1 text-[0.9em] font-medium">
                  2307 01/18ENCS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gray-300  border border-black pl-2">
              <span className="font-semibold  ">
                Fill in all applicable spaces. Mark all appropriate boxes with
                an "X".
              </span>
            </div>

            {/* 1 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black">
              <div className="flex w-full text-[0.9em]">
                <div className="flex flex-col ">
                  <span className="block font-bold mr-10">1</span>
                </div>
                <div className="flex items-center space-x-4 p-1 w-full sm:w-1/2 md:w-1/4 lg:w-1/8">
                  <span className="block font-semibold">For The Period</span>
                </div>

                <div className="flex items-center space-x-4 p-1 w-full sm:w-1/2 md:w-1/4 lg:w-1/8">
                  <span className="block font-semibold">From</span>
                  <DateSVG date={from} width={160} height={40} />
                </div>
                <div className="flex items-center space-x-4 p-1 w-full sm:w-1/2 md:w-1/4 lg:w-1/8">
                  <span className="block font-semibold italic">
                    (MM/DD/YYYY)
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-1 w-full sm:w-1/2 md:w-1/4 lg:w-1/8">
                  <span className="block font-semibold">To</span>
                  <DateSVG date={to} width={160} height={40} />
                </div>
                <div className="flex items-center space-x-4 p-1 w-full sm:w-1/2 md:w-1/4 lg:w-1/8">
                  <span className="block font-semibold italic">
                    (MM/DD/YYYY)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-semibold  text-center">
                Part I – Payee Information
              </span>
            </div>

            <div className="flex items-center bg-gray-300 p-1 border border-black justify-center relative">
              <div className="flex w-full text-[0.9em] relative">
                <div className="flex flex-col">
                  <span className="block font-bold mr-10">2</span>
                </div>
                <div className="flex items-center p-1 w-full">
                  <span className="font-bold absolute left-12">
                    Taxpayer Identification Number{" "}
                    <span className="font-semibold italic">(TIN)</span>
                  </span>
                  <div className="w-full flex justify-center">
                    <TinSVG
                      tin={PayeeInformation.tin}
                      width={300}
                      height={40}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black justify-center">
              <div className="flex w-full text-[0.9em]">
                <div className="flex flex-col ">
                  <span className="block font-bold mr-10">3</span>
                </div>
                <div className="flex flex-col w-full ">
                  <span className="block font-bold">
                    Payee’s Name
                    <span className="italic">
                      (Last Name, First Name, Middle Name for Individual OR
                      Registered Name for Non-Individual)
                    </span>
                  </span>
                  <span className="block font-bold border border-black p-2 w-full bg-white">
                    {PayeeInformation.name}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black justify-center">
              <div className="flex w-full text-[0.9em] space-x-2">
                <div className="flex flex-col">
                  <span className="block font-bold mr-10">8</span>
                </div>
                <div className="flex flex-col w-full ">
                  <span className="block font-bold">Registered Address</span>
                  <span className="block font-bold border border-black p-2 w-full bg-white h-full">
                    {PayeeInformation.address}
                  </span>
                </div>
                <div className="flex flex-col w-72">
                  <span className="block font-bold">4A Zip Code</span>
                  <ZipCodeSVG
                    zip={PayeeInformation.zip}
                    width={120}
                    height={40}
                  />
                </div>
              </div>
            </div>

            {/* 5 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black justify-center">
              <div className="flex w-full text-[0.9em]">
                <div className="flex flex-col ">
                  <span className="block font-bold mr-10">5</span>
                </div>
                <div className="flex flex-col w-full ">
                  <span className="block font-bold">
                    Foreign Address,{" "}
                    <span className="italic">if applicable</span>
                  </span>
                  <span className="block font-bold border border-black p-2 w-full bg-white text-transparent">
                    Foreign Address,
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-semibold  text-center">
                Part II – Payor Information
              </span>
            </div>

            {/* 6 */}
            {/* <div className="flex items-center bg-gray-300 p-1 border border-black justify-center">
              <div className="flex w-full text-[0.9em]">
                <div className="flex flex-col ">
                  <span className="block font-bold mr-10">6</span>
                </div>
                <div className="flex items-center p-1 w-full space-x-28">
                  <span className="block font-bold ">
                    Taxpayer Identification Number{" "}
                    <span className="italic">(TIN)</span>
                  </span>
                  <TinSVG tin="000-164-120-00000" width={300} height={40} />
                </div>
              </div>
            </div> */}

            <div className="flex items-center bg-gray-300 p-1 border border-black justify-center relative">
              <div className="flex w-full text-[0.9em] relative">
                <div className="flex flex-col">
                  <span className="block font-bold mr-10">2</span>
                </div>
                <div className="flex items-center p-1 w-full">
                  {/* Left-aligned text */}
                  <span className="font-bold absolute left-12">
                    Taxpayer Identification Number{" "}
                    <span className="font-semibold italic">(TIN)</span>
                  </span>
                  {/* Centered SVG */}
                  <div className="w-full flex justify-center">
                    <TinSVG tin="000-164-120-00000" width={300} height={40} />
                  </div>
                </div>
              </div>
            </div>

            {/* 7 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black justify-center">
              <div className="flex w-full text-[0.9em]">
                <div className="flex flex-col ">
                  <span className="block font-bold mr-10">7</span>
                </div>
                <div className="flex flex-col w-full ">
                  <span className="block font-bold">
                    Payor’s Name{" "}
                    <span className="italic">
                      (Last Name, First Name, Middle Name for Individual OR
                      Registered Name for Non-Individual)
                    </span>
                  </span>
                  <span className="block font-bold border border-black p-2 w-full bg-white">
                    NATIONAL DEVELOPMENT COMPANY
                  </span>
                </div>
              </div>
            </div>

            {/* 8 */}
            <div className="flex items-center space-x-2 bg-gray-300 p-2 border border-black justify-center">
              <div className="flex w-full text-[0.9em] space-x-2">
                <div className="flex flex-col">
                  <span className="block font-bold mr-10">8</span>
                </div>
                <div className="flex flex-col w-full ">
                  <span className="block font-bold">Registered Address</span>
                  <span className="block font-bold border border-black p-2 w-full bg-white h-full">
                    116 TORDESILLAS ST, SALCEDO VILLAGE MAKATI CITY
                  </span>
                </div>
                <div className="flex flex-col w-72">
                  <span className="block font-bold">8A Zip Code</span>
                  <ZipCodeSVG zip="1227" width={120} height={40} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-semibold  text-center">
                Part III – Details of Monthly Income Payments and Taxes Withheld
              </span>
            </div>

            <table className="table-auto w-full border-collapse border border-black">
              <thead>
                <tr className="bg-gray-300">
                  <th
                    className="px-4 py-2 border border-black text-center"
                    rowspan="2"
                  >
                    Income Payments Subject to Expanded <br />
                    Withholding Tax
                  </th>
                  <th
                    className="px-4 py-2 border border-black text-center"
                    rowspan="2"
                  >
                    ATC
                  </th>
                  <th
                    className="px-4 py-2 border border-black text-center"
                    colspan="4"
                  >
                    AMOUNT OF INCOME PAYMENTS
                  </th>
                  <th
                    className="px-4 py-2 border border-black text-center whitespace-nowrap"
                    rowspan="2"
                  >
                    Tax Withheld for the <br /> Quarter
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border border-black text-center whitespace-nowrap">
                    1st Month of the <br /> Quarter
                  </th>
                  <th className="px-4 py-2 border border-black text-center whitespace-nowrap">
                    2nd Month of the
                    <br /> Quarter
                  </th>
                  <th className="px-4 py-2 border border-black text-center whitespace-nowrap">
                    3rd Month of the <br /> Quarter
                  </th>
                  <th className="px-4 py-2 border border-black text-center whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* <>
                  {[
                    ...incomePayments,
                    ...Array.from(
                      { length: Math.max(0, 10 - incomePayments.length) },
                      () => ({})
                    ), 
                  ].map((item, index) => (
                    <tr key={`income-${index}`}>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxCategory || ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center whitespace-nowrap">
                        {item.taxCode || ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxBase
                          ? numberToCurrencyString(item.taxBase)
                          : ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxTotal
                          ? numberToCurrencyString(item.taxTotal)
                          : ""}
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td
                      colSpan="1"
                      className="px-4 py-2 border border-black text-start font-bold bg-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(incomeTaxBaseTotal)}
                    </td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(incomeTaxTotal)}
                    </td>
                  </tr>
                </> */}
                <>
                  {[
                    ...incomePayments,
                    ...Array.from(
                      { length: Math.max(0, 10 - incomePayments.length) },
                      () => ({})
                    ),
                  ].map((item, index) => {
                    const month = new Date(from).getMonth() + 1;

                    let firstMonthValue = "";
                    let secondMonthValue = "";
                    let thirdMonthValue = "";

                    if ([1, 4, 7, 10].includes(month)) {
                      firstMonthValue = item.taxBase
                        ? numberToCurrencyString(item.taxBase)
                        : "";
                    } else if ([2, 5, 8, 11].includes(month)) {
                      secondMonthValue = item.taxBase
                        ? numberToCurrencyString(item.taxBase)
                        : "";
                    } else if ([3, 6, 9, 12].includes(month)) {
                      thirdMonthValue = item.taxBase
                        ? numberToCurrencyString(item.taxBase)
                        : "";
                    }

                    return (
                      <tr key={`income-${index}`}>
                        <td className="px-4 py-2 border border-black text-center">
                          {item.taxCategory || ""}
                        </td>
                        <td className="px-4 py-2 border border-black text-center whitespace-nowrap">
                          {item.taxCode || ""}
                        </td>

                        <td className="px-4 py-2 border border-black text-center">
                          {firstMonthValue}
                        </td>

                        <td className="px-4 py-2 border border-black text-center">
                          {secondMonthValue}
                        </td>

                        <td className="px-4 py-2 border border-black text-center">
                          {thirdMonthValue}
                        </td>

                        <td className="px-4 py-2 border border-black text-center">
                        {item.taxBase
                            ? numberToCurrencyString(item.taxBase)
                            : ""}
                        </td>

                        <td className="px-4 py-2 border border-black text-center">
                          {item.taxTotal
                            ? numberToCurrencyString(item.taxTotal)
                            : ""}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row for Income Payments */}
                  <tr>
                    <td
                      colSpan="1"
                      className="px-4 py-2 border border-black text-start font-bold bg-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(incomeTaxBaseTotal)}
                    </td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(incomeTaxTotal)}
                    </td>
                  </tr>
                </>
                {/* Render moneyPayments section */}
                <>
                  <tr>
                    <td
                      colSpan="1"
                      className="px-4 py-2 border-black font-bold bg-gray-300 text-center"
                    >
                      Money Payments Subject to Withholding of <br />
                      Business Tax (Government & Private)
                    </td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                    <td className="px-4 py-2 border border-black text-center bg-gray-300"></td>
                  </tr>
                  {[
                    ...moneyPayments,
                    ...Array.from(
                      { length: Math.max(0, 10 - moneyPayments.length) },
                      () => ({})
                    ), // Fill empty rows
                  ].map((item, index) => (
                    <tr key={`money-${index}`}>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxCategory || ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxCode || ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center"></td>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxBase
                          ? numberToCurrencyString(item.taxBase)
                          : ""}
                      </td>
                      <td className="px-4 py-2 border border-black text-center">
                        {item.taxTotal
                          ? numberToCurrencyString(item.taxTotal)
                          : ""}
                      </td>
                    </tr>
                  ))}

                  {/* Total Row for Money Payments */}
                  <tr>
                    <td
                      colSpan="1"
                      className="px-4 py-2 border border-black text-start font-bold bg-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center"></td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(moneyTaxBaseTotal)}
                    </td>
                    <td className="px-4 py-2 border border-black text-center">
                      {numberToCurrencyString(moneyTaxTotal)}
                    </td>
                  </tr>
                </>
              </tbody>
            </table>

            <div className="flex items-center space-x-2 bg-gray-300  border border-black justify-center px-3 py-1">
              <span className="font-normal text-center">
                We declare under the penalties of perjury that this certificate
                has been made in good faith, verified by us, and to the best of
                our knowledge and belief, is true and correct, pursuant to the
                provisions of the National Internal Revenue Code, as amended,
                and the regulations issued under authority thereof. Further, we
                give our consent to the processing of our information as
                contemplated under the *Data Privacy Act of 2012 (R.A. No.
                10173) for legitimate and lawful purposes.
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-white  border border-black justify-center p-4">
              <span className="font-bold text-center">
               {CertifiedByDetails.name} / {CertifiedByDetails.userType} / {CertifiedByDetails.tin}
              </span>
            </div>

            <div className="text-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-normal text-center">
                Signature over Printed Name of Payor/Payor’s Authorized
                Representative/Tax Agent
              </span>
              <br />
              <span className="font-normal text-center italic">
                (Indicate Title/Designation and TIN)
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-300 border border-black justify-center p-2">
              <div className="flex flex-col">
                <span className="font-normal text-center">
                  Tax Agent Accreditation No.
                </span>
                <span className="font-normal text-center">
                  Attorney’s Roll No. (if applicable)
                </span>
              </div>
              <div className="flex flex-col bg-white text-transparent w-52 p-2 border border-black">
                blank
              </div>

              <div className="flex flex-col">
                <span className="font-normal text-center">Date of Issue</span>
                <span className="font-normal text-center italic">
                  (MM/DD/YYYY)
                </span>
              </div>
              <DateSVG date={""} width={160} height={35} />
              <div className="flex flex-col">
                <span className="font-normal text-center">Date of Expiry</span>
                <span className="font-normal text-center italic">
                  (MM/DD/YYYY)
                </span>
              </div>
              <DateSVG date={""} width={160} height={35} />
            </div>
            <div className="flex items-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-bold text-center">CONFORME:</span>
            </div>

            <div className="flex items-center space-x-2 bg-white border border-black justify-center p-3 flex-col">
              <div className="mt-4 w-full  border-black"></div>{" "}
              <span className="font-bold text-center">
                {PayeeInformation.name}
              </span>
            </div>
            <div className="text-center space-x-2 bg-gray-300  border border-black justify-center">
              <span className="font-normal text-center">
                Signature over Printed Name of Payee/Payee’s Authorized
                Representative/Tax Agent
              </span>
              <br />
              <span className="font-normal text-center italic">
                (Indicate Title/Designation and TIN)
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-300 border border-black justify-center p-2">
              <div className="flex flex-col">
                <span className="font-normal text-center">
                  Tax Agent Accreditation No.
                </span>
                <span className="font-normal text-center">
                  Attorney’s Roll No. (if applicable)
                </span>
              </div>
              <div className="flex flex-col bg-white text-transparent w-52 p-2 border border-black">
                blank
              </div>
              <div className="flex flex-col">
                <span className="font-normal text-center">Date of Issue</span>
                <span className="font-normal text-center italic">
                  (MM/DD/YYYY)
                </span>
              </div>
              <DateSVG date={""} width={160} height={35} />
              <div className="flex flex-col">
                <span className="font-normal text-center">Date of Expiry</span>
                <span className="font-normal text-center italic">
                  (MM/DD/YYYY)
                </span>
              </div>
              <DateSVG date={""} width={160} height={35} />
            </div>
            <span className="font-normal text-center">
              *NOTE: The BIR Data Privacy is in the BIR website (www.bir.gov.ph)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIR2307;
