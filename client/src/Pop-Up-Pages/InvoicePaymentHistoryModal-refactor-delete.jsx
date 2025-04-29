import React from "react";
import PropTypes from "prop-types";
import {
  numberToCurrencyString,
  formatReadableDate,
  formatDateToDays,
  getStatusColor,
} from "../helper/helper";
import { FaTimes } from "react-icons/fa";
import { RiFileHistoryFill } from "react-icons/ri";

// Function to get status information
const getStatusInformation = (invoiceDateString, dueDateString, statusType) => {
  const invoiceDate = new Date(invoiceDateString);
  const dueDate = new Date(dueDateString);
  const currentDate = new Date();

  const timeFromInvoiceToCurrent = currentDate - invoiceDate;
  const daysSinceInvoice = Math.ceil(
    timeFromInvoiceToCurrent / (1000 * 60 * 60 * 24)
  );

  const overdueDays =
    currentDate > dueDate
      ? Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24))
      : null;

  let statusInfo;
  const daysUntilDue = Math.ceil(
    (dueDate - currentDate) / (1000 * 60 * 60 * 24)
  );

  if (statusType === "Paid") {
    statusInfo = "Payment received.";
  } else if (statusType === "Pending") {
    if (daysUntilDue > 0) {
      statusInfo = `Due in ${daysUntilDue} ${
        daysUntilDue === 1 ? "day" : "days"
      }.`;
    } else if (daysUntilDue === 0) {
      statusInfo = "Due today!";
    } else {
      statusInfo = formatDateToDays(dueDateString);
    }
  } else if (statusType === "Partially Paid") {
    if (currentDate > dueDate) {
      statusInfo = `This invoice has been past due for ${overdueDays} ${
        overdueDays === 1 ? "day" : "days"
      }, and has been outstanding for ${daysSinceInvoice} days since the invoice was created.`;
    } else {
      statusInfo = `Due in ${daysUntilDue} ${
        daysUntilDue === 1 ? "day" : "days"
      }.`;
    }
  } else if (statusType === "Void") {
    statusInfo = "This order has been voided.";
  } else if (statusType === "Past Due") {
    statusInfo = "This Invoice is past Due!";
  }

  return statusInfo;
};


// Component to display payment details in a table row
const PaymentDetailRow = ({ paymentDetail }) => (
  <tr className="hover:bg-gray-50">
    <td className="border border-gray-300 px-4 py-2">
      {formatReadableDate(paymentDetail.date)}
    </td>
    <td className="border border-gray-300 px-4 py-2">{paymentDetail.method}</td>
    <td className="border border-gray-300 px-4 py-2">
      {`PHP ${numberToCurrencyString(paymentDetail.amount)}`}
    </td>
  </tr>
);

// Main modal component
const InvoicePaymentHistoryModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen) return null;

  const {
    invoiceDate,
    total,
    payment, // Ensure this is in the destructured invoiceData
    dueDate,
    status,
    temporaryInvoiceNumber,
    officialInvoiceNumber,
  } = invoiceData;

  // Calculate total payments
  const totalPayments = payment
    ? payment
        .map((paymentDetail) => paymentDetail.amount)
        .reduce((pre, cur) => pre + cur, 0)
    : 0; // Default to 0 if there are no payments

  // Calculate open balance
  const openBalance = total - totalPayments; // Calculate the open balance

  // Get status information
  const statusInfo = getStatusInformation(invoiceDate, dueDate, status.type);

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 modal transition duration-500${
        isOpen ? " opacity-1 visible" : " opacity-0 invisible"
      }`}
    >
      <div
        className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg my-[10px] relative w-full 
        sm:w-3/4 md:w-2/3 sm:mx-5 mx-4 overflow-auto mb-4 md:mb-0 text-[0.7rem] lg:h-full overflow-y-scroll max-h-[95vh]"
        data-aos="zoom-in"
        data-aos-duration="500"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <RiFileHistoryFill className="mr-2 text-green-500" size={25} />
            Invoice Payment History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={25} />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Customer Name: </span>
              <span className="text-gray-800">
                {invoiceData.customer.customerDisplayName}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Invoice Number: </span>
              <span className="text-gray-800">
                {temporaryInvoiceNumber || officialInvoiceNumber}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Payment Terms: </span>
              <span className="text-gray-800">{invoiceData.paymentTerms}</span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Invoice Date: </span>
              <span className="text-gray-800">
                {formatReadableDate(invoiceDate)}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Due Date: </span>
              <span className="text-gray-800">
                {formatReadableDate(dueDate)}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">
                Status Information:{" "}
              </span>
              <span
                className={`text-gray-800  ${getStatusColor(
                  invoiceData.status.type
                )}`}
              >
                <span className="font-bold">{invoiceData.status.type}</span> {statusInfo}
              </span>
            </p>
          </div>

          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Total Amount: </span>
              <span className="text-gray-800">
                PHP {numberToCurrencyString(total)}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p>
              <span className="text-lg font-semibold">Open Balance: </span>
              <span className="text-gray-800">
                PHP {numberToCurrencyString(openBalance)}
              </span>
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Payments Record</h3>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Method</th>
              <th className="border border-gray-300 px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payment.map((paymentDetail) => (
              <PaymentDetailRow
                key={paymentDetail._id} // Ensure this is unique
                paymentDetail={paymentDetail}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicePaymentHistoryModal;
