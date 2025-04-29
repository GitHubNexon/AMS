import React, { useContext, useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import axios from 'axios';
import { showToast } from '../utils/toastNotifications';
import CurrencyInput from '../Components/CurrencyInput';
import { formatReadableDate, numberToCurrencyString, monthName } from '../helper/helper';
import JournalModal from './JournalModal';
import useBase from '../context/useBase';
import { LedgerSheetContext } from '../context/LedgerSheetContext';

function SubledgerModal({ className='', show=false, setShow, selectedSubledger=null, isLessee=false, mode='add', refresh=()=>{} }) {

    const { base } = useBase();

    const { preload } = useContext(LedgerSheetContext);

    const [subLedger, setSubLedger] = useState({
        slCode: '',
        name: '',
        isLessee: isLessee,
        // lessee exclusive fields
        periodStart: '',
        periodEnd: '',
        area: '',
        initialRate: '',
        yearlyIncrease: '',
        escalation: []
    });

    const [escalation, setEscalation] = useState([]);

    useEffect(() => {
        if (!selectedSubledger) return;
        setSubLedger({
            slCode: selectedSubledger.slCode || '',
            name: selectedSubledger.name || '',
            isLessee: selectedSubledger.isLessee ?? isLessee, // Use `??` to handle both `null` and `undefined`
            periodStart: selectedSubledger.periodStart || '', // Convert string to Date
            periodEnd: selectedSubledger.periodEnd || '', // Convert string to Date
            escalation: []
        });
    }, [selectedSubledger]);

    useEffect(() => {
        if (mode === 'add') {
            setSubLedger({
                slCode: '',
                name: '',
                isLessee: isLessee,
                // lessee exclusive fields
                periodStart: '', // Reset to current date when adding new subledger
                periodEnd:  '',
                area: '',
                initialRate: '',
                yearlyIncrease: '',
                escalation: []
            });
            setEscalation([]);
        }else{
            if(selectedSubledger){
                // passing start date does not reflect on period picker
                setSubLedger(selectedSubledger);
            }
        }
    }, [show]);

    useEffect(()=>{
        if(subLedger.periodStart && subLedger.periodEnd && subLedger.area && subLedger.initialRate && subLedger.yearlyIncrease){
            buildEscalation(subLedger.periodStart, subLedger.periodEnd, subLedger.area, subLedger.initialRate, subLedger.yearlyIncrease);
        }
    }, [subLedger]);

    function buildEscalation(start, end, area, initialRate, yearlyIncrease){
        // get number of years between 2 dates
        const ds = new Date(start);
        const de = new Date(end);
        const y = getYearsBetweenDates(ds, de);
        const periods = getYearlyDateRanges(ds, de);
        let rate = initialRate;
        for(let i = 0; i < periods.length; i++){
            periods[i].rate = rate;
            periods[i].area = area;
            periods[i].amount = (rate * area).toFixed(2); 
            periods[i].vat12 = ((rate * area) * (12 / 100)).toFixed(2);
            periods[i].grossAmount = ((rate * area) + ((rate * area) * (12 / 100))).toFixed(2);
            periods[i].ewt5 = ((rate * area) * (5 / 100)).toFixed(2);
            periods[i].cashPayment = (((rate * area) + ((rate * area) * (12 / 100))) - ((rate * area) * (5 / 100))).toFixed(2);
            rate = (rate * (1 + yearlyIncrease / 100)).toFixed(2);
        }
        setEscalation(periods);
    }

    function getYearsBetweenDates(date1, date2) {
        const year1 = date1.getFullYear();
        const year2 = date2.getFullYear();
        const month1 = date1.getMonth();
        const month2 = date2.getMonth();
        const day1 = date1.getDate();
        const day2 = date2.getDate();
        let years = year2 - year1;
        // Adjust if the current year's month/day is before the previous year's month/day
        if (month2 < month1 || (month2 === month1 && day2 < day1)) {
          years--;
        } 
        return years;
    }

    function getYearlyDateRanges(startDate, endDate) {
        let result = [];
        let currentStartDate = new Date(startDate);
        // Loop until the currentStartDate reaches or surpasses the endDate
        while (currentStartDate <= endDate) {
            let currentEndDate = new Date(currentStartDate);
            currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
            currentEndDate.setDate(currentEndDate.getDate() - 1); // Adjust to the day before the next year's start date
            // Add the current date range to the result array
            result.push({
                start: new Date(currentStartDate),
                end: new Date(currentEndDate),
            });
            // Move to the next year's start date
            currentStartDate.setFullYear(currentStartDate.getFullYear() + 1);
        } 
        return result;
    }

    function startDateChange(e) {
        e.preventDefault();
        setSubLedger({...subLedger, periodStart: e.target.value});
    }

    function endDateChange(e) {
        e.preventDefault();
        setSubLedger({...subLedger, periodEnd: e.target.value});
    }

    async function saveClick(e) {
        e.preventDefault();
        if (!subLedger.name) {
            showToast('Please enter name', 'warning');
            return;
        }
        if (mode === 'add') {
            const toSave = {...subLedger, escalation: escalation};
            const response = await axios.post(`/subledgers`, toSave, { withCredentials: true });
            if (response.status === 200) {
                refresh(subLedger);
                setSubLedger({
                    slCode: '',
                    name: '',
                    isLessee: isLessee,
                    periodStart: '',
                    periodEnd: '',
                    area: '',
                    initialRate: '',
                    yearlyIncrease: '',
                    escalation: escalation
                });
                setShow(false);
                showToast('Subledger saved', 'success');
            } else {
                showToast('Unable to save subledger', 'warning');
            }
        } else {
            console.log('edit', subLedger._id);
            const data = {...subLedger, escalation: escalation};
            delete data._id;
            const response = await axios.patch(`/subledgers/${subLedger._id}`, data, { withCredentials: true });
            if(response.status === 200){
                setShow(false);
                showToast('Subledger saved', 'success');
            }else{
                showToast('Unable to save subledger', 'warning');
            }
        }
        refresh();
    }

    const [journalModal, setJournalModal] = useState({show: false, type: 'accrual'});
    const [entryData, setEntryData] = useState({});

    function journalClick(row){
        console.log(JSON.stringify(row))
        // build default particulars (message from base + current month + year on selected row)
        const particulars = base.rentalAccrual.particulars + " FOR THE MONTH OF " + monthName(new Date().getMonth()) + " " + new Date(row.start).getFullYear()
        // build ledgers
        const accrual = [
            // debit
            {
                ledger: {
                    code: base.rentalAccrual.accrual.debitTo.code,
                    name: base.rentalAccrual.accrual.debitTo.name
                },
                subledger: {
                    slCode: subLedger.slCode,
                    name: subLedger.name
                },
                dr: row.amount,
                cr: '',
                description: particulars
            },
            // credit
            {
                ledger: {
                    code: base.rentalAccrual.accrual.creditTo.code,
                    name: base.rentalAccrual.accrual.creditTo.name
                },
                subledger: {
                    slCode: subLedger.slCode,
                    name: subLedger.name
                },
                dr: '',
                cr: row.amount,
                description: particulars
            }
        ];
        setEntryData({Particulars: particulars, EntryType: 'Journal', ledgers: accrual});
        setJournalModal({ type: 'accrual', show: true });
    }

    return (
        <>
        <JournalModal 
            isOpen={journalModal.show} 
            onClose={()=>setJournalModal({...journalModal, show: false})}
            mode={journalModal.type}
            entryData={entryData}
            onSaveJournal={()=>{
                setShow(false);
            }} />
        <Modal show={show} closeCallback={() => setShow(false)} >
            <div className={`border-t border-b flex-1 flex flex-wrap p-2 max-h-[70vh] overflow-y-scroll ${className}`}>
                <div className='flex flex-col text-[0.9em] p-2 mr-2'>
                    <div className='flex flex items-center mb-2'>
                        <span className='mb-1 w-[100px] text-end mr-2'>Account Code</span>
                        <input 
                            type="text" 
                            className='border rounded p-1' 
                            value={subLedger.slCode || ''} 
                            onChange={(e) => setSubLedger({ ...subLedger, slCode: e.target.value })} />
                    </div>
                    <div className='flex flex items-center mb-2'>
                        <span className='mb-1 w-[100px] text-end mr-2'>Name</span>
                        <input 
                            type="text" 
                            className='border rounded p-1' 
                            value={subLedger.name || ''} 
                            onChange={(e) => setSubLedger({ ...subLedger, name: e.target.value })} />
                    </div>
                    <div className='p2 mr-4 mt-4 text-[0.9em] flex flex-col'>
                        <div className='flex items-center mb-2'>
                            <span className='w-[100px] mr-2 text-end'>Lessee</span>
                            <input 
                                type="checkbox" 
                                checked={subLedger ? subLedger.isLessee : isLessee} 
                                onChange={(e) => setSubLedger({ ...subLedger, isLessee: e.target.checked })} />
                        </div>
                        {subLedger.isLessee &&
                            <>
                            <div className='flex flex-col mb-2'>
                                <div className='flex items-center'>
                                    <span className='w-[100px] text-end mr-2'>Period</span>
                                    <input 
                                        type="date" 
                                        className='border p-1 rounded' 
                                        value={subLedger.periodStart && subLedger.periodStart.slice(0, 10) || ''} 
                                        onChange={startDateChange} />
                                    <span className='mx-2'>-</span>
                                    <input 
                                        type="date" 
                                        className='border p-1 rounded' 
                                        value={subLedger.periodEnd && subLedger.periodEnd.slice(0, 10) || ''} 
                                        onChange={endDateChange} />
                                </div>
                            </div>
                            <div className='flex items-center mb-2'>
                                <span className='w-[100px] text-end mr-2'>Area</span>
                                <input 
                                    type="number" 
                                    className='border p-1 rounded w-[100px]'
                                    value={subLedger.area || ''}
                                    onChange={(e) =>setSubLedger({ ...subLedger, area: e.target.value })} />
                                <span className='ml-1'>sq.m</span>
                            </div>
                            <div className='flex items-center mb-2'>
                                <span className='w-[100px] text-end mr-2'>Initial Rate</span>
                                <CurrencyInput
                                    className={'border p-1 rounded w-[100px]'}
                                    val={subLedger.initialRate || ''}
                                    setVal={(v)=>setSubLedger({...subLedger, initialRate: v})} />
                                <span className='ml-1'>/sq.m</span>
                            </div>
                            <div className='flex items-center mb-2'>
                                <span className='w-[100px] text-end mr-2'>Yearly Increase</span>
                                <input 
                                    type="number" 
                                    className='border p-1 rounded w-[100px]'
                                    value={subLedger.yearlyIncrease || ''}
                                    onChange={(e) =>setSubLedger({ ...subLedger, yearlyIncrease: e.target.value })} />
                                <span className='ml-1'>%</span>
                            </div>
                            </>
                        }
                    </div>
                </div>
                <div className='flex flex-col text-[0.8em] mr-2'>
                {subLedger.isLessee &&
                    <div className='mt-2 text-[0.9em] flex flex-col'>
                        <span className='mb-1'>Rental Rate Escalation</span>
                        <table className='w-[100%] text-center'>
                            <thead>
                                <tr className='border-b bg-gray-100'>
                                    <th className='py-1 px-2 border-r'></th>
                                    <th className='py-1 px-2 border-r'>YEAR</th>
                                    <th className='py-1 px-2 border-r'>RATE</th>
                                    <th className='py-1 px-2 border-r'>AREA</th>
                                    <th className='py-1 px-2 border-r'>AMOUNT</th>
                                    <th className='py-1 px-2 border-r'>12% VAT</th>
                                    <th className='py-1 px-2 border-r'>GROSS AMT</th>
                                    <th className='py-1 px-2 border-r'>5% EWT</th>
                                    <th className='py-1 px-2 border-r'>CASH PAYMENT</th>
                                    { mode === 'edit' && <th className='py-1 px-2'>ACTION</th> }
                                </tr>
                            </thead>
                            <tbody>
                            { escalation.length > 0 && escalation.map((item, index)=>
                                <tr key={index} className={`border-b ${new Date() >= item.start && new Date <= item.end && 'bg-orange-200'}`}>
                                    <td className='py-1 px-2 border-r'>{index + 1}.</td>
                                    <td className='py-1 px-2 border-r'>{formatReadableDate(item.start)} - {formatReadableDate(item.end)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.rate)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.area)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.amount)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.vat12)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.grossAmount)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.ewt5)}</td>
                                    <td className='py-1 px-2 border-r'>{numberToCurrencyString(+item.cashPayment)}</td>
                                    { mode === 'edit' && 
                                        <td className='py-1 px-2'>
                                            {/* if no journal?? */}
                                            <button className='bg-gray-600 text-[0.9em] px-2 rounded text-white' onClick={()=>journalClick(item)} >Journal</button>
                                        </td>
                                    }
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                }
                </div>
            </div>
            <div className='p-2 flex justify-end'>
                <button className='bg-green-600 text-white mr-2 px-2 py-1 rounded hover:bg-green-500 transition duration-500' onClick={(e) => saveClick(e)} >Save</button>
            </div>
        </Modal>
        </>
    );
}

export default SubledgerModal;