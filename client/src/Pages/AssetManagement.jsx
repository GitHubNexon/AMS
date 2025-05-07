import React, { useState, useEffect } from "react";
import AssetsNav from "../Navigation/AssetsNav";
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
      console.log("Selected Inventory:", selectedInventory);
    }
  }, [selectedInventory]);

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleSelectInventory = (inventory) => {
    setSelectedInventory(inventory);
  };


  return (
    <div>
      <AssetsNav />
      <AssetsPicker
        onSelectAsset={handleSelectAsset} 
        onSelectInventory={handleSelectInventory} 
      />
    </div>
  );
};

export default AssetManagement;
