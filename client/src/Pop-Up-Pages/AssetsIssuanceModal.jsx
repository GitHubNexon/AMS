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

const AssetsIssuanceModal = ({
  isOpen,
  onClose,
  onSaveAssetIssuance,
  assetsIssuanceData,
  mode,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("issuance-info");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const [formData, setFormData] = useState({
    docType: "",
    parNo: "",
    fundCluster: "",
    fundCluster: "",
    entityName: "",
    employeeName: "",
    employeeId: "",
    dateAcquired: moment().format("YYYY-MM-DD"),
    dateReleased: moment().format("YYYY-MM-DD"),
    assetRecords: [],
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (mode === "edit" && assetsIssuanceData) {
      const {
        dateAcquired,
        dateReleased,
        assetRecords = [],
        employeeId = "",
        employeeName = "",
        ...rest
      } = assetsIssuanceData;

      setFormData((prev) => ({
        ...prev,
        ...rest,
        assetRecords,
        employeeId,
        employeeName,
        dateAcquired: dateAcquired
          ? new Date(dateAcquired).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
        dateReleased: dateReleased
          ? new Date(dateReleased).toISOString().split("T")[0]
          : moment().format("YYYY-MM-DD"),
      }));
    }
  }, [mode, assetsIssuanceData]);

  const handleAddRecord = () => {
    if (!selectedAsset || !selectedInventory) {
      showToast("Select both asset and inventory before adding.", "warning");
      return;
    }

    const newRecord = {
      assetId: selectedAsset._id,
      inventoryId: selectedInventory._id,
      unit: selectedAsset.category,
      description:
        selectedInventory.invDescription || selectedInventory.description,
      itemNo: selectedInventory.invNo,
      amount: selectedAsset.unitCost,
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
    });
    setSelectedInventory({
      _id: inventoryId,
      invNo: record.itemNo,
      invDescription: record.description,
    });
  };

  const requiredFields = [
    { key: "propNo", message: "Property Number is required." },
    { key: "propName", message: "Property Name is required." },
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
    // if (!validateForm()) {
    //   return;
    // }

    try {
      let dataToSubmit = formData;
      if (mode === "edit") {
        dataToSubmit = Object.keys(formData).reduce((acc, key) => {
          if (formData[key] !== assetsIssuanceData[key]) {
            acc[key] = formData[key];
          }
          return acc;
        }, {});

        if (Object.keys(dataToSubmit).length === 0) {
          console.log("No changes detected.");
          return;
        }

        // await assetsApi.updateAssetsRecord(assetsData._id, dataToSubmit);
        console.log("FORM DATA UPDATED", dataToSubmit);
        showToast("Assets updated successfully!", "success");
      } else {
        // await assetsApi.createAssetsRecord(formData);
        console.log("FORM DATA CREATED", formData);
        showToast("Assets Recorded successfully!", "success");
      }
      //   onSaveAssetIssuance(formData);
      //   onClose();
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
              activeTab === "issuance-info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("issuance-info")}
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
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          {activeTab === "issuance-info" && (
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
                    formData.employeeId && formData.employeeName
                      ? {
                          _id: formData.employeeId,
                          employeeName: formData.employeeName,
                        }
                      : null
                  }
                  onSelect={(employee) => {
                    setFormData((prev) => ({
                      ...prev,
                      employeeId: employee._id,
                      employeeName: employee.employeeName,
                    }));
                  }}
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
                    <th>Item No</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.assetRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(record)}
                    >
                      <td>{record.unit}</td>
                      <td>{record.description}</td>
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
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {mode === "edit" ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsIssuanceModal;
