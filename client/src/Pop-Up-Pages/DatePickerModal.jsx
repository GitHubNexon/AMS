import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa"; // Calendar icon
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerModal = ({ isOpen, onClose, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleApplyClick = () => {
    // Call onDateSelect with the selected date
    onDateSelect(selectedDate);
    // Close the modal
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>

            <h3 className="text-xl font-semibold mb-4">Select Date</h3>

            <div className="flex flex-col">
              {/* Right part: Date Picker */}
              <div className="w-full">
                <label className="block text-gray-700 mb-2">
                  Select a Date
                </label>
                <div className="flex items-center border border-gray-300 p-2 rounded-md">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    className="w-full p-2 focus:outline-none"
                    dateFormat="MM/dd/yyyy"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleApplyClick} // Apply button to trigger onDateSelect
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mr-2"
              >
                Apply
              </button>
              <button
                onClick={onClose}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DatePickerModal;
