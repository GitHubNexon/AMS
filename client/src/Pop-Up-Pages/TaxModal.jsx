import React, { useState, useEffect, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import taxApi from "../api/taxApi";
import { showToast } from "../utils/toastNotifications";

const TaxModal = ({ isOpen, onClose, onSaveTax, taxData, mode }) => {
  const [formData, setFormData] = useState({
    Code: "",
    Category: "",
    Coverage: "",
    Type: "",
    taxRate: "",
  });

  useEffect(() => {
    if (mode === "edit" && taxData) {
      setFormData({
        Code: taxData.Code || "",
        Category: taxData.Category || "",
        Coverage: taxData.Coverage || "",
        Type: taxData.Type || "",
        taxRate: taxData.taxRate || "",
      });
    }
  }, [mode, taxData]);

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
      Code: "",
      Category: "",
      Coverage: "",
      Type: "",
      taxRate: "",
    });
  };

  const validateForm = () => {
    if (!formData.Code) {
      showToast("Code is required.", "warning");
      return false;
    }
    if (!formData.Category) {
      showToast("Category is required.", "warning");
      return false;
    }
    if (!formData.Type) {
      showToast("Type is required.", "warning");
      return false;
    }
    if (!formData.taxRate) {
      showToast("Tax Rate By is required.", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log(formData);
    if (!validateForm()) {
      return;
    }
    try {
      if (mode === "edit") {
        await taxApi.updateTax(taxData._id, formData);
        showToast("Tax updated successfully!", "success");
      } else {
        await taxApi.createTax(formData);
        showToast("Tax added successfully!", "success");
      }
      onSaveTax(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Tax:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-[500px] m-10 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {mode === "edit" ? "Edit Tax" : "Add Tax"}
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
            <div className="flex flex-col items-stretch justify-center text-[0.7em] space-y-2">
              <div className="flex flex-col">
                <label htmlFor="Code" className="text-gray-700">
                  Code
                </label>
                <input
                  type="text"
                  id="Code"
                  name="Code"
                  value={formData.Code}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="Category" className="text-gray-700">
                  Category
                </label>
                <textarea
                  type="text"
                  id="Category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="Coverage" className="text-gray-700">
                  Coverage
                </label>
                <textarea
                  type="text"
                  id="Coverage"
                  name="Coverage"
                  value={formData.Coverage}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 resize-none h-[100px]"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="Type" className="text-gray-700">
                  Type
                </label>
                <select
                  id="Type"
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                >
                  <option value="">Select Type</option> 
                  <option value="Individual">Individual</option>
                  <option value="Corporation">Corporation</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="taxRate" className="text-gray-700">
                  Tax Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
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
    </>
  );
};

export default TaxModal;
