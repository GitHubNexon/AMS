import React from "react";
import { FaCamera, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useCompanySettingsLogic from "../context/useCompanySettingsLogic";
import useBase from "../context/useBase";

const CompanySettings = () => {
  const navigate = useNavigate();

  const {base} = useBase();

  const {
    companyName,
    setCompanyName,
    companyType,
    setCompanyType,
    legalName,
    setLegalName,
    selectedOption,
    setSelectedOption,
    companyLogo,
    companyEmail,
    setCompanyEmail,
    companyPhone,
    setCompanyPhone,
    companyWebsite,
    setCompanyWebsite,
    streetAddress,
    setStreetAddress,
    city,
    setCity,
    region,
    setRegion,
    barangay,
    setBarangay,
    zipCode,
    setZipCode,
    fileInputRef,
    handleImageChange,
    handleUploadClick,
    handleSave,
    handleCancel,
    handleBackButtonClick,
  } = useCompanySettingsLogic();

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="relative w-full bg-white p-8 rounded-lg shadow-lg backdrop-filter backdrop-blur-sm">
        <div className="text-center mb-6">
          {/* Company Logo Section */}
          <div
            className="relative inline-block w-36 h-36 rounded-xl overflow-hidden cursor-pointer"
            onClick={handleUploadClick}
          >
            <img
              id="companyLogo"
              src={"data:image/png;base64," + companyLogo}
              alt="Company Logo"
              className="w-full h-full object-cover"
            />

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FaCamera />
            </div>
          </div>
          <div>
            <span className="text-sm">Maximum upload file size: 20mb</span>
          </div>
          <h2 className="text-xl text-white font-bold mt-4 bg-green-600 rounded-md p-3">
            {companyName || "Company Name"}
          </h2>
          <span className="font-light mt-4 text-sm">
            Shown on Sales Forms and Purchase Orders
          </span>
        </div>

        {/* Company Settings Form */}
        <form className="space-y-6" onSubmit={handleSave}>
          <h1 className="text-2xl text-gray-700 text-center">
            COMPANY INFORMATION
          </h1>

          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-semibold text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Enter Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Company Type */}
          <div>
            <label
              htmlFor="companyType"
              className="block text-sm font-semibold text-gray-700"
            >
              Company Type
            </label>
            <select
              id="companyType"
              className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              value={companyType}
              required
              onChange={(e) => setCompanyType(e.target.value)}
            >
              { base.companyTypes.map((item, index) => <option key={index} value={item.company}>{item.company}</option>) }
            </select>
          </div>

          <h1 className="text-2xl text-gray-700 text-center mb-4">
            COMPANY CONTACT INFORMATION
          </h1>
          {/* Contact Information */}

          <h3 className="text-gray-700 mb-4">Company Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="companyEmail"
                className="block text-sm font-semibold text-gray-700"
              >
                Company Email *
              </label>
              <input
                type="email"
                id="companyEmail"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Company Email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="companyPhone"
                className="block text-sm font-semibold text-gray-700"
              >
                Company Phone Number *
              </label>
              <input
                type="text"
                id="companyPhone"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Company Phone Number"
                value={companyPhone}
                required
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="companyWebsite"
                className="block text-sm font-semibold text-gray-700"
              >
                Website
              </label>
              <input
                type="url"
                id="companyWebsite"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Website URL"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Company Address Section */}
          <h1 className="text-2xl text-gray-700 text-center">
            COMPANY ADDRESS INFORMATION
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <h3 className="col-span-full text-gray-700 mb-2">
              Company Address
            </h3>

            <div>
              <label
                htmlFor="streetAddress"
                className="block text-sm font-semibold text-gray-700"
              >
                Street Address
              </label>
              <input
                type="text"
                id="streetAddress"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Street Address"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>
            {/* Region */}
            <div>
              <label
                htmlFor="region"
                className="block text-sm font-semibold text-gray-700"
              >
                Region *
              </label>
              <input
                type="text"
                id="region"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Region"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-semibold text-gray-700"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="barangay"
                className="block text-sm font-semibold text-gray-700"
              >
                Barangay *
              </label>
              <input
                type="text"
                id="barangay"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Barangay"
                required
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-semibold text-gray-700"
              >
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Enter Zip Code"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-md shadow hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettings;
