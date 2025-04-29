import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDataPreloader } from "../context/DataPreloader";

function GLInput({ selectedAccount, setSelectedAccount }) {
    const { accounts } = useDataPreloader();
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (accounts.length > 0) {
            setOptions(
                accounts.map((m) => ({
                    value: m, // Store the full account object
                    label: `${m.code} - ${m.name}`,
                }))
            );
        }
    }, [accounts]);

    return (
        <Select
            options={options}
            className="bbb w-[100%] max-w-[300px] text-[0.9em]"
            value={selectedAccount 
                ? options.find((opt) => opt.value.code === selectedAccount.code) 
                : null} // Set to null when no selection
            onChange={(option) => setSelectedAccount(option ? option.value : null)} // Ensure null on deselection
            isClearable // Allows clearing the selection
            placeholder="Select an account..." // Optional: Display placeholder when empty
        />
    );
}

export default GLInput;
