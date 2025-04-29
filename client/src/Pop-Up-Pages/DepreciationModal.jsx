import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatMMMDDYYYY } from "../helper/helper";
import DepreciationApi from "../api/DepreciationApi";
import moment from "moment";
import { useDataPreloader } from "../context/DataPreloader";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import SubledgerPicker from "../Components/SubledgerPicker";
import AccountPicker from "./../Components/AccountPicker";
import GLInput from "../Components/GLInput";
import CurrencyInput from "../Components/CurrencyInput";
import ImagePicker from "../Components/ImagePicker";
import InventoryTable from "../Components/InventoryTable";

const DepreciationModal = ({
  isOpen,
  onClose,
  onSaveDepreciation,
  depreciationData,
  mode,
}) => {
  const { lastClosing } = useDataPreloader();
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");

  const [formData, setFormData] = useState(() => ({
    Inventory: [
      {
        InventoryNo: "",
        Remarks: "",
        issuedTo: "",
        issueDate: "",
        PersonAccountable: "",
        Location: "",
        Condition: {
          GoodCondition: true,
          ForSale: false,
          ForRepair: false,
          ForDisposal: false,
          Unserviceable: false,
          Lost: false,
        },
      },
    ],
    PropNo: "",
    Name: "",
    Quantity: 0,
    UnitCost: 0,
    AssetImage: "",
    AcquisitionCost: 0,
    UseFullLife: 0,
    AssetDescription: "",
    AcquisitionDate: "",
    Reference: "",
    Subledger: { slCode: "", name: "" },
    EquipmentCategory: { code: "", name: "" },
    AccumulatedAccount: { code: "", name: "" },
    DepreciationAccount: { code: "", name: "" },
    CreatedBy: { name: user.name, position: user.userType, _id: user._id },
    PreparedBy: { name: user.name, position: user.userType, _id: user._id },
    ApprovedBy1: { name: "", position: "", _id: "" },
    ReviewedBy: { name: "", position: "", _id: "" },
    Status: { isDelete: false, isArchived: false },
  }));

  const setInventory = (newInventory) => {
    setFormData((prevData) => ({
      ...prevData,
      Inventory: newInventory,
    }));
  };

  useEffect(() => {
    if (mode === "edit" && depreciationData) {
      console.log(depreciationData);

      const formattedDate = depreciationData.AcquisitionDate
        ? new Date(depreciationData.AcquisitionDate).toISOString().split("T")[0]
        : "";
      setFormData({
        ...depreciationData,
        AcquisitionDate: formattedDate || "",
        Inventory: depreciationData.Inventory
        ? depreciationData.Inventory.map((item) => ({
            ...item,
            issueDate: formattedDate || item.issueDate || "",
          }))
        : prevData.Inventory,
        Subledger: depreciationData.Subledger || { slCode: "", name: "" },
      });
    }
  }, [mode, depreciationData]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      AcquisitionCost: prevData.UnitCost * prevData.Quantity,
    }));
  }, [formData.UnitCost, formData.Quantity]);

  // useEffect(() => {
  //   const totalAcquisitionCost = formData.Inventory.reduce(
  //     (total, item) => total + item.UnitCost * item.Quantity,
  //     0
  //   );
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     AcquisitionCost: totalAcquisitionCost,
  //   }));
  // }, [formData.Inventory]);

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  //test
  // useEffect(() => {
  //   if (formData.EquipmentCategory) {
  //     console.log("Selected Account:", formData.EquipmentCategory);
  //   }
  // }, [formData.EquipmentCategory]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.ReviewedBy) {
      showToast("ReviewedBy is required.", "warning");
      return false;
    }

    if (!formData.ApprovedBy1) {
      showToast("ApprovedBy is required.", "warning");
      return false;
    }

    if (!formData.AcquisitionDate){
      showToast("Acquisition Date is required.", "warning");
      return false;
    }
    // if (!formData.Name) {
    //   showToast("Equipment Name or Property Name is required.", "warning");
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      let dataToSubmit = formData;
      if (mode === "edit") {
        dataToSubmit = Object.keys(formData).reduce((acc, key) => {
          if (formData[key] !== depreciationData[key]) {
            acc[key] = formData[key]; 
          }
          return acc;
        }, {});
        
        if (Object.keys(dataToSubmit).length === 0) {
          console.log("No changes detected.");
          return; 
        }
  
        await DepreciationApi.updateDepreciation(depreciationData._id, dataToSubmit);
        console.log("FORM DATA UPDATED", dataToSubmit);
        showToast("Depreciation updated successfully!", "success");
      }
      else {
        await DepreciationApi.createDepreciation(formData);
        console.log("FORM DATA CREATED", formData);
        showToast("Depreciation added successfully!", "success");
      }
      onSaveDepreciation(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Depreciation:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-5 rounded-lg w-full m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit"
              ? "Update Depreciation Entry"
              : "Create Depreciation Entry"}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="Name" className="text-gray-700">
                Equipment / Property Name
              </label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="PropNo" className="text-gray-700 whitespace-nowrap">
                Plate Number / Property Number
              </label>
              <input
                type="text"
                id="PropNo"
                name="PropNo"
                value={formData.PropNo}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="AcquisitionDate" className="text-gray-700">
                Acquisition Date
              </label>
              <input
                type="date"
                id="AcquisitionDate"
                name="AcquisitionDate"
                value={formData.AcquisitionDate}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="UnitCost" className="text-gray-700">
                Unit Cost
              </label>
              <CurrencyInput
                val={formData.UnitCost}
                setVal={(value) =>
                  setFormData((prev) => ({ ...prev, UnitCost: value }))
                }
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="Quantity" className="text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                id="Quantity"
                name="Quantity"
                value={formData.Quantity}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    Quantity: parseFloat(e.target.value),
                  });
                }}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="AcquisitionCost" className="text-gray-700">
                Acquisition Cost
              </label>
              <p className="border border-gray-300 text-[0.9em] p-2 rounded-md bg-gray-100">
                {formData.AcquisitionCost !== null
                  ? numberToCurrencyString(formData.AcquisitionCost)
                  : 0}
              </p>
            </div>
            <div className="flex flex-col">
              <label htmlFor="UseFullLife" className="text-gray-700">
                Use Full Life
              </label>
              <input
                type="text"
                id="UseFullLife"
                name="UseFullLife"
                value={formData.UseFullLife}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="Reference" className="text-gray-700">
                Reference
              </label>
              <input
                type="text"
                id="Reference"
                name="Reference"
                value={formData.Reference}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="EquipmentCategory" className="text-gray-700">
                Equipment Category
              </label>
              <GLInput
                selectedAccount={formData.EquipmentCategory}
                setSelectedAccount={(selectedAccount) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    EquipmentCategory: {
                      code: selectedAccount?.code,
                      name: selectedAccount?.name,
                    },
                  }));
                }}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="AccumulatedAccount" className="text-gray-700">
                Accumulated Account
              </label>
              <GLInput
                selectedAccount={formData.AccumulatedAccount}
                setSelectedAccount={(selectedAccount) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    AccumulatedAccount: {
                      code: selectedAccount?.code,
                      name: selectedAccount?.name,
                    },
                  }));
                }}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="DepreciationAccount" className="text-gray-700">
                Depreciation Account
              </label>
              <GLInput
                selectedAccount={formData.DepreciationAccount}
                setSelectedAccount={(selectedAccount) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    DepreciationAccount: {
                      code: selectedAccount?.code,
                      name: selectedAccount?.name,
                    },
                  }));
                }}
              />
            </div>
            <div className="flex flex-col z-[20]">
              <label htmlFor="Subledger" className="text-gray-700">
                Subledger
              </label>
              <SubledgerPicker
                slCode={formData.Subledger?.slCode || ""}
                setSLCode={(slCode) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    Subledger: { ...prevData.Subledger, slCode },
                  }))
                }
                name={formData.Subledger?.name || ""}
                setName={(name) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    Subledger: { ...prevData.Subledger, name },
                  }))
                }
                callback={() => console.log("SubledgerPicker refreshed!")}
              />
            </div>
          </div>

          <InventoryTable
            inventory={formData.Inventory}
            setInventory={setInventory}
          />

          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">

          </div> */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 text-[0.7em]">
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
              <label htmlFor="AssetDescription" className="text-gray-700">
                Asset Description
              </label>
              <textarea
                type="text"
                id="AssetDescription"
                name="AssetDescription"
                value={formData.AssetDescription}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="AssetImage" className="text-gray-700">
                Asset Image
              </label>
              <ImagePicker
                image={formData.AssetImage}
                setImage={(image) =>
                  setFormData({ ...formData, AssetImage: image })
                }
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            {/* <button
                type="button"
                onClick={handleReset}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Reset
              </button> */}
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepreciationModal;
