import React, { useState } from "react";
import { FaRegFileAlt, FaRegChartBar, FaRegClipboard } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import TaxReportWPT from "./TaxReportWPT";
import TaxReportEWT from "./TaxReportEWT";
import TaxReportFVAT from "./TaxReportFVAT";
import TaxReportWTC from "./TaxReportWTC";
import InputTaxReport from "./InputTaxReport";
import OutTaxReport from "./OutPutTaxReport";

const TaxReportNav = ({ toggleModal }) => {
  const [activeTab, setActiveTab] = useState("InputTax");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full p-4">
      <div className="relative">
        {/* <button
          onClick={toggleModal}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          <IoIosClose className="mr-2" size={30} />
        </button> */}
      </div>
      <div className="tabs flex space-x-4 mb-6">
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "InputTax"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("InputTax")}
        >
          <FaRegChartBar className="mr-2" />
          AlphaList of InputTaxes
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "OutPutTax"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("OutPutTax")}
        >
          <FaRegChartBar className="mr-2" />
          AlphaList of OutPutTaxes
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "EWT"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("EWT")}
        >
          <FaRegChartBar className="mr-2" />
         EWT
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "FVAT"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("FVAT")}
        >
          <FaRegChartBar className="mr-2" />
          FVAT
        </button>

        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "WPT"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("WPT")}
        >
          <FaRegChartBar className="mr-2" />
          WPT
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "WTC"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("WTC")}
        >
          <FaRegChartBar className="mr-2" />
          WTC
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "OutPutTax" && <OutTaxReport />}
        {activeTab === "InputTax" && <InputTaxReport />}
        {activeTab === "EWT" && <TaxReportEWT />}
        {activeTab === "FVAT" && <TaxReportFVAT />}
        {activeTab === "WPT" && <TaxReportWPT />}
        {activeTab === "WTC" && <TaxReportWTC />}
      </div>
    </div>
  );
};

export default TaxReportNav;
