import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
axios.defaults.withCredentials = true;
import useBase from "../context/useBase";
import { showToast } from "../utils/toastNotifications"; // Import the toast utility

const UserModal = ({ isOpen, onClose, mode, user, onSaveUser, refresh }) => {
  const { base } = useBase();

  // Initialize state for fields
  const [firstName, setFirstName] = useState("");
  const [tin, setTin] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [signatoryType, setSignatoryType] = useState([]);

  const handleSignatoryChange = (e) => {
    const { value, checked } = e.target;

    setSignatoryType((prev) =>
      checked ? [...prev, value] : prev.filter((type) => type !== value)
    );
  };

  useEffect(() => {
    if (mode === "edit" && user) {
      setName(user.name || "");
      setFirstName(user.firstName || "");
      setMiddleName(user.middleName || "");
      setLastName(user.lastName || "");
      setGender(user.gender || "");
      setEmail(user.email || "");
      setTin(user.tin || "");
      setContactNumber(user.contactNumber || "");
      setAddress(user.address || "");
      setUserType(user.userType || "Accountant");
      setSignatoryType(user.signatoryType || []);
    } else {
      resetFields();
    }
  }, [mode, user]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasUppercase) {
      return "Password must contain at least 1 uppercase letter.";
    }
    if (!hasLowercase) {
      return "Password must contain at least 1 lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must contain at least 1 number.";
    }
    if (!hasSpecial) {
      return "Password must contain at least 1 special character.";
    }

    return "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationError = validatePassword(newPassword);
    setError(validationError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passwordError = validatePassword(password);
    if (mode === "add" && passwordError) {
      setError(passwordError);
      showToast(passwordError, "warning");
      setLoading(false);
      return;
    }

    if (!name || !email || !gender || (mode === "add" && !password)) {
      const missingFields = [];
      if (!name) missingFields.push("Username");
      if (!email) missingFields.push("Email");
      if (!gender) missingFields.push("Gender");
      if (mode === "add" && !password) missingFields.push("Password");

      const errorMessage = `Please fill in the following required fields: ${missingFields.join(
        ", "
      )}.`;
      setError(errorMessage);
      showToast(errorMessage, "warning");
      setLoading(false);
      return;
    }

    try {
      const newUser = {
        name,
        firstName,
        middleName,
        lastName,
        gender,
        email,
        tin,
        contactNumber,
        address,
        userType,
        signatoryType,
      };

      if (mode === "add") {
        newUser.password = password;
        await axios.post("/user", newUser);
        showToast("Added successfully!", "success");
        resetFields();
        refresh();
      } else if (mode === "edit") {
        if (newPassword) {
          const newPasswordError = validatePassword(newPassword);
          if (newPasswordError) {
            setError(newPasswordError);
            showToast(newPasswordError, "warning");
            setLoading(false);
            return;
          }
          newUser.password = newPassword;
        } else {
          delete newUser.password;
        }

        const isUnchanged = Object.keys(newUser).every(
          (key) => newUser[key] === user[key]
        );

        if (isUnchanged) {
          showToast("No changes detected.", "warning");
          setLoading(false);
          return;
        }

        console.log(newUser);
        await axios.patch(`/user/${user._id}`, newUser);
        showToast("Edited successfully!", "success");

        refresh();
      }

      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      console.error("Error response:", error.response);
      setError(
        error.response?.data?.message ||
          "An error occurred while saving the user."
      );
      showToast(error.response?.data?.message || "An error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetFields();
    setError(""); // Clear the error state when cancelling
  };

  const resetFields = () => {
    setName("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setGender("");
    setEmail("");
    setTin("");
    setPassword("");
    setNewPassword("");
    setUserType("Accountant");
    setContactNumber("");
    setAddress("");
    setError("");
    setSignatoryType([]); // Clear the error state
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 modal transition duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg relative w-[700px] max-w-full max-h-[90vh] overflow-y-auto m-10"
        data-aos="zoom-in"
        data-aos-duration="500"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-2 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={25} />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
            <div className="mb-4">
              <label className="block text-gray-700">First Name *</label>
              <input
                type="text"
                value={firstName}
                placeholder="Enter First name"
                required
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">
                Middle Name (optional)
              </label>
              <input
                type="text"
                value={middleName}
                placeholder="Enter Middle name"
                onChange={(e) => setMiddleName(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Last Name *</label>
              <input
                type="text"
                value={lastName}
                placeholder="Enter Last name"
                required
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
            <div className="mb-4">
              <label className="block text-gray-700">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Username *</label>
              <input
                type="text"
                value={name}
                placeholder="Enter Username"
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                placeholder="Enter Contact Number"
                onChange={(e) => setContactNumber(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            <div className="mb-4">
              <label className="block text-gray-700">Email *</label>
              <input
                type="email"
                value={email}
                placeholder="Enter Email Address"
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tin</label>
              <input
                type="text"
                value={tin}
                placeholder="Enter Tin"
                onChange={(e) => setTin(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                // required
              />
            </div>
          </div>

          {mode === "add" && (
            <div className="mb-4">
              <label className="block text-gray-700">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter Password"
                onChange={handlePasswordChange}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-1 text-blue-500 hover:text-blue-700"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700">Signatory Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "PreparedBy",
                "CreatedBy",
                "CertifiedBy",
                "ReviewedBy",
                "ApprovedBy1",
                "ApprovedBy2",
              ].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={type}
                    checked={signatoryType.includes(type)}
                    onChange={handleSignatoryChange}
                    className="form-checkbox text-blue-500"
                  />
                  <span>{type.replace(/([A-Z])/g, " $1").trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            >
              {base.userTypes.map((item, index) => (
                <option key={index} value={item.user}>
                  {item.user}
                </option>
              ))}
            </select>
          </div>
          {mode === "edit" && (
            <div className="mb-4">
              <label className="block text-gray-700">New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                placeholder="Enter New Password (optional)"
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="mt-1 text-blue-500 hover:text-blue-700"
              >
                {showNewPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <textarea
              type="text"
              value={address}
              placeholder="Enter Address"
              onChange={(e) => setAddress(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                handleClear();
                onClose();
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Add User"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
