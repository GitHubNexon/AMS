import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import { monthName, formatDateToYYYMMdd, formatReadableDate, numberToCurrencyString } from '../helper/helper';
import axios from 'axios';
import JournalModal from './JournalModal';
import useBase from '../context/useBase';
import { showToast } from '../utils/toastNotifications';
import OrderOfPaymentModal from '../Components/OrderOfPaymentModal';

function BatchAccrualModal({show, close}) {

    const {base} = useBase();

    const [jvDate, setJvDate] = useState(formatDateToYYYMMdd(new Date()));

    const [toBill, setToBill] = useState([]);

    const [jModal, setJModal] = useState({show: false, mode: 'accrual', entryData: []});

    useEffect(()=>{
        getToBill();
    }, [jvDate]);

    async function getToBill(){
        const response = await axios.get(`/subledgers/escalation/${jvDate}`, {withCredentials: true});
        const rows = response.data.data.map(item=>({...item, checked: false}));
        setToBill(rows);
    }

    // for accrual form
    function createClick(){
        // build particulars message
        const particulars = base.rentalAccrual.particulars + " FOR THE MONTH OF " + monthName(new Date(jvDate).getMonth()) + " " + new Date(jvDate).getFullYear();
        // get all checked
        const bill = toBill.filter(f=>f.checked);
        if(bill.length === 0){
            showToast('Select lessee', 'warning');
            return;
        }
        // create debits
        const debit = bill.map((item)=>({
            ledger: { code: base.rentalAccrual.accrual.debitTo.code, name: base.rentalAccrual.accrual.debitTo.name },
            subledger: { slCode: item.slCode, name: item.name },
            dr: item.amount.toFixed(2),
            cr: '',
            description: particulars
        }));
        // create credits
        const credit = bill.map((item)=>({
            ledger: { code: base.rentalAccrual.accrual.creditTo.code, name: base.rentalAccrual.accrual.creditTo.name },
            subledger: { slCode: item.slCode, name: item.name },
            dr: '',
            cr: item.amount.toFixed(2),
            description: particulars
        }));
        // create security deposits
        const debitDeposit = bill.filter(f=>f.securityToDeposit && f.securityToDeposit > (f.securityDeposit ? f.securityDeposit : 0)).map(item=>({
            ledger: { code: base.rentalAccrual.securityDeposit.debitTo.code, name: base.rentalAccrual.securityDeposit.debitTo.name },
            subledger: { slCode: item.slCode, name: item.name },
            dr: item.securityToDeposit - (item.securityDeposit ? item.securityDeposit : 0),
            cr: '',
            description: particulars
        }));
        const creditDeposit = bill.filter(f=>f.securityToDeposit && f.securityToDeposit > (f.securityDeposit ? f.securityDeposit : 0)).map(item=>({
            ledger: { code: base.rentalAccrual.securityDeposit.creditTo.code, name: base.rentalAccrual.securityDeposit.creditTo.name },
            subledger: { slCode: item.slCode, name: item.name },
            dr: '',
            cr: item.securityToDeposit - (item.securityDeposit ? item.securityDeposit : 0),
            description: particulars
        }));
        // create journal modal
        setJModal({
            show: true, 
            mode: 'accrual',
            entryData: {
                JVDate: jvDate,
                Particulars: particulars,
                EntryType: 'Journal',
                ledgers: [...debit, ...credit, ...debitDeposit, ...creditDeposit]
            } 
        });
    }

    const [OrModal, setOrModal] = useState({show: false, createList: []});

    function createOrClick(){
        // get all checked
        console.log(jvDate);
        const bill = toBill.filter(f=>f.checked).map(m=>({...m, date: jvDate}));
        if(bill.length === 0){
            showToast('Select lessee', 'warning');
            return;
        }

        setOrModal({...OrModal, show: true, createList: bill});
    }

    function check(index, e) {
        const updatedRows = [...toBill]; // Create a shallow copy of the toBill array
        updatedRows[index] = {
            ...updatedRows[index], // Copy the object to avoid mutating directly
            checked: e.target.checked, // Update the checked property
        };
        setToBill(updatedRows); // Update the state with the new array
    }

    function checkAll(e){
        setToBill(toBill.map(item=>({...item, checked: e.target.checked})));
    }

    return (
        <>
        <Modal show={show} closeCallback={close} title='Create Journal' >
            <div className='flex-1 p-4 border-t border-b min-w-[50vw]'>
                <div className='flex flex-col text-[0.8em]'>
                    <div className='flex items-center mb-4'>
                        <span className='mr-2 font-bold'>Date</span>
                        <input type="date" className='border p-1 rounded' value={jvDate} onChange={(e)=>setJvDate(e.target.value)} />
                    </div>
                    <div className='h-[50vh] overflow-y-scroll relative'>
                    { toBill.length > 0 ? (
                            <table className='text-center w-[100%]'>
                                <thead>
                                    <tr className='border-b bg-white sticky top-0'>
                                        <th className='px-2 py-1 border-r'>
                                            <input type="checkbox" onChange={checkAll} />
                                        </th>
                                        <th className='px-2 py-1 border-r'>SL CODE</th>
                                        <th className='px-2 py-1 border-r'>LESSEE</th>
                                        <th className='px-2 py-1 border-r'>PERIOD</th>
                                        <th className='px-2 py-1 border-r'>AMOUNT</th>
                                        <th className='px-2 py-1'>BILLING DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { toBill.map((item, index)=>
                                        <tr key={index} className='border-b hover:bg-gray-100'>
                                            <td className='px-2 py-1 border-r'>
                                                <input type="checkbox" checked={item.checked} onChange={(e)=>check(index, e)} />
                                            </td>
                                            <td className='px-2 py-1 border-r'>{item.slCode}</td>
                                            <td className='px-2 py-1 border-r'>{item.name}</td>
                                            <td className='px-2 py-1 border-r'>{formatReadableDate(item.start)} - {formatReadableDate(item.end)}</td>
                                            <td className='px-2 py-1 border-r'>{numberToCurrencyString(+item.amount)}</td>
                                            <td className='px-2 py-1'>{item.billingDate ? formatReadableDate(item.billingDate) : ''}</td>
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        ) : (
                            <span>no records found</span>
                        )
                    }
                    </div>
                </div>
            </div>
            <div className='p-4 flex justify-end'>
                <button className='bg-green-600 px-2 py-1 rounded text-white mr-2' onClick={createClick} >Create Accrual</button>
                <button className='bg-green-600 px-2 py-1 rounded text-white mr-2' onClick={createOrClick}>Create Order of Payment</button>
            </div>
        </Modal>
        <JournalModal 
            isOpen={jModal.show} 
            onClose={()=>setJModal({...jModal, show: false})}
            mode={jModal.mode}
            entryData={jModal.entryData}
            onSaveJournal={()=>{
                close();
            }} />
        <OrderOfPaymentModal 
            show={OrModal.show} 
            toCreate={OrModal.createList} 
            close={()=>{
                setOrModal({...OrModal, show: false, createList: []});
                close();
            }} />
        </>
    );
}

export default BatchAccrualModal;