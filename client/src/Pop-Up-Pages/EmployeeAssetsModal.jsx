import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import moment from "moment";
import assetsApi from "../api/assetsApi";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import AssetsPicker from "../Components/AssetsPicker";

const EmployeeAssetsModal = ({
  isOpen,
  onClose,
  onSaveEmployeeAssetsData,
  employeeAssetsData,
  mode,
}) => {
  const { user } = useAuth();
  const [selectedAssets, setSelectedAssets] = useState([null]);
  const [selectedInventories, setSelectedInventories] = useState([null]);

  const [activeTab, setActiveTab] = useState("employee");

  const [formData, setFormData] = useState({
    parNo: "",
    fundCluster: "",
    entityName: "",
    employeeName: "",
    dateAcquired: moment().format("YYYY-MM-DD"),
    dateReleased: moment().format("YYYY-MM-DD"),
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    assetRecords: [
      {
        category: "",
        description: "",
        propName: "",
        propNo: "",
        inventoryNo: "",
        dateAcquired: moment().format("YYYY-MM-DD"),
        amount: 0,
        assetId: "",
        inventoryId: "",
        isAssigned: false,
        condition: "",
      },
    ],
    approvedBy: { name: user.name, position: user.userType, _id: user._id },
  });

  useEffect(() => {
    console.log(employeeAssetsData);
    if (mode === "edit" && employeeAssetsData) {
      const formattedAssetRecords = employeeAssetsData.assetRecords.map(
        (record) => ({
          ...record,
          dateAcquired: record.dateAcquired
            ? moment(record.dateAcquired).format("YYYY-MM-DD")
            : moment().format("YYYY-MM-DD"),
        })
      );

      setFormData({
        ...employeeAssetsData,
        dateAcquired: employeeAssetsData.dateAcquired
          ? moment(employeeAssetsData.dateAcquired).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        dateReleased: employeeAssetsData.dateReleased
          ? moment(employeeAssetsData.dateReleased).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        assetRecords: formattedAssetRecords,
      });

      const initialSelectedAssets = employeeAssetsData.assetRecords.map(
        (record) => ({
          _id: record.assetId,
          category: record.category,
          propName: record.propName,
          propNo: record.propNo,
          unitCost: record.amount,
          inventory: record.inventoryId
            ? [
                {
                  _id: record.inventoryId,
                  invNo: record.inventoryNo,
                  condition: record.condition,
                },
              ]
            : [],
        })
      );

      const initialSelectedInventories = employeeAssetsData.assetRecords.map(
        (record) =>
          record.inventoryId
            ? {
                _id: record.inventoryId,
                invNo: record.inventoryNo,
                condition: record.condition,
              }
            : null
      );

      setSelectedAssets(initialSelectedAssets);
      setSelectedInventories(initialSelectedInventories);
    }
  }, [mode, employeeAssetsData]);

  if (!isOpen) return null;

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      const updatedAssetRecords = [...formData.assetRecords];
      updatedAssetRecords[index][name] = value;
      setFormData((prevData) => ({
        ...prevData,
        assetRecords: updatedAssetRecords,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const addAssetRecord = () => {
    setFormData({
      ...formData,
      assetRecords: [
        ...formData.assetRecords,
        {
          category: "",
          description: "",
          propNo: "",
          inventoryNo: "",
          dateAcquired: moment().format("YYYY-MM-DD"),
          amount: 0,
          assetId: "",
          inventoryId: "",
          isAssigned: false,
          condition: "",
        },
      ],
    });

    // Add null entries for new asset/inventory selections
    setSelectedAssets([...selectedAssets, null]);
    setSelectedInventories([...selectedInventories, null]);
  };

  const removeAssetRecord = (index) => {
    const updatedAssetRecords = [...formData.assetRecords];
    updatedAssetRecords.splice(index, 1);
    setFormData({
      ...formData,
      assetRecords: updatedAssetRecords,
    });

    // Also remove the corresponding selected asset and inventory
    const updatedSelectedAssets = [...selectedAssets];
    const updatedSelectedInventories = [...selectedInventories];
    updatedSelectedAssets.splice(index, 1);
    updatedSelectedInventories.splice(index, 1);
    setSelectedAssets(updatedSelectedAssets);
    setSelectedInventories(updatedSelectedInventories);
  };

  const setSelectedAsset = (index, asset) => {
    const updatedSelectedAssets = [...selectedAssets];
    updatedSelectedAssets[index] = asset;
    setSelectedAssets(updatedSelectedAssets);

    if (asset) {
      const updatedAssetRecords = [...formData.assetRecords];
      updatedAssetRecords[index] = {
        ...updatedAssetRecords[index],
        category: asset.category || "",
        propNo: asset.propNo || "",
        propName: asset.propName || "",
        assetId: asset._id,
        amount: asset.unitCost,
        isAssigned: true,
      };
      setFormData({
        ...formData,
        assetRecords: updatedAssetRecords,
      });
    }
  };

  const setSelectedInventory = (index, inventory) => {
    const updatedSelectedInventories = [...selectedInventories];
    updatedSelectedInventories[index] = inventory;
    setSelectedInventories(updatedSelectedInventories);

    if (inventory) {
      const updatedAssetRecords = [...formData.assetRecords];
      updatedAssetRecords[index] = {
        ...updatedAssetRecords[index],
        inventoryNo: inventory.invNo || "",
        inventoryId: inventory._id,
        condition: inventory.condition || "",
      };
      setFormData({
        ...formData,
        assetRecords: updatedAssetRecords,
      });
    }
  };

  const validateForm = () => {
    // if (!formData.recordedBy) {
    //   showToast("ReviewedBy is required.", "warning");
    //   return false;
    // }

    // if (!formData.propNo) {
    //   showToast("ReviewedBy is required.", "warning");
    //   return false;
    // }
    // if (!formData.propName) {
    //   showToast("ReviewedBy is required.", "warning");
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let dataToSubmit = formData;
      if (mode === "edit") {
        dataToSubmit = Object.keys(formData).reduce((acc, key) => {
          if (formData[key] !== assetsData[key]) {
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
        await assetsApi.createEmployeeAssetsRecord(formData);
        console.log("FORM DATA CREATED", formData);
        showToast("Assets Recorded successfully!", "success");
      }
      onSaveEmployeeAssetsData(formData);
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
            {mode === "edit"
              ? "Update Assets Assignment "
              : "Add Assets Assignment "}
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
              activeTab === "employee"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("employee")}
          >
            Employee Information
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "assets"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("assets")}
          >
            Assets Record
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          {activeTab === "employee" && (
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
                <label htmlFor="employeeName" className="text-gray-700">
                  Employee Name
                </label>
                <input
                  type="text"
                  id="employeeName"
                  name="employeeName"
                  value={formData.employeeName}
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
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          )}

          {activeTab === "assets" && (
            <>
              {formData.assetRecords.map((record, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-[0.7em]"
                >
                  <AssetsPicker
                    selectedAsset={selectedAssets[index]}
                    setSelectedAsset={setSelectedAsset}
                    selectedInventory={selectedInventories[index]}
                    setSelectedInventory={setSelectedInventory}
                    index={index}
                  />
                  <div>
                    <label className="block font-medium">Description</label>
                    <input
                      type="text"
                      name="description"
                      className="border rounded px-3 py-2 w-full"
                      value={record.description}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Date Acquired</label>
                    <input
                      type="date"
                      name="dateAcquired"
                      className="border rounded px-3 py-2 w-full"
                      value={record.dateAcquired}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div className="block font-medium">
                    <button
                      type="button"
                      className="bg-red-500 text-white py-2 px-2 rounded-md hover:bg-red-600"
                      onClick={() => removeAssetRecord(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-start mt-4">
                <button
                  type="button"
                  onClick={addAssetRecord}
                  className="bg-green-500 text-white py-2 px-2 rounded-md hover:bg-green-600"
                >
                  Add Asset Record
                </button>
              </div>
            </>
          )}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeAssetsModal;
