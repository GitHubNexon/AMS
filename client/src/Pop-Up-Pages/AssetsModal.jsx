import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import moment from "moment";
import assetsApi from "../api/assetsApi";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";

const AssetsModal = ({ isOpen, onClose, onSaveAssets, assetsData, mode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("assets");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    propNo: "",
    propName: "",
    propDescription: "",
    manufacturer: "",
    model: "",
    warrantyDate: moment().format("YYYY-MM-DD"),
    unitCost: 0,
    acquisitionDate: moment().format("YYYY-MM-DD"),
    assetImage: "",
    useFullLife: 0,
    quantity: 0,
    acquisitionCost: 0,
    reference: "",
    category: "",
    accumulatedAccount: "",
    depreciationAccount: "",
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    inventory: [
      {
        invNo: "",
        description: "",
        code: "",
        invName: "",
        status: "Available",
      },
    ],
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error");
        e.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          assetImage: reader.result,
        }));
      };
      reader.onerror = () => {
        showToast("Error reading image file", "error");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInventoryChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedInventory = [...prevData.inventory];
      updatedInventory[index] = {
        ...updatedInventory[index],
        [field]: field === "isAssigned" ? value === "true" : value,
      };
      return {
        ...prevData,
        inventory: updatedInventory,
      };
    });
  };

  const addInventoryRecord = () => {
    if (formData.inventory.length >= formData.quantity) {
      showToast(
        `Cannot add more inventory items. Maximum quantity is ${formData.quantity}.`,
        "warning"
      );
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      inventory: [
        ...prevData.inventory,
        {
          invNo: "",
          description: prevData.propDescription,
          code: "",
          invName: prevData.propName,
          status: "Available",
        },
      ],
    }));
  };

  const removeInventoryRecord = (index) => {
    setFormData((prevData) => {
      const updatedInventory = [...prevData.inventory];
      updatedInventory.splice(index, 1);
      return {
        ...prevData,
        inventory: updatedInventory.length
          ? updatedInventory
          : [
              {
                invNo: "",
                description: "",
                code: "",
                invName: "",
                status: "Available",
              },
            ],
      };
    });
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      inventory: prevData.inventory.map((item) => ({
        ...item,
        invName: prevData.propName,
        description: prevData.propDescription,
      })),
    }));
  }, [formData.propName, formData.propDescription]);

  useEffect(() => {
    if (mode === "edit" && assetsData) {
      const formattedDate = assetsData.acquisitionDate
        ? new Date(assetsData.acquisitionDate).toISOString().split("T")[0]
        : moment().format("YYYY-MM-DD");

      const inventoryData =
        Array.isArray(assetsData.inventory) && assetsData.inventory.length > 0
          ? assetsData.inventory.map((item) => ({
              invNo: item.invNo || "",
              invName: item.invName || "",
              description: item.description || "",
              code: item.code || "",
              status: item.status || "Available",
              _id: item._id || undefined,
            }))
          : [
              {
                invNo: "",
                invName: "",
                description: "",
                code: "",
                status: "Available",
              },
            ];

      setFormData({
        ...assetsData,
        acquisitionDate: formattedDate,
        inventory: inventoryData,
        assetImage: assetsData.assetImage || "",
      });
    }
  }, [mode, assetsData]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      acquisitionCost: prevData.unitCost * prevData.quantity,
    }));
  }, [formData.unitCost, formData.quantity]);

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  const requiredFields = [
    { key: "propNo", message: "Property Number is required." },
    { key: "propName", message: "Property Name is required." },
    { key: "propDescription", message: "Property Description is required." },
    { key: "unitCost", message: "Unit Cost is required." },
    { key: "acquisitionDate", message: "Acquisition Date is required." },
    { key: "useFullLife", message: "Use Full Life is required." },
    { key: "quantity", message: "Quantity is required." },
    { key: "acquisitionCost", message: "Acquisition Cost is required." },
    { key: "category", message: "Category is required." },
  ];

  const validateForm = () => {
    for (let { key, message } of requiredFields) {
      if (!formData[key]) {
        showToast(message, "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (formData.inventory.length !== parseInt(formData.quantity)) {
      showToast(
        `Inventory items (${formData.inventory.length}) must equal quantity (${formData.quantity}).`,
        "warning"
      );
      return;
    }

    try {
      let dataToSubmit = formData;
      console.log("to submit", dataToSubmit);
      if (mode === "edit") {
        await assetsApi.updateAssetsRecord(assetsData._id, dataToSubmit);
        console.log("FORM DATA UPDATED", dataToSubmit);
        showToast("Assets updated successfully!", "success");
      } else {
        await assetsApi.createAssetsRecord(formData);
        console.log("FORM DATA CREATED", formData);
        showToast("Assets Recorded successfully!", "success");
      }
      onSaveAssets(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Assets:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-5 rounded-lg w-full m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Update Assets " : "Add Assets "}
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
        <div className="flex border-b border-gray-300 mb-4">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "assets"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("assets")}
          >
            Assets Information
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "inventory"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory Record
          </button>
        </div>
        {activeTab === "inventory" && (
          <div className="sticky top-0 z-50 bg-white p-2 flex justify-end border-b">
            <button
              type="button"
              onClick={addInventoryRecord}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <FaPlus className="text-white" />
              Add Inventory Item
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          {activeTab === "assets" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="propNo" className="text-gray-700">
                  Equipment / Property No.
                </label>
                <input
                  type="text"
                  id="propNo"
                  name="propNo"
                  value={formData.propNo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="propName" className="text-gray-700">
                  Equipment / Property Name.
                </label>
                <input
                  type="text"
                  id="propName"
                  name="propName"
                  value={formData.propName}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="propDescription" className="text-gray-700">
                  Equipment / Property Description.
                </label>
                <input
                  type="text"
                  id="propDescription"
                  name="propDescription"
                  required
                  value={formData.propDescription}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="unitCost" className="text-gray-700">
                  Unit Cost
                </label>
                <input
                  type="number"
                  id="unitCost"
                  name="unitCost"
                  required
                  value={formData.unitCost}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="acquisitionDate" className="text-gray-700">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  id="acquisitionDate"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="useFullLife" className="text-gray-700">
                  Use full Life
                </label>
                <input
                  type="Number"
                  id="useFullLife"
                  name="useFullLife"
                  value={formData.useFullLife}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="quantity" className="text-gray-700">
                  Quantity
                </label>
                <input
                  type="Number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  required
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="acquisitionCost" className="text-gray-700">
                  Acquisition Cost
                </label>
                <input
                  type="Number"
                  id="acquisitionCost"
                  name="acquisitionCost"
                  value={formData.acquisitionCost}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="reference" className="text-gray-700">
                  Reference
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="category" className="text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="accumulatedAccount" className="text-gray-700">
                  Accumulated Account
                </label>
                <input
                  type="text"
                  id="accumulatedAccount"
                  name="accumulatedAccount"
                  value={formData.accumulatedAccount}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="depreciationAccount" className="text-gray-700">
                  Depreciation Account
                </label>
                <input
                  type="text"
                  id="depreciationAccount"
                  name="depreciationAccount"
                  value={formData.depreciationAccount}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="assetImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />

                {formData.assetImage ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={formData.assetImage}
                      alt="Asset Preview"
                      className="w-20 h-20 object-cover rounded-md cursor-pointer border- p-2"
                      onClick={() => setIsPreviewOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 text-sm"
                  >
                    Upload Image
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* <div className="flex justify-end sticky top-0 bg-white z-10 py-2">
                <button
                  type="button"
                  onClick={addInventoryRecord}
                  className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" /> Add Inventory Item
                </button>
              </div> */}

              {formData.inventory.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 border p-3 rounded-md relative text-[0.7em]"
                >
                  <div className="flex flex-col">
                    <label htmlFor={`invNo-${index}`} className="text-gray-700">
                      Inventory Number
                    </label>
                    <input
                      type="text"
                      id={`invNo-${index}`}
                      value={item.invNo}
                      onChange={(e) =>
                        handleInventoryChange(index, "invNo", e.target.value)
                      }
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`code-${index}`} className="text-gray-700">
                      Code
                    </label>
                    <input
                      type="text"
                      id={`code-${index}`}
                      value={item.code}
                      onChange={(e) =>
                        handleInventoryChange(index, "code", e.target.value)
                      }
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor={`invName-${index}`}
                      className="text-gray-700"
                    >
                      Inventory Name
                    </label>
                    <input
                      type="text"
                      id={`invName-${index}`}
                      value={item.invName}
                      onChange={(e) =>
                        handleInventoryChange(index, "invName", e.target.value)
                      }
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor={`description-${index}`}
                      className="text-gray-700"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        handleInventoryChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>

                  {formData.inventory.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInventoryRecord(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove Item"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {mode === "edit" ? "Save Changes" : "Save"}
          </button>
        </div>

        {isPreviewOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded-lg max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Image Preview</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={formData.assetImage}
                  alt="Asset Preview"
                  className="max-w-full max-h-[500px] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsModal;
