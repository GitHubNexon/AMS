import React, { useState, useEffect } from "react";
import Select from "react-select";
import employeeApi from "../api/employeeApi";
import assetsApi from "../api/assetsApi";

// EmployeePicker component
const EmployeePicker = ({ onSelect, value }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeApi.getAllEmployeeRecord();
        const employees = res?.employees || [];
        const mapped = employees.map((emp) => ({
          value: emp,
          label: `${emp.employeeName} - ${emp.employeePosition}`,
        }));
        setOptions(mapped);

        if (value) {
          const matched = mapped.find((opt) => opt.value._id === value._id);
          setSelected(matched || null);
        }
      } catch (err) {
        console.error("Error loading employee list:", err);
      }
    };
    fetchEmployees();
  }, [value]);

  const handleChange = (option) => {
    setSelected(option);
    if (onSelect) {
      onSelect(option?.value || null);
    }
  };

  return (
    <div className="text-[0.6rem]">
      <label className="text-gray-700 mb-1 block">Select Employee</label>
      <Select
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder="Search employee..."
        isClearable
      />
    </div>
  );
};

// AssetRecordsPicker component
const AssetRecordsPicker = ({ employeeId, onSelect, value }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setOptions([]);
      setSelected(null);
      return;
    }

    const fetchAssets = async () => {
      try {
        const res = await assetsApi.getEmployeeAssetsRecords(employeeId);
        const assetRecords = res?.assetRecords || [];
        const mapped = assetRecords.map((record) => ({
          value: record,
          label: `PAR No: ${record.parNo} - ${record.entityName}`,
        }));
        setOptions(mapped);

        if (value) {
          const matched = mapped.find(
            (opt) => opt.value.issuanceId === value.issuanceId
          );
          setSelected(matched || null);
        } else {
          setSelected(null);
        }
      } catch (err) {
        console.error("Error loading asset records:", err);
        setOptions([]);
        setSelected(null);
      }
    };

    fetchAssets();
  }, [employeeId, value]);

  const handleChange = (option) => {
    setSelected(option);
    if (onSelect) {
      onSelect(option?.value || null);
    }
  };

  return (
    <div className="text-[0.6rem]">
      <label className="text-gray-700 mb-1 block">Select Asset Record</label>
      <Select
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder="Search asset record..."
        isClearable
      />
    </div>
  );
};

// AssetDetailsPicker component
const AssetDetailsPicker = ({ assetDetails = [], onSelect, value }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const mapped = assetDetails.map((asset) => ({
      value: asset,
      label: `${asset.description} (${asset.itemNo})`,
    }));
    setOptions(mapped);

    if (value) {
      const matched = mapped.find((opt) => opt.value.assetId === value.assetId);
      setSelected(matched || null);
    } else {
      setSelected(null);
    }
  }, [assetDetails, value]);

  const handleChange = (option) => {
    setSelected(option);
    if (onSelect) {
      onSelect(option?.value || null);
    }
  };

  return (
    <div className="text-[0.6rem]">
      <label className="text-gray-700 mb-1 block">Select Asset Detail</label>
      <Select
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder="Search asset detail..."
        isClearable
      />
    </div>
  );
};

const AssetsEmployeePicker = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssetRecord, setSelectedAssetRecord] = useState(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);

  // Reset dependent pickers when employee changes
  useEffect(() => {
    setSelectedAssetRecord(null);
    setSelectedAssetDetail(null);
  }, [selectedEmployee]);

  useEffect(() => {
    setSelectedAssetDetail(null);
  }, [selectedAssetRecord]);

  useEffect(() => {
    console.log("Selected Employee:", selectedEmployee);
  }, [selectedEmployee]);

  useEffect(() => {
    console.log("Selected Asset Record:", selectedAssetRecord);
  }, [selectedAssetRecord]);

  useEffect(() => {
    if (selectedAssetDetail) {
      console.log("Selected Asset Detail:", selectedAssetDetail);
      console.log("assetId =", selectedAssetDetail.assetId);
      console.log("inventoryId =", selectedAssetDetail.inventoryId);
      console.log("quantity =", selectedAssetDetail.quantity);
      console.log("unit =", selectedAssetDetail.unit);
      console.log("description =", selectedAssetDetail.description);
      console.log("itemNo =", selectedAssetDetail.itemNo);
      console.log("amount =", selectedAssetDetail.amount);
    }
  }, [selectedAssetDetail]);

  return (
    <div className="flex flex-row gap-4 max-w-full  ">
      <EmployeePicker onSelect={setSelectedEmployee} value={selectedEmployee} />
      <AssetRecordsPicker
        employeeId={selectedEmployee?._id}
        onSelect={setSelectedAssetRecord}
        value={selectedAssetRecord}
      />
      {selectedAssetRecord?.assetDetails && (
        <AssetDetailsPicker
          assetDetails={selectedAssetRecord.assetDetails}
          onSelect={setSelectedAssetDetail}
          value={selectedAssetDetail}
        />
      )}

     
    </div>
  );
};

export default AssetsEmployeePicker;
