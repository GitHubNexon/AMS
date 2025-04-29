import React, { useState, useEffect, useContext } from "react";
import TaxApi from "../api/taxApi";
import "../styles/loader1.css";
import { FaCopy } from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";
import SubledgerPicker from "../Components/SubledgerPicker";
import AccountPicker from "./../Components/AccountPicker";
import { IoPush } from "react-icons/io5";
import Modal from "../Components/Modal";
import { LedgerSheetContext } from "../context/LedgerSheetContext";

const InputTaxPicker = ({ show = false, close = () => {} }) => {
  const { pushToGrid } = useContext(LedgerSheetContext);
  const [taxes, setTaxes] = useState([]);
  const [selectedTax, setSelectedTax] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [calculatedTax, setCalculatedTax] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");

  const [PaymentEntity, setPaymentEntity] = useState({
    slCode: "0000",
    name: "",
    tin: "",
    address: "",
  });

  const handleChangePayeee = (e) => {
    const { name, value } = e.target;
    setPaymentEntity((prev) => ({
      ...prev,
      [name]: value, // Update the specific field dynamically
    }));
  };

  const handlePushPayee = () => {
    console.log(PaymentEntity);
  };

  // const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState({
    code: "",
    name: "",
  });

  const [transactionType, setTransactionType] = useState("cr");
  const [taxType, setTaxType] = useState("");
  const {
    pushWithHoldingTaxSelectedRow,
    selectedRow,
    grid,
    inputTax,
    setInputTax,
    inputTaxHeader,
  } = useContext(LedgerSheetContext);

  const fetchTaxes = async () => {
    try {
      const data = await TaxApi.getAllTaxes(1, 1000);
      const items = data?.taxes || [];
      // console.log(items);
      setTaxes(items);
    } catch (error) {
      console.error("Error fetching taxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTaxes =
    taxType === "WTC"
      ? taxes.filter((tax) => tax.Code && tax.Code.includes("WTC"))
      : taxes;

  // useEffect(() => {
  //   console.log(selectedRow);
  //   console.log(grid[selectedRow - 1]);
  //   console.log(grid[selectedRow - 1][1]);
  //   console.log(grid[selectedRow - 1][2]);
  //   console.log(grid[selectedRow - 1][3]);
  //   console.log(grid[selectedRow - 1][4]);
  //   console.log(grid[selectedRow - 1][5]);
  //   console.log(grid[selectedRow - 1][6]);
  //   console.log(grid[selectedRow - 1][8]);
  // }, [selectedRow]);

  //testing
  useEffect(() => {
    const taxAccountMap = {
      EWT: {
        code: "202010102",
        name: "EXPANDED WITHHOLDING TAX",
      },
      FVAT: {
        code: "202010104",
        name: "WITHHOLDING TAX ON GMP - VALUE ADDED TAXES (GVAT)",
      },
      WPT: {
        code: "202010103",
        name: "WITHHOLDING TAX ON GOVERNMENT MONEY PAYMENTS(GMP) - PERCENTAGE TAXES",
      },
      WTC: {
        code: "202010101",
        name: "WITHHOLDING TAX ON COMPENSATION",
      },
    };

    if (taxType && taxAccountMap[taxType]) {
      setSelectedAccount(taxAccountMap[taxType]);
    }
  }, [taxType]);

  // test
  useEffect(() => {
    if (show && selectedRow > 0 && grid[selectedRow - 1]) {
      const rowData = grid[selectedRow - 1];
      const accountCodeData = rowData[1];
      const accountNameData = rowData[2];
      const subledgerCode = rowData[3];
      const subledgerName = rowData[4];
      const dr = rowData[5];
      const cr = rowData[6];
      const wt = rowData[8];

      const newTransactionType = cr ? "cr" : dr ? "dr" : null;
      setTransactionType(newTransactionType);

      setSelectedAccount({
        code: accountCodeData?.value || "",
        name: accountNameData?.value || "",
      });
      setSLCode(subledgerCode?.value || "5053");
      setName(subledgerName?.value || "BUREAU OF INTERNAL REVENUE");
      if (wt?.value?._id) {
        const matchedTax = taxes.find((tax) => tax._id === wt.value._id);
        setSelectedTax(matchedTax || null);
        setInputValue(wt.value.taxBase || "");
        setCalculatedTax(wt.value.taxTotal || null);
        setTaxType(wt.value.taxType || "");

        // Update PaymentEntity with data from wt
        setPaymentEntity({
          slCode: wt.value.PaymentEntity.slCode || "",
          name: wt.value.PaymentEntity.name || "",
          tin: wt.value.PaymentEntity.tin || "",
          address:  wt.value.PaymentEntity.address || "",
        });
        console.log(wt.value.PaymentEntity.tin)
      }
    } else if (show) {
      // Reset state when selectedRow or grid data is invalid
      setSelectedAccount({
        code: "",
        name: "",
      });
      setSLCode("5053");
      setName("BUREAU OF INTERNAL REVENUE");
      setTransactionType(null);
      setSelectedTax(null);
      setInputValue("");
      setCalculatedTax(null);
      setTaxType("");
      // Reset PaymentEntity
      setPaymentEntity({
        slCode: "0000",
        name: "",
        tin: "",
        address: "",
      });
    }
  }, [show, selectedRow, grid, taxes]);

  useEffect(() => {
    setSLCode("5053");
    setName("BUREAU OF INTERNAL REVENUE");
    fetchTaxes();
  }, []);

  const handleTaxChange = (tax) => {
    setSelectedTax(tax);
    setCalculatedTax(null);
    setTotalAmount(null);
    setInputValue("");
    setInputValue("");
    setCalculatedTax(null);
    if (tax && !["EWT", "FVAT", "WPT", "WTC"].includes(taxType)) {
      setTaxType("");
    }
  };

  // useEffect(() => {}, [slCode, selectedAccount, name]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTaxType((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const selectedTaxType = () => {
    return Object.keys(taxType).filter((key) => taxType[key]);
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    setTransactionType(value);
    console.log(value);
  };

  const handleRadioTaxTypeChange = (e) => {
    const value = e.target.value;
    setTaxType(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (selectedTax) {
      const taxRate = selectedTax.taxRate;
      const taxAmount = (value * taxRate) / 100;
      const total = parseFloat(value) + taxAmount;

      setCalculatedTax(taxAmount);
      setTotalAmount(total);
    }
  };

  const handleReset = () => {
    fetchTaxes();
    setTaxType("");
    setTaxes([]);
    setSelectedTax(null);
    setInputValue("");
    setCalculatedTax(null);
    setTotalAmount(null);
    setSLCode("5053");
    setName("BUREAU OF INTERNAL REVENUE");
    setSelectedAccount(null);
    setTransactionType("cr");
  };

  //old
  // const validate = () => {
  //   if (!selectedAccount) {
  //     showToast("Please select an Ledger Account.", "warning");
  //     return false;
  //   }
  //   if (!slCode) {
  //     showToast("Please enter a Subledger Account.", "warning");
  //     return false;
  //   }
  //   if (!selectedTax) {
  //     showToast("Please select a tax.", "warning");
  //     return false;
  //   }
  //   if (!inputValue || isNaN(inputValue) || parseFloat(inputValue) <= 0) {
  //     showToast("Please enter a valid amount.", "error");
  //     return false;
  //   }
  //   return true;
  // };

  const validate = () => {
    let isValid = true;

    // if (!selectedAccount._id || !selectedAccount.code || !selectedAccount.name) {
    //   showToast("Please select a Ledger Account.", "warning");
    //   isValid = false;
    // }
    if (!slCode) {
      showToast("Please enter a Subledger Account.", "warning");
      isValid = false;
    }
    if (!name) {
      showToast("Subledger name is required.", "warning");
      isValid = false;
    }
    if (!selectedTax) {
      showToast("Please select a tax.", "warning");
      isValid = false;
    }
    if (!taxType) {
      showToast("Please select a Tax Type.", "warning");
      isValid = false;
    }
    if (!inputValue || isNaN(inputValue) || parseFloat(inputValue) <= 0) {
      showToast("Please enter a valid Tax Base amount.", "error");
      isValid = false;
    }
    if (
      !calculatedTax ||
      isNaN(calculatedTax) ||
      parseFloat(calculatedTax) <= 0
    ) {
      showToast("Calculated Tax is invalid.", "error");
      isValid = false;
    }

    return isValid;
  };

  const handlePushToGrid = (e) => {
    handlePushPayee();
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const dataToPush = [
      {
        ledger: {
          code: selectedAccount.code,
          name: selectedAccount.name,
        },
        subledger: {
          slCode: slCode,
          name: name,
        },
        dr: transactionType === "dr" ? parseFloat(calculatedTax) || 0 : null,
        cr: transactionType === "cr" ? parseFloat(calculatedTax) || 0 : null,
        wt: {
          _id: selectedTax._id,
          taxType: taxType,
          taxCode: selectedTax.Code,
          taxCategory: selectedTax.Category,
          taxRate: selectedTax.taxRate,
          taxBase: parseFloat(inputValue) || 0,
          taxTotal: parseFloat(calculatedTax.toFixed(2)) || 0,
          taxTypeDetail: selectedTax.Type,
          PaymentEntity: PaymentEntity,
        },
      },
    ];

    const convert = parseFloat(calculatedTax.toFixed(2));

    console.log("Data to push to grid:", dataToPush, convert);

    pushWithHoldingTaxSelectedRow(dataToPush, convert);

    handleReset();
    close();
    showToast("Push to Row Successfully!", "success");
  };

  const handleChange = (e) => {
    const selectedTax = taxes.find((tax) => tax._id === e.target.value);
    setSelectedTax(selectedTax);
    handleTaxChange(selectedTax || null);
  };

  const copyToClipboard = () => {
    if (calculatedTax !== null) {
      navigator.clipboard
        .writeText(calculatedTax.toFixed(2))
        .then(() => {
          showToast("Copied to clipboard!", "info");
        })
        .catch((error) => {
          console.error("Error copying text: ", error);
        });
    }
  };

  if (loading)
    return (
      <div className="flex item-center justify-center">
        <p className="Dotsbar1"></p>
      </div>
    );

  return (
    <Modal show={show} closeCallback={close}>
      <div className="overflow-auto m-5 h-[45vh]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 text-[0.9em] max-w-full">
          <div className="flex flex-col mr-5">
            <label className="mb-1 font-medium">Transaction Type</label>
            <div className="flex items-center space-x-4">
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="dr"
                  name="transactionType"
                  value="dr"
                  onChange={handleRadioChange}
                  checked={transactionType === "dr"}
                />
                <label htmlFor="debit" className="text-gray-700 ml-2">
                  Debit
                </label>
              </div>
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="cr"
                  name="transactionType"
                  value="cr"
                  onChange={handleRadioChange}
                  checked={transactionType === "cr"}
                />
                <label htmlFor="credit" className="text-gray-700 ml-2">
                  Credit
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col mr-5">
            <label className="mb-3 font-medium">Tax Type</label>
            <div className="flex items-center space-x-4">
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="EWT"
                  name="taxType"
                  value="EWT"
                  onChange={handleRadioTaxTypeChange}
                  checked={taxType === "EWT"}
                />
                <label htmlFor="EWT" className="text-gray-700 ml-2">
                  EWT
                </label>
              </div>
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="WPT"
                  name="taxType"
                  value="WPT"
                  onChange={handleRadioTaxTypeChange}
                  checked={taxType === "WPT"}
                />
                <label htmlFor="WPT" className="text-gray-700 ml-2">
                  WPT
                </label>
              </div>
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="FVAT"
                  name="taxType"
                  value="FVAT"
                  onChange={handleRadioTaxTypeChange}
                  checked={taxType === "FVAT"}
                />
                <label htmlFor="FVAT" className="text-gray-700 ml-2">
                  FVAT
                </label>
              </div>
              <div className="flex flex-row">
                <input
                  type="radio"
                  id="WTC"
                  name="taxType"
                  value="WTC"
                  onChange={handleRadioTaxTypeChange}
                  checked={taxType === "WTC"}
                />
                <label htmlFor="WTC" className="text-gray-700 ml-2">
                  WTC
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col ">
            <label className="mb-1 font-medium">Ledger</label>
            <AccountPicker
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              filter={[
                // "ASSETS",
                "LIABILITIES",
                // "CAPITAL",
                // "REVENUES/INCOME",
                // "EXPENSES",
              ]}
            />
          </div>

          <div className="flex flex-col ">
            <label className="mb-1 font-medium">Subledger</label>
            <SubledgerPicker
              slCode={slCode}
              setSLCode={setSLCode}
              setName={setName}
              name={name}
              callback={() => {
                /* callback logic if needed */
              }}
            />
          </div>

          {/* Tax Coded */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">
              {taxType === "WTC" ? "Tax Rates For WTC" : "Tax Code"}
            </label>

            <div className="flex items-center justify-between ">
              <div className="group relative">
                <select
                  onChange={handleChange}
                  value={selectedTax ? selectedTax._id : ""}
                  className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Tax --</option>
                  {/* {taxes.map((tax) => (
                    <option key={tax._id} value={tax._id}>
                      {tax.Code} ({tax.taxRate}%)
                    </option>
                  ))} */}
                  {filteredTaxes.map((tax) => (
                    <option key={tax._id} value={tax._id}>
                      {tax.Code} ({tax.taxRate}%)
                    </option>
                  ))}
                </select>
                <span className="tooltip-text mb-6 w-full absolute top-12 h-fit">
                  {selectedTax
                    ? `${selectedTax.Category} (${selectedTax.Type})`
                    : "Select Tax"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 text-[0.9em] max-w-full">
          {/* Tax Base */}
          <div className="flex flex-col">
            {selectedTax && (
              <>
                <label className="mb-1 font-medium">Tax Base</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                />
              </>
            )}
          </div>

          {/* Total Tax */}
          <div className="flex flex-col">
            {calculatedTax !== null && (
              <>
                <label className="mb-1 font-medium">Tax</label>
                <div className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 flex justify-between items-center">
                  <p className="text-sm font-medium">
                    <span>{calculatedTax.toFixed(2)}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* {calculatedTax !== null && (
            <div className="flex flex-col m-3">
              <label className="text-gray-700 mb-2">Tax Type</label>
              <div className="flex items-center space-x-4">
                <div className="flex flex-row">
                  <input
                    type="radio"
                    id="EWT"
                    name="taxType"
                    value="EWT"
                    onChange={handleRadioTaxTypeChange}
                    checked={taxType === "EWT"}
                  />
                  <label htmlFor="EWT" className="text-gray-700 ml-2">
                    EWT
                  </label>
                </div>
                <div className="flex flex-row">
                  <input
                    type="radio"
                    id="WPT"
                    name="taxType"
                    value="WPT"
                    onChange={handleRadioTaxTypeChange}
                    checked={taxType === "WPT"}
                  />
                  <label htmlFor="WPT" className="text-gray-700 ml-2">
                    WPT
                  </label>
                </div>
                <div className="flex flex-row">
                  <input
                    type="radio"
                    id="FVAT"
                    name="taxType"
                    value="FVAT"
                    onChange={handleRadioTaxTypeChange}
                    checked={taxType === "FVAT"}
                  />
                  <label htmlFor="FVAT" className="text-gray-700 ml-2">
                    FVAT
                  </label>
                </div>
                <div className="flex flex-row">
                  <input
                    type="radio"
                    id="WTC"
                    name="taxType"
                    value="WTC"
                    onChange={handleRadioTaxTypeChange}
                    checked={taxType === "WTC"}
                  />
                  <label htmlFor="WTC" className="text-gray-700 ml-2">
                    WTC
                  </label>
                </div>
              </div>
            </div>
          )} */}

          {/* push to grid */}
          {calculatedTax !== null && (
            <div className="flex flex-col items-center justify-center group relative">
              <label className=" mb-1 font-medium">Push</label>
              <button
                className="bg-green-500 text-white rounded-md hover:bg-green-600 py-2 px-4 active:scale-110 transition-transform duration-300"
                onClick={handlePushToGrid}
              >
                <IoPush size={20} />
              </button>
              <span className="tooltip-text absolute hidden bg-gray-700 text-white text-nowrap text-[0.8em] p-2 rounded-md bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:block transition-all duration-500">
                Push To Row
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 text-[0.9em] max-w-full mt-10">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
              value={PaymentEntity.name}
              onChange={handleChangePayeee}
              placeholder="Enter Name"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Tin</label>
            <input
              type="text"
              name="tin"
              className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
              value={PaymentEntity.tin}
              onChange={handleChangePayeee}
              placeholder="Enter Tin"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Address</label>
            <textarea
              type="text"
              name="address"
              className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
              value={PaymentEntity.address}
              onChange={handleChangePayeee}
              placeholder="Enter Address"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InputTaxPicker;
