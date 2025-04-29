import { useState } from "react";
import VendorApi from "../api/VendorApi"; // Updated import for VendorApi
import { toast } from "react-toastify"; // Import toast
import { useLoader } from "../context/useLoader"; // Import useLoader context

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
  //   openBalance: [
  //     {
  //       amount: 0, // Initialize with a default amount (0) or leave it empty if needed
  //       creditAsOf: new Date(), // Default to the current date
  //     },
  //   ],
};

const useVendorForm = (vendorData, mode, isOpen, ) => {
  const [formData, setFormData] = useState(initialFormData);
  const [account, setAccount] = useState(null);
  const { loading } = useLoader(); // Get the loading function from LoaderContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading(true); // Show loader when starting submission


    const requiredFields = [
      "region_id",
      "province_id",
      "municipality_id",
      "barangay_id",
      "VendorDisplayName",
      "CompanyName",
      // "account",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      loading(false);
      isOpen(true);
      return;
    }

    try {
      const selectedRegion = await VendorApi.getRegionById(formData.region_id);
      const selectedProvince = await VendorApi.getProvinceById(
        formData.province_id
      );
      const selectedMunicipality = await VendorApi.getMunicipalityById(
        formData.municipality_id
      );
      const selectedBarangay = await VendorApi.getBarangayById(
        formData.barangay_id
      );

      if (
        !selectedRegion ||
        !selectedProvince ||
        !selectedMunicipality ||
        !selectedBarangay
      ) {
        toast.error("One or more selected entities not found in the database.");
        loading(false); // Hide loader on error
        return;
      }

      const vendorDataToSubmit = {
        VendorDisplayName: formData.VendorDisplayName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        CompanyName: formData.CompanyName,
        taxNo: formData.taxNo,
        Email: formData.Email, // Use email from formData
        phoneNumber: formData.phoneNumber,
        mobileNumber: formData.mobileNumber,
        website: formData.website,
        // account: formData.account || null,
        // openBalance: formData.openBalance, // Include openBalance
        address: {
          region: {
            id: Number(formData.region_id),
            region_name: selectedRegion.region_name,
          },
          province: {
            id: Number(formData.province_id),
            province_name: selectedProvince.province_name,
          },
          municipality: {
            id: Number(formData.municipality_id),
            municipality_name: selectedMunicipality.municipality_name,
          },
          barangay: {
            id: Number(formData.barangay_id),
            barangay_name: selectedBarangay.barangay_name,
          },
          streetAddress: formData.streetAddress,
          houseNumber: formData.houseNumber,
          zipcode: formData.zipCode,
        },
      };

      let response;
      if (mode === "edit") {
        // Update existing vendor
        if (!vendorData._id) {
          console.error("Vendor ID is undefined. Cannot update.");
          toast.error("Vendor ID is missing!");
          loading(false); // Hide loader on error
          return;
        }
        response = await VendorApi.updateVendor(
          vendorData._id,
          vendorDataToSubmit
        ); // Use _id for update
        toast.success("Vendor updated successfully!");
      } else {
        // Create new vendor
        response = await VendorApi.createVendor(vendorDataToSubmit);
        toast.success("Vendor recorded successfully!");
      }

      console.log("API Response:", response);
      return response; // Ensure this returns the created vendor
    } catch (error) {
      console.error("Error submitting vendor:", error);
      if (error.response) {
        toast.error("Error submitting vendor: " + error.response.data);
      } else if (error.request) {
        toast.error("No response received. Please try again.");
      } else {
        toast.error("Error: " + error.message);
      }
    } finally {
      loading(false); // Hide loader regardless of success or failure
    }
  };

  return { formData, handleChange, handleSubmit, setFormData };
};

export default useVendorForm;
