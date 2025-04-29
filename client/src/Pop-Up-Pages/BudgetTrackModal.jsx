import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import BudgetTrackApi from "../api/BudgetTrackApi";
import { useAuth } from "../context/AuthContext";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import AccountPicker from "./../Components/AccountPicker";
import SubledgerPicker from "./../Components/SubledgerPicker";
import BudgetTemplateModal from "../Pop-Up-Pages/BudgetTemplateModal";
import { numberToCurrencyString, formatMMMDDYYYY } from "../helper/helper";
import { useDataPreloader } from "../context/DataPreloader";

const BudgetTrackModal = ({
  isOpen,
  onClose,
  onSaveBudget,
  budgetData,
  mode,
}) => {
  const { lastClosing } = useDataPreloader();
  const [budgetTemplates, setBudgetTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [slCode, setSLCode] = useState("");
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  function getStartAndEndDate() {
    const currentYear = new Date().getFullYear();
    const formatDate = (date) => {
      return date.toLocaleDateString("en-CA");
    };
    const startDate = formatDate(new Date(currentYear, 0, 1));
    const endDate = formatDate(new Date(currentYear, 11, 31));
    return { startDate, endDate };
  }
  const [formData, setFormData] = useState(() => {
    const { startDate, endDate } = getStartAndEndDate();
    return {
      startDate: startDate,
      endDate: endDate,
      TotalBudget: 0,
      TotalAllocated: 0,
      TotalUnutilized: 0,
      TotalPercentage: 0,
      PreparedBy: {
        name: user.name,
        position: user.userType,
        _id: user._id,
      },
      Description: "",
      WorkGroup: {
        acronym: "",
        fullName: "",
        code: "",
        _id: "",
      },
      Funds: [],
    };
  });

  // const fetchBudgetTemplates = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await BudgetTrackApi.getAllBudgetTemplate();
  //     setBudgetTemplates(data.BudgetTemplate || []);
  //   } catch (err) {
  //     setError("Failed to fetch templates. Please try again later.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSelectTemplate = (selectedTemplates) => {
    setTimeout(() => {
      setFormData((prevData) => ({
        ...prevData,
        Funds: selectedTemplates,
      }));
    }, 0);
  };

  // useEffect(() => {
  //   fetchBudgetTemplates();
  // }, []);

  useEffect(() => {
    if (mode === "edit" && budgetData) {
      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : "";

      const formattedStartDate = formatDate(budgetData.startDate);
      const formattedEndDate = formatDate(budgetData.endDate);

      setFormData(() => {
        const updatedData = {
          ...budgetData,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };

        updatedData.Funds = updatedData.Funds.map((fund) => ({
          ...fund,
          selected:
            updatedData.selectedFunds?.includes(fund.FundsCode) || false,
        }));

        console.log("updated data", updatedData);
        return updatedData;
      });
    }
  }, [mode, budgetData]);

  useEffect(() => {
    if (slCode && name && id) {
      const acronym = generateAcronym(name);
      setFormData((prevData) => ({
        ...prevData,
        WorkGroup: {
          ...prevData.WorkGroup,
          acronym: acronym,
          fullName: name,
          code: slCode,
          _id: id,
        },
      }));
    }
  }, [slCode, name, id]);

  const generateAcronym = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const handleUserSelect = (user, field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { name: user.name, position: user.userType, _id: user._id },
    }));
    console.log("Parent selected", user);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      Description: "",
      WorkGroup: "",
      TotalBudget: 0,
      TotalAllocated: 0,
      TotalUnutilized: 0,
      TotalPercentage: 0,
    });
  };

  const validateForm = () => {
    if (!formData || !formData.Description) {
      showToast("Description is required.", "warning");
      return false;
    }

    if (!formData.Funds || formData.Funds.length === 0) {
      showToast("Funds data is missing or empty.", "warning");
      return false;
    }

    const totalFundsBudget = formData.Funds.reduce(
      (sum, fund) => sum + (fund.FundsBudget || 0),
      0
    );

    if (formData.TotalBudget < totalFundsBudget) {
      showToast(
        `The Total Budget of ${numberToCurrencyString(
          formData.TotalBudget
        )} exceeds the available Funds Budget of ${numberToCurrencyString(
          totalFundsBudget
        )}. Please adjust the Total Budget.`,
        "warning"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (mode === "edit") {
        console.log("Updating Budget with ID:", budgetData._id, formData);
        await BudgetTrackApi.updateBudgetTrack(budgetData._id, formData);
        showToast("Budget updated successfully!", "success");
      } else {
        console.log("Creating new Budget with data:", formData);
        await BudgetTrackApi.createBudgetTrack(formData);
        showToast("Funds allocated successfully!", "success");
      }
      onSaveBudget(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Budget:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full m-10 max-h-[45rem] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit" ? "Modify Budget" : "Allocate Budget"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-[0.7em]">
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
              <label htmlFor="SelectWorkGroup" className="text-gray-700">
                Select a WorkGroup
              </label>
              <SubledgerPicker
                slCode={formData.WorkGroup.code}
                setSLCode={setSLCode}
                name={formData.WorkGroup.fullName}
                id={formData.WorkGroup._id}
                setId={setId}
                setName={setName}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleChange}
                required
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            {/* <div className="flex flex-col">
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
            </div> */}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="TotalBudget" className="text-gray-700">
                Total Budget
              </label>
              <input
                type="number"
                id="TotalBudget"
                name="TotalBudget"
                value={formData.TotalBudget || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    TotalBudget: value,
                    TotalUnutilized: value,
                  }));
                }}
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="TotalAllocated" className="text-gray-700">
                Total Allocated
              </label>
              <div
                id="TotalAllocated"
                name="TotalAllocated"
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              >
                {numberToCurrencyString(formData.TotalAllocated || 0)}
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="TotalExpense" className="text-gray-700">
                Total Expense
              </label>
              <div
                id="TotalExpense"
                name="TotalExpense"
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              >
                {numberToCurrencyString(formData.TotalExpense || 0)}
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="TotalUnutilized" className="text-gray-700">
                Total Unutilized
              </label>
              <div
                id="TotalUnutilized"
                name="TotalUnutilized"
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              >
                {numberToCurrencyString(formData.TotalUnutilized || 0)}
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="TotalFundsBudget" className="text-gray-700">
                Total Funds Budget
              </label>
              <input
                type="number"
                id="TotalFundsBudget"
                name="TotalFundsBudget"
                value={
                  formData.Funds.reduce(
                    (sum, fund) => sum + (fund.FundsBudget || 0),
                    0
                  ) || ""
                }
                readOnly
                className={`border p-2 rounded-md bg-gray-100 cursor-not-allowed ${
                  formData.Funds.reduce(
                    (sum, fund) => sum + (fund.FundsBudget || 0),
                    0
                  ) > formData.TotalBudget
                    ? "border-red-500 bg-red-100"
                    : "border-gray-300"
                }`}
              />
            </div>
          </div>

          <BudgetTemplateModal
            onSelectTemplate={handleSelectTemplate}
            selectedFunds={formData.Funds}
            mode={mode}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 text-[0.7em]">
            <div className="flex flex-col">
              <label htmlFor="Description" className="text-gray-700">
                Description
              </label>
              <textarea
                type="text"
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
              />
            </div>
          </div>
          {(
            lastClosing
              ? formData.startDate &&
                new Date(formData.startDate) >= new Date(lastClosing)
              : true
          ) ? (
            <>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-red-600 text-white py-2 px-4 rounded-md"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  {mode === "edit" ? "Update Budget" : "Allocate Budget"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 text-end text-gray-500 text-[0.9em]">
              <span>Accounting Period Closed ({lastClosing.slice(0, 10)})</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BudgetTrackModal;
