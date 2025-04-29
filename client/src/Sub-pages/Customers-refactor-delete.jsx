import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaTrash, FaPlus, FaFileExcel, FaEdit, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import showDialog from "../utils/showDialog";
import { toast } from "react-toastify";
import { getAllCustomers, deleteCustomer } from "../api/CustomersTable"; // Ensure you import deleteCustomer
import Layout from "../Components/Layout";
import CustomerModal from "../Pop-Up-Pages/CustomerModal";
import { formatMMMDDYYYY, formatReadableDate, numberToCurrencyString } from "../helper/helper";
import InvoicePaymentModal from "../Pop-Up-Pages/InvoicePaymentModal";
import InvoicesModal from "../Pop-Up-Pages/InvoicesModal";
import CustomerTransactionsModal from "../Pop-Up-Pages/CustomerTransactionsModal";
import SalesShortcuts from "../Components/SalesShortcuts";

const Customers = () => {
  const navigate = useNavigate();
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false); // Renamed state
  const [modalMode, setModalMode] = useState("add");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [fileName, setFileName] = useState("customers");
  const [expandedRows, setExpandedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, query]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getAllCustomers(page, limit, query);
      setCustomers(response.customers);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerModalClose = async () => {
    setIsCustomerModalOpen(false);
    setSelectedCustomer(null);
    await fetchCustomers(); // Fetch customers after closing the modal
  };

  const handleModalOpenForAdd = () => {
    setModalMode("add");
    setIsCustomerModalOpen(true);
  };

  const handleModalOpenForEdit = (customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleDelete = async (customerId) => {
    setLoading(true);
    try {
      await deleteCustomer(customerId); // Call the API function to delete the customer
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== customerId)
      );
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  // Debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, page, limit]);

  const handleExportClick = () => {
    setIsFileNameModalOpen(true);
  };

  const handleFileNameSave = (name) => {
    setFileName(name);
    exportToExcel(name);
    toast.success("File exported successfully!");
    setIsFileNameModalOpen(false);
  };

  const exportToExcel = (name) => {
    const ws = XLSX.utils.json_to_sheet(
      customers.map((customer) => ({
        FirstName: customer.firstName,
        MiddleName: customer.middleName,
        LastName: customer.lastName,
        Suffix: customer.suffix,
        CompanyName: customer.companyName,
        CustomerDisplayName: customer.customerDisplayName,
        Email: customer.email,
        PhoneNumber: customer.phoneNumber,
        MobileNumber: customer.mobileNumber,
        Website: customer.website,
        StreetAddress: customer.address.streetAddress, // New Field
        HouseNumber: customer.address.houseNumber, // New Field
        ZipCode: customer.address.zipcode, // New Field
        Address: `${customer.address.region.region_name}, ${customer.address.province.province_name}, ${customer.address.municipality.municipality_name}, ${customer.address.barangay.barangay_name}`,
        DateCreated: new Date(customer.createdAt).toLocaleString(),
        DateUpdated: customer.updatedAt
          ? new Date(customer.updatedAt).toLocaleString()
          : "N/A",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const handleRowExpand = (row) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(row._id)
        ? prevExpandedRows.filter((id) => id !== row._id)
        : [...prevExpandedRows, row._id]
    );
  };

  const expandedRowComponent = ({ data }) => {
    const totalBalance = data.invoices.map(m=>m.total).reduce((pre, cur)=>pre + cur, 0);
    const totalPayment = data.invoices.map(m=>m.payment.map(s=>s.amount).reduce((pre, cur)=>pre + cur, 0)).reduce((pre, cur)=>pre+cur,0);
    const overdue = data.invoices.filter(f=>new Date(f.dueDate) <= new Date())
    return (
      <div className="flex flex-wrap text-[0.9em] border-b">
        <div className="flex flex-col flex-2 p-4">
          <div className="flex text-[1.5em] mb-[20px]">
            <span className="mr-2 w-[120px] text-[40px] flex items-center justify-end pr-[10px]"><FaUserTie /></span>
            <div className="flex flex-col">
              <span>{`${data.firstName} ${data.middleName} ${data.lastName} ${data.suffix}`}</span>
              <span className="text-[0.7em] text-gray-700">{data.customerDisplayName}</span>
              <span className="text-[0.5em] text-gray-400">created at {formatMMMDDYYYY(data.createdAt)}</span>
            </div>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Email:</span>
            <span className="text-blue-500 underline">{data.email}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Mobile #:</span>
            <span>{data.mobileNumber}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Tel #:</span>
            <span>{data.phoneNumber}</span>
          </div>
          <div className="flex mb-[25px]">
            <span className="font-bold w-[120px] text-end mr-2">Address: </span>
            <span className="max-w-[250px]">{`
              ${data.address.houseNumber} 
              ${data.address.streetAddress}. 
              ${data.address.barangay.barangay_name} 
              ${data.address.municipality.municipality_name}
              ${data.address.province.province_name}
              ${data.address.zipcode}
            `}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Company:</span>
            <span>{data.companyName}</span>
          </div>
          <div className="flex">
              <span className="font-bold w-[120px] text-end mr-2">Website:</span>
              <a href={data.website}>{data.website}</a>
          </div>
        </div>
        <div className="flex flex-col flex-1 p-4">
            <div className="flex justify-end text-[0.8em] mb-[10px]">
              <button className="m-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition duration-500" onClick={()=>receivePaymentClick(data)} >Receive payment</button>
              <button className="m-1 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-500 transition duration-500" onClick={()=>createInvoiceClick(data)} >Create invoice</button>
            </div>
            <div className="flex flex-col text-[1em] mb-[20px]">
              <div className="flex">
                <span className="font-bold w-[150px] text-end mr-2 border-l-4 border-orange-500">Overdue payment:</span>
                <span>₱ {numberToCurrencyString(overdue.map(m=>m.total).reduce((pre, cur)=>pre + cur, 0))}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-[150px] text-end mr-2 border-l-4 border-gray-500">Open balance:</span>
                <span>₱ {numberToCurrencyString(totalBalance - totalPayment)}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-[150px] text-end mr-2">Credits:</span>
                <span>₱ {numberToCurrencyString(data.credit || 0)}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold mb-[10px] text-[1em]">Outstanding transactions</span>
              <div className="h-[200px] relative overflow-y-scroll text-[0.8em]">
                <table className="w-[100%]">
                  <thead>
                    <tr className="sticky top-0 border-b bg-white">
                      <th className="border-r">Invoice number</th>
                      <th className="border-r">Total</th>
                      <th className="border-r">Open balance</th>
                      <th>Due date</th>
                    </tr>
                  </thead>
                  <tbody>
                  {
                    data.invoices.length > 0 ? 
                    data.invoices.map((item, index) =>
                      <tr key={index} className="border-b text-center">
                        <td className="p-1 border-r">{item.officialInvoiceNumber || item.temporaryInvoiceNumber} ({item.invoiceDate.substr(0, 10)})</td>
                        
                        <td className="p-1 flex flex-col border-r">
                          <span>₱ {numberToCurrencyString(item.total)}</span>
                          <span className="text-green-500">{
                            // Use default empty array in case payment is null or undefined
                            item.payment.length > 0 && `Paid ₱ (${numberToCurrencyString(item.payment.map(m => m.amount).reduce((pre, cur) => pre + cur, 0))})`
                          }</span>
                        </td>

                        <td className="p-1 border-r">₱ {
                          numberToCurrencyString(item.total - (item.payment ?? []).map(m => m.amount).reduce((pre, cur) => pre + cur, 0))
                        }</td>

                        <td className={`p-1 border-r ${new Date(item.dueDate) <= new Date() && 'text-orange-500'}`}>{formatReadableDate(item.dueDate)}</td>
                      </tr>
                    )
                    : <></>
                  }
                  </tbody>
                </table>
              </div>
              <button className="underline text-blue-500 self-center hover:text-blue-400 transition duration-500" onClick={()=>seeAllTransactionsClick(data)}>see all transactions</button>
            </div>
        </div>
      </div>
    );
  };

  const columns = [
    // {
    //   name: "Display Name",
    //   selector: (row) => row.customerDisplayName,
    //   sortable: true,
    // },
    { name: "Name", selector: (row) => `${row.firstName} ${row.middleName} ${row.lastName} ${row.suffix}`, sortable: true },
    // { name: "Middle Name", selector: (row) => row.middleName, sortable: true },
    // { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    {
      name: "Phone Number",
      selector: (row) => row.phoneNumber,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) =>
        `${row.address.region.region_name}, ${row.address.province.province_name}, ${row.address.municipality.municipality_name}, ${row.address.barangay.barangay_name}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {/* <button
            onClick={() => navigate(`/customerForm/${row._id}`)}
            className="text-white bg-blue-600 p-2 rounded-md"
          >
            <FaEdit size={16} />
          </button> */}
          <button
            onClick={() => handleModalOpenForEdit(row)} // Use an anonymous function here
            className="text-white bg-blue-600 p-2 rounded-md"
          >
            <FaEdit size={16} />
          </button>

          <button
            onClick={async () => {
              const confirmed = await showDialog.confirm(
                "This action will delete the customer permanently."
              );
              if (confirmed) {
                await handleDelete(row._id); // Now this should work
                showDialog.showMessage(
                  "Customer deleted successfully",
                  "success"
                );
              }
            }}
            className="text-white bg-red-600 p-2 rounded-md"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  const [paymentModal, setPaymentModal] = useState({show: false, customer: {}});
  const [invoiceModal, setInvoiceModal] = useState({show: false, id: null });

  function receivePaymentClick(customer){
    setPaymentModal({show: true, customer: customer});
  }

  function createInvoiceClick(customer){
    console.log(customer._id);
    setInvoiceModal({ show: true, id: customer._id });
  }

  const [transactionsModal, setTransactionsModal] = useState({show: false, id: ''});

  function seeAllTransactionsClick(customer){
    setTransactionsModal({show: true, id: customer._id});
  }

  return (
    <>  
    <SalesShortcuts />
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-center justify-end mt-6 mb-3 mx-4">
        <h1 className="flex-1 font-bold">Customers</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border py-1 px-2 rounded-md"
          />
          <button
            onClick={handleModalOpenForAdd}
            className="bg-green-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> New customer
          </button>
          <button
            onClick={handleExportClick}
            className="bg-blue-600 text-white p-2 rounded-md flex items-center"
          >
            <FaFileExcel size={16} className="mr-2" /> Export
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        pagination
        paginationServer
        paginationTotalRows={totalItems}
        paginationPerPage={limit}
        onChangePage={setPage}
        onChangeRowsPerPage={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        expandableRows
        expandableRowsComponent={expandedRowComponent}
        expandOnRowClicked={handleRowExpand}
        className="min-w-full bg-white border border-gray-200"
      />

      <FileNameModal
        isOpen={isFileNameModalOpen}
        onClose={() => setIsFileNameModalOpen(false)}
        onSave={handleFileNameSave}
      />

      {isCustomerModalOpen && (
        <CustomerModal
          mode={modalMode}
          isOpen={isCustomerModalOpen}
          onClose={handleCustomerModalClose}
          customerData={selectedCustomer}
          onSaveCustomer={fetchCustomers}
        />
      )}

      {
        paymentModal.show && 
        <InvoicePaymentModal 
          selectedCustomer={paymentModal.customer} 
          closeCallback={()=>setPaymentModal({show: false, customer: {}})} 
          refreshTable={fetchCustomers}
        />
      }
      <InvoicesModal 
        isOpen={invoiceModal.show} 
        onClose={()=>setInvoiceModal({show:false, id: null})} 
        preSelectId={invoiceModal.id}
        onSaveInvoice={fetchCustomers}
        />
      <CustomerTransactionsModal 
        show={transactionsModal.show} 
        close={()=>setTransactionsModal({show: false, id: ''})} 
        id={transactionsModal.id}
      />
    </div>

    </>
  );
};

export default Customers;
