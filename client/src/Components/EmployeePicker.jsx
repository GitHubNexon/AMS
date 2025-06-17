import React, { useEffect, useState } from "react";
import Select from "react-select";
import employeeApi from "../api/employeeApi";

const EmployeePicker = ({ onSelect, value }) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeApi.getAllEmployeeRecord(1, 999999);
        const employees = res?.employees || [];

        // Use employee._id as value, label is name + position
        const mapped = employees.map((emp) => ({
          value: emp._id,
          label: `${emp.employeeName} - ${emp.employeePosition}`,
          employee: emp, // Keep the full emp object for your reference if needed
        }));

        setOptions(mapped);

        if (!value) {
          setSelected(null);
          return;
        }

        // Find the option matching the passed value (which should be the whole employee object)
        const matched = mapped.find((opt) => opt.value === value._id);
        setSelected(matched || null);
      } catch (err) {
        console.error("Error loading employee list:", err);
      }
    };

    fetchEmployees();
  }, [value]);

  const handleChange = (option) => {
    setSelected(option);
    if (onSelect) {
      if (option === null) {
        onSelect(null); // Clear selection
      } else {
        // Pass the full employee object back, if you want
        onSelect(option.employee);
      }
    }
  };

  return (
    <div className="text-[0.6rem]">
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
