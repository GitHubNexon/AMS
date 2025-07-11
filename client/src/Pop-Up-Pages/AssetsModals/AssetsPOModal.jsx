import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../../utils/showDialog";
import { showToast } from "../../utils/toastNotifications";
import moment from "moment";
import assetsPOApi from "../../api/assetsPOApi";
import SignatoriesPicker from "../../Components/SignatoriesPicker";
import { useAuth } from "../../context/AuthContext";
import AssetsPOItemsTab from "./AssetsPOItemsTab";

const AssetsPOModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const { user } = useAuth();
  const formatDate = (date) => {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  };
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    isApproved: false,
    entityName: "Government",
    fundCluster: "",
    supplier: "", //done
    address: "", //done
    tin: "", //done
    poNo: "", //done
    modeOfProcurement: "", //done
    poDate: moment().format("YYYY-MM-DD"), //done
    placeOfDelivery: "", //done
    dateOfDelivery: moment().format("YYYY-MM-DD"), //done
    deliveryTerm: "",
    paymentTerm: "",
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
    items: [
      {
        propertyNo: "",
        unit: "",
        description: "",
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserSelect = (user, signatoryType) => {
    setFormData((prevData) => ({
      ...prevData,
      [signatoryType]: user,
    }));
  };

  const handleItemsChange = (updatedItems) => {
    setFormData((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const { items = [], ...rest } = initialData;
      const formattedPODate = formatDate(initialData.poDate);
      const formattedDDDate = formatDate(initialData.dateOfDelivery);
      setFormData((prev) => ({
        ...prev,
        ...rest,
        items,
        poDate: formattedPODate,
        dateOfDelivery: formattedDDDate,
      }));
    }
  }, [mode, initialData]);

  const requiredFields = [
    { key: "poNo", message: "PO No is required" },
    { key: "fundCluster", message: "fund cluster is required." },
  ];

  const approvalRequiredFields = [
    { key: "supplier", message: "Supplier is required for approval" },
    {
      key: "placeOfDelivery",
      message: "Place of Delivery is required is required for approval",
    },
    { key: "deliveryTerm", message: "Delivery Term is required for approval" },
  ];

  const validateForm = (isApprovalSubmission = false) => {
    //check basic required fields
    for (let { key, message } of requiredFields) {
      if (!formData[key]) {
        showToast(message, "warning");
        return false;
      }
    }

    //check additional fields for approval submission
    if (!isApprovalSubmission) {
      for (let { key, message } of approvalRequiredFields) {
        if (!formData[key]) {
          showToast(message, "warning");
          return false;
        }
      }
    }

    // Check if signatories are selected for approval
    if (!formData.ReviewedBy || !formData.ReviewedBy._id) {
      showToast("Reviewed By is required for approval.", "warning");
      return false;
    }
    if (!formData.ApprovedBy1 || !formData.ApprovedBy1._id) {
      showToast("Approved By is required for approval.", "warning");
      return false;
    }

    // Check if items are properly filled
    if (!formData.items || formData.items.length === 0) {
      showToast("At least one item is required for approval.", "warning");
      return false;
    }
    const hasValidItems = formData.items.some(
      (item) => item.description && item.quantity > 0 && item.unitCost > 0
    );
    if (!hasValidItems) {
      showToast(
        "At least one complete item (with description, quantity, and unit cost is required for approval"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (isApprovalSubmission = false) => {
    if (!validateForm(isApprovalSubmission)) {
      return;
    }
    try {
      // Filter out empty items and zero values
      const filteredItems = formData.items.filter(
        (item) =>
          item.description &&
          item.description.trim() !== "" &&
          item.quantity > 0 &&
          item.unitCost > 0
      );

      // Prepare the data with filtered items
      const submitData = {
        ...formData,
        items: filteredItems,
        isApproved: isApprovalSubmission,
      };

      if (mode === "edit" && initialData) {
        await assetsPOApi.updatePurchaseOrder(initialData._id, submitData);
        console.log("FORM DATA UPDATED", submitData);
        showToast(
          isApprovalSubmission
            ? "Purchase order approved and updated successfully!"
            : "Draft updated successfully!",
          "success"
        );
      } else {
        await assetsPOApi.createPurchaseOrder(submitData);
        console.log("FORM DATA CREATED", submitData);
        showToast(
          isApprovalSubmission
            ? "Purchase order approved and recorded successfully!"
            : "Draft saved successfully!",
          "success"
        );
      }
      onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting Assets:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-full m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Update" : "Create"} Purchase Order
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
              activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Purchase Order Information
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "items"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("items")}
          >
            Items
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={"space-y-4 overflow-scroll"}
        >
          {activeTab === "info" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="poNo" className="text-gray-700">
                  PO No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="poNo"
                  name="poNo"
                  value={formData.poNo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="poDate" className="text-gray-700">
                  PO Date
                </label>
                <input
                  type="date"
                  id="poDate"
                  name="poDate"
                  value={formData.poDate}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="fundCluster" className="text-gray-700">
                  Fund Cluster <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fundCluster"
                  name="fundCluster"
                  value={formData.fundCluster}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="supplier" className="text-gray-700">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="address" className="text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="tin" className="text-gray-700">
                  Tin
                </label>
                <input
                  type="text"
                  id="tin"
                  name="tin"
                  value={formData.tin}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="modeOfProcurement" className="text-gray-700">
                  Mode of Procurement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="modeOfProcurement"
                  name="modeOfProcurement"
                  value={formData.modeOfProcurement}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="placeOfDelivery" className="text-gray-700">
                  Place of Delivery <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="placeOfDelivery"
                  name="placeOfDelivery"
                  value={formData.placeOfDelivery}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="deliveryTerm" className="text-gray-700">
                  Delivery Term <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="deliveryTerm"
                  name="deliveryTerm"
                  value={formData.deliveryTerm}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateOfDelivery" className="text-gray-700">
                  Date of Delivery
                </label>
                <input
                  type="date"
                  id="dateOfDelivery"
                  name="dateOfDelivery"
                  value={formData.dateOfDelivery}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="paymentTerm" className="text-gray-700">
                  Payment Term <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="paymentTerm"
                  name="paymentTerm"
                  value={formData.paymentTerm}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="ReviewedBy" className="text-gray-700">
                  Reviewed By <span className="text-red-500">*</span>
                </label>
                <SignatoriesPicker
                  signatoryType="ReviewedBy"
                  value={formData.ReviewedBy || ""}
                  onSelectSignatory={(user) =>
                    handleUserSelect(user, "ReviewedBy")
                  }
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="ApprovedBy1" className="text-gray-700">
                  Approved By <span className="text-red-500">*</span>
                </label>
                <SignatoriesPicker
                  signatoryType="ApprovedBy1"
                  value={formData.ApprovedBy1 || ""}
                  onSelectSignatory={(user) =>
                    handleUserSelect(user, "ApprovedBy1")
                  }
                />
              </div>
            </div>
          )}
          {activeTab === "items" && (
            <AssetsPOItemsTab
              items={formData.items}
              onItemsChange={handleItemsChange}
            />
          )}
        </form>
        <div className="flex justify-between mt-4">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              {mode === "edit" ? "Save as Draft" : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              {mode === "edit" ? "Save as Approved" : "Save as Approved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPOModal;
