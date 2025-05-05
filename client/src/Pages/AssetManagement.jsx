import React, { useState, useEffect } from "react";
import AssetsTable from "../Sub-pages/AssetsTable";
import EmployeeAssetsTable from "../Sub-pages/EmployeeAssetsTable";
import AssetsPicker from "../Components/AssetsPicker";

const AssetManagement = () => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
    if (selectedAsset) {
      console.log("Selected Asset:", selectedAsset);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (selectedInventory) {
      console.log("selected Inventor", selectedInventory);
    }
  }, [selectedInventory]);

  return (
    <div>
      <AssetsTable />
      <EmployeeAssetsTable />
      <AssetsPicker
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        selectedInventory={selectedInventory}
        setSelectedInventory={setSelectedInventory}
      />
    </div>
  );
};

export default AssetManagement;
