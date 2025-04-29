import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";
import EmailModal from "../Pop-Up-Pages/EmailModal";
import {
  numberToCurrencyString,
  formatReadableDate,
  getStatusColor,
} from "../helper/helper";
import { showToast } from "../utils/toastNotifications";

const InvoicesSlipModal = ({ isOpen, onClose, invoiceDetails }) => {

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

  // State to control email modal visibility
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // State to hold the email data
  const [emailData, setEmailData] = useState({
    defaultFrom: "",
    defaultTo: "",
    defaultSubject: "",
    defaultBody: "",
    pdfAttachment: null,
  });

  useEffect(() => {
    if (invoiceDetails) {
      const closingMessage = (() => {
        switch (invoiceDetails.status.type) {
          case "Paid":
            return "Thank you for your payment! Your invoice has been marked as paid. We value your trust and look forward to serving you again.";
          case "Partially Paid":
            return "Thank you for your partial payment! If you need assistance with the remaining balance, feel free to reach out.";
          case "Pending":
            return "Your invoice is currently pending. Please ensure payment is made timely.";
          case "Past Due":
            return "This invoice is past due. Please make the payment as soon as possible.";
          case "Void":
            return "This invoice has been voided and is no longer valid.";
          default:
            return "Thank you for your business! We appreciate your trust in us and look forward to serving you again. Your satisfaction is our priority.";
        }
      })();

      setEmailData({
        defaultTo: invoiceDetails.customer.email,
        defaultSubject: `Invoice #${
          invoiceDetails.temporaryInvoiceNumber ||
          invoiceDetails.officialInvoiceNumber
        } from ${companyName}`,
        defaultBody:
          `Dear ${invoiceDetails.customer.customerDisplayName},\n\n` +
          `Please find attached the invoice for your records.\n` +
          `\nInvoice Number: ${
            invoiceDetails.temporaryInvoiceNumber ||
            invoiceDetails.officialInvoiceNumber
          }\n` +
          `Invoice Date: ${new Date(
            invoiceDetails.invoiceDate
          ).toLocaleDateString("en-US")}\n` +
          `Due Date: ${new Date(invoiceDetails.dueDate).toLocaleDateString(
            "en-US"
          )}\n` +
          `Payment Terms: ${invoiceDetails.paymentTerms}\n\n` +
          `${closingMessage}\n\n` + // Dynamic closing message based on status
          `Best regards,\n` +
          `${companyName}`,
      });
    }
  }, [invoiceDetails, companyName]);

  // Function to open email modal
  const handleOpenEmailModal = () => {
    // Update the email data before opening the modal
    if (invoiceDetails) {
      const closingMessage = (() => {
        switch (invoiceDetails.status.type) {
          case "Paid":
            return "Thank you for your payment! Your invoice has been marked as paid. We value your trust and look forward to serving you again.";
          case "Partially Paid":
            return "Thank you for your partial payment! If you need assistance with the remaining balance, feel free to reach out.";
          case "Pending":
            return "Your invoice is currently pending. Please ensure payment is made timely.";
          case "Past Due":
            return "This invoice is past due. Please make the payment as soon as possible.";
          case "Void":
            return "This invoice has been voided and is no longer valid.";
          default:
            return "Thank you for your business! We appreciate your trust in us and look forward to serving you again. Your satisfaction is our priority.";
        }
      })();

      setEmailData({
        defaultFrom: "",
        defaultTo: invoiceDetails.customer.email,
        defaultSubject: `Invoice #${
          invoiceDetails.temporaryInvoiceNumber ||
          invoiceDetails.officialInvoiceNumber
        } from ${companyName}`,
        defaultBody:
          `Dear ${invoiceDetails.customer.customerDisplayName},\n\n` +
          `Please find attached the invoice for your records.\n` +
          `\nInvoice Number: ${
            invoiceDetails.temporaryInvoiceNumber ||
            invoiceDetails.officialInvoiceNumber
          }\n` +
          `Invoice Date: ${new Date(
            invoiceDetails.invoiceDate
          ).toLocaleDateString("en-US")}\n` +
          `Due Date: ${new Date(invoiceDetails.dueDate).toLocaleDateString(
            "en-US"
          )}\n` +
          `Payment Terms: ${invoiceDetails.paymentTerms}\n\n` +
          `${closingMessage}\n\n` + // Dynamic closing message based on status
          `Best regards,\n` +
          `${companyName}`,
      });
    }
    setIsEmailModalOpen(true);
  };

  // Function to close email modal
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
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

  // Function to format the customer address
  // Function to format the customer address
  const formatCustomerAddress = () => {
    if (
      !invoiceDetails ||
      !invoiceDetails.customer ||
      !invoiceDetails.customer.address
    )
      return "";

    const {
      address: {
        region,
        province,
        municipality,
        barangay,
        streetAddress,
        houseNumber,
        zipcode,
      },
    } = invoiceDetails.customer;

    return `${houseNumber ? houseNumber + " " : ""}${
      streetAddress ? streetAddress + ", " : ""
    }${barangay?.barangay_name ? barangay.barangay_name + ", " : ""}${
      municipality?.municipality_name
        ? municipality.municipality_name + ", "
        : ""
    }${province?.province_name ? province.province_name + ", " : ""}${
      region?.region_name ? region.region_name + " " : ""
    }${zipcode ? zipcode : ""}`
      .trim()
      .replace(/,\s*$/, ""); // Remove trailing comma
  };

  // Display invoice details if available
  if (!isOpen || !invoiceDetails) {
    return null;
  }

  //   document.title =
  //     invoiceDetails.temporaryInvoiceNumber ||
  //     invoiceDetails.officialInvoiceNumber ||
  //     "Invoice";
  //   const printContents = document.getElementById("invoiceToPrint").innerHTML;
  //   const originalContents = document.body.innerHTML;

  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  //   window.location.reload(); // To reload the page after printing to restore the content
  // };

  const handlePrint = () => {
    document.title =
      invoiceDetails.temporaryInvoiceNumber ||
      invoiceDetails.officialInvoiceNumber ||
      "Invoice";

    const invoiceContainer = document
      .getElementById("invoiceToPrint")
      .cloneNode(true);

    const noPrintElements = invoiceContainer.querySelectorAll(".no-print");
    noPrintElements.forEach((element) => element.remove());

    const printContents = invoiceContainer.innerHTML;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>${document.title}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="../styles/custom.css" rel="stylesheet"> 
        </head>
        <body class="bg-white text-gray-900">
          ${printContents} <!-- Use the existing content -->
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  };

  async function downloadAttachedFile(id, filename){
    try{
      const response = await axios.get(`${API_BASE_URL}/invoices/pay/attachment/${id}/${filename}`, {
        withCredentials: true,
        responseType: 'blob' // Important: specify response type as blob
      });
      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'image/png' }); // Adjust the MIME type as necessary
      // Create a link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob); // Create a URL for the Blob
      link.download = filename.split('-').slice(1); // Set the file name for the download
      // Append to the body (needed for Firefox)
      document.body.appendChild(link);
      // Trigger the download
      link.click();
      // Clean up and remove the link
      link.remove();
    }catch(error){
      if(error.status === 404){
        showToast("File was deleted on server.");
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="flex items-center justify-center overflow-y-auto max-h-screen">
          <div
            className="bg-white rounded-lg shadow-lg p-10 w-[792px] h-auto max-h-[90vh] overflow-y-auto text-[0.7rem]"
            id="invoiceToPrint"
            data-aos="zoom-in-up"
            data-aos-duration="500"
          >
            <button
              onClick={onClose}
              className="text-gray-500 float-right no-print"
            >
              <FaTimes size={20} />
            </button>
            <div className="flex flex-col mt-6 no-print">
              <p className="text-sm mb-4">
                If you require a receipt for attachment, please print it first
                before attaching it to your email document.
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-start">
                <button
                  onClick={handlePrint}
                  className="bg-green-500 text-white py-2 px-4 rounded no-print mb-4 sm:mb-0 sm:mr-4"
                >
                  Print Receipt
                </button>

                <button
                  onClick={handleOpenEmailModal}
                  className="bg-blue-500 text-white py-2 px-4 rounded no-print"
                >
                  Email Invoice
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center flex-col mt-auto">
              <div className="rounded-md flex items-center justify-center pb-10 ">
                <img
                  src={"data:image/png;base64," + savedlogo}
                  alt="Company Logo"
                  className="cursor-pointer max-h-[50px] "
                />
              </div>
              <p className="text-gray-700">{companyName}</p>
            </div>

            <div className="p-4 mb-5 text-justify">
              {/* Invoice Nuber */}
              <div className="flex items-center justify-center w-full">
                <h3 className="text-[2rem] font-semibold mb-2 text-green-700 text-center">
                  Invoice
                </h3>
              </div>
              <p className="text-gray-700 text-[0.8rem]">
                <strong>Invoice Number:</strong>{" "}
                {invoiceDetails.temporaryInvoiceNumber ||
                  invoiceDetails.officialInvoiceNumber}
              </p>
              <p className="text-gray-700 text-[0.8rem]">
                <strong>Invoice Date:</strong>{" "}
                {formatReadableDate(invoiceDetails.invoiceDate)}
              </p>
              <p className="text-gray-700 text-[0.8rem] ">
                <strong>Due Date:</strong>{" "}
                {formatReadableDate(invoiceDetails.dueDate)}
              </p>
              <p className="text-gray-700 text-[0.8rem]">
                <strong>Payment Terms:</strong> {invoiceDetails.paymentTerms}
              </p>
            </div>

            {/* Flex container for company and invoice details */}
            <div className="flex justify-between items-start space-x-10 ">
              {/* CUSTOMER DETAILS LEFT */}

              <div className="w-1/2 pr-4">
                <div className="flex items-center justify-center">
                  <h3 className="font-semibold mb-2 text-white text-center bg-green-400 p-3 w-full">
                    Bill to:
                  </h3>
                </div>
                <div className="mb-4">
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Customer Name]</strong>{" "}
                    {invoiceDetails.customer.customerDisplayName}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Customer Name]</strong>{" "}
                    {invoiceDetails.customer.mobileNumber}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Customer Name]</strong>{" "}
                    {invoiceDetails.customer.email}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Customer Address]</strong>
                  </p>
                  <p className="mt-2 text-gray-700 text-[0.8rem]">
                    {formatCustomerAddress()}
                  </p>
                </div>
                <div className="border border-gray-500 w-full mt-10">
              <h2 className="bg-gray-600 text-white text-[0.8rem] text-center">
                Reference
              </h2>
            <span className="text-[0.7em] p-5">{invoiceDetails.reference}</span>
            </div>
              </div>
              

              {/* COMPANY DETAILS RIGHT */}
              <div className="w-1/2 ">
                <h2 className="text-xl font-semibold mb-4">Company Details</h2>

                <div className="mb-4">
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Email]</strong> {companyEmail}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Phone]</strong> {companyPhone}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Website]</strong> {companyWebsite}
                  </p>
                  <p className="text-gray-700 text-[0.8rem]">
                    <strong>[Address]</strong>
                    {formatCompanyAddress()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table Section */}
            <h4 className="text-lg font-semibold mt-6 mb-2">Items:</h4>
            <table className="min-w-full border border-gray-300 mb-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Type</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">
                      {item.type}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.id.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      PHP {numberToCurrencyString(item.price || 0)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col mt-4">
              <div className="flex justify-between">
                <div className="font-bold">Subtotal:</div>
                <div className="font-bold">
                  PHP {numberToCurrencyString(invoiceDetails.subtotal)}
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <div className="font-bold">Original Total:</div>
                <div className="font-bold">
                  PHP {numberToCurrencyString(invoiceDetails.total)}
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <div className="font-bold">Open Balance:</div>
                <div className="font-bold">
                  PHP{" "}
                  {numberToCurrencyString(
                    invoiceDetails.total -
                      invoiceDetails.payment
                        .map((payment) => payment.amount)
                        .reduce((pre, cur) => pre + cur, 0)
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <div className="font-bold">Status:</div>
                <div
                  className={`font-bold ${getStatusColor(
                    invoiceDetails.status.type
                  )}`}
                >
                  {invoiceDetails.status.type}
                </div>
              </div>

              {/* attached files section */}
              <div className="mt-8">
                <span className="mb-2 inline-block font-bold">Attached files:</span>
                <ul>
                  {
                    invoiceDetails.attachment.map((item, index)=>
                      <li key={index} className="mb-2">
                        <span className="inline-block w-[30px]">{index + 1}.</span>
                        <button className="underline text-blue-500" onClick={()=>downloadAttachedFile(invoiceDetails._id, item)} >{item}</button>
                      </li>
                    )
                  }
                </ul>
              </div>

              {/* Payment History Section */}
              <div className="mt-10">
                <h3 className="font-bold text-[1.5em]">Payment History</h3>
                <div className="flex flex-col space-y-2">
                  {invoiceDetails.payment.map((payment, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded-lg bg-gray-100"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">Payment Date:</span>
                        <span>{formatReadableDate(payment.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Amount:</span>
                        <span>
                          PHP {numberToCurrencyString(payment.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Method:</span>
                        <span>{payment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Reference No:</span>
                        <span>{payment.referenceNo || "N/A"}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-bold">Attached files:</span>
                        <ul className="pl-2 mt-2">
                          {
                            payment.attachments.map((a, ai)=>
                              <li key={ai}>
                                <span>{ai + 1}. </span>
                                <button className="text-blue-700 underline" onClick={() => downloadAttachedFile(invoiceDetails._id, a)}>
                                  {a.split('-').slice(1)}
                                </button>
                              </li>
                            )
                          }
                        </ul>                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-gray-500 w-1/2 mt-10">
              <h2 className="bg-gray-600 text-white text-[0.7rem] text-center">
                Other Comments or Special Instructions and Messages
              </h2>
              <span className="text-[0.7em] p-5">{invoiceDetails.message}</span>
            </div>

            <div className="flex items-center justify-center flex-col mt-10">
              <h2 className="text-center text-gray-700 text-[0.8rem]">
                If you have any questions regarding this invoice, please feel
                free to contact us.
              </h2>
              <p className="text-gray-700 text-[0.8rem]">
                <strong>[Phone]</strong> {companyPhone}
              </p>
              <p className="text-gray-700 text-[0.8rem]">
                <strong>[Email]</strong> {companyEmail}
              </p>
              {/* Conditional Thank You Message */}
              <p className="text-center mt-4 italic text-gray-700 text-[0.8rem]">
                {(() => {
                  switch (invoiceDetails.status.type) {
                    case "Paid":
                      return "Thank you for your payment! Your invoice has been marked as paid. We value your trust and look forward to serving you again.";
                    case "Partially Paid":
                      return "Thank you for your partial payment! If you need assistance with the remaining balance, feel free to reach out.";
                    case "Pending":
                      return "Your invoice is currently pending. Please ensure payment is made timely.";
                    case "Past Due":
                      return "This invoice is past due. Please make the payment as soon as possible.";
                    case "Void":
                      return "This invoice has been voided and is no longer valid.";
                    default:
                      return "Thank you for your business! We appreciate your trust in us and look forward to serving you again. Your satisfaction is our priority.";
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal for sending the invoice */}
      {isEmailModalOpen && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={handleCloseEmailModal}
          defaultTo={emailData.defaultTo}
          defaultSubject={emailData.defaultSubject}
          defaultBody={emailData.defaultBody}
        />
      )}
    </>
  );
};

export default InvoicesSlipModal;
