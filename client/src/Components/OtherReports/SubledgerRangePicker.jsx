import React, { useState, useEffect } from 'react';
import { useDataPreloader } from '../../context/DataPreloader';
import Select from "react-select";

function SubledgerRangePicker({ setSelected = () => {} }) {
    const { subledgers } = useDataPreloader(); // Fetch accounts

    const [fromAcc, setFromAcc] = useState(null);
    const [toAcc, setToAcc] = useState(null);

    const [fromAccList, setFromAccList] = useState([]);
    const [toAccList, setToAccList] = useState([]);

    useEffect(() => {
        if (subledgers && subledgers.length > 0) {
            const options = subledgers.map(m => ({
                value: m,
                label: `${m.slCode} - ${m.name}`
            }));
            setFromAccList(options);
        } else {
            setFromAccList([]);
            setToAccList([]);
            setSelected([]); // Reset state if no accounts
        }
    }, [subledgers]);

    useEffect(() => {
        if (fromAcc) {
            // Filter `toAccList` to only include accounts with code >= selected `fromAcc.code`
            const filteredToAccList = subledgers
                .filter(acc => acc.slCode >= fromAcc.slCode)
                .map(m => ({
                    value: m,
                    label: `${m.slCode} - ${m.name}`
                }));
            setToAccList(filteredToAccList);
        } else {
            setToAccList([]);
            setSelected([]); // Reset state if no `fromAcc`
        }
    }, [fromAcc, subledgers]);

    useEffect(() => {
        if (fromAcc && toAcc) {
            // Find all accounts between `fromAcc.code` and `toAcc.code`
            const selectedRange = subledgers.filter(acc => acc.slCode >= fromAcc.slCode && acc.slCode <= toAcc.slCode);
            setSelected(selectedRange);
        } else {
            setSelected([]); // Reset if `fromAcc` or `toAcc` is missing
        }
    }, [fromAcc, toAcc, subledgers, setSelected]);

    return (
        <div className='flex text-[0.8em]'>
            <div className='flex flex-col mr-2 min-w-[200px]'>
                <span>From Account SL</span>
                <Select
                    options={fromAccList}
                    value={fromAccList.find(opt => opt.value === fromAcc) || null}
                    onChange={(option) => {
                        setFromAcc(option ? option.value : null);
                        setToAcc(null); // Reset `toAcc` when `fromAcc` changes
                        setSelected([]); // Reset `selected` state
                    }}
                    isClearable
                />
            </div>
            <div className='flex flex-col mr-2 min-w-[200px]'>
                <span>To Account SL</span>
                <Select
                    options={toAccList}
                    value={toAccList.find(opt => opt.value === toAcc) || null}
                    onChange={(option) => setToAcc(option ? option.value : null)}
                    isClearable
                    isDisabled={!fromAcc} // Disable `toAcc` until `fromAcc` is selected
                />
            </div>
        </div>
    );
}

export default SubledgerRangePicker;
