import React, { useState, useEffect } from "react";
import EntriesApi from "../api/EntriesApi";
import { showToast } from "../utils/toastNotifications";

const AutoNumber = ({ entryType, value, onChange, mode  }) => {
  const [autoNumber, setAutoNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [existingNumbers, setExistingNumbers] = useState([]); 
  const [generatedAutoNumber, setGeneratedAutoNumber] = useState(""); 



  useEffect(() => {
    if (mode !== "edit" && !value) {
      const fetchAutoNumber = async () => {
        try {
          const response = await EntriesApi.generateAutoNumber(entryType);
          setAutoNumber(response.autoNumber);
          setGeneratedAutoNumber(response.autoNumber);
          onChange(response.autoNumber);
        } catch (error) {
          console.error("Failed to generate auto-number:", error);
        }
      };

      const fetchExistingNumbers = async () => {
        try {
          // Fetch all used numbers from your backend
          const response = await EntriesApi.getAllUsedNumbers();
          const numbers = response.usedNumbers.map(
            (entry) => entry.JVNo || entry.DVNo || entry.CrNo
          );
          setExistingNumbers(numbers);
        } catch (error) {
          console.error("Failed to fetch existing numbers:", error);
          setExistingNumbers([]);
        }
      };

      fetchAutoNumber();
      fetchExistingNumbers();
    } else {
      setUserInput(value);
    }
  }, [entryType, onChange, mode, value]);


  const handleInputChange = (e) => {
    const newNumber = e.target.value;
    setUserInput(newNumber);

    if (newNumber && existingNumbers.includes(newNumber)) {
      showToast("This number is already taken. Try another one.", "warning");
    } else {
      onChange(newNumber);
    }
  };

  const handleBlur = () => {
    if (userInput === generatedAutoNumber) {
      onChange(autoNumber);
    }
  };

  return (
    <div className="flex flex-col">
      {/* <input
        type="text"
        id="autoNumber"
        value={value || autoNumber}
        readOnly
        className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
      /> */}
      <input
        type="text"
        id="autoNumber"
        value={userInput ||  autoNumber  } 
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="border border-gray-300 p-2 rounded-md bg-white text-gray-500"
        placeholder="Enter a number"
      />
    </div>
  );
};

export default AutoNumber;