import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const AssetsPRItemsTab = ({ items, onItemsChange }) => {
  const [localItems, setLocalItems] = useState(items || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState({});

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  // Initialize with empty item if no items exist
  useEffect(() => {
    if (localItems.length === 0) {
      const newItem = {
        propertyNo: "",
        unit: "",
        description: "",
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
      };
      setLocalItems([newItem]);
      onItemsChange([newItem]);
    }
  }, []);

  const handleAddItem = () => {
    const newItem = {
      propertyNo: "",
      unit: "",
      description: "",
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
    };
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const handleRemoveItem = (index) => {
    if (localItems.length > 1) {
      const updatedItems = localItems.filter((_, i) => i !== index);
      setLocalItems(updatedItems);
      onItemsChange(updatedItems);
      // Cancel editing if we're removing the item being edited
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingItem({});
      }
    }
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    setEditingItem({ ...localItems[index] });
  };

  const handleSaveEdit = () => {
    const updatedItems = [...localItems];
    updatedItems[editingIndex] = {
      ...editingItem,
      totalCost:
        parseFloat(editingItem.quantity) * parseFloat(editingItem.unitCost) ||
        0,
    };
    setLocalItems(updatedItems);
    onItemsChange(updatedItems);
    setEditingIndex(null);
    setEditingItem({});
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingItem({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    let updatedItem = { ...editingItem, [name]: value };

    // Auto-calculate total cost when quantity or unit cost changes
    if (name === "quantity" || name === "unitCost") {
      updatedItem.totalCost =
        parseFloat(updatedItem.quantity) * parseFloat(updatedItem.unitCost) ||
        0;
    }

    setEditingItem(updatedItem);
  };

  const calculateGrandTotal = () => {
    return localItems.reduce(
      (total, item) => total + (parseFloat(item.totalCost) || 0),
      0
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Item Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Items</h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 flex items-center gap-2 text-sm"
        >
          <FaPlus size={12} />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Property No.
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Unit
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Description
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Quantity
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Unit Cost
              </th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                Total Cost
              </th>
              <th className="px-4 py-2 text-center text-gray-600 font-medium border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-2">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      name="propertyNo"
                      value={editingItem.propertyNo}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 p-1 rounded text-xs"
                      placeholder="Property No."
                    />
                  ) : (
                    <span className="text-gray-700">
                      {item.propertyNo || "-"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      name="unit"
                      value={editingItem.unit}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 p-1 rounded text-xs"
                      placeholder="Unit"
                    />
                  ) : (
                    <span className="text-gray-700">{item.unit || "-"}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      name="description"
                      value={editingItem.description}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 p-1 rounded text-xs"
                      placeholder="Description"
                    />
                  ) : (
                    <span className="text-gray-700">
                      {item.description || "-"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editingItem.quantity}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 p-1 rounded text-xs"
                      placeholder="0"
                      min="0"
                    />
                  ) : (
                    <span className="text-gray-700">{item.quantity || 0}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      name="unitCost"
                      value={editingItem.unitCost}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 p-1 rounded text-xs"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <span className="text-gray-700">
                      ₱
                      {parseFloat(item.unitCost || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <span className="text-gray-700 font-medium">
                    ₱
                    {parseFloat(
                      editingIndex === index
                        ? editingItem.totalCost
                        : item.totalCost || 0
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          <FaSave size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel"
                        >
                          <FaTimes size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditItem(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                          disabled={localItems.length === 1}
                        >
                          <FaTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td
                colSpan="5"
                className="px-4 py-3 text-right font-semibold text-gray-700"
              >
                Grand Total:
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">
                ₱
                {calculateGrandTotal().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Items:</span>
          <span className="font-semibold text-gray-900">
            {localItems.length}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Grand Total:</span>
          <span className="font-bold text-lg text-gray-900">
            ₱
            {calculateGrandTotal().toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetsPRItemsTab;
