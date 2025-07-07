import React, { useState } from "react";
import AssetsTable from "../containers/assetsContainers/AssetsTable";
import EmployeesTable from "../containers/assetsContainers/EmployeesTable";
import AssetIssuanceTable from "../containers/assetsContainers/AssetIssuanceTable";
import AssetsReturnTable from "../containers/assetsContainers/AssetsReturnTable";
import AssetsDisposalTable from "../containers/assetsContainers/AssetsDisposalTable";
import AssetsRepairTable from "../containers/assetsContainers/AssetsRepairTable";
import AssetsLostStolenTable from "../containers/assetsContainers/AssetsLostStolenTable";
import AssetOverView from "../containers/assetsContainers/AssetOverView";
import AssetsAllHistory from "../containers/assetsContainers/AssetsAllHistory";
import AssetsRepairedTable from "../containers/assetsContainers/AssetsRepairedTable";
import AssetsReport from "../containers/assetsContainers/AssetsReport";

const TABS = [
  "Overview",
  "Asset Records",
  "Employee Records",
  "Issuance Records",
  "Return Records",
  "Disposal Records",
  "Under-Repair Records",
  "Repaired Records",
  "Lost/Stolen/Damage Records",
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
        {activeTab === "Overview" && (
          <div>
            <AssetOverView />
          </div>
        )}
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
        {activeTab === "Issuance Records" && (
          <div>
            <AssetIssuanceTable />
          </div>
        )}
        {activeTab === "Return Records" && (
          <div>
            <AssetsReturnTable />
          </div>
        )}
        {activeTab === "Disposal Records" && (
          <div>
            <AssetsDisposalTable />
          </div>
        )}
        {activeTab === "Under-Repair Records" && (
          <div>
            <AssetsRepairTable />
          </div>
        )}
        {activeTab === "Repaired Records" && (
          <div>
            <AssetsRepairedTable />
          </div>
        )}
        {activeTab === "Lost/Stolen/Damage Records" && (
          <div>
            <AssetsLostStolenTable />
          </div>
        )}
        {activeTab === "History" && (
          <div>
            <AssetsAllHistory />
          </div>
        )}
        {activeTab === "Reports" && (
          <div>
            <AssetsReport />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsNav;
