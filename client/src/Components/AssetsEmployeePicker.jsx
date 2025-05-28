import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import employeeApi from "../api/employeeApi";
import assetsApi from "../api/assetsApi";

// EmployeePicker component
const EmployeePicker = ({ onSelect, value, isDisabled }) => {
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
        isDisabled={isDisabled}
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

const AssetsEmployeePicker = ({
  value,
  onSelect,
  onEmployeeSelect,
  onCancelEmployee,
  lockedEmployeeId,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssetRecord, setSelectedAssetRecord] = useState(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [isEmployeeLocked, setIsEmployeeLocked] = useState(!!lockedEmployeeId);

  // Sync with value prop (for edit mode)
  useEffect(() => {
    if (value) {
      setSelectedAssetDetail(value);
    } else {
      setSelectedAssetDetail(null);
    }
  }, [value]);

  // Fetch employee details when lockedEmployeeId changes
  useEffect(() => {
    if (lockedEmployeeId) {
      const fetchEmployee = async () => {
        try {
          const res = await employeeApi.getAllEmployeeRecord();
          const employee = res?.employees?.find(
            (emp) => emp._id === lockedEmployeeId
          );
          if (employee) {
            const employeeData = {
              _id: employee._id,
              employeeName: employee.employeeName,
              employeePosition: employee.employeePosition,
            };
            setSelectedEmployee(employeeData);
            // Only call onEmployeeSelect if not already locked to avoid loop
            if (!isEmployeeLocked && onEmployeeSelect) {
              onEmployeeSelect(employeeData);
            }
            setIsEmployeeLocked(true);
          } else {
            console.error("Employee not found for ID:", lockedEmployeeId);
            setIsEmployeeLocked(false);
          }
        } catch (err) {
          console.error("Error fetching employee:", err);
          setIsEmployeeLocked(false);
        }
      };
      fetchEmployee();
    } else {
      setSelectedEmployee(null);
      setIsEmployeeLocked(false);
    }
  }, [lockedEmployeeId, isEmployeeLocked, onEmployeeSelect]);

  // Reset dependent pickers when employee changes
  useEffect(() => {
    setSelectedAssetRecord(null);
    setSelectedAssetDetail(null);
  }, [selectedEmployee]);

  // Reset asset detail when asset record changes
  useEffect(() => {
    setSelectedAssetDetail(null);
  }, [selectedAssetRecord]);

  // Call onSelect when an asset detail is selected
  useEffect(() => {
    if (selectedAssetDetail && onSelect) {
      onSelect(selectedAssetDetail);
    }
  }, [selectedAssetDetail, onSelect]);

  // Handle employee selection from picker
  const handleEmployeePickerSelect = useCallback(
    (employee) => {
      setSelectedEmployee(employee);
      if (employee && onEmployeeSelect) {
        onEmployeeSelect({
          _id: employee._id,
          employeeName: employee.employeeName,
          employeePosition: employee.employeePosition,
        });
      }
    },
    [onEmployeeSelect]
  );

  const handleConfirmEmployee = () => {
    if (selectedEmployee) {
      setIsEmployeeLocked(true);
    }
  };

  const handleCancelEmployee = () => {
    setIsEmployeeLocked(false);
    setSelectedEmployee(null);
    setSelectedAssetRecord(null);
    setSelectedAssetDetail(null);
    if (onCancelEmployee) {
      onCancelEmployee();
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-full">
      <div className="flex flex-row gap-4">
        {!isEmployeeLocked && (
          <EmployeePicker
            onSelect={handleEmployeePickerSelect}
            value={selectedEmployee}
            isDisabled={isEmployeeLocked}
          />
        )}
        {isEmployeeLocked && selectedEmployee && (
          <div className="text-[0.6rem]">
            <label className="text-gray-700 mb-1 block">
              Selected Employee
            </label>
            <div className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500">
              {selectedEmployee.employeeName} -{" "}
              {selectedEmployee.employeePosition}
            </div>
          </div>
        )}
        {selectedEmployee && (
          <AssetRecordsPicker
            employeeId={selectedEmployee._id}
            onSelect={setSelectedAssetRecord}
            value={selectedAssetRecord}
          />
        )}
        {selectedAssetRecord?.assetDetails && (
          <AssetDetailsPicker
            assetDetails={selectedAssetRecord.assetDetails}
            onSelect={setSelectedAssetDetail}
            value={selectedAssetDetail}
          />
        )}
      </div>
      {selectedEmployee && !isEmployeeLocked && (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={handleConfirmEmployee}
          >
            Save Employee
          </button>
          <button
            type="button"
            className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            onClick={handleCancelEmployee}
          >
            Cancel
          </button>
        </div>
      )}
      {isEmployeeLocked && (
        <button
          type="button"
          className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={handleCancelEmployee}
        >
          Change Employee
        </button>
      )}
    </div>
  );
};

export default AssetsEmployeePicker;
