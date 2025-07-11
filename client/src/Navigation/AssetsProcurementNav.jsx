import React, { useState } from "react";
import AssetsPolarAreaChart from "../Components/AssetsComponents/AssetsPolarAreaChart";
import AssetsPurchaseRequestTable from "../containers/assetsContainers/AssetsPurchaseRequestTable";
import AssetsPurchaseOrderTable from "../containers/assetsContainers/AssetsPurchaseOrderTable";

const TABS = ["Charts", "Purchase Request", "Purchase Order"];

const AssetsProcurementNav = () => {
  const [activeTab, setActiveTab] = useState("Charts");

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
        {activeTab === "Charts" && (
          <div>
            <AssetsPolarAreaChart />
          </div>
        )}
        {activeTab === "Purchase Request" && (
          <div>
            <AssetsPurchaseRequestTable />
          </div>
        )}
        {activeTab === "Purchase Order" && (
          <div>
            <AssetsPurchaseOrderTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsProcurementNav;
