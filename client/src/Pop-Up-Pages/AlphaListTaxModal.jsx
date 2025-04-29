import React, { useState, useEffect, useContext } from "react";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";
import { FaTimes } from "react-icons/fa";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { showToast } from "../utils/toastNotifications";
import { AlphaListTaxContext } from "../context/AlphaListTaxSheetContext";
import AlphaListTaxApi from "../api/AlphaListTaxApi";
import SubledgerPicker from "./../Components/SubledgerPicker";
import AccountPicker from "./../Components/AccountPicker";
import { toast } from "react-toastify";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import { numberToCurrencyString } from "../helper/helper";

const AlphaListTaxModal = ({
  isOpen,
  onClose,
  onSaveAlphaListTax,
  alphaListTaxData,
  mode,
}) => {
  const {
    addRows,
    setAddRows,
    formData,
    insertEmptyRows,
    header,
    handleAlphaListChange,
    dataSheetColumns,
    setFormData,
    table,
  } = useContext(AlphaListTaxContext);

  const { pushToGrid } = useContext(LedgerSheetContext);

  const [transactionType, setTransactionType] = useState("Debit");
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    console.log(slCode);
    console.log(selectedAccount);
    console.log(name);
  }, [slCode, selectedAccount, name]);

  const handleRadioChange = (e) => {
    const value = e.target.value;
    setTransactionType(value);
  };

  const validateForm = () => {
    if (!selectedAccount) {
      showToast("Please select an Ledger Account.", "warning");
      return false;
    }
    if (!slCode) {
      showToast("Please enter a Subledger Account.", "warning");
      return false;
    }
    if (!formData.Description) {
      showToast("Description. is required.", "warning");
      return false;
    }
    // Loop through each row in AlphaList and validate Date if necessary
    for (let i = 0; i < formData.AlphaList.length; i++) {
      const row = formData.AlphaList[i];

      // Check if any of the relevant fields have data
      const hasData =
        row.Date !== "" ||
        row.TaxpayerID !== "" ||
        row.RegisteredName !== "" ||
        row.SupplierName !== "" ||
        row.SupplierAddress !== "" ||
        Object.values(row.TaxAmount).some((value) => value !== 0);

      if (hasData && !row.Date) {
        showToast(`Date is required for row ${i + 1}.`, "warning");
        return false;
      }
      if (hasData && !row.TaxAmount.InputTaxAmount) {
        showToast(`Input Tax Amount is required for row ${i + 1}.`, "warning");
        return false;
      }
      if (hasData && !row.TaxAmount.GrossTaxablePurchase) {
        showToast(
          `Gross Taxable Purchase is required for row ${i + 1}.`,
          "warning"
        );
        return false;
      }
    }
    return true;
  };

  //   const handleSave = async () => {
  //     if (!validateForm()) {
  //       return;
  //     }
  //     try {
  //       const filteredAlphaList = formData.AlphaList.map((row) => {
  //         // Set default values for empty fields
  //         return {
  //           ...row,
  //           Date: row.Date || "",
  //           TaxpayerID: row.TaxpayerID || "",
  //           RegisteredName: row.RegisteredName || "",
  //           SupplierName: row.SupplierName || "",
  //           SupplierAddress: row.SupplierAddress || "",
  //           TaxAmount: {
  //             GrossPurchase: row.TaxAmount.GrossPurchase || 0,
  //             ExemptPurchase: row.TaxAmount.ExemptPurchase || 0,
  //             ZeroRatePurchase: row.TaxAmount.ZeroRatePurchase || 0,
  //             TaxablePurchase: row.TaxAmount.TaxablePurchase || 0,
  //             ServicesPurchase: row.TaxAmount.ServicesPurchase || 0,
  //             CapitalGoods: row.TaxAmount.CapitalGoods || 0,
  //             GoodsOtherThanCapital: row.TaxAmount.GoodsOtherThanCapital || 0,
  //             InputTaxAmount: row.TaxAmount.InputTaxAmount || 0,
  //             GrossTaxablePurchase: row.TaxAmount.GrossTaxablePurchase || 0,
  //           },
  //         };
  //       }).filter((row) => {
  //         // Check if the row has any value in Date or TaxpayerID or TaxAmount
  //         return (
  //           row.Date !== "" ||
  //           row.TaxpayerID !== "" ||
  //           row.RegisteredName !== "" ||
  //           row.SupplierName !== "" ||
  //           row.SupplierAddress !== "" ||
  //           Object.values(row.TaxAmount).some((value) => value !== 0)
  //         );
  //       });

  //       // Transform formData to ensure TaxAmount fields are numeric
  //       const transformedData = {
  //         ...formData,
  //         AlphaList: filteredAlphaList.map((row) => ({
  //           ...row,
  //           TaxAmount: {
  //             ...row.TaxAmount,
  //             GrossPurchase: parseFloat(row.TaxAmount.GrossPurchase) || 0,
  //             ExemptPurchase: parseFloat(row.TaxAmount.ExemptPurchase) || 0,
  //             ZeroRatePurchase: parseFloat(row.TaxAmount.ZeroRatePurchase) || 0,
  //             TaxablePurchase: parseFloat(row.TaxAmount.TaxablePurchase) || 0,
  //             ServicesPurchase: parseFloat(row.TaxAmount.ServicesPurchase) || 0,
  //             CapitalGoods: parseFloat(row.TaxAmount.CapitalGoods) || 0,
  //             GoodsOtherThanCapital:
  //               parseFloat(row.TaxAmount.GoodsOtherThanCapital) || 0,
  //             InputTaxAmount: parseFloat(row.TaxAmount.InputTaxAmount) || 0,
  //             GrossTaxablePurchase:
  //               parseFloat(row.TaxAmount.GrossTaxablePurchase) || 0,
  //           },
  //         })),
  //       };

  //       console.log("Transformed Data:", transformedData);
  //       const response = await AlphaListTaxApi.createAlphaListTax(
  //         transformedData
  //       );
  //       console.log("API Response:", response);

  //       // !!!!!!!!!!!!!!
  //       // response.data.grandTotal.GrossTaxablePurchase
  //       // cr/dr ?
  //       // account code
  //       // account name
  //       // subledger slcode
  //       // subledger name
  //       // description
  //       console.log(transformedData);
  //       pushToGrid([
  //         {
  //           ledger: {
  //             code: selectedAccount.code,
  //             name: selectedAccount.name,
  //           },
  //           subledger: {
  //             slCode: slCode,
  //             name: name,
  //           },
  //           dr:
  //             transactionType === "Debit"
  //               ? parseFloat(response.data.GrandTotal.GrossPurchase) || 0
  //               : null,
  //           cr:
  //             transactionType === "Credit"
  //               ? parseFloat(response.data.GrandTotal.GrossPurchase) || 0
  //               : null,
  //           description: response.data.Description,
  //         },
  //         {
  //           ledger: {
  //             code: "19902060",
  //             name: "Input Tax",
  //           },
  //           subledger: {
  //             slCode: "5052",
  //             name: "BIR-INPUT VAT RECEIVABLE",
  //           },
  //           dr:
  //             transactionType === "Debit"
  //               ? parseFloat(response.data.GrandTotal.InputTaxAmount) || 0
  //               : null,
  //           cr:
  //             transactionType === "Credit"
  //               ? parseFloat(response.data.GrandTotal.InputTaxAmount) || 0
  //               : null,
  //           description: response.data.Description,
  //         },
  //       ]);

  //       showToast("Data Saved Successfully!", "success");
  //       onSaveAlphaListTax(response);
  //       onClose();
  //     } catch (error) {
  //       console.error("Error saving data:", error);
  //       showToast("Failed to save data. Please try again.", "error");
  //     }
  //   };

  const calculateGrandTotal = (alphaList) => {
    const grandTotal = {
      GrossPurchase: 0,
      ExemptPurchase: 0,
      ZeroRatePurchase: 0,
      TaxablePurchase: 0,
      ServicesPurchase: 0,
      CapitalGoods: 0,
      GoodsOtherThanCapital: 0,
      InputTaxAmount: 0,
      GrossTaxablePurchase: 0,
    };

    alphaList.forEach((item) => {
      if (item.TaxAmount) {
        grandTotal.GrossPurchase += item.TaxAmount.GrossPurchase || 0;
        grandTotal.ExemptPurchase += item.TaxAmount.ExemptPurchase || 0;
        grandTotal.ZeroRatePurchase += item.TaxAmount.ZeroRatePurchase || 0;
        grandTotal.TaxablePurchase += item.TaxAmount.TaxablePurchase || 0;
        grandTotal.ServicesPurchase += item.TaxAmount.ServicesPurchase || 0;
        grandTotal.CapitalGoods += item.TaxAmount.CapitalGoods || 0;
        grandTotal.GoodsOtherThanCapital +=
          item.TaxAmount.GoodsOtherThanCapital || 0;
        grandTotal.InputTaxAmount += item.TaxAmount.InputTaxAmount || 0;
        grandTotal.GrossTaxablePurchase +=
          item.TaxAmount.GrossTaxablePurchase || 0;
      }
    });

    // Ensure all totals are rounded to two decimal places
    for (let key in grandTotal) {
      grandTotal[key] = parseFloat(grandTotal[key].toFixed(2));
    }

    return grandTotal;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    try {
      const filteredAlphaList = formData.AlphaList.map((row) => {
        // Set default values for empty fields
        return {
          ...row,
          Date: row.Date || "",
          TaxpayerID: row.TaxpayerID || "",
          RegisteredName: row.RegisteredName || "",
          SupplierName: row.SupplierName || "",
          SupplierAddress: row.SupplierAddress || "",
          TaxAmount: {
            GrossPurchase: row.TaxAmount.GrossPurchase || 0,
            ExemptPurchase: row.TaxAmount.ExemptPurchase || 0,
            ZeroRatePurchase: row.TaxAmount.ZeroRatePurchase || 0,
            TaxablePurchase: row.TaxAmount.TaxablePurchase || 0,
            ServicesPurchase: row.TaxAmount.ServicesPurchase || 0,
            CapitalGoods: row.TaxAmount.CapitalGoods || 0,
            GoodsOtherThanCapital: row.TaxAmount.GoodsOtherThanCapital || 0,
            InputTaxAmount: row.TaxAmount.InputTaxAmount || 0,
            GrossTaxablePurchase: row.TaxAmount.GrossTaxablePurchase || 0,
          },
        };
      }).filter((row) => {
        // Check if the row has any value in Date or TaxpayerID or TaxAmount
        return (
          row.Date !== "" ||
          row.TaxpayerID !== "" ||
          row.RegisteredName !== "" ||
          row.SupplierName !== "" ||
          row.SupplierAddress !== "" ||
          Object.values(row.TaxAmount).some((value) => value !== 0)
        );
      });

      const grandTotal = calculateGrandTotal(filteredAlphaList);

      // Transform formData to ensure TaxAmount fields are numeric
      const transformedData = {
        ...formData,
        AlphaList: filteredAlphaList.map((row) => ({
          ...row,
          TaxAmount: {
            ...row.TaxAmount,
            GrossPurchase: parseFloat(row.TaxAmount.GrossPurchase) || 0,
            ExemptPurchase: parseFloat(row.TaxAmount.ExemptPurchase) || 0,
            ZeroRatePurchase: parseFloat(row.TaxAmount.ZeroRatePurchase) || 0,
            TaxablePurchase: parseFloat(row.TaxAmount.TaxablePurchase) || 0,
            ServicesPurchase: parseFloat(row.TaxAmount.ServicesPurchase) || 0,
            CapitalGoods: parseFloat(row.TaxAmount.CapitalGoods) || 0,
            GoodsOtherThanCapital:
              parseFloat(row.TaxAmount.GoodsOtherThanCapital) || 0,
            InputTaxAmount: parseFloat(row.TaxAmount.InputTaxAmount) || 0,
            GrossTaxablePurchase:
              parseFloat(row.TaxAmount.GrossTaxablePurchase) || 0,
          },
        })),
        GrandTotal: grandTotal,
      };

      console.log("Transformed Data:", transformedData);

      const existingData =
        JSON.parse(localStorage.getItem("AlphaListTaxData")) || [];

      // Append the new data to the existing data
      existingData.push(transformedData);

      // Save transformedData to localStorage
      localStorage.setItem("AlphaListTaxData", JSON.stringify(existingData));

      showToast("Data Saved to LocalStorage Successfully!", "success");

      pushToGrid([
        {
          ledger: {
            code: selectedAccount.code,
            name: selectedAccount.name,
          },
          subledger: {
            slCode: slCode,
            name: name,
          },
          dr:
            transactionType === "Debit"
              ? parseFloat(transformedData.GrandTotal.GrossPurchase) || 0
              : null,
          cr:
            transactionType === "Credit"
              ? parseFloat(transformedData.GrandTotal.GrossPurchase) || 0
              : null,
          description: transformedData.Description,
        },
        {
          ledger: {
            code: "19902060",
            name: "Input Tax",
          },
          subledger: {
            slCode: "5052",
            name: "BIR-INPUT VAT RECEIVABLE",
          },
          dr:
            transactionType === "Debit"
              ? parseFloat(transformedData.GrandTotal.InputTaxAmount) || 0
              : null,
          cr:
            transactionType === "Credit"
              ? parseFloat(transformedData.GrandTotal.InputTaxAmount) || 0
              : null,
          description: transformedData.Description,
        },
      ]);

      onSaveAlphaListTax(transformedData);
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("Failed to save data. Please try again.", "error");
    }
  };

  const handleClose = () => {
    // Remove saved data from localStorage
    // localStorage.removeItem("AlphaListTaxData");
    onClose();
  };

  const addRowsClick = (e) => {
    e.preventDefault();
    insertEmptyRows();
  };

  const [isMinimized, setIsMinimized] = useState(false);

  function minmax(e) {
    e.preventDefault();
    setIsMinimized(!isMinimized);
  }

  // Function to calculate the grand totals
  const calculateGrandTotalDisplay = () => {
    return formData.AlphaList.reduce(
      (totals, row) => {
        Object.keys(row.TaxAmount).forEach((key) => {
          totals[key] += parseFloat(row.TaxAmount[key]) || 0;
        });
        return totals;
      },
      {
        GrossPurchase: 0,
        ExemptPurchase: 0,
        ZeroRatePurchase: 0,
        TaxablePurchase: 0,
        ServicesPurchase: 0,
        CapitalGoods: 0,
        GoodsOtherThanCapital: 0,
        InputTaxAmount: 0,
        GrossTaxablePurchase: 0,
      }
    );
  };

  const transformDataForDataSheet = (alphaList) => {
    const headerRow = header.map((col) => ({
      value: col.value,
      type: "text",
      readOnly: col.readOnly,
    }));
    // console.log(alphaList);
    const dataRows = alphaList.map((row, index) => [
      { value: index + 1, type: "text", readOnly: true },
      ...dataSheetColumns.map((col, colIdx) => {
        const keys = col.key.split(".");
        let value = row;
        keys.forEach((key) => {
          value = value ? value[key] : "";
        });

        return {
          value: value || "",
          type: typeof value,
        };
      }),
    ]);

    return [headerRow, ...dataRows];
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  if (!isOpen) return null;
  const grandTotal = calculateGrandTotalDisplay();

  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50 flex justify-center items-center p-5">
      <div
        className="flex flex-col w-full bg-white rounded-lg shadow-lg h-full p-8 max-h-[100vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex  justify-end items-center space-x-2 sticky top-0">
          <button onClick={handleClose} className="text-gray-500">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-[0.7em] mb-5">
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-[0.7em] mb-5">
          <div className="flex flex-col">
            <label htmlFor="AccountPicker" className="text-gray-700 mb-2">
              Account Picker
            </label>
            <AccountPicker
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              className="mb-4"
              filter={[
                "ASSETS",
                "LIABILITIES",
                "CAPITAL",
                "REVENUES/INCOME",
                "EXPENSES",
              ]}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="PaymentEntity" className="text-gray-700">
              Subledger
            </label>
            <SubledgerPicker
              slCode={slCode}
              setSLCode={setSLCode}
              name={name}
              setName={setName}
              callback={() => console.log("SubledgerPicker refreshed!")}
            />
          </div>

          {/* Radio buttons for Debit or Credit */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-2">Transaction Type</label>
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="radio"
                  id="debit"
                  name="transactionType"
                  value="Debit"
                  onChange={handleRadioChange}
                  checked={transactionType === "Debit"}
                />
                <label htmlFor="debit" className="text-gray-700 ml-2">
                  Debit
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="credit"
                  name="transactionType"
                  value="Credit"
                  onChange={handleRadioChange}
                  checked={transactionType === "Credit"}
                />
                <label htmlFor="credit" className="text-gray-700 ml-2">
                  Credit
                </label>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${
            isMinimized &&
            "absolute transparent h-[100%] w-[100%] top-0 left-0 p-5"
          }`}
        >
          <div
            className={`transition duration-500 flex flex-col ${
              isMinimized && "bg-white h-[95%] p-5 rounded shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between text-[0.8em]">
              <div className="flex items-center mb-2">
                <input
                  type="number"
                  className="border rounded w-[100px] mr-1"
                  value={addRows}
                  onChange={(e) => setAddRows(Number(e.target.value))}
                />
                <button
                  className="bg-green-600 px-1 rounded text-white"
                  onClick={addRowsClick}
                >
                  Add Rows
                </button>
              </div>
              <button className="p-1 text-[1.5em] ml-2 group" onClick={minmax}>
                {/* {isMinimized ? <RiFullscreenFill /> : <RiFullscreenExitFill />} */}
                {isMinimized ? (
                  <MdFullscreenExit size={24} />
                ) : (
                  <MdFullscreen size={24} />
                )}
                <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                  {isMinimized ? "Zoom Out" : "Zoom In"}
                </span>
              </button>
            </div>
            <div
              className={`transition duration-500 w-[100%] ${
                isMinimized ? "max-h-[70vh]" : "max-h-[30vh]"
              } overflow-y-scroll`}
              ref={table}
            >
              <ReactDataSheet
                className="w-full text-[0.8em] overflow-auto"
                data={transformDataForDataSheet(formData.AlphaList)}
                valueRenderer={(cell) => cell.value || ""}
                onCellsChanged={(changes) => {
                  changes.forEach(({ row, col, value }) => {
                    const cell = transformDataForDataSheet(formData.AlphaList)[
                      row
                    ][col];
                    if (!cell.readOnly) {
                      handleAlphaListChange(row, col, value, changes);
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
        {/* Grandtotal Here */}
        <div className="flex justify-between bg-gray-200 p-2 border-t">
          <span className="font-bold text-[0.8em] flex items-center justify-center">
            GrandTotal:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 text-[0.6em]">
            {Object.entries(grandTotal).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center">
                <span className="font-semibold">{key}</span>
                <span>{numberToCurrencyString(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start mt-2 text-[0.7em]">
          <label htmlFor="Description">Description</label>
          <textarea
            type="text"
            name="Description"
            value={formData.Description || ""}
            onChange={handleInputChange}
            placeholder="Add Description"
            className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px] w-[30%]"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <button
            className="p-[0.3em] bg-green-500 text-white rounded text-[0.8em]"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="p-[0.3em] bg-red-500 text-white rounded text-[0.8em]"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlphaListTaxModal;
