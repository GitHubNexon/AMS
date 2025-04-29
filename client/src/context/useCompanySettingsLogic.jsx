import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { showToast } from "../utils/toastNotifications"; // Import the toast utility
import { useNavigate } from 'react-router-dom'; 

const useCompanySettingsLogic = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("Private");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");

  const fileInputRef = useRef();
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch company settings when the component mounts
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/company-settings`);
        const settings = response.data;

        // Populate the state with the fetched settings
        setCompanyName(settings.companyName || "");
        setCompanyType(settings.companyType || "Private");
        setCompanyLogo(settings.companyLogo || "");
        setCompanyEmail(settings.companyEmail || "");
        setCompanyPhone(settings.companyPhone || "");
        setCompanyWebsite(settings.companyWebsite || "");
        setStreetAddress(settings.streetAddress || "");
        setRegion(settings.region || "");
        setCity(settings.city || "");
        setBarangay(settings.barangay || "");
        setZipCode(settings.zipCode || "");
      } catch (error) {
        console.error("Error fetching company settings:", error);
      }
    };

    fetchCompanySettings();
  }, []); // Empty dependency array means this runs once on component mount

  const maxFileSizeMB = 20;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please upload a valid image file.", "error");
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024); // Convert to MB
      if (fileSizeMB > maxFileSizeMB) {
        showToast(
          "File size exceeds 20MB. Please upload a smaller file..",
          "warning",
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result.split(",")[1];
        setCompanyLogo(base64Image);
        // Show success toast after successful image load
        showToast("Image uploaded successfully!", "success");
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        showToast("Failed to read the file. Please try again.", "error");
      };
      reader.readAsDataURL(file);
    } else {
      showToast("No file selected. Please choose an image file.", "error");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const settings = {
        companyName,
        companyType,
        companyLogo,
        companyEmail,
        companyPhone,
        companyWebsite,
        streetAddress,
        city,
        region,
        barangay,
        zipCode,
      };

      const response = await axios.post(
        `${API_BASE_URL}/company-settings`,
        settings
      );
      showToast("Save successful!", "success"); // Show success toast
    } catch (error) {
      console.error("Error saving company settings:", error);
    }
  };

  const handleCancel = () => {
    navigate("/");
    console.log("Cancelled");
  };

  const handleBackButtonClick = (navigate) => (e) => {
    e.preventDefault();
    navigate("/dashboard", { replace: true });
  };

  return {
    companyName,
    setCompanyName,
    companyType,
    setCompanyType,
    companyLogo,
    setCompanyLogo,
    companyEmail,
    setCompanyEmail,
    companyPhone,
    setCompanyPhone,
    companyWebsite,
    setCompanyWebsite,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    region,
    setRegion,
    barangay,
    setBarangay,
    zipCode,
    setZipCode,
    fileInputRef,
    handleImageChange,
    handleUploadClick,
    handleSave,
    handleCancel,
    handleBackButtonClick,
    maxFileSizeMB,
  };
};

export default useCompanySettingsLogic;
