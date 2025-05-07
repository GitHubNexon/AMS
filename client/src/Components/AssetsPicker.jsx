import React, { useState, useEffect } from "react";
import Select from "react-select";
import assetsApi from "../api/assetsApi";

const AssetsPicker = ({ onSelectAsset, onSelectInventory }) => {
  const [assets, setAssets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await assetsApi.getAllAssetRecordsList();
        setAssets(response.assets);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleAssetChange = (selectedOption) => {
    onSelectAsset(selectedOption);
    if (selectedOption) {
      setInventory(selectedOption.inventory || []);
    } else {
      setInventory([]);
    }
  };

  const handleInventoryChange = (selectedOption) => {
    onSelectInventory(selectedOption);
  };

  const assetOptions = assets.map((asset) => ({
    label: `${asset.propName} - ${asset.propDescription}`,
    value: asset._id,
    ...asset,
  }));

  const inventoryOptions = inventory.map((inv) => ({
    label: `${inv.invNo} - ${inv.invName}`,
    value: inv._id,
    ...inv,
  }));

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <Select
          isClearable
          isSearchable
          isLoading={isLoading}
          options={assetOptions}
          onChange={handleAssetChange}
          placeholder="Select Main Asset"
          className="w-full"
        />
      </div>

      {inventory.length > 0 && (
        <div className="w-full">
          <Select
            isClearable
            isSearchable
            isLoading={isLoading}
            options={inventoryOptions}
            onChange={handleInventoryChange}
            placeholder="Select Inventory"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default AssetsPicker;
