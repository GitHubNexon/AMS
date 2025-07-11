import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { showToast } from "../../utils/toastNotifications";
import AssetsEmployeePicker from "../../Components/AssetsEmployeePicker";
import { numberToCurrencyString } from "../../helper/helper";

const AssetsInventoryReturnTab = ({
  selectedAssetDetail,
  setSelectedAssetDetail,
  handleEmployeeSelect,
  handleCancelEmployee,
  lockedEmployeeId,
  formData,
  setFormData,
}) => {
  // Handle adding a new asset record
  const handleAddRecord = () => {
    if (!selectedAssetDetail) {
      showToast("Please select an asset detail to add.", "warning");
      return;
    }

    const alreadyExists = formData.assetRecords.some(
      (record) =>
        record.assetId === selectedAssetDetail.assetId &&
        record.inventoryId === selectedAssetDetail.inventoryId
    );

    if (alreadyExists) {
      showToast("This asset is already added.", "warning");
      return;
    }

    const newRecord = {
      assetId: selectedAssetDetail.assetId,
      inventoryId: selectedAssetDetail.inventoryId,
      quantity: selectedAssetDetail.quantity || 1,
      unit: selectedAssetDetail.unit,
      description: selectedAssetDetail.description,
      itemNo: selectedAssetDetail.itemNo,
      amount: selectedAssetDetail.amount,
    };

    setFormData((prev) => ({
      ...prev,
      assetRecords: [...prev.assetRecords, newRecord],
    }));

    setSelectedAssetDetail(null);
  };

  // Handle row click to populate AssetsEmployeePicker for editing
  const handleRowClick = (record) => {
    setSelectedAssetDetail({
      assetId: record.assetId,
      inventoryId: record.inventoryId,
      quantity: record.quantity,
      unit: record.unit,
      description: record.description,
      itemNo: record.itemNo,
      amount: record.amount,
    });
  };

  // Handle delete record
  const handleDeleteRecord = (e, index) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      assetRecords: prev.assetRecords.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <AssetsEmployeePicker
        value={selectedAssetDetail}
        onSelect={setSelectedAssetDetail}
        onEmployeeSelect={handleEmployeeSelect}
        onCancelEmployee={handleCancelEmployee}
        lockedEmployeeId={lockedEmployeeId}
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
            <th>Quantity</th>
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
              title="Click to edit"
            >
              <td>{record.unit}</td>
              <td>{record.description}</td>
              <td>{record.itemNo}</td>
              <td>{record.quantity}</td>
              <td>{numberToCurrencyString(record.amount)}</td>
              <td>
                <button onClick={(e) => handleDeleteRecord(e, index)}>
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

export default AssetsInventoryReturnTab;
