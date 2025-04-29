import React, { useEffect, useState, useRef } from 'react';
import { useDataPreloader } from '../context/DataPreloader';
import GLInput from './GLInput';

function AccountRangePicker({ className = '', range = [], setRange = () => {} }) {
    const { accounts } = useDataPreloader();
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    
    const prevRangeRef = useRef(null); // Store previous range to prevent unnecessary updates

    useEffect(() => {
        let newRange = [];

        if (fromAccount && !toAccount) {
            newRange = [fromAccount.code];
        } 
        else if (!fromAccount && toAccount) {
            newRange = [toAccount.code];
        } 
        else if (fromAccount && toAccount) {
            let accs = [];
            let beginRecord = false;

            for (let i = 0; i < accounts.length; i++) {
                if (fromAccount.code === accounts[i].code) {
                    beginRecord = true;
                }
                if (beginRecord) {
                    accs.push(accounts[i].code);
                }
                if (toAccount.code === accounts[i].code) {
                    break; // Stop adding when `toAccount` is reached
                }
            }
            newRange = accs;
        }

        // Prevent unnecessary updates
        if (JSON.stringify(prevRangeRef.current) !== JSON.stringify(newRange)) {
            prevRangeRef.current = newRange;
            setRange(newRange);
        }
    }, [fromAccount, toAccount, accounts, setRange]);

    return (
        <div>
            <div className={`${className} flex items-center flex-wrap`}>
                <div className='flex flex-col w-[200px] mr-2'>
                    <span>From Account</span>
                    <GLInput selectedAccount={fromAccount} setSelectedAccount={setFromAccount} />
                </div>
                <div className='flex flex-col w-[200px] mr-2'>
                    <span>To Account</span>
                    <GLInput selectedAccount={toAccount} setSelectedAccount={setToAccount} />
                </div>
            </div>
        </div>
    );
}

export default AccountRangePicker;
