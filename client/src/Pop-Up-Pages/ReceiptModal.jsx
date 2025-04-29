import React, { useState, useEffect, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import { showToast } from "../utils/toastNotifications";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import AutoNumber from "../components/AutoNumber";
import { useAuth } from "../context/AuthContext";
import useBase from "../context/useBase";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import LedgerSheet from "../Components/LedgerSheet";
import axios from "axios";
import { FileHandlerContext } from "../context/FileHandlerContext";
import FileHandler from "../Components/FileHandler";
import { useLoader } from "../context/useLoader";
import { useDataPreloader } from "../context/DataPreloader";
import SubledgerPicker from "../Components/SubledgerPicker";
import PrintCR from "../Components/PrintCR";
import { formatLedgers } from "../helper/helper";

const ReceiptModal = ({ isOpen, onClose, onSaveReceipt, entryData, mode }) => {
  const { lastClosing } = useDataPreloader();
  const { base } = useBase();
  const { user } = useAuth();
  const { loading } = useLoader();
  const [formData, setFormData] = useState({
    EntryType: "Receipt",
    CRNo: "",
    CRDate: new Date().toISOString().split("T")[0],
    Particulars: "",
    PaymentEntity: { slCode: "", name: "", tin: "", address: "", zip: ''},
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
    // ApprovedBy2: { name: "", position: "", _id: "" },
    // CertifiedBy: { name: "", position: "", _id: "" },
    Attachments: "",
    tag: "",
    ledgers: [],
    ReceiptEntryType: "",
    paymentMethods: "",
  });

  const {
    preload,
    getLedgers,
    reset,
    setDescriptionAll,
    totalCredit,
    totalDebit,
    grid,
    setGrid,
  } = useContext(LedgerSheetContext);

  const { getFiles, insertFiles } = useContext(FileHandlerContext);

  useEffect(() => {
    if (mode === "edit" && entryData) {
      const formattedCRDate = entryData.CRDate
        ? new Date(entryData.CRDate).toISOString().split("T")[0]
        : "";
        const paymentEntity = entryData.PaymentEntity || {
          slCode: "",
          name: "",
          tin: "",
          address: "",
          zip: ''
        };
      setFormData({
        ...entryData,
        PaymentEntity: paymentEntity,
        CRDate: formattedCRDate,
      });
      preload(entryData.ledgers);
    }
    if (mode === "duplicate" && entryData) {
      const formattedCRDate = entryData.CRDate
        ? new Date(entryData.CRDate).toISOString().split("T")[0]
        : "";
        const paymentEntity = entryData.PaymentEntity || {
          slCode: "",
          name: "",
          tin: "",
          address: "",
          zip: ''
        };

      const entryDataCopy = { ...entryData }; // Create a copy of the entryData
      delete entryDataCopy.ApprovedBy2;
      delete entryDataCopy.CertifiedBy;

      setFormData({
        ...entryDataCopy,
        _id: undefined,
        CRNo: "",
        CRDate: formattedCRDate,
        PaymentEntity: paymentEntity,
        CreatedBy: { name: user.name, position: user.userType, _id: user._id },
        PreparedBy: { name: user.name, position: user.userType, _id: user._id },
        ReviewedBy: { name: "", position: "", _id: "" },
        ApprovedBy1: { name: "", position: "", _id: "" },
      });

      preload(entryDataCopy.ledgers);
      console.log("ENTRY", entryDataCopy);
    }

    if (mode === "lease" && entryData) {
      const formattedCRDate = entryData.CRDate
        ? new Date(entryData.CRDate).toISOString().split("T")[0]
        : "";
      setFormData({
        ...entryData,
        _id: undefined,
        CRNo: "",
        CreatedBy: { name: user.name, position: user.userType, _id: user._id },
        PreparedBy: { name: user.name, position: user.userType, _id: user._id },
        ReviewedBy: { name: "", position: "", _id: "" },
        ApprovedBy1: { name: "", position: "", _id: "" },
        // ApprovedBy2: { name: "", position: "", _id: "" },
        // CertifiedBy: { name: "", position: "", _id: "" },
      });
      // preload(entryData.ledgers);
    }
    if (mode === "OR") {
      console.log("cash receipt entry", entryData);
      setFormData({
        ...formData,
        ...entryData,
      });
    }
    if (entryData) {
      getFiles(entryData._id);
    }
  }, [mode, entryData]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    /**
     * filtering on payment method chage
     * checks if this is from order of payment
     * when receipt entry type is cash receipt and method is others
     */
    if (name === "paymentMethods") {
      if (formData.EntryType === "Receipt") {
        if (formData.orId || formData._id) {
          loading(true);
          const whichId = formData._id || formData.orId;
          const response = await axios.get(`/or/find/${whichId}`, {
            withCredentials: true,
          });
          loading(false);
          if (response.data) {
            const g = grid;
            const newrows = [g[0]];
            const tail = g.slice(2);
            const toUpdate = grid[1];
            if (value === "Others") {
              // switch first ledger and subledger to 10102020 9488
              toUpdate[1].value = "10102020";
              toUpdate[2].value =
                "CASH IN BANK- LOCAL CURRENCY, CURRENT ACCOUNT";
              toUpdate[3].value = "9488";
              toUpdate[4].value = "LBP TORDESILLAS";
              newrows.push(toUpdate);
            } else {
              // back to original
              // for edit(entry already saved) mode we can go to previous value
              if (formData.ledgers.length > 0) {
                toUpdate[1].value = formData.ledgers[0].ledger.code;
                toUpdate[2].value = formData.ledgers[0].ledger.name;
                toUpdate[3].value = formData.ledgers[0].subledger.slCode;
                toUpdate[4].value = formData.ledgers[0].subledger.name;
              } else {
                // on create mode formData.ledgers is empty array initially
                toUpdate[1].value = "10101010";
                toUpdate[2].value = "CASH-COLLECTING OFFICERS";
                toUpdate[3].value = "9410";
                toUpdate[4].value = "PERA LIZA P. JULIAN";
              }
              newrows.push(toUpdate);
            }
            setGrid([...newrows, ...tail]);
          }
        }
      }
    }
    // particulars change will update the ledgers description
    if (name === "Particulars") {
      setDescriptionAll(value);
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      ReviewedBy: "",
      ApprovedBy1: "",
      PaymentEntity: "",
      // ApprovedBy2: "",
      // CertifiedBy: "",
      tag: "",
    });
    reset(); // reset ledger component
  };

  // Handle user selection and set the name and position
  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  const handleAutoNumberChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      CRNo: value,
    }));
  };

  // Validate required fields with specific messages
  const validateForm = () => {
    if (!formData.CRNo) {
      showToast("CR Number is required.", "warning");
      return false;
    }
    if (!formData.CRDate) {
      showToast("CR Date is required.", "warning");
      return false;
    }
    if (!formData.PreparedBy) {
      showToast("Prepared By is required.", "warning");
      return false;
    }
    if (!formData.ReviewedBy) {
      showToast("ReviewedBy By is required.", "warning");
      return false;
    }
    // if (!formData.CertifiedBy) {
    //   showToast("Certified By is required.", "warning");
    //   return false;
    // }

    // Validate ReceiptEntryType for Cash Receipt
    if (formData.EntryType === "Receipt" && !formData.ReceiptEntryType) {
      showToast("Receipt EntryType is required.", "warning");
      return false;
    }

    if (
      formData.ReceiptEntryType === "Cash Receipt" &&
      !formData.paymentMethods
    ) {
      showToast("Payment Method is required for Cash Receipt.", "warning");
      return false;
    }
    const l = getLedgers();
    if (l === false || (Array.isArray(l) && l.length === 0)) {
      return false;
    } else {
      formData.ledgers = l;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (totalDebit != totalCredit) {
      showToast("Credit and Debit must be balanced", "warning");
      return;
    }

    if (!validateForm()) {
      return;
    }
    try {
      if (mode === "edit") {
        loading(true);
        await EntriesApi.updateEntry(entryData._id, formData);
        insertFiles(formData._id);
        loading(false);
        showToast("Receipt updated successfully!", "success");
      } else if (mode === "OR") {
        loading(true);
        const response = await EntriesApi.createEntry(formData);
        console.log("response from receipt modal:", response);
        await axios.post(
          `/or/link`,
          {
            entryId: response.entry._id,
            orId: formData.orId,
            type: formData.ReceiptEntryType,
          },
          { withCredentials: true }
        );
        loading(false);
        showToast("Receipt added successfully!", "success");
      } else {
        loading(true);
        const newEntry = await EntriesApi.createEntry(formData);
        insertFiles(newEntry.entry._id);
        loading(false);
        showToast("Receipt added successfully!", "success");
      }

      console.log(formData);
      onSaveReceipt(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting receipt:", error);
      if (
        error.response &&
        error.response.data.message.includes("CRNo already exists")
      ) {
        showToast(
          "CR Number already exists. Please choose another one.",
          "warning"
        );
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full m-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Edit Receipt Entry" : "Add Receipt Entry"}
          </h2>
          <button
            onClick={async () => {
              const confirmed = await showDialog.confirm(
                "Are you sure you want to close without saving?"
              );
              if (confirmed) {
                reset();
                onClose();
              }
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={25} />
          </button>
        </div>
        <form className="space-y-4">
          <div className="flex flex-wrap items-end gap-2 text-[0.7em]">
            <div className="flex flex-col w-[100px]">
              <label htmlFor="EntryType" className="text-gray-700">
                Entry Type
              </label>
              <input
                type="text"
                id="EntryType"
                name="EntryType"
                value={formData.EntryType || ""}
                readOnly
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col w-[125px]">
              <label htmlFor="CRNo" className="text-gray-700">
                CR No.
                <span className="text-[0.8em]">(Auto-Generated)</span>
              </label>
              {/* <input
                type="text"
                id="CRNo"
                name="CRNo"
                value={formData.CRNo}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              /> */}
              <AutoNumber
                entryType="Receipt"
                value={formData.CRNo || ""}
                onChange={handleAutoNumberChange}
                mode={mode}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="CRDate" className="text-gray-700">
                CR Date
              </label>
              <input
                type="date"
                id="CRDate"
                name="CRDate"
                value={formData.CRDate || ""}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="flex flex-col z-[20] min-w-[200px]">
              <label htmlFor="PaymentEntity" className="text-gray-700">
                Payment Entity
              </label>
              <SubledgerPicker
                slCode={formData.PaymentEntity.slCode || ""}
                setSLCode={(slCode) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentEntity: { ...prevData.PaymentEntity, slCode },
                  }))
                }
                name={formData.PaymentEntity.name || ""}
                setName={(name) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentEntity: { ...prevData.PaymentEntity, name },
                  }))
                }
                tin={formData.PaymentEntity.tin || ""}
                setTin={(tin) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentEntity: { ...prevData.PaymentEntity, tin },
                  }))
                }
                address={formData.PaymentEntity.address || ""}
                setAddress={(address) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentEntity: { ...prevData.PaymentEntity, address },
                  }))
                }
                zip={formData.PaymentEntity.zip || ""}
                setZip={(zip) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentEntity: { ...prevData.PaymentEntity, zip },
                  }))
                }
                callback={() => console.log("SubledgerPicker refreshed!")}
              />
            </div>

            {/* Receipt Entry Type Dropdown */}
            <div className="flex flex-col text-[1.1em] w-[140px]">
              <label htmlFor="ReceiptEntryType" className="text-gray-700">
                Receipt Entry Type:
              </label>
              <select
                name="ReceiptEntryType"
                id="ReceiptEntryType"
                value={formData.ReceiptEntryType || ""}
                onChange={handleChange}
                className="border border-gray-300 p-[11px] rounded-md"
              >
                <option value="">-- select --</option>
                {base.ReceiptEntryType.map((entryType) => (
                  <option key={entryType} value={entryType}>
                    {entryType}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Methods Checkbox (only shown for "Cash Receipt") */}
            {(formData.ReceiptEntryType === "Cash Receipt" || formData.ReceiptEntryType === "Deposit Slip") && (
              <div className="">
                <label className="text-gray-700">Payment Method:</label>
                <div className="flex flex-row text-[1em] mt-2 space-x-4">
                  {base.paymentMethods.map((method) => (
                    <div key={method} className="flex items-center pb-[15px]">
                      <input
                        type="radio"
                        id={method}
                        name="paymentMethods"
                        value={method || ""}
                        checked={formData.paymentMethods === method}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor={method}>{method}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="z-index-500 border-t border-b pt-2 pb-2">
            <LedgerSheet />
          </div>

          <div className="flex flex-wrap text-[0.7em]">
            <div className="flex flex-col flex-1 mr-2">
              <label htmlFor="Particulars" className="text-gray-700">
                Particulars
              </label>
              <textarea
                type="text"
                id="Particulars"
                name="Particulars"
                value={formData.Particulars || ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            {/* <div className="flex flex-col mr-2">
              <label htmlFor="tag" className="text-gray-700">
                Tag
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                value={formData.tag || ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div> */}
            <div className="flex flex-col">
              <label htmlFor="Attachments" className="text-gray-700">
                Attachments
              </label>
              <input 
                type="text" 
                className="border mb-1 p-1 rounded min-w-[250px]" 
                placeholder="type here"
                id="Attachments"
                name="Attachments"
                value={formData.Attachments || ""}
                onChange={handleChange} />
              <FileHandler />
              {/* <input
                type="text"
                id="Attachments"
                name="Attachments"
                value={formData.Attachments || ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              /> */}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 text-[0.7em]">
            <div className="hidden">
              {" "}
              <div className="flex flex-col">
                <label htmlFor="CreatedBy" className="text-gray-700">
                  Created By
                </label>
                <SignatoriesPicker
                  value={formData.CreatedBy || ""}
                  readOnly
                  onSelectSignatory={(user) =>
                    handleUserSelect(user, "CreatedBy")
                  }
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="PreparedBy" className="text-gray-700">
                Prepared By
              </label>
              <SignatoriesPicker
                signatoryType="PreparedBy"
                value={formData.PreparedBy || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "PreparedBy")
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="ReviewedBy" className="text-gray-700">
                Reviewed By
              </label>
              <SignatoriesPicker
                signatoryType="ReviewedBy"
                value={formData.ReviewedBy || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ReviewedBy")
                }
              />
            </div>
            {/* <div className="flex flex-col">
              <label htmlFor="CertifiedBy" className="text-gray-700">
                Certified By
              </label>
              <SignatoriesPicker
                signatoryType="CertifiedBy"
                value={formData.CertifiedBy || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "CertifiedBy")
                }
              />
            </div> */}
            <div className="flex flex-col">
              <label htmlFor="ApprovedBy1" className="text-gray-700">
                Approved By
              </label>
              <SignatoriesPicker
                signatoryType="ApprovedBy1"
                value={formData.ApprovedBy1 || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ApprovedBy1")
                }
              />
            </div>
            {/* <div className="flex flex-col">
              <label htmlFor="ApprovedBy2" className="text-gray-700">
                Approved By
              </label>
              <SignatoriesPicker
                signatoryType="ApprovedBy2"
                value={formData.ApprovedBy2 || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ApprovedBy2")
                }
              />
            </div> */}
          </div>

          <div className="flex justify-between mt-6">
            {(
              lastClosing
                ? formData.CRDate &&
                  new Date(formData.CRDate) >= new Date(lastClosing)
                : true
            ) ? (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = await showDialog.confirm(
                      "Are you sure you want to reset?"
                    );
                    if (confirmed) {
                      handleReset();
                    }
                  }}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Reset
                </button>
                <div className="flex items-center">
                  {
                    mode === "edit" &&
                    <PrintCR receipt={formData} rows={formatLedgers(entryData.ledgers)} />
                  }
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    {mode === "edit" ? "Save Changes" : "Save Receipt"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 text-end text-gray-500 text-[0.9em]">
                <span>
                  Accounting Period Closed ({lastClosing.slice(0, 10)})
                </span>
              </div>
            )}
          </div>
          <div>
            {
              mode === "edit" && 
              <span 
                className="text-[0.8em] text-gray-800">
                  created by: {formData?.CreatedBy?.name || ''} - {formData?.CreatedBy?.position || ""} ({formData?.createdAt ? formData.createdAt.substr(0, 10) : ''})
              </span>
            }
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptModal;
