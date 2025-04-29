import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import CurrencyInput from '../Components/CurrencyInput';
import axios from 'axios';
import { showToast } from '../utils/toastNotifications';
import { formatReadableDate, numberToCurrencyString, formatDateToYYYMMdd, monthName, isTodayInRange } from '../helper/helper';
import JournalModal from './JournalModal';
import ReceiptModal from './ReceiptModal';
import useBase from '../context/useBase';
import { FaCopy } from 'react-icons/fa6';
import { useDataPreloader } from '../context/DataPreloader';
// import CurrencyInput from '../Components/CurrencyInput';

function SubledgerModal({ className='', show=false, setShow, selectedSubledger=null, isLessee=false, mode='add', refresh=()=>{} }) {

    const { base } = useBase();
    const { refreshAccounts } = useDataPreloader();

    const [subLedger, setSubLedger] = useState({
        slCode: '',
        name: '',
        isLessee: isLessee,
        address: '',
        zip: '',
        // lessee exclusive fields
        periodStart: '',
        periodEnd: '',
        area: '',
        initialRate: '',
        yearlyIncrease: '',
        escalation: [],
        securityDepositIsMonthlyRental: false,
        vat: 12,
        ewt: 0,
        cwt: 0,
        fvat: 0,

        billingDate: '1',
        dueDate: '1',
        penalty: 0,
        tin: '',

        securityDeposit: 0
    });

    const [showBuildEscalationButton, setShowBuildEscalationButton] = useState(false);

    // holds formatted entry data for journal sheet
    const [entryData, setEntryData] = useState({});
    const [journalModal, setJournalModal] = useState({show: false, type: 'accrual'});
    const [receiptModal, setReceiptModal] = useState({show: false, type: 'lease'});

    useEffect(() => {
        if (mode === 'add' || !show) {
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
                escalation: [],
                vat: 12,
                ewt: 0,
                fvat: 0,
                cwt: 0,
                penalty: 0,
                tin: '',
                address: '',
                zip: '',
                billingDate: '1',
                dueDate: '1',
                securityDeposit: 0.00
            });
        }else{
            // edit mode
            if(selectedSubledger){
                if(!selectedSubledger.billingDate){
                    selectedSubledger.billingDate = '1';
                }
                if(!selectedSubledger.dueDate){
                    selectedSubledger.dueDate = '1';
                }
                // load security deposit (from seperate endpoint) first before mutating state
                const getd = async ()=>{
                    const d = await getSecurityDeposit();
                    setSubLedger({...selectedSubledger, securityDeposit: d});
                };
                getd();
            }
        }
    }, [show]);

    // listen to changes in subLedger
    useEffect(()=>{
        // shows build escalation button
        if(subLedger.isLessee && subLedger.escalation.length === 0 && !!subLedger.periodStart && !!subLedger.periodEnd && !!subLedger.area && !!subLedger.initialRate && !!subLedger.yearlyIncrease){
            setShowBuildEscalationButton(true);
        }else{
            setShowBuildEscalationButton(false);
        }
    }, [subLedger]);

    async function getSecurityDeposit(){
        if(!selectedSubledger.slCode) return;
        // this endpoint gets the balance of the current lessee on 20401040B account (security deposit) 
        const response = await axios.get(`/reports/book/summary?ledger=20401040B&&subledger=${selectedSubledger.slCode}`, {withCredentials: true});
        const data = response.data;
        return Math.round((data.credit - data.debit) * 100) / 100;
    }

    async function saveClick(e) {
        e.preventDefault();
        if (!subLedger.name) {
            showToast('Please enter name', 'warning');
            return;
        }
        if (mode === 'add') {
            const toSave = {...subLedger, escalation: []};
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
                    escalation: [],
                    vat: 12,
                    ewt: 0,
                    fvat: 0,
                    cwt: 0,
                    penalty: 0,
                    tin: '',
                    address: '',
                    zip: '',
                    billingDate: '1',
                    dueDate: '1'
                });
                setShow(false);
                showToast('Subledger saved', 'success');
            } else {
                showToast('Unable to save subledger', 'warning');
            }
        } else {
            // const data = {...subLedger, escalation: []};
            const data = subLedger;
            // delete(data._id);
            // TODO !! begin edit
            // delete data._id;
            const response = await axios.patch(`/subledgers/${subLedger._id}`, data, { withCredentials: true });
            if(response.status === 200){
                setShow(false);
                showToast('Subledger saved', 'success');
            }else{
                showToast('Unable to save subledger', 'warning');
            }
        }
        refresh();
        // also refresh from data preloader
        refreshAccounts();
    }

    function startDateChange(e) {
        e.preventDefault();
        setSubLedger({ ...subLedger, periodStart: e.target.value });
    }

    function endDateChange(e) {
        e.preventDefault();
        setSubLedger({ ...subLedger, periodEnd: e.target.value });
    }

    // pre build escalation table when all inputs are complete
    function createEscalationTableClick() {
        // Build yearly breakdown from period start and period end
        const newEsc = divideYears(subLedger.periodStart, subLedger.periodEnd);
        let newRate = parseFloat(subLedger.initialRate);
        const yearlyIncrease = parseFloat(subLedger.yearlyIncrease) / 100;
        const area = parseFloat(subLedger.area);
        const isSecurityDepositMonthly = subLedger.securityDepositIsMonthlyRental;
        for (let i = 0; i < newEsc.length; i++) {
            // Calculate values
            const office = newRate * area;
            const parking = 0; // Explicitly set to 0
            const total = office + parking;
            const vat = total * (parseFloat(subLedger.vat ? subLedger.vat : 0) / 100); // 12% VAT
            const grossAmount = total + vat;
            const ewt = total * (parseFloat(subLedger.ewt ? subLedger.ewt : 0) / 100); // 5% EWT
            const cwt = total * (parseFloat(subLedger.cwt ? subLedger.cwt : 0) / 100);
            const fvat = total * (parseFloat(subLedger.fvat ? subLedger.fvat : 0) / 100); // Explicitly set to 0
            const assessmentFee = 0; // Explicitly set to 0
            const cashPayment = grossAmount - (ewt + fvat) + assessmentFee;
            const securityDeposit = isSecurityDepositMonthly ? cashPayment : 0;
            // Assign calculated values
            newEsc[i] = {
                ...newEsc[i], // Preserve existing data
                rate: newRate, // Store as string for display
                area: area,
                office: office,
                parking: parking,
                total: total,
                vat: vat ? parseFloat(vat.toFixed(2)) : 0.00,
                grossAmount: grossAmount,
                ewt: ewt,
                fvat: fvat,
                cwt: cwt,
                assessmentFee: assessmentFee,
                cashPayment: cashPayment,
                securityDeposit: securityDeposit,
            };
            // Increment rate for the next year
            newRate += parseFloat(newRate) * parseFloat(yearlyIncrease);
        }
        // Update the subLedger with the new escalation data
        setSubLedger({ ...subLedger, escalation: newEsc });
    }
    
    // divide range of date into array of dates
    function divideYears(start, end) {
        // not working on less than 1 year ex: start is 12/31/2024 and end is 12/31/2024
        const yearStart = new Date(start).getFullYear();
        const yearEnd = new Date(end).getFullYear();
        const years = [];
        for (let i = yearStart; i < yearEnd; i++) {
            const startOfYear = new Date(new Date(start).setFullYear(i));
            const endOfYear = new Date(new Date(end).setFullYear(i + 1));
            years.push({period: {start: startOfYear, end: endOfYear}});
        }
        return years;
    }

    function depositClick(){
        setRentalInfoModal({...rentalInfoModal, row: {}});
        // open payment entry modal with default accounts for security deposit (to be added on base later!)
        setEntryData({Particulars: 'SECURITY DEPOSIT', EntryType: 'Receipt', ledgers: [
            {
                ledger: {
                    code: '10102020',
                    name: 'CASH IN BANK- LOCAL CURRENCY, CURRENT ACCOUNT'
                },
                subledger: {
                    slCode: '',
                    name: ''
                },
                dr: '',
                cr: '',
                description: 'SECURITY DEPOSIT'
            },
            {
                ledger: {
                    code: '20401040B',
                    name: 'MISCELLANEOUS LONG TERM LIABILITIES'
                },
                subledger: {
                    slCode: subLedger.slCode,
                    name: subLedger.name
                },
                dr: '',
                cr: '',
                description: 'SECURITY DEPOSIT'
            }
        ]});
        setReceiptModal({...receiptModal, mode: 'security deposit', show: true});
    }

    // input handler for rental rate escalation
    function escalationChange(index, field, e) {
        let lc = subLedger.escalation; // Current escalation array
        let slc = lc[index]; // Selected escalation row
        let sub = {};
        let particulars = '';
        switch (field) {
            case 'start': 
                slc = { ...slc, period: { ...slc.period, start: new Date(e.target.value) } };
            break;
            case 'end':
                slc = { ...slc, period: { ...slc.period, end: new Date(e.target.value) } };
            break;
            case 'add':
                let emptyRow = {
                    period: {
                        start: '',
                        end: ''
                    },
                    rate: '',
                    area: '',
                    office: '',
                    parking: '',
                    total: '',
                    vat: '',
                    grossAmount: '',
                    ewt: '',
                    fvat: '',
                    cwt: '',
                    assessmentFee: '',
                    cashPayment: '',
                    securityDeposit: ''
                };
                lc = [...lc.slice(0, index + 1), emptyRow, ...lc.slice(index + 1)];
                setSubLedger({ ...subLedger, escalation: lc });
            return;
            case 'remove':
                // Remove the row at the specified index
                lc = [...lc.slice(0, index), ...lc.slice(index + 1)];
                setSubLedger({ ...subLedger, escalation: lc });
            return;
            case 'journal':
                sub = subLedger.escalation[index];
                setRentalInfoModal({...rentalInfoModal, row: sub});
                particulars = base.rentalAccrual.particulars + " FOR THE MONTH OF " + monthName(new Date(sub.period.start).getMonth()) + " " + new Date(sub.period.end).getFullYear();
                // compute for security deposit
                let toDeposit = 0;
                // if no security deposit debited to this book
                if(sub.securityDeposit && (subLedger.securityDeposit < sub.securityDeposit)){
                    toDeposit = +sub.securityDeposit - +subLedger.securityDeposit;
                    toDeposit = Math.round(toDeposit * 100) / 100;
                }
                const accrual = [
                    // Debit
                    {
                        ledger: {
                            code: base.rentalAccrual.accrual.debitTo.code,
                            name: base.rentalAccrual.accrual.debitTo.name
                        },
                        subledger: {
                            slCode: subLedger.slCode,
                            name: subLedger.name
                        },
                        dr: sub.cashPayment.toFixed(2),
                        cr: '',
                        description: particulars
                    },
                    // Credit
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
                        cr: sub.cashPayment.toFixed(2),
                        description: particulars
                    }
                ];
                if(toDeposit > 0){
                    accrual.push(
                        {
                            ledger: {
                                code: base.rentalAccrual.securityDeposit.debitTo.code,
                                name: base.rentalAccrual.securityDeposit.debitTo.name
                            },
                            subledger: {
                                slCode: subLedger.slCode,
                                name: subLedger.name
                            },
                            dr: toDeposit,
                            cr: '',
                            description: particulars
                        },
                        {
                            ledger: {
                                code: base.rentalAccrual.securityDeposit.creditTo.code,
                                name: base.rentalAccrual.securityDeposit.creditTo.name
                            },
                            subledger: {
                                slCode: subLedger.slCode,
                                name: subLedger.name
                            },
                            dr: '',
                            cr: toDeposit,
                            description: particulars
                        }
                    );
                }
                setEntryData({ Particulars: particulars, EntryType: 'Journal', ledgers: accrual });
                setJournalModal({ ...journalModal, show: true });
            return;
            case 'receipt':
                console.log('show receit entry modal');
                sub = subLedger.escalation[index];
                // add receipt info here for rental payment
                setRentalInfoModal({...rentalInfoModal, row: sub});


                setReceiptModal({ ...receiptModal, show: true });
            return;
            default:
                slc = { ...slc, [field]: e ? parseFloat(e.target?.value || e) : 0 };
        }
        const vat = subLedger.vat ? parseFloat(subLedger.vat) / 100 : 0;
        const fvat = subLedger.fvat ? parseFloat(subLedger.fvat) / 100 : 0;
        const ewt = subLedger.ewt ? parseFloat(subLedger.ewt) / 100 : 0;
        const cwt = subLedger.cwt ? parseFloat(subLedger.cwt) / 100 : 0;
        // Default values for fields
        const assessmentFee = parseFloat(slc.assessmentFee || 0);
        // Calculate office
        const newOffice = parseFloat(slc.rate || 0) * parseFloat(slc.area || 0);
        // Calculate total
        const newTotal = newOffice + parseFloat(slc.parking || 0);
        // Calculate VAT (VAT is a percentage of the total)
        const newVat = newTotal * vat;
        // Calculate gross amount (total + VAT)
        const newGrossAmount = newTotal + newVat;
        // Calculate EWT (EWT is a percentage of the total)
        const newEwt = newTotal * ewt;
        const newCwt = newTotal * cwt;
        // Calculate FVAT (FVAT is a percentage of the total)
        const newFvat = newTotal * fvat;
        // Calculate cash payment (gross amount - (EWT + FVAT) + assessment fee)
        const newCashPayment = newGrossAmount - (newEwt + newFvat) + assessmentFee;
        // Update the row object with computed values
        slc = {
            ...slc,
            office: newOffice,
            total: newTotal,
            vat: newVat ? parseFloat(newVat.toFixed(2)) : 0.00,
            grossAmount: newGrossAmount,
            ewt: newEwt,
            fvat: newFvat,
            cwt: newCwt,
            cashPayment: newCashPayment,
        };
        // Update subLedger with the modified escalation array
        setSubLedger({
            ...subLedger,
            escalation: lc.map((item, indx) => (indx === index ? slc : item))
        });
    }
    
    const days = Array.from({ length: 28 }, (_, i) => i + 1).map(day => ({
        value: day,
        label: `${day}${getOrdinal(day)}`,
    }));
    days.push({ value: 'last', label: 'Last' });

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"],
              v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    // display selected rental info
    const [rentalInfoModal, setRentalInfoModal] = useState({show: false, dropdown: false, row: {}});
    
    useEffect(()=>{
        if(receiptModal.show || journalModal.show){
            setRentalInfoModal({...rentalInfoModal, show: true, dropdown: false});
        }else{
            setRentalInfoModal({show: false, dropdown: false, row: {}});
        }
    }, [journalModal.show, receiptModal.show]);

    function copyClick(text){
        navigator.clipboard.writeText(text)
        .then(()=>{
            setRentalInfoModal({...rentalInfoModal, dropdown: false});
            showToast('copied to clipboard!', 'success');
        })
        .catch(err=>{
            console.error('error ', err);
        });
    }

    return (
        <>
        <div className={`absolute z-50 top-[15px] left-[15px] ${rentalInfoModal.show ? 'visible' : 'hidden'}`}>
            <button 
                className='bg-gray-100 shadow-lg px-2 py-1 rounded border' 
                onClick={()=>{
                    setRentalInfoModal({...rentalInfoModal, dropdown: !rentalInfoModal.dropdown})
                }} >
                Rental Info
            </button>
            <div className={`p-4 border shadow-lg bg-gray-100 rounded ${rentalInfoModal.dropdown ? 'visible' : 'hidden'}`}>
                {
                    Object.keys(rentalInfoModal.row).length > 0 ? (
                        <div>
                            <div className='text-[0.9em] mb-2 flex'>
                                <span className='w-[280px] pr-1 text-end font-bold'>Lessee:</span>
                                <span>{subLedger.slCode} {subLedger.name}</span>
                                <button className='ml-2' onClick={()=>copyClick(`${subLedger.slCode}	${subLedger.name}`)}><FaCopy /></button>
                            </div>
                            <div className='text-[0.9em] mb-2 flex'>
                                <span className='w-[280px] pr-1 text-end font-bold'>Period:</span>
                                <span>{formatReadableDate(rentalInfoModal.row.period.start)} - {formatReadableDate(rentalInfoModal.row.period.end)}</span>
                            </div>
                            <table className='text-[0.8em]'>
                                <tbody>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Rate:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.rate)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.rate)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Area:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.area)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.area)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Office:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.office)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.office)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Parking:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.parking)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.parking)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Total:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.total)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.total)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>VAT:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.vat)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.vat)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Gross Amount:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.grossAmount)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.grossAmount)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>EWT:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.ewt)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.ewt)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>CWT:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.cwt)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.cwt)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>FVAT:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.fvat)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.fvat)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Assessment Fee:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.assessmentFee)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.assessmentFee)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Cash Payment:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.cashPayment)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.cashPayment)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Security Deposit for this period:</td>
                                        <td>
                                            {numberToCurrencyString(rentalInfoModal.row.securityDeposit)}
                                            <button className='ml-2' onClick={()=>copyClick(rentalInfoModal.row.securityDeposit)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                    <tr className='mb-1'>
                                        <td className='w-[280px] pr-1 text-end font-bold'>Security Deposit credited to this account:</td>
                                        <td>
                                            {numberToCurrencyString(subLedger.securityDeposit)}
                                            <button className='ml-2' onClick={()=>copyClick(subLedger.securityDeposit)}><FaCopy /></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (<></>)
                }
            </div>
        </div>
        <Modal show={show} closeCallback={() => setShow(false)} >
            <div className={`border-t border-b z-50 flex-1 flex flex-wrap p-2 max-h-[70vh] overflow-y-scroll ${className}`}>
                <div className='flex flex-col text-[0.9em] p-2 mr-2'>
                    <div className='flex items-center mb-2'>
                        <span className='mb-1 w-[100px] text-end mr-2'>Account Code</span>
                        <input type="text" className='border rounded p-1' value={subLedger.slCode || ''} 
                            onChange={(e) => setSubLedger({ ...subLedger, slCode: e.target.value })} />
                    </div>
                    <div className='flex items-center mb-2'>
                        <span className='mb-1 w-[100px] text-end mr-2'>Name</span>
                        <input type="text" className='border rounded p-1' value={subLedger.name || ''} 
                            onChange={(e) => setSubLedger({ ...subLedger, name: e.target.value })} />
                    </div>
                    <div className='flex mb-2'>
                        <div className='flex items-center mr-2'>
                            <span className='w-[100px] text-end mr-2'>TIN</span>
                            <input type="text" className='border p-1 rounded' value={subLedger.tin || ''}
                                onChange={(e)=>setSubLedger({...subLedger, tin: e.target.value})} />
                        </div>
                    </div>
                    <div className='flex mb-2'>
                        <div className='flex items-center mr-2'>
                            <span className='w-[100px] text-end mr-2'>ADDRESS</span>
                            <input type="text" className='border p-1 rounded' value={subLedger.address || ''}
                                onChange={(e)=>setSubLedger({...subLedger, address: e.target.value})} />
                        </div>
                    </div>
                    <div className='flex mb-2'>
                        <div className='flex items-center mr-2'>
                            <span className='w-[100px] text-end mr-2'>ZIP</span>
                            <input type="text" className='border p-1 rounded' value={subLedger.zip || ''}
                                onChange={(e)=>setSubLedger({...subLedger, zip: e.target.value})} />
                        </div>
                    </div>
                    <div className='p2 mr-4 mt-4 text-[0.9em] flex flex-col'>
                        <div className='flex items-center mb-2'>
                            <span className='w-[100px] mr-2 text-end'>Lessee</span>
                            <input type="checkbox" checked={subLedger ? subLedger.isLessee : isLessee} 
                                onChange={(e) => setSubLedger({ ...subLedger, isLessee: e.target.checked })} />
                        </div>
                        {subLedger.isLessee &&
                            <>
                            <div className='flex flex-col'>
                                <div className='flex flex-col mb-2'>
                                    <div className='flex items-center mr-2 mb-2'>
                                        <span className='w-[110px] text-end mr-2'>Period</span>
                                        <input type="date" className='border p-1 rounded' 
                                            value={subLedger.periodStart && subLedger.periodStart.slice(0, 10) || ''} onChange={startDateChange} />
                                        <span className='mx-2'>-</span>
                                        <input type="date" className='border p-1 rounded' 
                                            value={subLedger.periodEnd && subLedger.periodEnd.slice(0, 10) || ''} onChange={endDateChange} />
                                    </div>
                                    <div className='flex items-center mr-2 mb-2'>
                                        <span className='w-[110px] mr-2 text-end'>Billing Date every</span>
                                        <select
                                            className="w-[150px] border p-1 rounded mr-2"
                                            defaultValue={subLedger.billingDate ?? '1'}
                                            onChange={(e)=>setSubLedger({...subLedger, billingDate: e.target.value})}
                                        >
                                            {days.map((day, index) => <option key={day.value} value={day.value}>{day.label}</option>)}
                                        </select>
                                        <span>day of the month</span>
                                    </div>
                                    <div className='flex items-center mr-2 mb-2'>
                                        <span className='w-[110px] mr-2 text-end'>Due Date every</span>
                                        <select
                                            className="w-[150px] border p-1 rounded mr-2" 
                                            defaultValue={subLedger.dueDate ?? '1'} 
                                            onChange={(e)=>setSubLedger({...subLedger, dueDate: e.target.value})} >
                                            {days.map((day, index) => <option key={day.value} value={day.value}>{day.label}</option>)}
                                        </select>
                                        <span>day of the month</span>
                                    </div>
                                </div>
                                <div className='flex flex-wrap'>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>Area</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.area || ''}
                                            onChange={(e) =>setSubLedger({ ...subLedger, area: e.target.value })} />
                                        <span className='ml-1 w-[50px]'>sq.m</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>Initial Rate</span>
                                        <CurrencyInput className={'border p-1 rounded w-[100px]'} val={subLedger.initialRate || ''}
                                            setVal={(v)=>setSubLedger({...subLedger, initialRate: v})} />
                                        <span className='ml-1 w-[50px]'>/sq.m</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>Yearly Increase</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.yearlyIncrease || ''}
                                            onChange={(e)=>setSubLedger({ ...subLedger, yearlyIncrease: e.target.value })} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>Penalty</span>
                                        <input type="number" className='p-1 w-[100px] border' value={subLedger.penalty || ''}
                                            onChange={(e)=>setSubLedger({...subLedger, penalty: e.target.value})} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                </div>
                                <div className='flex flex-wrap'>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>VAT</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.vat || 0}
                                            onChange={(e)=>setSubLedger({ ...subLedger, vat: e.target.value })} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>FVAT</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.fvat || 0}
                                            onChange={(e)=>setSubLedger({ ...subLedger, fvat: e.target.value})} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>EWT</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.ewt || 0}
                                            onChange={(e)=>setSubLedger({ ...subLedger, ewt: e.target.value})} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                    <div className='flex items-center mb-2'>
                                        <span className='w-[110px] text-end mr-2'>CWT</span>
                                        <input type="number" className='border p-1 rounded w-[100px]' value={subLedger.cwt || 0}
                                            onChange={(e)=>setSubLedger({ ...subLedger, cwt: e.target.value})} />
                                        <span className='ml-1 w-[50px]'>%</span>
                                    </div>
                                </div>
                                <div className='flex items-center'>
                                    <input type="checkbox" className='mr-2 ml-4' checked={subLedger.securityDepositIsMonthlyRental || false} 
                                        onChange={(e)=>setSubLedger({...subLedger, securityDepositIsMonthlyRental: e.target.checked})} />
                                    <span>Security deposit same with monthly rental</span>
                                    { showBuildEscalationButton &&
                                        <button className='ml-4 bg-green-500 text-white px-2 rounded-lg' onClick={createEscalationTableClick}>create table</button>
                                    }
                                </div>
                                <div className='mt-4 flex flex-col'>
                                    <div className='flex'>
                                        <span className='font-bold flex-1'>Rental Rate Escalation</span>
                                        <button className='underline' onClick={()=>setSubLedger({...subLedger, escalation: []})}>reset</button>
                                    </div>
                                    <div className='p-1 max-w-[90vw] overflow-x-scroll'>
                                        <table className='w-[100%] text-[0.9em]'>
                                            <thead>
                                                <tr className='bg-white border-b'>
                                                    <th className='px-2 py-1 border-r sticky left-[-5px] bg-gray-100'>Year</th>
                                                    <th className='px-2 py-1 border-r'>Rate</th>
                                                    <th className='px-2 py-1 border-r'>Area</th>
                                                    <th className='px-2 py-1 border-r'>Office</th>
                                                    <th className='px-2 py-1 border-r'>Parking</th>
                                                    <th className='px-2 py-1 border-r'>Total</th>
                                                    <th className='px-2 py-1 border-r'>VAT</th>
                                                    <th className='px-2 py-1 border-r'>Gross Amount</th>
                                                    <th className='px-2 py-1 border-r'>EWT</th>
                                                    <th className='px-2 py-1 border-r'>CWT</th>
                                                    <th className='px-2 py-1 border-r'>FVAT</th>
                                                    <th className='px-2 py-1 border-r'>Assessment Fee</th>
                                                    <th className='px-2 py-1 border-r'>Cash Payment</th>
                                                    <th className='px-2 py-1 border-r'>Security Deposit</th>
                                                    <th className='px-2 py-1 sticky right-[-5px] bg-gray-100'></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            { subLedger.escalation.map((item, index)=>
                                                <tr key={index} 
                                                    className={`
                                                        border-b 
                                                        ${isTodayInRange(new Date(item.period.start), new Date(item.period.end)) ? 
                                                        'bg-green-300 hover:bg-green-400 ' : 'hover:bg-gray-100 '}
                                                    `} >
                                                    <td className='flex border-r p-1 sticky left-[-5px] bg-gray-100'>
                                                        <input type="date" className='border mr-1 px-1 w-[100px]'
                                                            value={item.period.start ? formatDateToYYYMMdd(new Date(item.period.start)) : ''} 
                                                            onChange={(e)=>escalationChange(index, 'start', e)} />
                                                        -
                                                        <input type="date" className='border ml-1 px-1 w-[100px]'
                                                            value={item.period.end ? formatDateToYYYMMdd(new Date(item.period.end)) : ''} 
                                                            onChange={(e)=>escalationChange(index, 'end', e)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.rate} setVal={(v)=>escalationChange(index, 'rate', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.area} setVal={(v)=>escalationChange(index, 'area', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.office} setVal={(v)=>escalationChange(index, 'office', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.parking} setVal={(v)=>escalationChange(index, 'parking', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.total} setVal={(v)=>escalationChange(index, 'total', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.vat} setVal={(v)=>escalationChange(index, 'vat', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.grossAmount} setVal={(v)=>escalationChange(index, 'grossAmount', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.ewt} setVal={(v)=>escalationChange(index, 'ewt', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.cwt} setVal={(v)=>escalationChange(index, 'cwt', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.fvat} setVal={(v)=>escalationChange(index, 'fvat', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.assessmentFee} setVal={(v)=>escalationChange(index, 'assessmentFee', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.cashPayment} setVal={(v)=>escalationChange(index, 'cashPayment', v)} />
                                                    </td>
                                                    <td className='border-r p-1'>
                                                        <CurrencyInput className={'border px-1 w-[100px]'} 
                                                            val={item.securityDeposit} setVal={(v)=>escalationChange(index, 'securityDeposit', v)} />
                                                    </td>
                                                    <td className='flex sticky right-[-5px] bg-gray-100'>
                                                        <button className='bg-green-500 text-white px-1 mr-2' onClick={()=>escalationChange(index, 'add')} >+</button>
                                                        <button className='bg-gray-500 text-white px-1 mr-2' onClick={()=>escalationChange(index, 'journal')} >journal</button>
                                                        <button className='bg-gray-500 text-white px-1 mr-2' onClick={()=>escalationChange(index, 'receipt')}>Receipt</button>
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className='flex items-center justify-end mt-4 p-4 border border-yellow-100 mb-2'>
                                    <span className='w-[110px] text-end mr-2'>Security Deposit</span>
                                    <input type="text" className='border p-1 rounded w-[150px]' value={numberToCurrencyString(+subLedger.securityDeposit) || 0.00} readOnly />
                                    <button className='ml-4 bg-green-500 text-white px-2 rounded-lg' onClick={depositClick}>deposit</button>
                                </div>
                            </div>
                            </>
                        }
                    </div>
                </div>
                <div className='flex flex-col text-[0.8em] mr-2'>
                {subLedger.isLessee && <></>}
                </div>
            </div>
            <div className='p-2 flex items-end justify-end'>
                {/* <button className='mr-4 underline text-red-500' onClick={()=>alert('not yet implemented')} >delete</button> */}
                <button className='bg-green-600 text-white mr-2 px-2 py-1 rounded hover:bg-green-500 transition duration-500' onClick={(e) => saveClick(e)} >Save</button>
            </div>
        </Modal>
        <ReceiptModal
            isOpen={receiptModal.show}
            onClose={()=>setReceiptModal({...receiptModal, show: false})}
            mode={receiptModal.type}
            entryData={entryData}
            onSaveReceipt={()=>{
                setShow(false);
            }} />
        <JournalModal 
            isOpen={journalModal.show} 
            onClose={()=>setJournalModal({...journalModal, show: false})}
            mode={journalModal.type}
            entryData={entryData}
            onSaveJournal={()=>{
                setShow(false);
            }} />
        </>
    );
}

export default SubledgerModal;