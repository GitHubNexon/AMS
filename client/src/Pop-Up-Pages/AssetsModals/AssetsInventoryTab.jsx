import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { showToast } from "../../utils/toastNotifications";

const AssetsInventoryTab = ({
  formData,
  handleInventoryChange,
  addInventoryRecord,
  removeInventoryRecord,
}) => {
  const handleAddInventoryRecord = () => {
    if (formData.inventory.length >= formData.quantity) {
      showToast(
        `Cannot add more inventory items. Maximum quantity is ${formData.quantity}.`,
        "warning"
      );
      return;
    }
    addInventoryRecord();
  };

  return (
    <div className="space-y-6">
      {/* Add Inventory Item Button - Sticky Header */}
      <div className="sticky top-0 z-50 bg-white p-2 flex justify-end border-b">
        <button
          type="button"
          onClick={handleAddInventoryRecord}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <FaPlus className="text-white" />
          Add Inventory Item
        </button>
      </div>

      {/* Inventory Items Grid */}
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
            <label htmlFor={`invName-${index}`} className="text-gray-700">
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
            <label htmlFor={`description-${index}`} className="text-gray-700">
              Description
            </label>
            <input
              type="text"
              id={`description-${index}`}
              value={item.description}
              onChange={(e) =>
                handleInventoryChange(index, "description", e.target.value)
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
  );
};

export default AssetsInventoryTab;