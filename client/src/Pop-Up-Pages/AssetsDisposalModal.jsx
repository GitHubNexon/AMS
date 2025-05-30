import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import moment from "moment";
import assetIssuanceApi from "../api/assetIssuanceApi";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import EmployeePicker from "../Components/EmployeePicker";
import AssetsPicker from "../Components/AssetsPicker";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import assetsApi from "../api/assetsApi";
import assetDisposalApi from "./../api/assetDisposalApi";

const AssetsDisposalModal = ({
  isOpen,
  onClose,
  onSaveAssetDisposal,
  assetsDisposalData,
  mode,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("disposal-info");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [invalidAssetIds, setInvalidAssetIds] = useState([]);
  const [allAssets, setAllAssets] = useState([]);

  const [formData, setFormData] = useState({
    docType: "",
    parNo: "",
    fundCluster: "",
    entityName: "",
    employeeName: "",
    employeePosition: "",
    employeeId: "",
    description: "",
    dateDisposed: moment().format("YYYY-MM-DD"),
    assetRecords: [],
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
  });

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

  useEffect(() => {
    if (mode === "edit" && assetsDisposalData) {
      const {
        dateDisposed,
        assetRecords = [],
        employeeId = "",
        employeeName = "",
        ...rest
      } = assetsDisposalData;

      setFormData((prev) => ({
        ...prev,
        ...rest,
        assetRecords,
        employeeId,
        employeeName,
        dateDisposed: dateDisposed
          ? new Date(dateDisposed).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
        dateReleased: dateReleased
          ? new Date(dateReleased).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
      }));
    }
  }, [mode, assetsDisposalData]);

  const handleAddRecord = () => {
    if (!selectedAsset || !selectedInventory) {
      showToast("Select both asset and inventory before adding.", "warning");
      return;
    }

    const alreadyExists = formData.assetRecords.some(
      (record) =>
        record.assetId === selectedAsset._id &&
        record.inventoryId === selectedInventory._id
    );

    if (alreadyExists) {
      showToast(
        "This asset-inventory combination is already added.",
        "warning"
      );
      return;
    }

    const newRecord = {
      assetId: selectedAsset._id,
      inventoryId: selectedInventory._id,
      unit: selectedAsset.category,
      useFullLife: selectedAsset.useFullLife,
      description:
        selectedInventory.invDescription || selectedInventory.description,
      itemNo: selectedInventory.invNo,
      amount: selectedAsset.unitCost,
      location: "",
    };

    setFormData((prev) => ({
      ...prev,
      assetRecords: [...prev.assetRecords, newRecord],
    }));

    setSelectedAsset(null);
    setSelectedInventory(null);
  };

  const handleRowClick = (record) => {
    const { assetId, inventoryId } = record;
    setSelectedAsset({
      _id: assetId,
      category: record.unit,
      unitCost: record.amount,
      useFullLife: record.useFullLife,
    });
    setSelectedInventory({
      _id: inventoryId,
      invNo: record.itemNo,
      invDescription: record.description,
    });
  };

  const requiredFields = [
    { key: "parNo", message: "Par No is required." },
    { key: "fundCluster", message: "fund Cluster is required." },
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

      let cleanedRecords = [...formData.assetRecords];

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
          if (dataToSubmit[key] !== assetsDisposalData[key]) {
            acc[key] = dataToSubmit[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedData).length === 0) {
          console.log("No changes detected.");
          return;
        }

        await assetDisposalApi.updateAssetsDisposalRecord(
          assetsDisposalData._id,
          changedData
        );
        showToast("Assets updated successfully!", "success");
      } else {
        await assetDisposalApi.createAssetsDisposalRecord(dataToSubmit);
        showToast("Assets recorded successfully!", "success");
      }

      onSaveAssetDisposal(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error submitting Assets:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-5 rounded-lg w-full m-10 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Update Issuance " : "Create Issuance"}
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
              activeTab === "disposal-info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("disposal-info")}
          >
            Assets Issuance Information
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
          className={"space-y-4 overflow-scroll  p-5"}
        >
          {activeTab === "disposal-info" && (
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
                <label htmlFor="dateAcquired" className="text-gray-700">
                  Date Acquired
                </label>
                <input
                  type="date"
                  id="dateAcquired"
                  name="dateAcquired"
                  value={formData.dateAcquired}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateReleased" className="text-gray-700">
                  Date Released
                </label>
                <input
                  type="date"
                  id="dateReleased"
                  name="dateReleased"
                  value={formData.dateReleased}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <EmployeePicker
                  value={
                    formData.employeeId &&
                    formData.employeeName &&
                    formData.employeePosition
                      ? {
                          _id: formData.employeeId,
                          employeeName: formData.employeeName,
                          employeePosition: formData.employeePosition,
                        }
                      : null
                  }
                  onSelect={(employee) => {
                    setFormData((prev) => ({
                      ...prev,
                      employeeId: employee._id,
                      employeeName: employee.employeeName,
                      employeePosition: employee.employeePosition,
                    }));
                  }}
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
            <div className="space-y-4">
              <AssetsPicker
                value={{ asset: selectedAsset, inventory: selectedInventory }}
                onSelectAsset={setSelectedAsset}
                onSelectInventory={setSelectedInventory}
              />

              <button
                type="button"
                className="flex items-center gap-2 text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={handleAddRecord}
              >
                <FaPlus /> Add Record
              </button>

              <table className="w-full text-xs mt-4 border">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Item No</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.assetRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRowClick(record)}
                      title=""
                    >
                      <td>{record.unit}</td>
                      <td>{record.description}</td>
                      <td>
                        <input
                          type="text"
                          value={record.location || ""}
                          onChange={(e) => {
                            const updatedRecords = [...formData.assetRecords];
                            updatedRecords[index].location = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              assetRecords: updatedRecords,
                            }));
                          }}
                          className="border border-gray-300 rounded p-1 text-xs w-full"
                          placeholder="Enter location"
                        />
                      </td>
                      <td>{record.itemNo}</td>
                      <td>{numberToCurrencyString(record.amount)}</td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData((prev) => ({
                              ...prev,
                              assetRecords: prev.assetRecords.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          <FaTrash className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default AssetsDisposalModal;
