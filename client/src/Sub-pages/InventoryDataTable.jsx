import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
  FaDollarSign,
  FaTrash,
} from "react-icons/fa";
import DepreciationApi from "../api/DepreciationApi";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import Modal from "../Components/Modal";
import PropertySaleForm from "../Components/PropertySaleForm";
import { showToast } from "../utils/toastNotifications";

const ConditionDropdown = ({
  inventoryId,
  currentConditions,
  onConditionUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const conditionMapping = {
    GoodCondition: "In Good Condition",
    ForSale: "For Sale",
    ForRepair: "For Repair",
    ForDisposal: "For Disposal",
    Unserviceable: "Unserviceable/Damaged",
    Lost: "Lost/Stolen",
  };

  const handleCheckboxChange = async (conditionKey) => {
    const newConditions = {
      ...currentConditions,
      [conditionKey]: !currentConditions[conditionKey],
    };
    console.log(`Checkbox changed for ${inventoryId}:`, newConditions);

    try {
      const response = await DepreciationApi.updateCondition(
        inventoryId,
        newConditions
      );
      console.log(`API response for ${inventoryId}:`, response);
      onConditionUpdate(response.updatedInventoryItem);
    } catch (error) {
      console.error(`Failed to update condition for ${inventoryId}:`, error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-200 rounded-full"
      >
        <FaEdit />
      </button>

      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
          <div className="py-1">
            {Object.entries(conditionMapping).map(([key, label]) => (
              <label
                key={`${inventoryId}-${key}`}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentConditions[key] || false}
                  onChange={() => handleCheckboxChange(key)}
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryDataTable = ({ DataId }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);
  const [selectedInventoryData, setSelectedInventoryData] = useState(null);

  const [saleMode, setSaleMode] = useState("add");
  const [existingSaleData, setExistingSaleData] = useState(null);

  const fetchData = async () => {
    try {
      const data = await DepreciationApi.getInventoryTable(
        pagination.page,
        pagination.limit,
        DataId
      );
      setInventoryData(data.data);
      setPagination({ total: data.total, page: data.page, limit: data.limit });
    } catch (error) {
      console.error("Error fetching inventory table:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      await DepreciationApi.deleteItem(saleId);
      showToast("Sell Form Deleted", "success");
      fetchData();
    } catch (error) {
      console.error("Failed to delete sale item:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [DataId, pagination.page, pagination.limit]);

  const handlePagination = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const conditionMapping = {
    GoodCondition: "In Good Condition",
    ForSale: "For Sale",
    ForRepair: "For Repair",
    ForDisposal: "For Disposal",
    Unserviceable: "Unserviceable/Damaged",
    Lost: "Lost/Stolen",
  };

  const renderConditions = (conditions, inventoryId) => {
    return Object.keys(conditionMapping).map((key) => {
      if (conditions[key]) {
        return <li key={`${inventoryId}-${key}`}>{conditionMapping[key]}</li>;
      }
      return null;
    });
  };

  const handleConditionUpdate = (updatedItem) => {
    setInventoryData((prevData) => {
      const newData = prevData.map((item) => {
        if (item.Inventory._id === updatedItem._id) {
          const updated = {
            ...item,
            Inventory: {
              ...item.Inventory,
              ...updatedItem, // Merge all updated properties
            },
          };
          console.log(`Updated item ${item.Inventory._id}:`, updated);
          return updated;
        }
        return item;
      });
      console.log("New inventory data:", newData);
      return newData;
    });
  };

  const handleOpenSaleModal = (item, mode = "add", existingSaleData = null) => {
    setSelectedInventoryData({
      itemName: item.Name,
      itemNo: item.Inventory.InventoryNo,
      inventoryId: item.Inventory._id,
      personAccountable: item.Inventory.PersonAccountable,
      unitCost: item.UnitCost,
      currentCost: item.CurrentCost,
      currentAdValue: item.CurrentAdValue,
      remarks: item.Inventory.Remarks,
      issuedTo: item.Inventory.issuedTo,
      location: item.Inventory.Location,
      conditions: item.Inventory.Condition,
      adDate:
        item.LatestAccumulatedDepreciation?.Month ||
        item.FirstAccumulatedDepreciation?.Month,
      adValue:
        item.LatestAccumulatedDepreciation?.Value ||
        item.FirstAccumulatedDepreciation?.Value,
    });

    setShowSaleModal(true);
    setSaleMode(mode);
    setExistingSaleData(existingSaleData);
    console.log("existing data", existingSaleData);
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full table-auto bg-white shadow-md rounded-lg border border-gray-200 text-[0.8rem]">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-center">Inventory No</th>
            <th className="py-2 px-4 text-center">Unit Cost</th>
            <th className="py-2 px-4 text-center">Current Book Value </th>
            <th className="py-2 px-4 text-center">Current AD Value</th>
            <th className="py-2 px-4 text-center">Remarks</th>
            <th className="py-2 px-4 text-center">Issued To</th>
            <th className="py-2 px-4 text-center">Issue Date</th>
            <th className="py-2 px-4 text-center">Person Accountable</th>
            <th className="py-2 px-4 text-center">Location</th>
            <th className="py-2 px-4 text-center">Conditions</th>
            <th className="py-2 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item, index) => (
            <tr
              key={`${item.Inventory._id}-${index}`}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-2 px-4">{item.Inventory.InventoryNo}</td>
              <td className="py-2 px-4 text-center">
                {numberToCurrencyString(item.UnitCost || 0)}
              </td>
              <td className="py-2 px-4 text-center">
                {numberToCurrencyString(item.CurrentCost || 0)}
              </td>
              <td className="py-2 px-4 text-center">
                {numberToCurrencyString(item.CurrentAdValue || 0)}
              </td>
              <td className="py-2 px-4">{item.Inventory.Remarks}</td>
              <td className="py-2 px-4">{item.Inventory.issuedTo}</td>
              <td className="py-2 px-4">
                {formatReadableDate(item.Inventory.issueDate)}
              </td>
              <td className="py-2 px-4">{item.Inventory.PersonAccountable}</td>
              <td className="py-2 px-4">{item.Inventory.Location}</td>
              <td className="py-2 px-4">
                <ul>
                  {renderConditions(
                    item.Inventory.Condition,
                    item.Inventory._id
                  )}
                </ul>
              </td>
              <td className="flex space-x-2">
                <ConditionDropdown
                  inventoryId={item.Inventory._id}
                  currentConditions={item.Inventory.Condition}
                  onConditionUpdate={handleConditionUpdate}
                />

                {item.Inventory.Condition.ForSale ? (
                  item.PropertySales &&
                  Object.keys(item.PropertySales).length > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          handleOpenSaleModal(item, "edit", item.PropertySales)
                        }
                      >
                        <FaDollarSign />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(item.PropertySales._id)}
                        className="p-2 hover:bg-red-200 rounded-full text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleOpenSaleModal(item)}>
                      <FaDollarSign />
                    </button>
                  )
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => handlePagination(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="p-2 bg-gray-300 rounded-md disabled:bg-gray-200"
        >
          <FaArrowLeft />
        </button>
        <div className="text-sm text-gray-700">
          Page {pagination.page} of{" "}
          {Math.ceil(pagination.total / pagination.limit)} ({pagination.total}{" "}
          Records)
        </div>
        <button
          onClick={() => handlePagination(pagination.page + 1)}
          disabled={pagination.page * pagination.limit >= pagination.total}
          className="p-2 bg-gray-300 rounded-md disabled:bg-gray-200"
        >
          <FaArrowRight />
        </button>
      </div>

      <Modal
        title={saleMode === "add" ? "Add Property Sale" : "Edit Property Sale"}
        show={showSaleModal}
        // closeCallback={() => setShowSaleModal(false)}
        closeCallback={() => {
          setShowSaleModal(false);
          setExistingSaleData(null);
          setSelectedInventoryData(null);
        }}
      >
        {selectedInventoryData && (
          <PropertySaleForm
            inventoryData={selectedInventoryData}
            closeCallback={() => {
              setShowSaleModal(false);
              fetchData();
            }}
            mode={saleMode}
            existingSaleData={existingSaleData}
          />
        )}
      </Modal>
    </div>
  );
};

export default InventoryDataTable;
