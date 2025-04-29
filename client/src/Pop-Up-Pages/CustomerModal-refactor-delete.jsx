import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCustomerForm from "../context/useCustomerForm";
import CustomerFormApi from "../api/CustomerFormApi";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";

const initialFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  companyName: "",
  customerDisplayName: "",
  email: "",
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
};

const CustomerModal = ({
  mode,
  isOpen,
  onClose,
  customerData,
  onSaveCustomer,
}) => {
  const navigate = useNavigate();

  const { customerId } = useParams();
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [error, setError] = useState(null);

  const { formData, handleChange, handleSubmit, setFormData } = useCustomerForm(
    customerData,
    mode
  );

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const fetchedRegions = await CustomerFormApi.getRegions();
        setRegions(fetchedRegions);
      } catch (err) {
        setError("Error fetching regions");
        console.error("Error fetching regions:", err);
      }
    };
    fetchRegions();
  }, []);

  // New effect to set form data when customerData changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        if (customerData) {
          setFormData({
            ...initialFormData,
            firstName: customerData.firstName || "",
            middleName: customerData.middleName || "",
            lastName: customerData.lastName || "",
            suffix: customerData.suffix || "",
            companyName: customerData.companyName || "",
            customerDisplayName: customerData.customerDisplayName || "",
            email: customerData.email || "",
            phoneNumber: customerData.phoneNumber || "",
            mobileNumber: customerData.mobileNumber || "",
            website: customerData.website || "",
            streetAddress: customerData.address?.streetAddress || "",
            houseNumber: customerData.address?.houseNumber || "",
            zipCode: customerData.address?.zipcode || "",
            region_id: customerData.address?.region?.id || "",
            province_id: customerData.address?.province?.id || "",
            municipality_id: customerData.address?.municipality?.id || "",
            barangay_id: customerData.address?.barangay?.id || "",
            region_name: customerData.address?.region?.region_name || "",
            province_name: customerData.address?.province?.province_name || "",
            municipality_name:
              customerData.address?.municipality?.municipality_name || "",
            barangay_name: customerData.address?.barangay?.barangay_name || "",
          });

          const fetchedProvinces = await CustomerFormApi.getProvinces(
            customerData.address.region.id
          );
          setProvinces(fetchedProvinces);

          const fetchedMunicipalities = await CustomerFormApi.getMunicipalities(
            customerData.address.province.id
          );
          setMunicipalities(fetchedMunicipalities);

          const fetchedBarangays = await CustomerFormApi.getBarangays(
            customerData.address.municipality.id
          );
          setBarangays(fetchedBarangays);
        }
      } catch (err) {
        setError("Error fetching customer data");
        console.error("Error fetching customer data:", err);
      }
    };

    fetchCustomerData();
  }, [customerData, setFormData]); // Ensure that dependencies are correct

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    try {
      const selectedRegion = regions.find(
        (region) => region.region_id === regionId
      );
      const filteredProvinces = await CustomerFormApi.getProvinces(regionId);
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
      const filteredMunicipalities = await CustomerFormApi.getMunicipalities(
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
      const filteredBarangays = await CustomerFormApi.getBarangays(
        municipalityId
      );

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
    // Reset the form to its initial state
    setFormData(initialFormData);
    // Reset regions, provinces, municipalities, barangays, and error
    setRegions([]);
    setProvinces([]);
    setMunicipalities([]);
    setBarangays([]);
    setError(null);
  };

  if (!isOpen) return null;

  const [customerDisplayName, setCustomerDisplayName] = useState(
    `${formData.firstName} ${formData.lastName}`.trim() || "No Display Name"
  );

  useEffect(() => {
    const displayName =
      `${formData.firstName} ${formData.lastName}`.trim() || "No Display Name";
    setCustomerDisplayName(displayName);
  }, [formData.firstName, formData.lastName]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      customerDisplayName: customerDisplayName || "No Display Name",
    }));
  }, [customerDisplayName, setFormData]);

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Show confirmation dialog
    const confirmed = await showDialog.confirm(
      mode === "edit" ? "Update this customer?" : "Add this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const customerData = await handleSubmit(event);
      console.log("New customer created:", customerData); // Debugging log
      if (customerData) {
        onSaveCustomer(customerData);
      }
      onClose();
    } catch (err) {
      console.error("Error saving customer data:", err);
      setError("Error saving customer data"); // Set error message
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
        sm:w-3/4 md:w-2/3 sm:mx-5 mx-4 overflow-auto mb-4 md:mb-0 text-[0.7rem] lg:h-full lg:w-full overflow-y-scroll max-h-[95vh]"
          data-aos="zoom-in"
          data-aos-duration="800"
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
          <div className="relative w-full bg-white p-5 rounded-lg shadow-lg">
            {/* <button onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button> */}
            <h1 className="text-2xl text-gray-700 text-center mb-4">
              Customer Information
            </h1>
            <h1 className="text-2xl text-gray-700 text-center mb-4">
              {mode === "edit" ? "Edit Customer" : "Create Customer"}
            </h1>
            {error && <p className="text-red-500 text-center">{error}</p>}

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Company Name (optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Customer Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="customerDisplayName"
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Customer Display Name"
                    value={customerDisplayName}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Enter Email"
                    value={formData.email}
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
                    value={formData.province_id} // Ensure controlled input
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
                  {/* Save Customer */}
                  {mode === "edit" ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerModal;
