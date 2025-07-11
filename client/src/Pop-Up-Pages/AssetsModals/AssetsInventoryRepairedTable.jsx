import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { showToast } from "../../utils/toastNotifications";
import AssetsPicker from "../../Components/AssetsPicker";
import { numberToCurrencyString } from "../../helper/helper";

const AssetsInventoryRepairedTable = ({
  selectedAsset,
  selectedInventory,
  setSelectedAsset,
  setSelectedInventory,
  formData,
  setFormData,
}) => {
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

  const handleLocationChange = (index, value) => {
    const updatedRecords = [...formData.assetRecords];
    updatedRecords[index].location = value;
    setFormData((prev) => ({
      ...prev,
      assetRecords: updatedRecords,
    }));
  };

  const handleRemoveRecord = (index) => {
    setFormData((prev) => ({
      ...prev,
      assetRecords: prev.assetRecords.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <AssetsPicker
        value={{ asset: selectedAsset, inventory: selectedInventory }}
        onSelectAsset={setSelectedAsset}
        onSelectInventory={setSelectedInventory}
        isForRepair={true}
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
                  onChange={(e) => handleLocationChange(index, e.target.value)}
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
                    handleRemoveRecord(index);
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
  );
};

export default AssetsInventoryRepairedTable;
