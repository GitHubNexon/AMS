import React, { useState, useEffect, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import EntriesApi from "../api/EntriesApi";
import { showToast } from "../utils/toastNotifications";
import AutoNumber from "../components/AutoNumber";
import { useAuth } from "../context/AuthContext";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import LedgerSheet from "../Components/LedgerSheet";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import FileHandler from "../Components/FileHandler";
import { FileHandlerContext } from "../context/FileHandlerContext";
import { useDataPreloader } from "../context/DataPreloader";
import axios from 'axios';
import PrintJV from "../Components/PrintJV";
import { formatLedgers } from "../helper/helper";

const JournalModal = ({ isOpen, onClose, onSaveJournal, entryData, mode }) => {



  const { lastClosing } = useDataPreloader();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    EntryType: "Journal",
    JVNo: "",
    JVDate: new Date().toISOString().split("T")[0],
    Particulars: "",
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    ReviewedBy: { name: "", position: "", _id: "" },
    ApprovedBy1: { name: "", position: "", _id: "" },
    // ApprovedBy2: { name: "", position: "", _id: "" },
    // CertifiedBy: { name: "", position: "", _id: "" },
    ledgers: [],
  });

  const {
    preload,
    getLedgers,
    reset,
    setDescriptionAll,
    totalDebit,
    totalCredit,
  } = useContext(LedgerSheetContext);

  const { getFiles, insertFiles } = useContext(FileHandlerContext);




  useEffect(() => {
    if (mode === "edit" && entryData) {
      const formattedJVDate = entryData.JVDate
        ? new Date(entryData.JVDate).toISOString().split("T")[0]
        : "";

      setFormData({
        ...entryData,
        JVDate: formattedJVDate,
      });
      preload(entryData.ledgers);
    }
    if (mode === "duplicate" && entryData) {
      const formattedJVDate = entryData.JVDate
        ? new Date(entryData.JVDate).toISOString().split("T")[0]
        : "";

      const entryDataCopy = { ...entryData }; // Create a copy of the entryData
      delete entryDataCopy.ApprovedBy2;
      delete entryDataCopy.CertifiedBy;

      setFormData({
        ...entryDataCopy,
        _id: undefined,
        CRNo: "",
        JVDate: formattedJVDate,
        CreatedBy: { name: user.name, position: user.userType, _id: user._id },
        PreparedBy: { name: user.name, position: user.userType, _id: user._id },
        ReviewedBy: { name: "", position: "", _id: "" },
        ApprovedBy1: { name: "", position: "", _id: "" },
      });

      preload(entryDataCopy.ledgers);
      console.log("ENTRY", entryDataCopy);
    }

    // accrual mode shows modal with ledgers pre filled. see journalClick() on SubledgerModal.jsx
    if (mode === "accrual" && Object.entries(entryData).length >= 1) {
      preload(entryData.ledgers);
      const formattedJVDate = entryData.JVDate
        ? new Date(entryData.JVDate).toISOString().split("T")[0]
        : "";
      setFormData({
        ...entryData,
        _id: undefined,
        JVNo: "",
        CreatedBy: { name: user.name, position: user.userType, _id: user._id },
        PreparedBy: { name: user.name, position: user.userType, _id: user._id },
        ReviewedBy: { name: "", position: "", _id: "" },
        ApprovedBy1: { name: "", position: "", _id: "" },
        // ApprovedBy2: { name: "", position: "", _id: "" },
        // CertifiedBy: { name: "", position: "", _id: "" },
        JVDate: entryData.JVDate
          ? entryData.JVDate
          : new Date().toISOString().split("T")[0],
      });
      
    }
    if (mode === "DP") {
      console.log("Monthly Depreciation", entryData);
      setFormData({
        ...formData,
        ...entryData,
      });
    }
    if (mode === "DP-ALL") {
      console.log("Monthly Depreciation", entryData);
      setFormData({
        ...formData,
        ...entryData,
      });
    }
    if(mode === "ca"){
      setFormData({...formData, ...entryData});
    }
    if(mode === "payroll"){
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
      // ApprovedBy2: "",
      // CertifiedBy: "",
      tag: "",
      ledgers: [],
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
      JVNo: value,
    }));
  };

  // Validate required fields with specific messages
  const validateForm = () => {
    if (!formData.JVNo) {
      showToast("JV Number is required.", "warning");
      return false;
    }
    if (!formData.JVDate) {
      showToast("JV Date is required.", "warning");
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
    const l = getLedgers();
    if (l === false || (Array.isArray(l) && l.length === 0)) {
      return false;
    } else {
      formData.ledgers = l;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log(formData);
    if (totalDebit != totalCredit) {
      console.log(totalCredit, totalDebit);
      showToast("Credit and Debit must be balanced", "warning");
      return;
    }

    // if (entryData.JVDate) {
    //   const formattedJVDate = new Date(entryData.JVDate);
    //   formData.JVDate = formattedJVDate.toISOString();
    // } else {
    //   formData.JVDate = new Date();
    // }

    if (!validateForm()) {
      return;
    }
    try {
      let savedEntry = {}
      if (mode === "edit") {
        savedEntry = await EntriesApi.updateEntry(entryData._id, formData);
        insertFiles(formData._id);
        showToast("Journal updated successfully!", "success");
        
      } else if (mode === "DP") {
        const response = await EntriesApi.createEntry(formData);
        await axios.post(
          `/depreciation/link`,
          {
            entryId: response.entry._id,
            id: entryData.Depreciation.dpId,
            monthlyDepreciationId: entryData.Depreciation.monthlyDepreciationId,
            DocNo: response.entry.JVNo,
            month: entryData.month,
            year: entryData.year
          },
          { withCredentials: true }
        );
        showToast("Journal added successfully!", "success");
      }
      else if (mode === "DP-ALL") {
        const response = await EntriesApi.createEntry(formData);
        await axios.post(
          `/depreciation/all-link`,
          {
            entryId: response.entry._id,
            ids: entryData.Depreciation.dpId,
            monthlyDepreciationIds: entryData.Depreciation.monthlyDepreciationId,
            DocNo: response.entry.JVNo,
            month: entryData.Depreciation.month,
            year: entryData.Depreciation.year
          },
          { withCredentials: true }
        );
        showToast("Journal added successfully!", "success");
      }
      else {
        savedEntry = await EntriesApi.createEntry(formData);
        insertFiles(savedEntry.entry._id);
        showToast("Journal added successfully!", "success");
        handleReset();
      }
      onSaveJournal(savedEntry);

      onClose();
    } catch (error) {
      console.error("Error submitting journal:", error);
      if (
        error.response &&
        error.response.data.message.includes("JVNo already exists")
      ) {
        showToast(
          "JV Number already exists. Please choose another one.",
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
            {mode === "edit" ? "Edit Journal Entry" : "Add Journal Entry"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 text-[0.7em]">
            <div className="flex flex-col">
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
            <div className="flex flex-col">
              <label htmlFor="JVNo" className="text-gray-700">
                JV Number (Auto-Generated Number)
              </label>
              {/* <input
                type="text"
                id="JVNo"
                name="JVNo"
                value={formData.JVNo}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              /> */}
              <AutoNumber
                entryType="Journal"
                value={formData.JVNo}
                onChange={handleAutoNumberChange}
                mode={mode}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="JVDate" className="text-gray-700">
                JV Date
              </label>
              <input
                type="date"
                id="JVDate"
                name="JVDate"
                value={formData.JVDate}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
          </div>

          <div className="z-50 border-t border-b pt-2 pb-2">
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
            </div>
          </div>

          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-[0.7em]">
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
                value={formData.ApprovedBy2 || ""}
                onSelectSignatory={(user) =>
                  handleUserSelect(user, "ApprovedBy2")
                }
              />
            </div>
          </div> */}

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
                ? formData.JVDate &&
                  new Date(formData.JVDate) >= new Date(lastClosing)
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
                    <PrintJV journal={formData} rows={formatLedgers(entryData.ledgers)} />
                  }
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    {mode === "edit" ? "Save Changes" : "Save Journal"}
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

export default JournalModal;
