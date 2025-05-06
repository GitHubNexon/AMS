import React, { useState, useEffect, useContext, useRef } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import showDialog from "../utils/showDialog";
import { showToast } from "../utils/toastNotifications";
import moment from "moment";
import SignatoriesPicker from "../Components/SignatoriesPicker";
import { useAuth } from "../context/AuthContext";
import employeeApi from "../api/employeeApi";

const EmployeeModal = ({
  isOpen,
  onClose,
  onSaveEmployees,
  employeeData,
  mode,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeImage: "",
    employeeType: "",
    employeePosition: "",
    employeeDivision: "",
    employeeDepartment: "",
    employeeSection: "",
    address: "",
    contactNo: "",
    email: "",
    dateOfBirth: moment().format("YYYY-MM-DD"),
    Status: {
      isDeleted: false,
      isArchived: false,
    },
    CreatedBy: {
      name: user.name,
      position: user.userType,
      _id: user._id,
    },
  });

  useEffect(() => {
    if (mode === "edit" && employeeData) {
      const formattedDate = employeeData.dateOfBirth
        ? new Date(employeeData.dateOfBirth).toISOString().split("T")[0]
        : moment().format("YYYY-MM-DD");

      setFormData({
        ...employeeData,
        dateOfBirth: formattedDate,
        assetImage: employeeData.assetImage || "",
      });
    }
  }, [mode, employeeData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error");
        e.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          employeeImage: reader.result,
        }));
      };
      reader.onerror = () => {
        showToast("Error reading image file", "error");
      };
      reader.readAsDataURL(file);
    }
  };

  const requiredFields = [
    { key: "employeeName", message: "Employee Name is required." },
    { key: "employeeType", message: "EmployeeType is required." },
    { key: "employeePosition", message: "Employee Position is required." },
    { key: "employeeDivision", message: "Employee Division is required." },
    { key: "employeeDepartment", message: "Employee Department is required." },
  ];

  const validateForm = () => {
    for (let { key, message } of requiredFields) {
      if (!formData[key]) {
        showToast(message, "warning");
        return false;
      }
    }
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
          if (formData[key] !== employeeData[key]) {
            acc[key] = formData[key];
          }
          return acc;
        }, {});

        if (Object.keys(dataToSubmit).length === 0) {
          console.log("No changes detected.");
          return;
        }

        await employeeApi.updateEmployeeRecord(employeeData._id, dataToSubmit);
        console.log("FORM DATA UPDATED", dataToSubmit);
        showToast("Employee updated successfully!", "success");
      } else {
        await employeeApi.createEmployeeRecord(formData);
        console.log("FORM DATA CREATED", formData);
        showToast("Employee Recorded successfully!", "success");
      }
      onSaveEmployees(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting Employee:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 ">
      <div className="bg-white p-5 rounded-lg w-[1000px] m-10 max-h-[40rem]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "edit"
              ? "Update Employee Record "
              : "Add Employee Record "}
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
        <div className="flex border-b border-gray-300 mb-4">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "basic"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Information
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "advance"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("advance")}
          >
            Other Information
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={"space-y-4 overflow-scroll max-h-[25rem] p-5"}
        >
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 text-[0.7em]">
                <div className="flex flex-col">
                  <label htmlFor="employeeName" className="text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeName"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="employeeType" className="text-gray-700">
                    Employee Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeType"
                    name="employeeType"
                    value={formData.employeeType}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="employeePosition" className="text-gray-700">
                    Employee Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeePosition"
                    name="employeePosition"
                    value={formData.employeePosition}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="employeeDivision" className="text-gray-700">
                    Employee Division <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeDivision"
                    name="employeeDivision"
                    value={formData.employeeDivision}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="employeeDepartment" className="text-gray-700">
                    Employee Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="employeeDepartment"
                    name="employeeDepartment"
                    value={formData.employeeDepartment}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="employeeSection" className="text-gray-700">
                    Employee Section
                  </label>
                  <input
                    type="text"
                    id="employeeSection"
                    name="employeeSection"
                    value={formData.employeeSection}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="employeeImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />

                {formData.employeeImage ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={formData.employeeImage}
                      alt="Asset Preview"
                      className="w-20 h-20 object-cover rounded-md cursor-pointer border- p-2"
                      onClick={() => setIsPreviewOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600 text-sm"
                  >
                    Upload Image
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "advance" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 text-[0.7em]">
              <div className="flex flex-col">
                <label htmlFor="address" className="text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="contactNo" className="text-gray-700">
                  Contact No
                </label>
                <input
                  type="text"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="dateOfBirth" className="text-gray-700">
                  Date Of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>

        {isPreviewOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded-lg max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Image Preview</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={formData.employeeImage}
                  alt="Image Preview"
                  className="max-w-full max-h-[500px] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;
