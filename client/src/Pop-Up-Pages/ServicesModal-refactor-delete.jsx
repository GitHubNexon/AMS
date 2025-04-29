import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import ProductsAndServicesApi from "../api/ProductsAndServicesApi"; // Ensure this API includes service-related methods
import { showToast } from "../utils/toastNotifications";
import AccountPicker from "../Components/AccountPicker";

const ServicesModal = ({ isOpen, onClose, mode, service, onSaveService }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    account: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceImage, setServiceImage] = useState("");
  const fileInputRef = useRef(null);

  function setAccount(acc){
    setFormData({...formData, account: acc});
  }

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
          "File size exceeds 20MB. Please upload a smaller file.",
          "warning"
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result.split(",")[1];
        setServiceImage(base64Image);
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

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        sku: service.sku || "",
        description: service.description || "",
        price: service.price || "",
        account: service.account || ""
      });
      setServiceImage(
        service.serviceImage ? service.serviceImage.split(",")[1] : ""
      ); // Fetch existing service image
    } else {
      resetFields();
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const missingFields = [];
    if (!formData.name) missingFields.push("Service Name");
    if (!formData.description) missingFields.push("Description");
    if (!formData.price) missingFields.push("Price");
    if (!formData.account) missingFields.push("Income Account");

    if (missingFields.length > 0) {
      const errorMessage = `Please fill in the following required fields: ${missingFields.join(
        ", "
      )}.`;
      setError(errorMessage);
      showToast(errorMessage, "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submissions
    setLoading(true);
    setError("");

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    const updatedService = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      serviceImage: serviceImage
        ? `data:image/png;base64,${serviceImage}`
        : undefined,
      ...(mode === "add" && formData.sku ? { sku: formData.sku.trim() } : {}), // Include SKU only if it is provided
      account: formData.account
    };

    console.log("Payload to update:", updatedService);

    try {
      let response;
      if (mode === "add") {
        response = await ProductsAndServicesApi.createService(updatedService);
        onSaveService({...response, account: formData.account}); // Pass the full response object instead of `newService`
        handleClear();
      } else if (mode === "edit") {
        response = await ProductsAndServicesApi.updateService(
          service._id,
          updatedService
        );
        onSaveService({...response, account: formData.account}); // Pass the updated service response
      }

      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while saving the service.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetFields();
    setError("");
  };

  const resetFields = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      price: "",
      account: null
    });
    setServiceImage(""); // Reset the service image
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 modal transition duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-2 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={25} />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          {mode === "add" ? "Add New Service" : "Edit Service"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* IMAGE UPLOAD SECTION */}
          <div className="mb-4">
            <label className="block text-gray-700">Service Image</label>
            <div
              className="relative inline-block w-36 h-36 rounded-xl overflow-hidden cursor-pointer"
              onClick={handleUploadClick}
            >
              {serviceImage ? (
                <img
                  id="serviceImage"
                  src={"data:image/png;base64," + serviceImage}
                  alt="Service"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                  <span className="text-gray-400">Upload Image</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Service Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Enter Service Name"
              required
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              placeholder="Enter SKU (optional)"
              onChange={handleChange}
              readOnly={!!service?.sku} // Make SKU read-only if it exists
              className={`border border-gray-300 rounded-md px-4 py-2 w-full ${
                service?.sku ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            />
            {mode === "edit" && service?.sku && (
              <p className="text-gray-500 text-sm mt-1">
                SKU exists: {service.sku} (Read-only)
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              placeholder="Enter Description"
              required
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              placeholder="Enter Price"
              required
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Income Account *</label>
            <AccountPicker selectedAccount={formData.account} setSelectedAccount={setAccount} />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Add Service"
                : "Update Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicesModal;
