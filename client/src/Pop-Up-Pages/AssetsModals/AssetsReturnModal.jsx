import React, { useState, useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../../utils/showDialog";
import { showToast } from "../../utils/toastNotifications";
import moment from "moment";
import SignatoriesPicker from "../../Components/SignatoriesPicker";
import { useAuth } from "../../context/AuthContext";
import assetReturnApi from "../../api/assetReturnApi";
import AssetsInventoryReturnTab from "./AssetsInventoryReturnTab";

const AssetsReturnModal = ({
  isOpen,
  onClose,
  onSaveAssetReturn,
  assetsReturnData,
  mode,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("return-info");
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [lockedEmployeeId, setLockedEmployeeId] = useState(null);

  const [formData, setFormData] = useState({
    docType: "",
    purpose: "",
    parNo: "",
    fundCluster: "",
    entityName: "",
    employeeName: "",
    employeePosition: "",
    employeeId: "",
    dateReturned: moment().format("YYYY-MM-DD"),
    assetRecords: [],
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
  });

  // Populate formData in edit mode
  useEffect(() => {
    if (mode === "edit" && assetsReturnData) {
      const {
        dateReturned,
        assetRecords = [],
        employeeId = "",
        employeeName = "",
        employeePosition = "",
        ...rest
      } = assetsReturnData;

      setFormData((prev) => ({
        ...prev,
        ...rest,
        assetRecords,
        employeeId,
        employeeName,
        employeePosition,
        dateReturned: dateReturned
          ? new Date(dateReturned).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
      }));
      setLockedEmployeeId(employeeId || null);
    }
  }, [mode, assetsReturnData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
  };

  // Handle employee selection
  const handleEmployeeSelect = useCallback((employee) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: employee._id,
      employeeName: employee.employeeName,
      employeePosition: employee.employeePosition,
    }));
    setLockedEmployeeId(employee._id);
  }, []);

  // Handle canceling employee selection
  const handleCancelEmployee = useCallback(() => {
    setLockedEmployeeId(null);
    setFormData((prev) => ({
      ...prev,
      assetRecords: [],
      employeeId: "",
      employeeName: "",
      employeePosition: "",
    }));
  }, []);

  const requiredFields = [
    { key: "parNo", message: "PAR No is required." },
    { key: "fundCluster", message: "Fund Cluster is required." },
    { key: "employeeId", message: "Employee selection is required." },
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

  const handleSubmit = async (docType) => {
    try {
      if (!validateForm()) {
        return;
      }

      const cleanedRecords = [...formData.assetRecords];

      if (cleanedRecords.length === 0) {
        return showToast("No valid assets to save.", "warning");
      }

      const dataToSubmit = {
        ...formData,
        docType,
        assetRecords: cleanedRecords,
      };

      if (mode === "edit") {
        const changedData = Object.keys(dataToSubmit).reduce((acc, key) => {
          if (
            JSON.stringify(dataToSubmit[key]) !==
            JSON.stringify(assetsReturnData[key])
          ) {
            acc[key] = dataToSubmit[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedData).length === 0) {
          console.log("No changes detected.");
          return;
        }

        await assetReturnApi.updateAssetsReturnRecord(
          assetsReturnData._id,
          changedData
        );
        console.log("Updating Assets Return Record:", changedData);
        showToast("Assets updated successfully!", "success");
      } else {
        await assetReturnApi.createAssetsReturnRecord(dataToSubmit);
        console.log("Creating Assets Return Record:", dataToSubmit);
        showToast("Assets recorded successfully!", "success");
      }

      onSaveAssetReturn(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error submitting Assets:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg w-full m-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit"
              ? "Update Returning Records"
              : "Create Returning Records"}
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
              activeTab === "return-info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("return-info")}
          >
            Assets Returning Information
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="space-y-4 overflow-scroll p-5"
        >
          {activeTab === "return-info" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="parNo" className="text-gray-700">
                  PAR No
                </label>
                <input
                  type="text"
                  id="parNo"
                  name="parNo"
                  value={formData.parNo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="fundCluster" className="text-gray-700">
                  Fund Cluster
                </label>
                <input
                  type="text"
                  id="fundCluster"
                  name="fundCluster"
                  value={formData.fundCluster}
                  onChange={handleChange}
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
                <label htmlFor="purpose" className="text-gray-700">
                  Purpose
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateReturned" className="text-gray-700">
                  Date Returned
                </label>
                <input
                  type="date"
                  id="dateReturned"
                  name="dateReturned"
                  value={formData.dateReturned}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="ReviewedBy" className="text-gray-700">
                  Reviewed By
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
                  Approved By
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

          {activeTab === "inventory" && (
            <AssetsInventoryReturnTab
              selectedAssetDetail={selectedAssetDetail}
              setSelectedAssetDetail={setSelectedAssetDetail}
              handleEmployeeSelect={handleEmployeeSelect}
              handleCancelEmployee={handleCancelEmployee}
              lockedEmployeeId={lockedEmployeeId}
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </form>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => handleSubmit("Draft")}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
          >
            {mode === "edit" ? "Update Draft" : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("Approved")}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {mode === "edit" ? "Save as Approved" : "Save as Approved"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsReturnModal;
