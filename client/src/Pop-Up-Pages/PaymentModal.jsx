import React, { useState, useEffect, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import { showToast } from "../utils/toastNotifications";
import AutoNumberPayment from "../components/AutoNumberPayment";
import { useAuth } from "../context/AuthContext";
import SubledgerPicker from "../Components/SubledgerPicker";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import LedgerSheet from "../Components/LedgerSheet";
import InputTaxPicker from "../Components/InputTaxPicker";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { FileHandlerContext } from "../context/FileHandlerContext";
import FileHandler from "../Components/FileHandler";
import { useDataPreloader } from "../context/DataPreloader";
import PrintDV from "../Components/PrintDV";

const PaymentModal = ({ isOpen, onClose, onSavePayment, entryData, mode }) => {
  const { lastClosing } = useDataPreloader();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    EntryType: "Payment",
    DVNo: "",
    // DVDate: new Date().toISOString().split("T")[0],
    DVDate: new Date().toISOString().split("T")[0],
    CheckNo: "",
    DisbursementTransaction: [],
    PaymentEntity: { slCode: "", name: "", tin: "", address: "", zip: ''},
    Particulars: "",
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    // ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
    ApprovedBy2: { name: "", position: "", _id: "" },
    CertifiedBy: { name: "", position: "", _id: "" },
    Attachments: "",
    tag: "",
    ledgers: [],
  });

  const {
    preload,
    getLedgers,
    reset,
    totalCredit,
    totalDebit,
    setDescriptionAll,
  } = useContext(LedgerSheetContext);

  const { getFiles, insertFiles } = useContext(FileHandlerContext);

  useEffect(() => {
    if (mode === "edit" && entryData) {
      console.log(entryData);
      const formattedDVDate = entryData.DVDate
        ? new Date(entryData.DVDate).toISOString().split("T")[0]
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
        DVDate: formattedDVDate,
        PaymentEntity: paymentEntity,
      });
      preload(entryData.ledgers);
    }
    if (mode === "duplicate" && entryData) {
      const formattedDVDate = entryData.DVDate
        ? new Date(entryData.DVDate).toISOString().split("T")[0]
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
        _id: undefined,
        DVNo: "",
        DVDate: formattedDVDate,
        PaymentEntity: paymentEntity,
      });

      preload(entryData.ledgers);
    }
    if(mode === "ca"){
      setFormData({...formData, ...entryData});
    }
    if (entryData) {
      getFiles(entryData._id);
    }
  }, [mode, entryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // particulars change will update the ledgers description
    if (name === "Particulars") {
      setDescriptionAll(value);
    }
    if (name === "DVDate") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: new Date(value),
      }));
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAutoNumberChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      DVNo: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      PaymentEntity: "",
      // ReviewedBy: "",
      ApprovedBy1: "",
      ApprovedBy2: "",
      CertifiedBy: "",
      tag: "",
      CheckNo: "",
      ledgers: [],
    });
    reset();
  };

  // Handle user selection and set the name and position
  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  // Validate required fields with specific messages
  const validateForm = () => {
    if (!formData.DVNo) {
      showToast("DV Number is required.", "warning");
      return false;
    }
    if (!formData.DVDate) {
      showToast("DV Date is required.", "warning");
      return false;
    }
    if (!formData.PreparedBy) {
      showToast("Prepared By is required.", "warning");
      return false;
    }
    // if (!formData.ReviewedBy) {
    //   showToast("ReviewedBy By is required.", "warning");
    //   return false;
    // }
    if (!formData.CertifiedBy) {
      showToast("CertifiedBy By is required.", "warning");
      return false;
    }
    // if (!formData.PaymentEntity.slCode || !formData.PaymentEntity.name) {
    //   showToast("Payment Entity is required.", "warning");
    //   return false;
    // }
    const l = getLedgers();
    console.log("l is", l);
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

    if (!formData.ApprovedBy1?.name || !formData.ApprovedBy1?.position) {
      if (!formData.ApprovedBy2?.name || !formData.ApprovedBy2?.position) {
        showToast("At least one of Approved By must be filled out", "warning");
        return;
      }
    }
    // Remove ApprovedBy1 or ApprovedBy2 if they're empty (to avoid server validation errors)
    if (!formData.ApprovedBy1?.name || !formData.ApprovedBy1?.position) {
      delete formData.ApprovedBy1;
    }
    if (!formData.ApprovedBy2?.name || !formData.ApprovedBy2?.position) {
      delete formData.ApprovedBy2;
    }

    if (!validateForm()) {
      return;
    }
    // const paymentEntityString = `${formData.PaymentEntity.slCode} - ${formData.PaymentEntity.name}`;

    // const formDataToSubmit = {
    //   ...formData,
    //   PaymentEntity: paymentEntityString, // Set PaymentEntity as a string
    // };

    console.log("Form Data before submission:", formData);

    try {
      let savedEntry = {};
      if (mode === "edit") {
        savedEntry = await EntriesApi.updateEntry(entryData._id, formData);
        console.log(formData);
        insertFiles(formData._id);
        showToast("Payment updated successfully!", "success");
      } else {
        savedEntry = await EntriesApi.createEntry(formData);
        console.log(formData);
        insertFiles(savedEntry._id);
        showToast("Payment updated successfully!", "success");
        handleReset();
      }
      onSavePayment(savedEntry);
      onClose();
    } catch (error) {
      console.error("Error submitting payment:", error);
      if (
        error.response &&
        error.response.data.message.includes("DVNo already exists")
      ) {
        showToast(
          "DV Number already exists. Please choose another one.",
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
            {mode === "edit" ? "Edit Payment Entry" : "Add Payment Entry"}
          </h2>
          <button
            onClick={async () => {
              const confirmed = await showDialog.confirm(
                "Are you sure you want to close without saving?"
              );
              if (confirmed) {
                onClose();
              }
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes size={25} />
          </button>
        </div>
        <form className="space-y-4">
          <div className="flex flex-wrap gap-2 items-end text-[0.7em]">
            <div className="flex flex-col w-[100px]">
              <label htmlFor="EntryType" className="text-gray-700">
                Entry Type
              </label>
              <input
                type="text"
                id="EntryType"
                name="EntryType"
                value={formData.EntryType}
                readOnly
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col w-[125px]">
              <label htmlFor="DVNo" className="text-gray-700">
                DV No. 
                <span className="text-[0.8em]">(Auto-Generated)</span>
              </label>
              <AutoNumberPayment
                entryType="Payment"
                value={formData.DVNo}
                onChange={handleAutoNumberChange}
                mode={mode}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="DVDate" className="text-gray-700">
                DV Date
              </label>
              <input
                type="date"
                id="DVDate"
                name="DVDate"
                value={formData.DVDate}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="CheckNo" className="text-gray-700">
                Check Number
              </label>
              <input
                type="text"
                id="CheckNo"
                name="CheckNo"
                value={formData.CheckNo}
                onChange={handleChange}
                className="border border-gray-300 p-[9px] rounded-md"
              />
            </div>
            {/* <div className="flex flex-col">
              <label htmlFor="CheckNo" className="text-gray-700">
                Input Tax(NOT FIXED YET!!!)
              </label>
              <button
                type="button"
                onClick={() => setIsAlphaListTaxModalOpen(true)}
                className="bg-blue-500 text-white p-2 rounded-md"
              >
                Open Tax
              </button>
            </div> */}
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
          </div>

          <div className="z-index-500 border-t border-b pt-2 pb-2">
            <LedgerSheet />
          </div>

          {/* <div className="mt-4">
            <InputTaxPicker />
          </div> */}

          <div className="flex flex-wrap text-[0.7em]">
            <div className="flex flex-col flex-1 mr-2">
              <label htmlFor="Particulars" className="text-gray-700">
                Particulars
              </label>
              <textarea
                type="text"
                id="Particulars"
                name="Particulars"
                value={formData.Particulars}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-[0.7em]">
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
            <div className="hidden">
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
            <div className="flex flex-col">
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
            </div>
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
            <div className="flex flex-col">
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
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {(
              lastClosing
                ? formData.DVDate &&
                  new Date(formData.DVDate) >= new Date(lastClosing)
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
                <div className="flex items-end">
                  {
                    mode === "edit" &&
                    <PrintDV dv={entryData} />
                  }
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    {mode === "edit" ? "Save Changes" : "Save Payment"}
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

export default PaymentModal;
