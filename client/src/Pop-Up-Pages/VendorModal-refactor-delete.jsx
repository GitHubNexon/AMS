import React, { useEffect, useState } from "react";
import useVendorForm from "../context/useVendorForm";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTimes, FaFileInvoice } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import VendorApi from "../api/VendorApi";
import CurrencyInput from "../Components/CurrencyInput";
import { numberToCurrencyString, removeFileByName } from "../helper/helper";
import AccountPicker from "../Components/AccountPicker";

const initialFormData = {
  VendorDisplayName: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  CompanyName: "",
  taxNo: "",
  Email: "",
  phoneNumber: "",
  mobileNumber: "",
  website: "",
  streetAddress: "",
  houseNumber: "",
  zipCode: "",
  region_id: "",
  region_name: "",
  province_id: "",
  province_name: "",
  municipality_id: "",
  municipality_name: "",
  barangay_id: "",
  barangay_name: "",
  // account: "",
  // openBalance: [
  //   {
  //     amount: 0,
  //     creditAsOf: new Date(), // Default to the current date
  //   },
  // ],
};

const VendorModal = ({ mode, isOpen, onClose, vendorData, onSaveVendor }) => {
  const navigate = useNavigate();

  const { vendorId } = useParams();
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [error, setError] = useState(null);
  // const [account, setAccount] = useState(null);

  const { formData, handleChange, handleSubmit, setFormData } = useVendorForm(
    vendorData,
    mode
  );

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const fetchedRegions = await VendorApi.getRegions();
        setRegions(fetchedRegions);
      } catch (err) {
        setError("Error fetching regions");
        console.error("Error fetching regions:", err);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        if (vendorData) {
          setFormData({
            ...initialFormData,
            firstName: vendorData.firstName || "",
            middleName: vendorData.middleName || "",
            lastName: vendorData.lastName || "",
            suffix: vendorData.suffix || "",
            CompanyName: vendorData.CompanyName || "",
            VendorDisplayName: vendorData.VendorDisplayName || "",
            Email: vendorData.Email || "",
            phoneNumber: vendorData.phoneNumber || "",
            mobileNumber: vendorData.mobileNumber || "",
            website: vendorData.website || "",
            streetAddress: vendorData.address?.streetAddress || "",
            houseNumber: vendorData.address?.houseNumber || "",
            zipCode: vendorData.address?.zipcode || "",
            region_id: vendorData.address?.region?.id || "",
            province_id: vendorData.address?.province?.id || "",
            municipality_id: vendorData.address?.municipality?.id || "",
            barangay_id: vendorData.address?.barangay?.id || "",
            region_name: vendorData.address?.region?.region_name || "",
            province_name: vendorData.address?.province?.province_name || "",
            municipality_name:
              vendorData.address?.municipality?.municipality_name || "",
            barangay_name: vendorData.address?.barangay?.barangay_name || "",
            taxNo: vendorData.taxNo || "", // Added taxNo
            // account: vendorData.account || "", // Added account
            // openBalance: vendorData.openBalance || [], // Added openBalance
          });

          const fetchedProvinces = await VendorApi.getProvinces(
            vendorData.address.region.id
          );
          setProvinces(fetchedProvinces);

          const fetchedMunicipalities = await VendorApi.getMunicipalities(
            vendorData.address.province.id
          );
          setMunicipalities(fetchedMunicipalities);

          const fetchedBarangays = await VendorApi.getBarangays(
            vendorData.address.municipality.id
          );
          setBarangays(fetchedBarangays);
        }
      } catch (err) {
        setError("Error fetching vendor data");
        console.error("Error fetching vendor data:", err);
      }
    };

    fetchVendorData();
  }, [vendorData, setFormData]);

  // useEffect(() => {
  //   if (account) {
  //     console.log("Account object:", account); // Log the account object
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       account: { ...account },
  //     }));
  //   }
  // }, [account]);

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    try {
      const selectedRegion = regions.find(
        (region) => region.region_id === regionId
      );
      const filteredProvinces = await VendorApi.getProvinces(regionId);
      setProvinces(filteredProvinces);
      setMunicipalities([]);
      setBarangays([]);
      setError(null);

      setFormData((prevData) => ({
        ...prevData,
        region_id: regionId,
        region_name: selectedRegion ? selectedRegion.region_name : "",
        province_id: "",
        municipality_id: "",
        barangay_id: "",
      }));
    } catch (err) {
      setError("Error fetching provinces");
      console.error("Error fetching provinces:", err);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    try {
      const selectedProvince = provinces.find(
        (province) => province.province_id === provinceId
      );
      const filteredMunicipalities = await VendorApi.getMunicipalities(
        provinceId
      );
      setMunicipalities(filteredMunicipalities);
      setBarangays([]);
      setError(null);

      setFormData((prevData) => ({
        ...prevData,
        province_id: provinceId,
        province_name: selectedProvince ? selectedProvince.province_name : "",
        municipality_id: "",
        barangay_id: "",
      }));
    } catch (err) {
      setError("Error fetching municipalities");
      console.error("Error fetching municipalities:", err);
    }
  };

  const handleMunicipalityChange = async (e) => {
    const municipalityId = e.target.value;
    try {
      const selectedMunicipality = municipalities.find(
        (municipality) => municipality.municipality_id === municipalityId
      );
      const filteredBarangays = await VendorApi.getBarangays(municipalityId);

      if (filteredBarangays.length === 0) {
        setError("No barangays found for the selected municipality");
        setBarangays([]);
      } else {
        setBarangays(filteredBarangays);
        setError(null);
      }

      setFormData((prevData) => ({
        ...prevData,
        municipality_id: municipalityId,
        municipality_name: selectedMunicipality
          ? selectedMunicipality.municipality_name
          : "",
        barangay_id: "",
      }));
    } catch (err) {
      setError("Error fetching barangays");
      console.error("Error fetching barangays:", err);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setError(null);
  };

  if (!isOpen) return null;

  const [vendorDisplayName, setVendorDisplayName] = useState(
    `${formData.firstName} ${formData.lastName}`.trim() || "No Display Name"
  );

  useEffect(() => {
    const displayName =
      `${formData.firstName} ${formData.lastName}`.trim() || "No Display Name";
    setVendorDisplayName(displayName);
  }, [formData.firstName, formData.lastName]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      VendorDisplayName: vendorDisplayName || "No Display Name",
    }));
  }, [vendorDisplayName, setFormData]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const confirmed = await showDialog.confirm(
      mode === "edit" ? "Update this vendor?" : "Add this vendor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const vendorData = await handleSubmit(event);
      if (vendorData) {
        onSaveVendor(vendorData);
      }
      onClose();
    } catch (err) {
      console.error("Error saving vendor data:", err);
      setError("Error saving vendor data");
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 modal transition duration-500${
          isOpen ? " opacity-1 visible" : " opacity-0 invisible"
        }`}
      >
        <div
          className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow-lg my-[10px] relative w-full 
      sm:w-3/4 md:w-2/3 sm:mx-5 mx-4 overflow-hidden mb-4 md:mb-0 text-[0.7rem] lg:h-full lg:w-full"
          data-aos="zoom-in"
          data-aos-duration="800"
        >
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaFileInvoice className="mr-2 text-gray-500" /> Vendor Form
            </h2>
            <button
              onClick={async () => {
                const confirmed = await showDialog.confirm(
                  "Are you sure you want to close without saving?"
                );
                if (confirmed) {
                  onClose();
                }
              }}
              className="text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={25} />
            </button>
          </div>

          {/* Modal Content Section */}
          <div className="overflow-y-auto max-h-[80vh]">
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              {/* Section: Personal Information */}
              <h2 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Middle Name (optional)
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Middle Name"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Suffix (optional)
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Suffix"
                    value={formData.suffix}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Vendor Display Name Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Vendor Display Name *
                  </label>
                  <input
                    type="text"
                    id="vendorDisplayName"
                    value={vendorDisplayName}
                    readOnly
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Vendor Display Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="Email"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Email"
                    value={formData.Email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Mobile Number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="CompanyName"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Company Name"
                    value={formData.CompanyName}
                    required
                    onChange={handleChange}
                  />
                </div>
                {/* ACCOUNT PICKER */}

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Account Type *
                  </label>
                  <div className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <AccountPicker
                      selectedAccount={formData.account}
                      setSelectedAccount={(selected) => {
                        setAccount(selected);
                        setFormData((prevData) => ({
                          ...prevData,
                          account: selected,
                        }));
                      }}
                      filter={["LIABILITIES", "EXPENSES"]}
                    />
                  </div>
                </div> */}

                {/* TAX NO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    TaxNo (optional)
                  </label>
                  <input
                    type="text"
                    name="taxNo"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Tax No"
                    value={formData.taxNo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Website URL"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Open Balance Amount *
                  </label>
                  <input
                    type="text" // Using text type for formatting
                    name="openBalance.amount"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Open Balance Amount"
                    value={
                      formData.openBalance[0]?.amount
                        ? formData.openBalance[0].amount.toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, ""); // Remove commas for parsing
                      // Directly set the number value in formData
                      handleChange({
                        target: {
                          name: e.target.name,
                          value: rawValue ? parseFloat(rawValue) : "", // Ensure value is stored as a number
                        },
                      });
                    }}
                    onBlur={(e) => {
                      const rawValue = e.target.value.replace(/,/g, ""); // Remove commas for parsing
                      // Set formatted value for display purposes
                      handleChange({
                        target: {
                          name: e.target.name,
                          value: rawValue
                            ? parseFloat(rawValue).toFixed(2)
                            : "", // Store formatted number as string for display
                        },
                      });
                    }}
                    // required
                  />
                </div>

            
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Credit As Of *
                  </label>
                  <input
                    type="date"
                    name="openBalance.creditAsOf"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={
                      formData.openBalance[0]?.creditAsOf
                        ? new Date(formData.openBalance[0].creditAsOf)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    // required
                  />
                </div> */}
              </div>

              {/* Section: Address Information */}
              <h2 className="text-lg font-semibold text-gray-800">
                Address Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Street Address (optional)
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Street Address"
                    value={formData.streetAddress}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    House Number (optional)
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter House Number"
                    value={formData.houseNumber}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Zip Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Region *
                  </label>
                  <select
                    name="region_id"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={formData.region_id}
                    onChange={handleRegionChange}
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.region_id} value={region.region_id}>
                        {region.region_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Province *
                  </label>
                  <select
                    name="province_id"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={formData.province_id}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option
                        key={province.province_id}
                        value={province.province_id}
                      >
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Municipality *
                  </label>
                  <select
                    name="municipality_id"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={formData.municipality_id} // Ensure controlled input
                    onChange={handleMunicipalityChange}
                  >
                    <option value="">Select Municipality</option>
                    {municipalities.map((municipality) => (
                      <option
                        key={municipality.municipality_id}
                        value={municipality.municipality_id}
                      >
                        {municipality.municipality_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Barangay *
                  </label>
                  <select
                    name="barangay_id"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    value={formData.barangay_id} // Ensure controlled input
                    onChange={handleChange}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                      <option
                        key={barangay.barangay_id}
                        value={barangay.barangay_id}
                      >
                        {barangay.barangay_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {/* Save Vendor */}
                  {mode === "edit" ? "Update Vendor" : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorModal;
