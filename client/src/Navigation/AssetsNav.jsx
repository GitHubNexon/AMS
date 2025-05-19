import React, { useState } from "react";
import AssetsTable from "../Sub-pages/AssetsTable";
import EmployeesTable from "../Sub-pages/EmployeesTable";
import AssetIssuanceTable from "../Sub-pages/AssetIssuanceTable";

const TABS = [
  "Overview",
  "Asset Records",
  "Employee Records",
  "Issuance",
  "Turn In",
  "History",
  "Reports",
];

const AssetsNav = () => {
  const [activeTab, setActiveTab] = useState("Overview");

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
        {activeTab === "Overview" && <div>Overview Content</div>}
        {activeTab === "Asset Records" && (
          <div>
            <AssetsTable />{" "}
          </div>
        )}
        {activeTab === "Employee Records" && (
          <div>
            <EmployeesTable />
          </div>
        )}
        {activeTab === "Issuance" && (
          <div>
            {" "}
            <AssetIssuanceTable />
          </div>
        )}
        {activeTab === "Turn In" && <div>Turn In Content</div>}
        {activeTab === "History" && <div>History Content</div>}
        {activeTab === "Reports" && <div>Reports Content</div>}
      </div>
    </div>
  );
};

export default AssetsNav;
