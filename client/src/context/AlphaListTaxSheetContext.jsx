import React, { createContext, useState, useRef, useEffect } from "react";
import { showToast } from "../utils/toastNotifications";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

export const AlphaListTaxContext = createContext();

const header = [
  { value: "No.", width: "35px", readOnly: true },
  { value: "Date ", width: "150px", readOnly: true },
  { value: "Taxpayer ID", width: "400px", readOnly: true },
  { value: "Registered Name", width: "200px", readOnly: true },
  { value: "Supplier Name", width: "200px", readOnly: true },
  { value: "Supplier Address", width: "200px", readOnly: true },
  { value: "Gross Purchase", width: "200px", readOnly: true },
  { value: "Exempt Purchase", width: "200px", readOnly: true },
  { value: "Zero Rate Purchase", width: "200px", readOnly: true },
  { value: "Amount Of Taxable Purchase", width: "200px", readOnly: true },
  { value: "Services Purchase", width: "200px", readOnly: true },
  { value: "Capital Goods", width: "200px", readOnly: true },
  { value: "Goods Other Than Capital", width: "200px", readOnly: true },
  { value: "Input Tax Amount", width: "200px", readOnly: true },
  { value: "Gross Taxable Purchase", width: "200px", readOnly: true },
];

const Footer = ({ grandTotal }) => {
  return (
    <div className="footer">
      <div className="footer-row">
        <div>Gross Purchase: {grandTotal.GrossPurchase}</div>
        <div>Exempt Purchase: {grandTotal.ExemptPurchase}</div>
        <div>Zero Rate Purchase: {grandTotal.ZeroRatePurchase}</div>
        <div>Taxable Purchase: {grandTotal.TaxablePurchase}</div>
        <div>Services Purchase: {grandTotal.ServicesPurchase}</div>
        <div>Capital Goods: {grandTotal.CapitalGoods}</div>
        <div>Goods Other Than Capital: {grandTotal.GoodsOtherThanCapital}</div>
        <div>Input Tax Amount: {grandTotal.InputTaxAmount}</div>
        <div>Gross Taxable Purchase: {grandTotal.GrossTaxablePurchase}</div>
      </div>
    </div>
  );
};

export function AlphaListTaxContextProvider({ children }) {
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    streetAddress: "",
    city: "",
    region: "",
    barangay: "",
    zipCode: "",
    companyLogo: "",
  });

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const { data: settings } = await axios.get(
          `${API_BASE_URL}/company-settings`
        );

        // Update company data state
        setCompanyData((prevData) => ({
          ...prevData,
          ...settings,
        }));

        // Update form data state
        setFormData((prevData) => ({
          ...prevData,
          OwnerName: settings.companyName || "",
          OwnerTradeName: settings.companyName || "",
          OwnerAddress: `${settings.streetAddress || ""}, ${
            settings.barangay || ""
          }, ${settings.city || ""}, ${settings.region || ""}, ${
            settings.zipCode || ""
          }`,
        }));
      } catch (error) {
        console.error("Error fetching company settings:", error);
      }
    };

    fetchCompanySettings();
  }, []);

  const [grid, setGrid] = useState([header], [Footer]);
  const [addRows, setAddRows] = useState(20);
  const table = useRef();

  const [formData, setFormData] = useState({
    Description: "",
    AlphaList: [],
  });

  const insertEmptyRows = () => {
    const newRows = Array.from({ length: addRows }, () => ({
      Date: "",
      TaxpayerID: "",
      RegisteredName: "",
      SupplierName: "",
      SupplierAddress: "",
      TaxAmount: {
        GrossPurchase: 0,
        ExemptPurchase: 0,
        ZeroRatePurchase: 0,
        TaxablePurchase: 0,
        ServicesPurchase: 0,
        CapitalGoods: 0,
        GoodsOtherThanCapital: 0,
        InputTaxAmount: 0,
        GrossTaxablePurchase: 0,
      },
    }));

    setFormData((prevData) => ({
      ...prevData,
      AlphaList: [...prevData.AlphaList, ...newRows],
    }));
  };

  // Handle changes in the input fields
  const handleAlphaListChange = (rowIdx, colIdx, value, changes) => {
    // Validate the Date field
    const cleanValue = value.replace(/,/g, "").trim();

    // Copy state
    const newAlphaList = [...formData.AlphaList];

    // Keys defined on dataSheetColumns can be nested, split by "."
    const keys = dataSheetColumns[colIdx - 1].key.split(".");
    console.log(keys);

    // Traverse through keys to set the value at the correct nested level
    let target = newAlphaList[rowIdx - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      // Navigate through the nesting
      target = target[keys[i]];
    }

    if (keys[keys.length - 1] === "Date") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        showToast(
          "Invalid date format. Please enter a date in YYYY-MM-DD format."
        );
        target[keys[keys.length - 1]] = "";
        setFormData({ ...formData, AlphaList: newAlphaList });
        return;
      }
    }

    // Check if the key refers to a TaxAmount field and convert to number if so
    if (
      keys[keys.length - 1] === "GrossPurchase" ||
      keys[keys.length - 1] === "ExemptPurchase" ||
      keys[keys.length - 1] === "ZeroRatePurchase" ||
      keys[keys.length - 1] === "TaxablePurchase" ||
      keys[keys.length - 1] === "ServicesPurchase" ||
      keys[keys.length - 1] === "CapitalGoods" ||
      keys[keys.length - 1] === "GoodsOtherThanCapital" ||
      keys[keys.length - 1] === "InputTaxAmount" ||
      keys[keys.length - 1] === "GrossTaxablePurchase"
    ) {
      // Attempt to parse the cleaned value as a number
      target[keys[keys.length - 1]] = isNaN(parseFloat(cleanValue))
        ? 0
        : parseFloat(cleanValue);
    } else {
      // For non-TaxAmount fields, set the value directly
      target[keys[keys.length - 1]] = value;
    }
    // Update state
    setFormData({ ...formData, AlphaList: newAlphaList });
  };

  const dataSheetColumns = [
    { name: "Date", key: "Date" },
    { name: "TaxpayerID", key: "TaxpayerID" },
    { name: "RegisteredName", key: "RegisteredName" },
    { name: "SupplierName", key: "SupplierName" },
    { name: "SupplierAddress", key: "SupplierAddress" },
    { name: "GrossPurchase", key: "TaxAmount.GrossPurchase" },
    { name: "ExemptPurchase", key: "TaxAmount.ExemptPurchase" },
    { name: "ZeroRatePurchase", key: "TaxAmount.ZeroRatePurchase" },
    { name: "TaxablePurchase", key: "TaxAmount.TaxablePurchase" },
    { name: "ServicesPurchase", key: "TaxAmount.ServicesPurchase" },
    { name: "CapitalGoods", key: "TaxAmount.CapitalGoods" },
    { name: "GoodsOtherThanCapital", key: "TaxAmount.GoodsOtherThanCapital" },
    { name: "InputTaxAmount", key: "TaxAmount.InputTaxAmount" },
    { name: "GrossTaxablePurchase", key: "TaxAmount.GrossTaxablePurchase" },
  ];

  return (
    <AlphaListTaxContext.Provider
      value={{
        table,
        formData,
        setFormData,
        handleAlphaListChange,
        insertEmptyRows,
        addRows,
        setAddRows,
        grid,
        setGrid,
        header,
        dataSheetColumns,
      }}
    >
      {children}
    </AlphaListTaxContext.Provider>
  );
}
