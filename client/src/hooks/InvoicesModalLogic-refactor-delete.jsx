import { useState, useEffect, useRef } from "react";
import InvoicesApi from "../api/InvoicesApi"; // Adjust the import according to your project structure
import { showToast } from "../utils/toastNotifications";
import axios from "axios";

const PaymentTermsEnum = {
  NET15: "net15",
  NET30: "net30",
  NET60: "net60",
};

const InvoicesModalLogic = (isOpen, onClose, onSaveInvoice, invoice, mode) => {
  // Invoice state variables
  const [temporaryInvoiceNumber, setTemporaryInvoiceNumber] = useState("");
  const [reference, setReference] = useState("");
  const [officialInvoiceNumber, setOfficialInvoiceNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(PaymentTermsEnum.NET15); // Default to NET15
  const [paidDate, setPaidDate] = useState(null); // Initialize paidDate
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerById, setCustomerById] = useState(null);
  const [customersByAll, setCustomersByAll] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);

  const [attachment, setAttachment] = useState([]);
  const attachmentRef = useRef();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // will have future tax calcuation
    setSubTotal(calculateSubtotal);
    setTotal(calculateTotal);
  }, [lineItems]);

  function clear(){
    setTemporaryInvoiceNumber("");
    setOfficialInvoiceNumber("");
    setPaymentTerms(PaymentTermsEnum.NET15);
    setPaidDate(null); // Initialize paidDate
    setInvoiceDate(new Date());
    setDueDate(null);
    setLoading(false);
    setError("");
    setCustomerById(null);
    setCustomersByAll([]);
    setProducts([]);
    setServices([]);
    setMessage("");
    setSelectedInvoiceId(null);
    setLineItems([]);
    setSubTotal(0);
    setTotal(0);
    setAttachment([]);
    if(attachmentRef.current){
      attachmentRef.current.value = '';
    }
  }

  // Line items state and functions

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { type: "", id: "", description: "", price: 0, quantity: 1 }, // Changed SKU to ID
    ]);
  };

  const handleLineItemChange = async (index, field, value) => {
    const newLineItems = [...lineItems];
    // Update the type of the line item
    if (field === "type") {
      newLineItems[index][field] = value;
      // Fetch product or service data based on the selected type
      if (value === "product") {
        const productList = await fetchProducts(); // Fetch the list of products
        const selectedProduct = productList.find(
          (item) => item._id === newLineItems[index].id
        ); // Match Object ID with selected product
        if (selectedProduct) {
          newLineItems[index] = {
            ...newLineItems[index],
            name: selectedProduct.name,
            description: selectedProduct.description,
            price: selectedProduct.price,
          };
        }
      } else if (value === "service") {
        const serviceList = await fetchServices(); // Fetch the list of services
        const selectedService = serviceList.find(
          (item) => item._id === newLineItems[index].id
        ); // Match Object ID with selected service
        if (selectedService) {
          newLineItems[index] = {
            ...newLineItems[index],
            name: selectedService.name,
            description: selectedService.description,
            price: selectedService.price,
          };
        }
      }
    }

    // Update other fields in line items
    if (field !== "type") {
      if (value === "addnew") {
        newLineItems[index] = {
          ...newLineItems[index],
          id: "",
          name: "",
          description: "",
          price: 0,
        };
      } else {
        newLineItems[index][field] = value;
      }
    }
    // Set the updated line items
    setLineItems(newLineItems);
    // Recalculate subtotal
    calculateSubtotal();
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // You can add additional calculations for taxes, discounts, etc.
  };

  // API fetching functions
  const fetchTemporaryInvoiceNumber = async () => {
    try {
      setLoading(true);
      const response = await InvoicesApi.getTemporaryInvoiceNumber();
      setTemporaryInvoiceNumber(response.temporaryInvoiceNumber);
    } catch (err) {
      showToast(
        "Failed to fetch temporary invoice number. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerById = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await InvoicesApi.getCustomerById(id);
      console.log(response)
      setCustomerById(response);
    } catch (err) {
      showToast("Failed to fetch customer. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await InvoicesApi.getCustomers();
      setCustomersByAll(response);
    } catch (err) {
      showToast("Failed to fetch customers. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await InvoicesApi.getProducts();
      const filteredProducts = response.map(
        ({ name, _id, description, price }) => ({
          name,
          _id, // Use Object ID instead of SKU
          description,
          price,
        })
      );
      setProducts(filteredProducts);
      return filteredProducts; // Return the products
    } catch (err) {
      showToast("Failed to fetch products. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await InvoicesApi.getServices();
      const filteredServices = response.map(
        ({ name, _id, description, price }) => ({
          name,
          _id, // Use Object ID instead of SKU
          description,
          price,
        })
      );
      setServices(filteredServices);
      return filteredServices; // Return the services
    } catch (err) {
      showToast("Failed to fetch services. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Effects for fetching data and calculating due date
  useEffect(() => {
    if (isOpen) {
      fetchTemporaryInvoiceNumber();
      fetchCustomers();
      fetchProducts();
      fetchServices();
      fetchCustomerById();
    }else{
      clear();
    }
  }, [isOpen]);

  const formatDate = (date) => {
    if (!date) return ""; // Return empty string if date is not provided
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Calculate and update due date when invoiceDate or paymentTerms change
  useEffect(() => {
    if (invoiceDate && paymentTerms) {
      const daysToAdd = {
        [PaymentTermsEnum.NET15]: 15,
        [PaymentTermsEnum.NET30]: 30,
        [PaymentTermsEnum.NET60]: 60,
      }[paymentTerms];

      const newDueDate = new Date(invoiceDate);
      newDueDate.setDate(newDueDate.getDate() + daysToAdd);
      setDueDate(newDueDate);
    }
  }, [invoiceDate, paymentTerms]);

  // This effect will run whenever dueDate changes
  // useEffect(() => {
  //   console.log(
  //     "Due Date Updated:",
  //     dueDate ? dueDate.toISOString().split("T")[0] : "No Due Date"
  //   ); // Log the updated due date
  // }, [dueDate]);

  // const handleMessageChange = (e) => {
  //   setMessage(e.target.value);
  // };

  const handleTextInputChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    if (name === "reference") {
      setReference(value); // Update reference state
    } else if (name === "message") {
      setMessage(value); // Update message state
    }
  };

  // Handle saving the invoice logic
  const handleSaveInvoice = async () => {
    try {
      const invoiceData = prepareData();
      console.log(invoiceData);
      const response = await InvoicesApi.createInvoice(invoiceData.invoiceData, invoiceData.files); // Call the API to save the invoice
      if (response.success) {
      showToast("Invoice created successfully!", "success");
        onSaveInvoice();
        onClose();
        clear();
      }
    } catch (error) {
      // Here we check if the error response exists
      if (error.response) {
        // Check for specific error message from the server
        showToast(error.response.data.message, "error"); // Show the specific error message
      } else {
        // Handle unexpected errors
        console.error("Error creating invoice: ", error); // Log the error for debugging
        showToast(
          "An error occurred while saving the invoice. Please try again.",
          "error"
        );
      }
    }
  };

  const handleUpdateInvoice = async () => {
    try {
      console.log("to updated", selectedInvoiceId);

       // Ensure customerById is valid before preparing data
       if (!customerById) {
        showToast("Customer information is not available.", "error");
        return;
      }
    
      const invoiceData = prepareData();

      await InvoicesApi.updateInvoice(
        selectedInvoiceId,
        invoiceData.invoiceData,
        invoiceData.files
      );
      showToast("Invoice updated successfully!", "success");
      onSaveInvoice();
      onClose();

      // UPDARTE FEEDBACK !!!!
    } catch (err) {
      // Here we check if the error response exists
      if (error.response) {
        // Check for specific error message from the server
        showToast(error.response.data.message, "error"); // Show the specific error message
      } else {
        // Handle unexpected errors
        console.error("Error creating invoice: ", error); // Log the error for debugging
        showToast(
          "An error occurred while saving the invoice. Please try again.",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    if (invoice) {
      setOfficialInvoiceNumber(invoice.officialInvoiceNumber || '');
      setTemporaryInvoiceNumber(invoice.temporaryInvoiceNumber || '');
    }  
    if (customerById) {
      // You can set any additional state related to customerById here if needed
      // console.log("Customer By ID updated:", customerById); // Optional: for debugging
    }
  }, [invoice, customerById]);

  const prepareData = () => {
    // Ensure customerById is structured correctly
    if (
      !customerById.address ||
      !customerById.address.region ||
      !customerById.address.province ||
      !customerById.address.municipality ||
      !customerById.address.barangay
    ) {
      const errorMessage =
        "Please ensure that all customer address fields are filled out.";
      showToast(errorMessage, "warning");
      return;
    }

    // Check if it's a new invoice or an update
    const customerId = customerById._id || customerById.id;

    const files = attachmentRef.current.files;

    // Prepare the invoice data
    const invoiceData = {
      reference: reference,
      message: message,
      paymentTerms: paymentTerms,
      dueDate: formatDate(dueDate),
      invoiceDate: formatDate(invoiceDate),
      customer: {
        // id: customerById._id,
        id: customerId, // Dynamically use _id or id?
        customerDisplayName: customerById.customerDisplayName,
        email: customerById.email,
        mobileNumber: customerById.mobileNumber,
        address: {
          region: {
            id: customerById.address.region.id,
            region_name: customerById.address.region.region_name || "",
          },
          province: {
            id: customerById.address.province.id,
            province_name: customerById.address.province.province_name || "",
          },
          municipality: {
            id: customerById.address.municipality.id,
            municipality_name:
              customerById.address.municipality.municipality_name || "",
          },
          barangay: {
            id: customerById.address.barangay.id,
            barangay_name: customerById.address.barangay.barangay_name || "",
          },
          streetAddress: customerById.address.streetAddress || "", // Optional
          houseNumber: customerById.address.houseNumber || "", // Optional
          zipcode: customerById.address.zipcode || "", // Optional
        },
      },
      items: lineItems,
      attachment: attachment
    };

    // Include temporaryInvoiceNumber if officialInvoiceNumber is not provided
    if (!officialInvoiceNumber) {
      invoiceData.temporaryInvoiceNumber = temporaryInvoiceNumber;
    } else {
      invoiceData.officialInvoiceNumber = officialInvoiceNumber;
    }

    console.log("Invoice Data Prepared: ", invoiceData); // Debugging log
    return {invoiceData: invoiceData, files: files};
  };

  const markInvoiceAsPaid = () => {
    setPaidDate(new Date()); // Set paidDate to current date when marked as paid
    showToast("Invoice marked as paid.", "success");
  };

  const handleResetInvoice = () => {
    // Reset invoice-related states
    setOfficialInvoiceNumber('');
    setTemporaryInvoiceNumber('');
    setReference('');
    setMessage('');
    // setPaymentTerms('');
    // setDueDate('');
    // setInvoiceDate('');
    setCustomerById(null); 
    setLineItems([]); 
    setAttachment([]);
    attachmentRef.current.value = '';
    fetchTemporaryInvoiceNumber();
  };

  // const handleCancelInvoice = () => {};
  // const handleResetInvoice = () => {};
  const handlePrintInvoice = () => {};

  async function downloadFileAttachment(id, name){
    try{
      if([...attachmentRef.current.files].filter(f=>f.name === name).length > 0){
        return;
      }
      // uses same route for payment attachments since invoice attachments is saved in same directory as payment attachments
      const response = await axios.get(`/invoices/pay/attachment/${id}/${name}`, {withCredentials: true, responseType: 'blob'});
      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'image/png' }); // Adjust the MIME type as necessary
      // Create a link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob); // Create a URL for the Blob
      link.download = name; // Set the file name for the download
      // Append to the body (needed for Firefox)
      document.body.appendChild(link);
      // Trigger the download
      link.click();
      // Clean up and remove the link
      link.remove();
    }catch(error){
        console.error(error);
    }
  }

  return {
    temporaryInvoiceNumber,
    officialInvoiceNumber,
    setOfficialInvoiceNumber,
    setTemporaryInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    paymentTerms, // Keep only one instance
    setPaymentTerms, // Keep only one instance
    paidDate,
    message,
    setMessage,
    isOpen,
    onClose,
    loading,
    error,
    prepareData,
    customerById,
    customersByAll,
    products, // Expose products
    services, // Expose services
    addLineItem,
    handleLineItemChange,
    calculateSubtotal,
    calculateTotal,
    lineItems,
    setLineItems, // Expose total calculation function
    handleSaveInvoice,
    // handleCancelInvoice,
    handleResetInvoice,
    handlePrintInvoice,
    fetchCustomerById,
    fetchProducts,
    fetchServices,
    markInvoiceAsPaid,
    PaymentTermsEnum,
    // handleMessageChange,
    handleTextInputChange,
    reference,
    setReference,
    total,
    setTotal,
    subTotal,
    setSubTotal,
    setCustomerById,
    setPaidDate,
    handleUpdateInvoice,
    setSelectedInvoiceId,
    setCustomersByAll,
    setProducts,
    setServices,
    fetchCustomers,
    attachment, setAttachment,
    attachmentRef,
    dragging, setDragging,
    downloadFileAttachment
  };
};

export { PaymentTermsEnum }; // Export the enum
export default InvoicesModalLogic;
