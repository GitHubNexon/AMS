import React, { useState } from "react";
import AssetsMonthlyDepreciation from "../Sub-pages/DepreciationTables/assetsMonthlyDepreciation";

const TABS = [
  "Monthly Depreciation",
  "Net Book Value",
  "Accumulated Depreciation",
];

const AssetsDepreciationNav = () => {
  const [activeTab, setActiveTab] = useState("Monthly Depreciation");

  return (
    <div className="w-full">
      <ul className="flex border-b text-[0.9em] pt-4 mb-2 overflow-auto">
        {TABS.map((tab) => (
          <li
            key={tab}
            className={`py-1 px-4 border-b-[5px] whitespace-nowrap cursor-pointer ${
              activeTab === tab ? "border-green-500" : "border-transparent"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>

      <div className="p-4">
        {activeTab === "Monthly Depreciation" && (
          <div>
            <AssetsMonthlyDepreciation />
          </div>
        )}
        {activeTab === "Net Book Value" && <div>Net Book Value</div>}
        {activeTab === "Accumulated Depreciation" && (
          <div>Accumulated Depreciation</div>
        )}
      </div>
    </div>
  );
};

export default AssetsDepreciationNav;
