import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { LedgerSheetContext } from '../context/LedgerSheetContext';
import { useDataPreloader } from '../context/DataPreloader';

function LedgerInput({ value = '', index }) {
    const { accounts } = useDataPreloader();
    const { grid, setGrid } = useContext(LedgerSheetContext);

    const inputRef = useRef(null);
    const [input, setInput] = useState(value);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Filter accounts instantly as user types
    const filteredAccounts = useMemo(() => {
        if (!input) return accounts.slice(0, 5);
        const lowerInput = input.toLowerCase();
        return accounts
            .filter(acc => acc.code.toLowerCase().includes(lowerInput) || acc.name.toLowerCase().includes(lowerInput))
            .slice(0, 5);
    }, [input, accounts]);

    // Handle input change and update the grid
    function onInput(e) {
        const newValue = e.target.value;
        setInput(newValue);

        const item = accounts.find(acc => acc.code.toLowerCase() === newValue.toLowerCase()) || null;

        const newLedgerCode = {
            value: item?.code || '',
            width: '150px',
            component: <LedgerInput value={item?.code || ''} index={index} />,
        };

        const newLedger = {
            value: item?.name || '',
            width: '250px',
            component: <LedgerInput value={item?.name || ''} index={index} />,
        };

        const newRow = [
            grid[index][0],
            newLedgerCode,
            newLedger,
            grid[index][3],
            grid[index][4],
            grid[index][5],
            grid[index][6],
            grid[index][7],
        ];

        setGrid(grid.map((row, idx) => (idx === index ? newRow : row)));
    }

    return (
        <div className="relative p-0 ledger-input z-50">
            <input
                type="text"
                className="m-0 z-50"
                ref={inputRef}
                value={input}
                onChange={onInput}
                placeholder="search"
                list="list"
            />
            <datalist id="list">
                {filteredAccounts.map((item, idx) => (
                    <option value={item.code} key={idx}>
                        {item.name}
                    </option>
                ))}
            </datalist>
        </div>
    );
}

export default LedgerInput;
