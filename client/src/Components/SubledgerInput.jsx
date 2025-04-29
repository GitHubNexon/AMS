import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { LedgerSheetContext } from '../context/LedgerSheetContext';
import axios from 'axios';
import { useDataPreloader } from '../context/DataPreloader';

// Custom hook for debouncing a value
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const timer = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return debouncedValue;
// }

function SubledgerInput({ value = '', index }) {
  const { grid, setGrid } = useContext(LedgerSheetContext);
  const inputRef = useRef(null);

  const [input, setInput] = useState(value);

  // const debouncedInput = useDebounce(input, 500);

  // const [accounts, setAccounts] = useState([]);

  const {subledgers} = useDataPreloader();

  // Update local input state when the incoming value changes.
  // useEffect(() => {
  //   if (value) {
  //     setInput(value);
  //   }
  // }, [value]);

  // Focus the input field when the component mounts.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch subledgers when the debounced input changes.
  // useEffect(() => {
  //   const source = axios.CancelToken.source();
  //   async function searchSubledger() {
  //     try {
  //       console.log('searching');
  //       const response = await axios.get(`/subledgers?search=${debouncedInput}`, {
  //         withCredentials: true,
  //         cancelToken: source.token,
  //       });
  //       setAccounts(response.data.data);
  //     } catch (error) {
  //       if (!axios.isCancel(error)) {
  //         console.error(error);
  //       }
  //     }
  //   }
  //   searchSubledger();
  //   return () => {
  //     source.cancel();
  //   };
  // }, [debouncedInput]);

  // Memoize the sliced accounts for the datalist.
  const displayedAccounts = useMemo(() => {
    if (!input) return subledgers.slice(0, 5);
    return subledgers
      .filter((item) =>
        item.name.toLowerCase().includes(input.toLowerCase()) ||
        item.slCode.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5);
  }, [input, subledgers]);
  

  // Handle input changes and update the grid row accordingly.
  function onInput(e) {
    const newValue = e.target.value;
    setInput(newValue);

    const item = newValue
      ? subledgers.find(option => option.slCode.toLowerCase() === newValue.toLowerCase())
      : null;

    const newSubledgerCode = {
      value: item ? item.slCode : '',
      width: '150px',
      component: <SubledgerInput value={item ? item.slCode : ''} index={index} />,
    };

    const newLedger = {
      value: item ? item.name : '',
      width: '250px',
      component: <SubledgerInput value={item ? item.name : ''} index={index} />,
    };

    const newRow = [
      grid[index][0],
      grid[index][1],
      grid[index][2],
      newSubledgerCode,
      newLedger,
      grid[index][5],
      grid[index][6],
      grid[index][7],
    ];
    const newGrid = grid.map((row, idx) => (idx === index ? newRow : row));
    setGrid(newGrid);
  }

  return (
    <div className="relative p-0 ledger-input">
      <input
        type="text"
        className="m-0"
        ref={inputRef}
        value={input}
        onChange={onInput}
        list="subledger-list"
      />
      <datalist id="subledger-list">
        {displayedAccounts.map((item, idx) => (
          <option value={item.slCode} key={idx}>
            {item.name}
          </option>
        ))}
      </datalist>
    </div>
  );
}

export default SubledgerInput;
