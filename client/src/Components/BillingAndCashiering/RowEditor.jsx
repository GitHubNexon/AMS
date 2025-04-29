import React, { useEffect, useState } from 'react';
import EntriesQuickBrowser from '../EntriesQuickBrowser';
import { IoEnter } from 'react-icons/io5'
import { numberToCurrencyString, formatDateToYYYMMdd } from '../../helper/helper';
import axios from 'axios';

function RowEditor({ glCode='', slCode='', index, updater=()=>{}, deleter=()=>{} }) {

    const [preField, setPreField] = useState('accrual');
    const [selected, setSelected] = useState([]);
    const [pushAs, setPushAs] = useState('bill');

    function formatDate(dateString) {
        const date = new Date(dateString);                                                 
        return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    }

    useEffect(()=>{
        console.log(glCode)
        if(glCode === '10301010B'){
            setPreField('accrual');
        }else if(glCode === '10301010D'){
            setPreField('other')
        }
    }, [glCode])
    
    async function pushClick(){
        if(selected.length < 0) return;
        const amount = selected.map(m=>m.SLDEBIT).reduce((pre,cur)=>pre+cur,0) - selected.map(m=>m.SLCREDIT).reduce((pre,cur)=>pre+cur,0);
        if(pushAs === 'bill'){
            // get month and year from first SLDATE
            const d = selected[0].SLDATE.split('/');
            // add loading here
            // currently if due date is not found in records, this will return the first day of the givem month
            const response = await axios.get(`/soa/duedate/${slCode}/${parseInt(d[1])}/${d[0]}`, { withCredentials: true });
            updater(
                index,
                ['particulars1', 'billingAmount', 'dueDate'],
                [formatDate(selected[0].SLDATE), amount, formatDateToYYYMMdd(new Date(response.data.duedate))]
            );
        }else{
            updater(
                index,
                ['paymentDate', 'paymentRefNo', 'paymentAmount'],
                [selected[0].SLDATE, selected[0].SLDOCNO, amount]
            );
        }
        setSelected([]);
    }

    return (
        <div className='flex flex-col'>
            <div className='flex'>
                <div className='flex-1 flex items-center'>
                    <span className='mr-4 ml-4 font-bold'>Entries</span>
                    <button 
                        className={`${preField === 'accrual' ? 'bg-green-500' : 'bg-gray-500'} text-white px-2 flex rounded-lg mr-2`} 
                        onClick={()=>setPreField('accrual')} >
                        Rental Accrual
                    </button>
                    <button 
                        className={`${preField === 'payment' ? 'bg-green-500' : 'bg-gray-500'} text-white px-2 flex rounded-lg mr-2`}
                        onClick={()=>setPreField('payment')} >
                        Payments
                    </button>
                    <button 
                        className={`${preField === 'other' ? 'bg-green-500' : 'bg-gray-500'} text-white px-2 flex rounded-lg mr-2`}
                        onClick={()=>setPreField('other')} >
                        other Income Rec
                    </button>
                </div>
                <button className='bg-red-600 text-[0.8em] text-white py-0 px-1 rounded-lg' onClick={()=>deleter(index)}>delete row</button>
            </div>
            <div className='flex relative'>
                <div className='p-2 w-[100%]'>
                    <EntriesQuickBrowser
                        selected={selected}
                        setSelected={setSelected}
                        preGL={preField === 'other' ? '10301010D' : '10301010B'}
                        preSL={slCode}
                        preEntry={preField === 'accrual' ? 'journal' : preField === 'payment' ? 'payment' : ''} />
                </div>
                <div className='flex bottom-0 right-0 items-center justify-center absolute'>
                    <div className='flex text-[1.2em] items-center'>
                        <span className='font-bold mr-3 text-[1.3em] whitespace-nowrap'>₱ {numberToCurrencyString(selected.map(m=>m.SLDEBIT).reduce((pre,cur)=>pre+cur,0) - selected.map(m=>m.SLCREDIT).reduce((pre,cur)=>pre+cur,0))}</span>
                        <span className='text-center mr-3'>as</span>
                        <select className='border px-2 py-1 mr-3 rounded' value={pushAs} onChange={(e)=>setPushAs(e.target.value)} >
                            <option value="bill">Bill</option>
                            <option value="payment">Payment</option>
                        </select>
                    </div>
                    <button onClick={pushClick} className='flex items-center border py-1 px-4 rounded-lg bg-green-600 text-white hover:bg-green-500 transition duration-500' >
                        <IoEnter className='-rotate-90 text-[2.5em] mr-2' />
                        <span>push</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RowEditor;