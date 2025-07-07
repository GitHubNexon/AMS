import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../../utils/showDialog";
import { showToast } from "../../utils/toastNotifications";
import moment from "moment";
import assetsPRApi from "../../api/assetsPRApi";
import SignatoriesPicker from "../../Components/SignatoriesPicker";
import { useAuth } from "../../context/AuthContext";
import AssetsPRItemsTab from "./AssetsPRItemsTab";

const AssetsPRModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const { user } = useAuth();
  const formatDate = (date) => {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  };
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    isApproved: false,
    prNo: "",
    entityName: "Government",
    fundCluster: "",
    officeSection: "",
    ResponsibilityCenterCode: "",
    prDate: moment().format("YYYY-MM-DD"),
    purpose: "",
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
      const formattedPRDate = formatDate(initialData.prDate);
      setFormData((prev) => ({
        ...prev,
        ...rest,
        items,
        prDate: formattedPRDate,
      }));
    }
  }, [mode, initialData]);

  const requiredFields = [
    { key: "prNo", message: "PR No is required." },
    { key: "fundCluster", message: "fund Cluster is required." },
  ];

  // Additional validation for approved submissions
  const approvalRequiredFields = [
    {
      key: "officeSection",
      message: "Office Section is required for approval.",
    },
    { key: "purpose", message: "Purpose is required for approval." },
    {
      key: "ResponsibilityCenterCode",
      message: "Responsibility Center Code is required for approval.",
    },
  ];

  const validateForm = (isApprovalSubmission = false) => {
    // Check basic required fields
    for (let { key, message } of requiredFields) {
      if (!formData[key]) {
        showToast(message, "warning");
        return false;
      }
    }

    // Check additional fields for approval submission
    if (isApprovalSubmission) {
      for (let { key, message } of approvalRequiredFields) {
        if (!formData[key]) {
          showToast(message, "warning");
          return false;
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
          "At least one complete item (with description, quantity, and unit cost) is required for approval.",
          "warning"
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (isApprovalSubmission = false) => {
    if (!validateForm(isApprovalSubmission)) {
      return;
    }

    try {
      // Prepare the data with the appropriate approval status
      const submitData = {
        ...formData,
        isApproved: isApprovalSubmission,
        // Add timestamp for when it was approved if it's an approval submission
        ...(isApprovalSubmission && { approvedAt: new Date().toISOString() }),
        // Add timestamp for when it was saved as draft
        ...(!isApprovalSubmission && {
          draftSavedAt: new Date().toISOString(),
        }),
      };

      if (mode === "edit" && initialData) {
        await assetsPRApi.updatePurchaseRequest(initialData._id, submitData);
        console.log("FORM DATA UPDATED", submitData);
        showToast(
          isApprovalSubmission
            ? "Purchase request approved and updated successfully!"
            : "Draft updated successfully!",
          "success"
        );
      } else {
        await assetsPRApi.createPurchaseRequest(submitData);
        console.log("FORM DATA CREATED", submitData);
        showToast(
          isApprovalSubmission
            ? "Purchase request approved and recorded successfully!"
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-5 rounded-lg w-full m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Update" : "Create"} Purchase Request
            {formData.isApproved && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Approved
              </span>
            )}
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
            Purchase Request Information
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
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          {activeTab === "info" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="prNo" className="text-gray-700">
                  PR No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="prNo"
                  name="prNo"
                  value={formData.prNo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="prDate" className="text-gray-700">
                  PR Date
                </label>
                <input
                  type="date"
                  id="prDate"
                  name="prDate"
                  value={formData.prDate}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="officeSection" className="text-gray-700">
                  Office Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="officeSection"
                  name="officeSection"
                  value={formData.officeSection}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="purpose" className="text-gray-700">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="ResponsibilityCenterCode"
                  className="text-gray-700"
                >
                  Responsibility Center Code{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ResponsibilityCenterCode"
                  name="ResponsibilityCenterCode"
                  value={formData.ResponsibilityCenterCode}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="entityName" className="text-gray-700">
                  Entity Name
                </label>
                <input
                  type="text"
                  id="entityName"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleChange}
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
            <AssetsPRItemsTab
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

export default AssetsPRModal;
