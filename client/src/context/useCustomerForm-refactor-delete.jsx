import { useState, useEffect } from "react";
import CustomerFormApi from "../api/CustomerFormApi"; // Update the import
import { toast } from "react-toastify"; // Import toast
import showDialog from "../utils/showDialog";
import { useLoader } from "../context/useLoader"; // Import useLoader context

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
  region_id: "",
  province_id: "",
  municipality_id: "",
  barangay_id: "",
  streetAddress: "", // New field
  houseNumber: "", // New field
  zipCode: "", // Changed from zipcode to zipCode
};

const useCustomerForm = (customerData, mode) => {
  // Change parameter from customerId to customerData
  const [formData, setFormData] = useState(initialFormData);
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
    // Validate required fields
    if (
      !formData.region_id ||
      !formData.province_id ||
      !formData.municipality_id ||
      !formData.barangay_id
    ) {
      toast.error("Missing required fields!");
      loading(false); // Hide loader on error
      return;
    }

    try {
      const selectedRegion = await CustomerFormApi.getRegionById(
        formData.region_id
      );
      const selectedProvince = await CustomerFormApi.getProvinceById(
        formData.province_id
      );
      const selectedMunicipality = await CustomerFormApi.getMunicipalityById(
        formData.municipality_id
      );
      const selectedBarangay = await CustomerFormApi.getBarangayById(
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

      const customerDataToSubmit = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        companyName: formData.companyName,
        customerDisplayName: formData.customerDisplayName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        mobileNumber: formData.mobileNumber,
        website: formData.website,
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

      console.log(
        "Submitting customer data:",
        JSON.stringify(customerDataToSubmit, null, 2)
      );


      let response;
      if (mode === "edit") {
        // Update existing customer
        if (!customerData._id) {
          // Access the _id property here
          console.error("Customer ID is undefined. Cannot update.");
          toast.error("Customer ID is missing!");
          loading(false); // Hide loader on error
          return;
        }
        response = await CustomerFormApi.updateCustomer(
          customerData._id,
          customerDataToSubmit
        ); // Use _id instead of id
        toast.success("Customer updated successfully!");
      } else {
        // Create new customer
        response = await CustomerFormApi.submitCustomer(customerDataToSubmit);
        toast.success("Customer recorded successfully!");

        // // Reset the form fields after successful submission if adding a new customer
        // setFormData(initialFormData);
      }

      console.log("API Response:", response);
      return response; // Ensure this returns the created customer
    } catch (error) {
      console.error("Error submitting customer:", error);
      if (error.response) {
        toast.error("Error submitting customer: " + error.response.data);
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

export default useCustomerForm;
