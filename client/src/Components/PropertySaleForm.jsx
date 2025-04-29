import React, { useState, useEffect } from "react";
import DepreciationApi from "../api/DepreciationApi";
import { showToast } from "../utils/toastNotifications";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import CurrencyInput from "../Components/CurrencyInput";
import {
  numberToCurrencyString,
  formatFullReadableDate,
} from "../helper/helper";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // React Icons

const PropertySaleForm = ({
  inventoryData,
  closeCallback,
  mode = "add",
  existingSaleData,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    InventoryId: inventoryData.inventoryId || "",
    SellingDate: "",
    SellingPrice: 0,
    Cost: inventoryData.currentCost,
    Ad: {
      Date: inventoryData.adDate,
      Value: inventoryData.adValue,
    },
    BookValue: 0,
    GainLoss: 0,
    PropertyInfo: {
      Name: inventoryData.itemName,
      itemNo: inventoryData.itemNo,
    },
  });

  useEffect(() => {
    setFormData((prevData) => {
      const bookValue = prevData.Cost - prevData.Ad.Value;
      const gainLoss = prevData.SellingPrice - bookValue;
      return {
        ...prevData,
        BookValue: bookValue,
        GainLoss: gainLoss,
      };
    });
  }, [formData.SellingPrice, formData.Cost, formData.Ad?.Value]);

  useEffect(() => {
    if (mode === "edit" && existingSaleData) {
      const saleData = existingSaleData; 
      setFormData({
        ...saleData,
        CreatedBy: saleData.CreatedBy || { name: "", position: "", _id: "" },
        PreparedBy: saleData.PreparedBy || { name: "", position: "", _id: "" },
        ReviewedBy: saleData.ReviewedBy || { name: "", position: "", _id: "" },
        Ad: saleData.Ad || { Date: "", Value: 0 },
        SellingDate: saleData.SellingDate.split("T")[0],
      });
    }
    console.log("Existing Sale Data", existingSaleData);
  }, [mode, existingSaleData]);

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      CreatedBy: { name: user.name, position: user.userType, _id: user._id },
      PreparedBy: { name: user.name, position: user.userType, _id: user._id },
      ReviewedBy: { name: "", position: "", _id: "" },
      InventoryId: inventoryData.inventoryId || "",
      SellingDate: "",
      SellingPrice: 0,
      Cost: inventoryData.currentCost,
      Ad: {
        Date: inventoryData.adDate,
        Value: inventoryData.adValue,
      },
      BookValue: 0,
      GainLoss: 0,
    });
  };

  const validateForm = () => {
    if (!formData.ReviewedBy) {
      showToast("ReviewedBy is required.", "warning");
      return false;
    }
    if (!formData.PreparedBy) {
      showToast("PreparedBy is required.", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await DepreciationApi.sellItem(formData);
        console.log("Item sold successfully", formData);
      } else if (mode === "edit") {
        const saleData = Array.isArray(existingSaleData)
          ? existingSaleData[0]
          : existingSaleData;
        const saleId = saleData._id;
        response = await DepreciationApi.updateSellItem(saleId, formData);
        console.log("Item updated successfully", formData);
      }

      showToast(response.message, "success");
      if (closeCallback) closeCallback();
      // handleReset();
    } catch (error) {
      showToast("Failed to submit property sale", "error");
      console.error("Submit error:", error);
    }
  };

  const gainLossClass =
    formData.GainLoss >= 0 ? "text-green-500" : "text-red-500";
  const gainLossIcon =
    formData.GainLoss >= 0 ? (
      <FaArrowUp className="text-green-500" />
    ) : (
      <FaArrowDown className="text-red-500" />
    );

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="font-semibold text-lg">
          {mode === "add" ? "Add Property Sale" : "Edit Property Sale"}
        </h3>

        {/* Inventory No */}
        <div className="text-sm">
          <span>Inventory No: </span>
          <span className="text-green-400">{formData.PropertyInfo.itemNo}</span>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <label htmlFor="PropertyInfo" className="block text-gray-700">
              Property Name
            </label>
            <input
              type="text"
              value={formData.PropertyInfo.Name}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="SellingDate" className="block text-gray-700">
              Selling Date
            </label>
            <input
              type="date"
              name="SellingDate"
              value={formData.SellingDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500"
              required
            />
          </div>
          <div>
            <label htmlFor="SellingPrice" className="block text-gray-700">
              Selling Price
            </label>
            <CurrencyInput
              val={formData.SellingPrice}
              setVal={(value) =>
                setFormData((prev) => ({ ...prev, SellingPrice: value }))
              }
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="Cost" className="block text-gray-700">
              Cost
            </label>
            <CurrencyInput
              val={formData.Cost}
              setVal={(value) =>
                setFormData((prev) => ({ ...prev, Cost: value }))
              }
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500 pointer-events-none"
            />
          </div>
          <div>
            <label htmlFor="PreparedBy" className="block text-gray-700">
              Prepared By
            </label>
            <SignatoriesPicker
              signatoryType="PreparedBy"
              value={formData.PreparedBy || ""}
              onSelectSignatory={(user) => handleUserSelect(user, "PreparedBy")}
            />
          </div>
          <div>
            <label htmlFor="ReviewedBy" className="block text-gray-700">
              Reviewed By
            </label>
            <SignatoriesPicker
              signatoryType="ReviewedBy"
              value={formData.ReviewedBy || ""}
              onSelectSignatory={(user) => handleUserSelect(user, "ReviewedBy")}
            />
          </div>
          <div>
            <label htmlFor="Ad" className="block text-gray-700">
              Accumulated Depreciation
            </label>
            <input
              type="text"
              value={numberToCurrencyString(formData.Ad.Value)}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="Ad" className="block text-gray-700">
              Depreciation Month
            </label>
            <input
              type="text"
              value={formData.Ad.Date}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        {formData.SellingPrice > 0 &&
          formData.Cost > 0 &&
          formData.Ad.Value > 0 && (
            <div className="text-sm">
              <h4 className="font-semibold mb-1">Sale Result</h4>
              <div className="flex space-x-2">
                <span className="text-gray-600">Book Value:</span>
                <span className="font-semibold">
                  {numberToCurrencyString(formData.BookValue)}
                </span>
              </div>
              <div className="flex space-x-1">
                <span className="text-gray-600">Gain / Loss:</span>
                <span className={`font-semibold ${gainLossClass}`}>
                  {numberToCurrencyString(formData.GainLoss)}
                </span>
                {gainLossIcon}
              </div>
            </div>
          )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {mode === "add" ? "Submit Sale" : "Update Sale"}
        </button>
      </form>
    </div>
  );
};

export default PropertySaleForm;
