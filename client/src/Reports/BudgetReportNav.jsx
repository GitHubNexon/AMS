import React, { useState } from "react";
import { FaRegFileAlt, FaRegChartBar, FaRegClipboard } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import BudgetUtilization from "./BudgetUtilization";
import BudgetWorkGroup from "./BudgetWorkGroup";
import BudgetPerAccount from "./BudgetPerAccount";

const BudgetReportNav = ({ toggleModal }) => {
  const [activeTab, setActiveTab] = useState("A");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full p-4">
      <div className="relative">
        <button
          onClick={toggleModal}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          <IoIosClose className="mr-2" size={30} />
        </button>
      </div>
      <div className="tabs flex space-x-4 mb-6">
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "A"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("A")}
        >
          <FaRegChartBar className="mr-2" />
          Budget Utilization Report
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "B"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("B")}
        >
          <FaRegChartBar className="mr-2" />
          Budget Per WorkGroup
        </button>
        <button
          className={`tab-item flex items-center p-2 rounded-md border border-gray-300 ${
            activeTab === "C"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => handleTabChange("C")}
        >
          <FaRegChartBar className="mr-2" />
          Budget Per Account
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "A" && <BudgetUtilization />}
        {activeTab === "B" && <BudgetWorkGroup />}
        {activeTab === "C" && <BudgetPerAccount />}
      </div>
    </div>
  );
};

export default BudgetReportNav;
