import React, { useEffect, useState } from "react";
import Select from "react-select";
import employeeApi from "../api/employeeApi";

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
  }, [value]); // re-run if `value` changes

  const handleChange = (option) => {
    setSelected(option);
    if (onSelect && option?.value) {
      onSelect(option.value);
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

export default EmployeePicker;
