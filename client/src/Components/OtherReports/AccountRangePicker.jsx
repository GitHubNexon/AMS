import React, { useState, useEffect } from 'react';
import { useDataPreloader } from '../../context/DataPreloader';
import Select from "react-select";

function AccountRangePicker({ setSelected = () => {} }) {
    const { accounts } = useDataPreloader(); // Fetch accounts

    const [fromAcc, setFromAcc] = useState(null);
    const [toAcc, setToAcc] = useState(null);

    const [fromAccList, setFromAccList] = useState([]);
    const [toAccList, setToAccList] = useState([]);

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            const options = accounts.map(m => ({
                value: m,
                label: `${m.code} - ${m.name}`
            }));
            setFromAccList(options);
        } else {
            setFromAccList([]);
            setToAccList([]);
            setSelected([]); // Reset state if no accounts
        }
    }, [accounts]);

    useEffect(() => {
        if (fromAcc) {
            // Filter `toAccList` to only include accounts with code >= selected `fromAcc.code`
            const filteredToAccList = accounts
                .filter(acc => acc.code >= fromAcc.code)
                .map(m => ({
                    value: m,
                    label: `${m.code} - ${m.name}`
                }));
            setToAccList(filteredToAccList);
        } else {
            setToAccList([]);
            setSelected([]); // Reset state if no `fromAcc`
        }
    }, [fromAcc, accounts]);

    useEffect(() => {
        if (fromAcc && toAcc) {
            // Find all accounts between `fromAcc.code` and `toAcc.code`
            const selectedRange = accounts.filter(acc => acc.code >= fromAcc.code && acc.code <= toAcc.code);
            setSelected(selectedRange);
        } else {
            setSelected([]); // Reset if `fromAcc` or `toAcc` is missing
        }
    }, [fromAcc, toAcc, accounts, setSelected]);

    return (
        <div className='flex text-[0.8em]'>
            <div className='flex flex-col mr-2 min-w-[200px]'>
                <span>From Account GL</span>
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
                <span>To Account GL</span>
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

export default AccountRangePicker;
