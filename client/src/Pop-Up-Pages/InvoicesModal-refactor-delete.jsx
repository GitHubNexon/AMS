import React, { useState, useEffect, useRef } from "react";
import {
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaCalendarAlt,
  FaPaperclip
} from "react-icons/fa";
import { BsXCircle } from "react-icons/bs";
import Select from "react-select";
import DatePicker from "react-datepicker";
import InvoicesModalLogic, {
  PaymentTermsEnum,
} from "../hooks/InvoicesModalLogic"; // Import the PaymentTermsEnum
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles
import showDialog from "../utils/showDialog";
import InvoicesApi from "../api/InvoicesApi";
import ServicesModal from "./ServicesModal";
import ProductsModal from "./ProductsModal";
import CustomerModal from "./CustomerModal";
import { showToast } from "../utils/toastNotifications";
import { removeFileByName } from "../helper/helper";

const ActionsButton = ({ onClick, text, loading, bgColor, refreshTable }) => {
  return (
    <button
      onClick={onClick}
      className={`text-white py-2 px-4 rounded ${bgColor} hover:bg-blue-700 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={loading}
    >
      {loading ? "Loading..." : text}
    </button>
  );
};

const InvoicesModal = ({
  mode,
  isOpen,
  onClose,
  onSaveInvoice,
  onUpdateInvoice,
  invoiceData,
  preSelectId = null,
}) => {
  const {
    temporaryInvoiceNumber,
    setTemporaryInvoiceNumber,
    officialInvoiceNumber,
    setOfficialInvoiceNumber,
    error,
    customer,
    prepareData,
    customerById,
    customersByAll,
    handleSaveInvoice,
    handleUpdateInvoice,
    // handleCancelInvoice,
    handleResetInvoice,
    handlePrintInvoice,
    fetchCustomerById,
    addLineItem,
    handleLineItemChange,
    calculateSubtotal,
    calculateTotal,
    fetchProducts,
    fetchServices,
    lineItems,
    setLineItems,
    // handleMessageChange,
    handleTextInputChange,
    message,
    setMessage,
    reference,
    setReference,
    total,
    setTotal,
    subTotal,
    setSubTotal,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    paymentTerms,
    setPaymentTerms,
    setCustomerById,
    setPaidDate,
    setSelectedInvoiceId,
    setCustomersByAll,
    fetchCustomers,
    attachment, setAttachment,
    attachmentRef,
    dragging, setDragging,
    downloadFileAttachment
  } = InvoicesModalLogic(isOpen, onClose, onSaveInvoice, onUpdateInvoice);

  const [showOfficialInvoice, setShowOfficialInvoice] = useState(false);
  // const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // const [officialInvoiceNumber, setOfficialInvoiceNumber] = useState("");
  // const [temporaryInvoiceNumber, setTemporaryInvoiceNumber] = useState("");

  // const [invoiceId, setInvoiceId] = useState(null);

  const [productModal, setProductModal] = useState({ show: false });
  const [serviceModal, setServiceModal] = useState({ show: false });
  const [customerModal, setCustomerModal] = useState({ show: false });

  // Automatically switch based on available data when in edit mode
  useEffect(() => {
    if (mode === "edit" && invoiceData) {
      const {
        officialInvoiceNumber: initialOfficialInvoiceNumber,
        temporaryInvoiceNumber: initialTemporaryInvoiceNumber,
      } = invoiceData;
      if (initialOfficialInvoiceNumber) {
        setShowOfficialInvoice(true);
        setOfficialInvoiceNumber(initialOfficialInvoiceNumber);
      } else if (initialTemporaryInvoiceNumber) {
        setShowOfficialInvoice(false);
        setTemporaryInvoiceNumber(initialTemporaryInvoiceNumber);
      }
    }
  }, [mode, invoiceData]);

  const fetchInvoiceById = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await InvoicesApi.getInvoiceById(id);
      if (response) {
        setOfficialInvoiceNumber(response.officialInvoiceNumber || "");
        setTemporaryInvoiceNumber(response.temporaryInvoiceNumber || "");
        setInvoiceDate(new Date(response.invoiceDate));
        setDueDate(new Date(response.dueDate));
        setPaidDate(response.paidDate ? new Date(response.paidDate) : "");
        setPaymentTerms(response.paymentTerms);
        setCustomerById(response.customer);
        setLineItems(response.items || []);
        setSelectedInvoiceId(response._id);
        setReference(response.reference);
        setMessage(response.message);
        setAttachment(response.attachment);
      }
    } catch (err) {
      console.log(err);
      showToast("Failed to fetch invoice details. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = () => {
    // Check if modalMode is correctly passed
    if (mode === "add") {
      showToast("Invoice creation canceled!", "success");
    } else if (mode === "edit") {
      showToast("Invoice update canceled!", "success");
    }

    onClose(); // Close the modal
  };

  useEffect(() => {
    if (preSelectId) {
      fetchCustomerById(preSelectId);
    }
  }, [preSelectId]);

  useEffect(() => {
    if (isOpen && invoiceData) {
      fetchInvoiceById(invoiceData._id); // Assuming invoiceData contains the ID to fetch
    }
  }, [isOpen, invoiceData]); // Trigger fetch when the modal opens or invoiceData changes

  // Handle Payment Terms and Due Date Calculation
  useEffect(() => {
    // Ensure invoiceDate and paymentTerms are defined before calculation
    if (invoiceDate && paymentTerms) {
      // Determine how many days to add based on the payment terms
      const daysToAdd = {
        [PaymentTermsEnum.NET15]: 15,
        [PaymentTermsEnum.NET30]: 30,
        [PaymentTermsEnum.NET60]: 60,
      }[paymentTerms];

      // Calculate the new due date
      const newDueDate = new Date(invoiceDate);
      newDueDate.setDate(newDueDate.getDate() + daysToAdd);

      // Update the state with the new due date
      setDueDate(newDueDate);

      // // Log payment terms for debugging
      // console.log("Payment Terms:", paymentTerms);
      // console.log(
      //   "Calculated Due Date:",
      //   newDueDate.toISOString().split("T")[0]
      // ); // Log the calculated due date
    }
  }, [invoiceDate, paymentTerms]);

  // This effect will run whenever dueDate changes
  // useEffect(() => {
  //   console.log(
  //     "Due Date Updated:",
  //     dueDate ? dueDate.toISOString().split("T")[0] : "No Due Date"
  //   ); // Log the updated due date
  // }, [dueDate]);

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch products and services when the component mounts
    const fetchData = async () => {
      const fetchedProducts = await fetchProducts(); // Ensure fetchProducts is defined
      const fetchedServices = await fetchServices(); // Ensure fetchServices is defined
      setProducts(fetchedProducts);
      setServices(fetchedServices);
    };

    fetchData();
  }, []);

  const customerOptions = customersByAll.map((customer) => ({
    value: customer._id,
    label: customer.customerDisplayName,
  }));

  const selectedCustomer = customerById
    ? { value: customerById._id, label: customerById.customerDisplayName }
    : null;

  const handleCustomerChange = (selectedOption) => {
    if (selectedOption) {
      console.log("Selected customer ID:", selectedOption.value);
      fetchCustomerById(selectedOption.value);
    } else {
      console.error("No customer selected.");
    }
  };

  const formatDate = (date) => {
    if (!date) return ""; // Return empty string if date is not provided
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const formatAddress = () => {
    if (!customerById || !customerById.address) return "";
    const {
      region,
      province,
      municipality,
      barangay,
      streetAddress,
      houseNumber,
      zipcode,
    } = customerById.address;

    return `${houseNumber || ""} ${streetAddress || ""}, ${
      barangay?.barangay_name || ""
    }, ${municipality?.municipality_name || ""}, ${
      province?.province_name || ""
    }, ${region?.region_name || ""} ${zipcode || ""}`;
  };

  if (!isOpen) return null;

  function pushProduct(i) {
    setProducts([
      ...products,
      { description: i.description, name: i.name, price: i.price, _id: i._id },
    ]);
    handleLineItemChange(productModal.index, "id", i._id);
    handleLineItemChange(productModal.index, "description", i.description);
    handleLineItemChange(productModal.index, "price", i.price);
  }

  function pushService(i) {
    setServices([
      ...services,
      { description: i.description, name: i.name, price: i.price, _id: i._id },
    ]);
    handleLineItemChange(serviceModal.index, "id", i._id);
    handleLineItemChange(serviceModal.index, "description", i.description);
    handleLineItemChange(serviceModal.index, "price", i.price);
  }

  function pushCustomer(customer) {
    setCustomersByAll((prevCustomers) => [...prevCustomers, customer]);
    setCustomerById(customer); // Optionally set the current customer
  }

  // file attachment handling
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);  // Show that the button is ready for a drop
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);  // Remove drag state
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);  // Reset the drag state

    const files = [...e.dataTransfer.files];  // Get dropped files

    // Create a DataTransfer object to assign the dragged files to the input element
    const dataTransfer = new DataTransfer();

    files.forEach(file => {
        dataTransfer.items.add(file); // Add each dragged file
    });

    // Set the files on the file input element using the ref
    attachmentRef.current.files = dataTransfer.files;

    // Use attachValidate to validate files
    attachValidate({ target: { files: dataTransfer.files } });
  };

  function attachValidate(e){
    const allowedTypes = [
      "application/msword",  // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
      "application/vnd.oasis.opendocument.text",  // .odt
      "application/rtf",  // .rtf
      "text/plain",  // .txt
      "application/vnd.ms-excel",  // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  // .xlsx
      "application/vnd.oasis.opendocument.spreadsheet",  // .ods
      "text/csv",  // .csv
      "application/vnd.ms-powerpoint",  // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",  // .pptx
      "application/vnd.oasis.opendocument.presentation",  // .odp
      "application/pdf",  // .pdf
      "image/png",  // .png
      "image/jpeg",  // .jpg, .jpeg
      "image/tiff",  // .tiff
      "text/html",  // .html
      "text/markdown"  // .md
    ];
    const files = [...e.target.files];
    const totalSize = files.map(file => file.size).reduce((pre, cur) => pre + cur, 0) / 1048576;
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    // Check upload size
    if (totalSize > 25) {
      showToast("File attachments should not exceed 20MB", "warning");
      attachmentRef.current.value = null;
      return;
    }
    // Check file types
    if (invalidFiles.length > 0) {
      showToast("Invalid file types uploaded. Please upload valid business document files", "warning");
      attachmentRef.current.value = null;
      return;
    }
    // Update the attachment state with valid files
    setAttachment([...attachment, ...files.map(file => file.name)]);
  }

  function attachFileClick(){
    attachmentRef.current.click();
  }

  function removeAttachFile(name){
    removeFileByName(attachmentRef.current, name);
    setAttachment(attachment.filter(f=>f!=name));
  }

  function downloadAttachment(item){
    downloadFileAttachment(invoiceData._id, item);
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 modal transition duration-500${
          isOpen ? "opacity-1 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="
        bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg my-[10px] relative w-full 
        sm:w-3/4 md:w-2/3 sm:mx-5 mx-4 overflow-auto mb-4 md:mb-0 text-[0.7rem] lg:h-full lg:w-full overflow-y-scroll max-h-[95vh]"
        >
          <button
            onClick={async () => {
              const confirmed = await showDialog.confirm(
                "Are you sure you want to close without saving?"
              );
              if (confirmed) {
                onClose(); // Call the onClose function if confirmed
              }
            }}
            className="absolute top-5 right-2 text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={25} />
          </button>

          <div className="flex flex-col md:flex-row w-full">
            {/* Left side for customer details */}
            <div className="md:w-1/2 pr-4">
              <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}

              {/* <div className="mb-4">
                <label className="block text-gray-700">Select Customer</label>
                <Select
                  options={customerOptions}
                  value={selectedCustomer}
                  classNamePrefix="react-select"
                  placeholder="Select a customer"
                  onChange={handleCustomerChange}
                />
              </div> */}

              <div className="mb-4">
                <label className="block text-gray-700">Select Customer</label>
                <Select
                  options={[
                    { label: "-Add New Customer-", value: "addNew" },
                    ...customerOptions,
                  ]}
                  value={selectedCustomer || ""}
                  classNamePrefix="react-select"
                  placeholder="Select a customer"
                  isDisabled={mode === "edit"} // Disable the Select when in edit mode
                  onChange={(selectedOption) => {
                    if (selectedOption.value === "addNew") {
                      setCustomerModal({ show: true });
                    } else {
                      handleCustomerChange(selectedOption);
                    }
                  }}
                />
              </div>

              {/* Flex container for customer details */}
              <div className="flex flex-row space-x-4 mb-4">
                <div>
                  <label className="block text-gray-700">Customer Email</label>
                  <input
                    type="email"
                    value={customerById ? customerById.email : ""}
                    readOnly
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">
                    Customer Mobile Number
                  </label>
                  <input
                    type="text"
                    value={
                      customerById
                        ? customerById.id
                          ? customerById.id.mobileNumber
                          : customerById.mobileNumber
                        : ""
                    }
                    readOnly
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  />
                </div>
              </div>

              {/* Customer Address */}
              <div className="mb-4">
                <label className="block text-gray-700">Customer Address</label>
                <textarea
                  value={formatAddress()}
                  readOnly
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  rows={4}
                />
              </div>
            </div>

            {/* Right side for invoice details */}
            <div className="md:w-1/2 pl-4">
              <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
              {/* Only show the toggle if there's no officialInvoiceNumber yet */}
              {!officialInvoiceNumber && (
                <div className="mb-4 flex items-center">
                  <label className="block text-gray-700 mr-2">
                    {showOfficialInvoice
                      ? "Switch to Temporary Invoice Number"
                      : "Switch to Official Invoice Number"}
                  </label>
                  <button
                    onClick={() => {
                      if (showOfficialInvoice) {
                        setOfficialInvoiceNumber(""); // Clear the official invoice number if switched to temporary
                      } else {
                        setTemporaryInvoiceNumber(""); // Clear the temporary invoice number when switching to official
                      }
                      setShowOfficialInvoice(!showOfficialInvoice); // Toggle between temporary and official
                    }}
                    className="focus:outline-none"
                  >
                    {showOfficialInvoice ? (
                      <FaToggleOn size={30} className="text-green-500" />
                    ) : (
                      <FaToggleOff size={30} className="text-gray-400" />
                    )}
                  </button>
                </div>
              )}

              {/* Conditionally render based on toggle state or existing officialInvoiceNumber */}
              {officialInvoiceNumber || showOfficialInvoice ? (
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Official Invoice Number
                  </label>
                  <input
                    type="text"
                    name="officialInvoiceNumber"
                    value={officialInvoiceNumber || ""}
                    onChange={(e) => {
                      setOfficialInvoiceNumber(e.target.value);
                    }}
                    placeholder="Enter official invoice number"
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-gray-700">
                    Temporary Invoice Number *
                  </label>
                  <input
                    name="temporaryInvoiceNumber"
                    type="text"
                    value={temporaryInvoiceNumber || ""}
                    readOnly
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  />
                </div>
              )}

              <>
                {/* Invoice Date Picker */}
                <div className="flex flex-col md:flex-row mb-4">
                  <div className="flex flex-col md:w-1/2 md:pr-2 mb-4">
                    <label className="text-gray-700 flex items-center">
                      Invoice Date
                      <FaCalendarAlt className="ml-2 text-gray-400 cursor-pointer" />
                    </label>
                    <input
                      type="date"
                      value={formatDate(invoiceDate) || ""} // Make sure to format the date for the input
                      onChange={(e) => setInvoiceDate(new Date(e.target.value))} // Convert the input value back to a Date object
                      className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                  </div>

                  {/* Due Date Input */}
                  <div className="flex flex-col md:w-1/2 md:pl-2 mb-4">
                    <label className="text-gray-700 flex items-center">
                      Due Date
                      <FaCalendarAlt className="ml-2 text-gray-400 cursor-pointer" />
                    </label>
                    <input
                      type="date"
                      value={formatDate(dueDate) || ""} // Format the date for the input
                      onChange={(e) => setDueDate(new Date(e.target.value))} // Allow manual override
                      className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                  </div>
                </div>
                {/* Payment Terms Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700">Payment Terms</label>
                  <select
                    value={paymentTerms || ""}
                    onChange={(e) => {
                      const selectedPaymentTerm = e.target.value;
                      setPaymentTerms(selectedPaymentTerm);
                      console.log(
                        "Selected Payment Term:",
                        selectedPaymentTerm
                      );
                    }}
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  >
                    <option value="" disabled>
                      Select Payment Terms
                    </option>
                    <option value={PaymentTermsEnum.NET15}>
                      {PaymentTermsEnum.NET15}
                    </option>
                    <option value={PaymentTermsEnum.NET30}>
                      {PaymentTermsEnum.NET30}
                    </option>
                    <option value={PaymentTermsEnum.NET60}>
                      {PaymentTermsEnum.NET60}
                    </option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Reference</label>
                  <textarea
                    name="reference" // Set the name attribute
                    value={reference || ""}
                    onChange={handleTextInputChange}
                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    rows={4}
                  />
                </div>
              </>
            </div>
          </div>

          {/* Table for line items */}
          <div className="mt-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Select Type
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Select Item
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-2 w-[120px]">
                    Price
                  </th>
                  <th className="border border-gray-300 px-4 py-2 w-[120px]">
                    Quantity
                  </th>
                  <th className="border border-gray-300 px-4 py-2 w-[120px]">
                    Amount
                  </th>
                  <th className="border border-gray-300 px-4 py-2 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-1">
                      <Select
                        options={[
                          { value: "Product", label: "Product" },
                          { value: "Service", label: "Service" },
                        ]}
                        onChange={(selectedOption) => {
                          handleLineItemChange(
                            index,
                            "type",
                            selectedOption.value
                          );
                          // Clear other fields when the type changes
                          handleLineItemChange(index, "id", null); // Clear selected item
                          handleLineItemChange(index, "description", "");
                          handleLineItemChange(index, "price", 0);
                          handleLineItemChange(index, "quantity", 1); // Reset quantity to 1
                        }}
                        value={{
                          value: item.type,
                          label: item.type
                            ? item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)
                            : "",
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {item.type && (
                        <Select
                          options={[
                            {
                              value: "addnew",
                              label: `- Add new ${item.type} -`,
                            },
                            ...(item.type === "Product"
                              ? products.map((product) => ({
                                  value: product._id,
                                  label: product.name,
                                }))
                              : services.map((service) => ({
                                  value: service._id,
                                  label: service.name,
                                }))),
                          ]}
                          onChange={(selectedOption) => {
                            if (selectedOption.value === "addnew") {
                              // Opens add new item modal
                              if (item.type === "Product") {
                                setProductModal({
                                  ...productModal,
                                  show: true,
                                  index: index,
                                });
                              } else {
                                setServiceModal({
                                  ...serviceModal,
                                  show: true,
                                  index: index,
                                });
                              }
                            }

                            // Update line item with selected option value
                            handleLineItemChange(
                              index,
                              "id",
                              selectedOption.value
                            );

                            // Find the selected item from products or services
                            const selectedItem =
                              item.type === "Product"
                                ? products.find(
                                    (prod) => prod._id === selectedOption.value
                                  )
                                : services.find(
                                    (serv) => serv._id === selectedOption.value
                                  );

                            // If a selected item is found, update the corresponding line item details
                            if (selectedItem) {
                              handleLineItemChange(
                                index,
                                "description",
                                selectedItem.description
                              );
                              handleLineItemChange(
                                index,
                                "price",
                                selectedItem.price
                              );
                            }
                          }}
                          placeholder={`Select ${
                            item.type === "Product" ? "Product" : "Service"
                          }`}
                          value={
                            item.id
                              ? {
                                  value: item.id._id || item.id,
                                  label:
                                    item.type === "Product"
                                      ? products.find(
                                          (prod) =>
                                            prod._id ===
                                            (item.id._id || item.id)
                                        )?.name
                                      : services.find(
                                          (serv) =>
                                            serv._id ===
                                            (item.id._id || item.id)
                                        )?.name,
                                }
                              : null
                          }
                        />
                      )}
                    </td>

                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={item.description || ""}
                        readOnly
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        // readOnly // Make the price field read-only
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      ₱
                      {item.price ? (item.price * item.quantity).toFixed(2) : 0}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <button
                        onClick={() => {
                          const newLineItems = lineItems.filter(
                            (_, i) => i !== index
                          );
                          setLineItems(newLineItems);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={addLineItem}
                className="bg-blue-500 text-white py-2 px-4 rounded mb-5"
              >
                Add Line
              </button>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal:</span>
                  <span>₱{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message box */}
          {/* <div className="border p-4 w-1/2 max-md:w-full">
            <label className="block text-gray-700 mb-2">Message:</label>
            <textarea

              value={message}
              onChange={handleTextInputChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full h-32"
              placeholder="Type your message here..."
            />
          </div> */}
          <div className="flex flex-wrap items-start">
            <div className="border mr-4 p-4 w-1/2 max-md:w-full">
              <label className="block text-gray-700 mb-2">Message:</label>
              <textarea
                name="message" // Set the name attribute
                value={message || ""}
                onChange={handleTextInputChange}
                className="border border-gray-300 rounded-md px-4 py-2 w-full h-32"
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex flex-col mr-4 flex-1">
              <span className="mb-2">Attachments</span>
              <button
                className={`
                  border py-[50px] px-[20px] w-[100%] rounded flex flex-col items-center justify-center mb-4
                  ${dragging ? 'border-green-200' : ''}
                `}
                onClick={attachFileClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop} >
                <FaPaperclip className="mb-4 text-lg" />
                <span>{dragging ? 'Drop files here!' : 'Drag/Drop files here or click the icon'}</span>
              </button>
              <input 
                  type="file" 
                  accept=".doc, .docx, .odt, .rtf, .txt, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .odp, .pdf, .png, .jpg, .jpeg, .tiff, .html, .md" 
                  multiple 
                  className='hidden' 
                  ref={attachmentRef} 
                  onChange={attachValidate} 
              />
              <ul>
                {/* file attachment here! */}
                <ul>
                    {
                        attachment.map((item, index)=>
                            <li key={index} className='flex mb-2'>
                                <span className='w-[30px]'>{index+1}.</span>
                                {
                                  mode === 'edit' ?
                                  <button className="text-blue-500 underline" onClick={()=>downloadAttachment(item)}>{item}</button>
                                  :
                                  <span>{item}</span> 
                                }
                                <button className='ml-2 text-red-500 m-1' onClick={()=>removeAttachFile(item)}><BsXCircle /></button>
                            </li>
                        )
                    }
                </ul>
            </ul>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-col md:flex-row justify-between mt-6">
            {/* Left Side: Cancel and Reset */}
            <div className="flex space-x-2 mb-4 md:mb-0">
              {/* Cancel */}
              <ActionsButton
                onClick={handleCancelInvoice}
                text="Cancel"
                loading={loading}
                bgColor="bg-gray-500"
              />
              {/* Reset */}
              {mode !== "edit" && (
                <ActionsButton
                  onClick={handleResetInvoice}
                  text="Reset"
                  loading={loading}
                  bgColor="bg-red-500"
                />
              )}
            </div>

            {/* Right Side: Save and Print */}
            {/* <ActionsButton
              onClick={async () => {
                if (invoiceData) {
                  const confirmed = await showDialog.confirm(
                    "Are you sure you want to update this invoice?"
                  );
                  if (confirmed) {
                    handleUpdateInvoice({
                      _id: invoiceId,
                      invoiceDate,
                      dueDate,
                      customer,
                      paymentTerms,
                      reference,
                      message,
                      lineItems,
                      officialInvoiceNumber: showOfficialInvoice
                        ? officialInvoiceNumber
                        : "",
                      temporaryInvoiceNumber: showOfficialInvoice
                        ? ""
                        : temporaryInvoiceNumber,
                        // customer: customerById._id, // Assuming you need to pass customer ID
                        
                    });
                  }
                } else {
                  const confirmed = await showDialog.confirm(
                    "Are you sure you want to save this new invoice?"
                  );
                  if (confirmed) {
                    await handleSaveInvoice(); // This function should handle the save operation
                  }
                }
              }}
              text={invoiceData ? "Update Invoice" : "Save Invoice"}
              loading={loading}
              bgColor={invoiceData ? "bg-green-500" : "bg-blue-500"}
            /> */}

            <ActionsButton
              onClick={async () => {
                if (invoiceData) {
                  const confirmed = await showDialog.confirm(
                    "Are you sure you want to update this invoice?"
                  );
                  if (confirmed) {
                    handleUpdateInvoice(); // No need to pass parameters here, they are already in state
                  }
                } else {
                  const confirmed = await showDialog.confirm(
                    "Are you sure you want to save this new invoice?"
                  );
                  if (confirmed) {
                    await handleSaveInvoice();
                  }
                }
              }}
              text={invoiceData ? "Update Invoice" : "Save Invoice"}
              loading={loading}
              bgColor={invoiceData ? "bg-green-500" : "bg-blue-500"}
            />
          </div>
        </div>
      </div>
      <ProductsModal
        isOpen={productModal.show}
        mode={"add"}
        onClose={() => setProductModal({ ...productModal, show: false })}
        onSaveProduct={pushProduct}
      />
      <ServicesModal
        isOpen={serviceModal.show}
        mode={"add"}
        onClose={() => setServiceModal({ ...serviceModal, show: false })}
        onSaveService={pushService}
      />

      <CustomerModal
        isOpen={customerModal.show}
        mode={"add"}
        onClose={() => setCustomerModal({ ...customerModal, show: false })}
        onSaveCustomer={pushCustomer}
      />
    </>
  );
};

export default InvoicesModal;
