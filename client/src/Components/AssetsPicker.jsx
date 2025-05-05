// AssetsPicker.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import assetsApi from "../api/assetsApi";

const AssetsPicker = ({
  selectedAsset,
  setSelectedAsset,
  selectedInventory,
  setSelectedInventory,
  index
}) => {
  const [assets, setAssets] = useState([]);

  const fetchAssets = async () => {
    try {
      const response = await assetsApi.getAllAssetsRecord();
      setAssets(response.assets || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const assetOptions = assets.map((asset) => ({
    label: `${asset.propName} (${asset.propNo})`,
    value: asset._id,
    asset,
  }));

  const handleAssetChange = (selectedOption) => {
    const asset = selectedOption ? selectedOption.asset : null;
    setSelectedAsset(index, asset);
    setSelectedInventory(index, null); 
  };

  const handleInventoryChange = (selectedOption) => {
    const inventory = selectedOption ? selectedOption.inventory : null;
    setSelectedInventory(index, inventory);
  };

  const selectedAssetOption = selectedAsset
    ? {
        label: `${selectedAsset.propName} (${selectedAsset.propNo})`,
        value: selectedAsset._id,
        asset: selectedAsset,
      }
    : null;

  const inventoryOptions =
    selectedAsset?.inventory.map((inv) => ({
      label: `${inv.invNo} - ${inv.condition}`,
      value: inv._id,
      inventory: inv,
    })) || [];

  const selectedInventoryOption = selectedInventory
    ? {
        label: `${selectedInventory.invNo} - ${selectedInventory.condition}`,
        value: selectedInventory._id,
        inventory: selectedInventory,
      }
    : null;

  return (
    <div>
      <h3>Select an Asset</h3>
      <Select
        options={assetOptions}
        value={selectedAssetOption}
        onChange={handleAssetChange}
        placeholder="Choose an asset..."
        isClearable
      />

      {selectedAsset && (
        <>
          <h4 className="mt-4">Select Inventory Item</h4>
          <Select
            options={inventoryOptions}
            value={selectedInventoryOption}
            onChange={handleInventoryChange}
            placeholder="Choose inventory item..."
            isClearable
          />
        </>
      )}
    </div>
  );
};

export default AssetsPicker;