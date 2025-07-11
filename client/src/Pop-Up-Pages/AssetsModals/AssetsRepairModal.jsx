import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../../utils/showDialog";
import { showToast } from "../../utils/toastNotifications";
import moment from "moment";
import assetIssuanceApi from "../../api/assetIssuanceApi";
import SignatoriesPicker from "../../Components/SignatoriesPicker";
import { useAuth } from "../../context/AuthContext";
import EmployeePicker from "../../Components/EmployeePicker";
import AssetsPicker from "../../Components/AssetsPicker";
import {
  numberToCurrencyString,
  formatReadableDate,
} from "../../helper/helper";
import assetsApi from "../../api/assetsApi";
import assetDisposalApi from "../../api/assetDisposalApi";
import AssetsLogic from "../../hooks/AssetsLogic";
import assetRepairApi from "../../api/assetRepairApi";
import AssetsInventoryUnderRepairTab from "./AssetsInventoryUnderRepairTab";

const AssetsRepairModal = ({
  isOpen,
  onClose,
  onSaveAssetRepair,
  assetsRepairData,
  mode,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("repair-info");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [invalidAssetIds, setInvalidAssetIds] = useState([]);
  const [allAssets, setAllAssets] = useState([]);

  const { fetchAssets } = AssetsLogic();

  useEffect(() => {
    fetchAssets();
  }, []);

  const [formData, setFormData] = useState({
    docType: "",
    parNo: "",
    fundCluster: "",
    entityName: "Government",
    // employeeName: "",
    // employeePosition: "",
    // employeeId: "",
    description: "",
    dateRepairStart: moment().format("YYYY-MM-DD"),
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
    if (mode === "edit" && assetsRepairData) {
      const {
        dateRepairStart,
        assetRecords = [],
        // employeeId = "",
        // employeeName = "",
        ...rest
      } = assetsRepairData;

      setFormData((prev) => ({
        ...prev,
        ...rest,
        assetRecords,
        // employeeId,
        // employeeName,
        dateRepairStart: dateRepairStart
          ? new Date(dateRepairStart).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
        // dateReleased: dateReleased
        //   ? new Date(dateReleased).toISOString().split("T")[0]
        //   : moment().format("YYYY-MM-DD"),
      }));
    }
  }, [mode, assetsRepairData]);

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
          if (dataToSubmit[key] !== assetsRepairData[key]) {
            acc[key] = dataToSubmit[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedData).length === 0) {
          console.log("No changes detected.");
          return;
        }

        await assetRepairApi.updateAssetsRepairRecord(
          assetsRepairData._id,
          changedData
        );
        console.log("Assets Repair Data to Update:", changedData);
        showToast("Assets updated successfully!", "success");
      } else {
        await assetRepairApi.createAssetsRepairRecord(dataToSubmit);
        console.log("Assets Repair Data to Submit:", dataToSubmit);
        showToast("Assets recorded successfully!", "success");
      }

      onSaveAssetRepair(dataToSubmit);
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
            {mode === "edit" ? "Update Repair Record " : "Create Repair Record"}
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
              activeTab === "repair-info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("repair-info")}
          >
            Assets Repair Information
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
          {activeTab === "repair-info" && (
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
                <label htmlFor="description" className="text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateRepaired" className="text-gray-700">
                  Date for Repair
                </label>
                <input
                  type="date"
                  id="dateRepairStart"
                  name="dateRepairStart"
                  value={formData.dateRepairStart}
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
            <AssetsInventoryUnderRepairTab
              selectedAsset={selectedAsset}
              selectedInventory={selectedInventory}
              setSelectedAsset={setSelectedAsset}
              setSelectedInventory={setSelectedInventory}
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

export default AssetsRepairModal;
