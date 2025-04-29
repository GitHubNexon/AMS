import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // React Icon for dropdown arrow
import Task from "../Sub-pages/Task";
import OrderOfPaymentTask from "../Sub-pages/OrderOfPaymentTask";

const options = [
  { id: "entriesTask", label: "Entries Task", component: <Task /> },
  { id: "orderOfPayment", label: "Order Of Payment Task", component: <OrderOfPaymentTask /> },
];

const TaskNotification = () => {
  const [selectedOption, setSelectedOption] = useState(options[0].id); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleOptionSelect = (id) => {
    setSelectedOption(id);
    setIsDropdownOpen(false);
  };

  const selectedLabel = options.find((option) => option.id === selectedOption)?.label;

  return (
    <div className="w-full max-w-md mx-auto p-4">
    <h1 className="text-black text-[0.8em] mb-2">Select a Task</h1>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full px-4 py-2 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none"
        >
          <span>{selectedLabel}</span>
          <FaChevronDown className="ml-2" />
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 right-0 z-10 mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
            <ul>
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    onClick={() => handleOptionSelect(option.id)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="mt-4">
        {options.find((option) => option.id === selectedOption)?.component}
      </div>
    </div>
  );
};

export default TaskNotification;
