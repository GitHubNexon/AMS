import React, { useState } from "react";
import AssetsInventoriesHistory from "../Reports/AssetsReports/AssetsInventoriesHistory";
import AssetsICSReport from "../Reports/AssetsReports/AssetsICSReport";

const TABS = ["Assets Inventory History", "ICS Report"];

const AssetsReportsNav = () => {
  const [activeTab, setActiveTab] = useState("Assets Inventory History");

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
        {activeTab === "Assets Inventory History" && (
          <div>
            <AssetsInventoriesHistory />
          </div>
        )}
        {activeTab === "ICS Report" && (
          <div>
            <AssetsICSReport />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsReportsNav;
