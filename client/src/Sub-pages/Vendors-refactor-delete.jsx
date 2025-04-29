import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaTrash,
  FaPlus,
  FaFileExcel,
  FaEdit,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import showDialog from "../utils/showDialog";
import { toast } from "react-toastify";
import VendorApi from "../api/VendorApi"; // Ensure this API handles vendors
import ExpensesShortcuts from "../Components/ExpensesShortcuts";
import {
  formatMMMDDYYYY,
  formatReadableDate,
  numberToCurrencyString,
} from "../helper/helper";
import VendorModal from "../Pop-Up-Pages/VendorModal";

const Vendors = () => {
  const navigate = useNavigate();
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [fileName, setFileName] = useState("vendor");
  const [expandedRows, setExpandedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [page, limit, query]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await VendorApi.getAllVendors(page, limit, query);
      setVendors(response.vendors);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleVendorModalClose = async () => {
    setIsVendorModalOpen(false);
    setSelectedVendor(null);
    await fetchVendors(); // Fetch vendors after closing the modal
  };

  const handleModalOpenForAdd = () => {
    setModalMode("add");
    setIsVendorModalOpen(true);
  };

  const handleModalOpenForEdit = (vendor) => {
    setModalMode("edit");
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const handleDelete = async (vendorId) => {
    setLoading(true);
    try {
      await VendorApi.deleteVendor(vendorId);
      setVendors((prevVendors) =>
        prevVendors.filter((vendor) => vendor._id !== vendorId)
      );
      toast.success("Vendor deleted successfully");
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Error deleting vendor");
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
      fetchVendors();
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
      vendors.map((vendor) => ({
        VendorDisplayName: vendor.VendorDisplayName,
        FirstName: vendor.firstName,
        MiddleName: vendor.middleName,
        LastName: vendor.lastName,
        Suffix: vendor.suffix,
        CompanyName: vendor.CompanyName,
        TaxNo: vendor.taxNo,
        Email: vendor.Email,
        PhoneNumber: vendor.phoneNumber,
        MobileNumber: vendor.mobileNumber,
        Website: vendor.website,
        StreetAddress: vendor.address.streetAddress,
        HouseNumber: vendor.address.houseNumber,
        ZipCode: vendor.address.zipcode,
        Address: `${vendor.address.region.region_name}, ${vendor.address.province.province_name}, ${vendor.address.municipality.municipality_name}, ${vendor.address.barangay.barangay_name}`,
        DateCreated: new Date(vendor.dateTimestamp).toLocaleString(),
        DateUpdated: vendor.dateUpdated
          ? new Date(vendor.dateUpdated).toLocaleString()
          : "N/A",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
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
    return (
      <div className="flex flex-wrap text-[0.9em] border-b">
        <div className="flex flex-col flex-2 p-4">
          <div className="flex text-[1.5em] mb-[20px]">
            <span className="mr-2 w-[120px] text-[40px] flex items-center justify-end pr-[10px]">
              <FaUserTie />
            </span>
            <div className="flex flex-col">
              <span>{`${data.firstName} ${data.middleName} ${data.lastName} ${data.suffix}`}</span>
              <span className="text-[0.7em] text-gray-700">
                {data.VendorDisplayName}
              </span>
              <span className="text-[0.5em] text-gray-400">
                created at {formatMMMDDYYYY(data.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Email:</span>
            <span className="text-blue-500 underline">{data.Email}</span>
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
            <span>{data.CompanyName}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Website:</span>
            <a href={data.website}>{data.website}</a>
          </div>
          {/* <div className="flex flex-col p-4 border-t mt-4">
            <span className="font-bold text-lg mb-2">
              Account Type Information:
            </span>
            {data.account &&
              Object.entries(data.account).map(([key, value]) => (
                <div className="flex mb-2" key={key}>
                  <span className="font-bold w-[120px] text-end mr-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>
                  <span>
                    {key === "dateAdded" && typeof value === "string"
                      ? formatReadableDate(value) // Apply formatReadableDate to DateAdded
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : value.toString()}
                  </span>
                </div>
              ))}
          </div> */}
        </div>
      </div>
    );
  };

  const columns = [
    {
      name: "Vendor Display Name",
      cell: (row) => (
        <div className="table-cell" data-full-text={row.VendorDisplayName}>
          {row.VendorDisplayName}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Company Name",
      cell: (row) => (
        <div className="table-cell" data-full-text={row.CompanyName}>
          {row.CompanyName}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Full Name",
      cell: (row) => (
        <div className="table-cell" data-full-text={`${row.firstName} ${row.middleName} ${row.lastName} ${row.suffix}`}>
          {`${row.firstName} ${row.middleName} ${row.lastName} ${row.suffix}`}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Email",
      cell: (row) => (
        <div className="table-cell" data-full-text={row.Email}>
          {row.Email}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Mobile Number",
      cell: (row) => (
        <div className="table-cell" data-full-text={row.mobileNumber}>
          {row.mobileNumber}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="table-cell space-x-2">
          <button
            onClick={() => handleModalOpenForEdit(row)}
            className="text-white bg-blue-600 p-2 rounded-md"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-white bg-red-600 p-2 rounded-md"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];
  

  return (
    <>
      <ExpensesShortcuts />
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 mb-3 mx-4">
          <h1 className="flex-1 font-bold text-2xl">Vendor Management</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search Vendors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border py-1 px-2 rounded-md"
            />
            <button
              onClick={handleModalOpenForAdd}
              className="bg-green-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition duration-300 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Vendor
            </button>
            <button
              onClick={handleExportClick}
              className="bg-blue-600 text-white rounded-md px-6 py-2 text-sm flex items-center"
            >
              <FaFileExcel className="mr-2" /> Export to Excel
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={vendors}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
          //   progressPending={loading}
          expandableRows
          expandableRowsComponent={expandedRowComponent}
          onRowExpandToggled={handleRowExpand}
          className="min-w-full bg-white border border-gray-200 rounded-md shadow-sm"
        />

        {isFileNameModalOpen && (
          <FileNameModal
            isOpen={isFileNameModalOpen}
            onClose={() => setIsFileNameModalOpen(false)}
            onSave={handleFileNameSave}
          />
        )}

        {isVendorModalOpen && (
          <VendorModal
            isOpen={isVendorModalOpen}
            mode={modalMode}
            vendorData={selectedVendor}
            onClose={handleVendorModalClose}
            onSaveVendor={fetchVendors}
          />
        )}
      </div>
    </>
  );
};
export default Vendors;
