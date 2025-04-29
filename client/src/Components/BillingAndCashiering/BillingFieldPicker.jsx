import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import { numberToCurrencyString } from '../../helper/helper';

function BillingFieldPicker({ open=false, close=()=>{}, select=()=>{}, slCode, soa=null }) {

    const [rows, setRows] = useState([]);
    const [particular, setParticular] = useState('');
    const [amount, setAmount] = useState(0);
    const [dueDate, setDueDate] = useState('');

    // search soas and provide a field picker
    useEffect(()=>{
        if(!soa.rows) return;
        if(soa.rows.length > 0){
            // maybe if no soa selected (current soa opened is not saved yet) search from other soa using slCode?
            setRows(soa.rows.map((item, index)=>({...item, index: index, checked: false})));
        }
    }, [open]);

    useEffect(()=>{
        const r = rows.filter(f=>f.checked);
        if(r.length > 0){
            setParticular(r[r.length - 1].particulars1);
            setAmount(r.map(m=>m.billOutstandingBalance).reduce((pre,cur)=>pre+cur,0));
            setDueDate(r[r.length - 1].dueDate);
        }
    }, [rows]);

    function confirmClick(){
        const r = rows.filter(f=>f.checked);
        if(r.length > 0) select(particular, amount, dueDate);
    }

    function selectItem(item, e){
        setRows((prevRows)=> prevRows.map((row, i)=> i === item.index ? { ...row, checked: e.target.checked } : row));
    }

    return (
        <>
            <Modal show={open} closeCallback={close} >
                <div className='flex-1 border-t border-b min-h-[70vh] max-h-[70vh] overflow-y-scroll relative'>
                    <table className='text-[0.8em] w-[100%]'>
                        <thead>
                            <tr className='border-b sticky top-0 bg-white'>
                                <th className='border-r p-1'></th>
                                <th className='border-r p-1'>PARTICULARS</th>
                                <th className='border-r p-1'>AMOUNT</th>
                                <th className='p-1'>DUE DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.map((item, index)=>
                                    <tr key={index} className='border-b' >
                                        <td className='border-r p-1'>
                                            <input type="checkbox" checked={item.checked} onChange={(e)=>selectItem(item, e)} />
                                        </td>
                                        <td className='border-r p-1'>{item.particulars1}</td>
                                        <td className='border-r p-1'>{item.billOutstandingBalance && numberToCurrencyString(item.billOutstandingBalance)}</td>
                                        <td className='p-1'>{item.dueDate}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                <div className='py-2 px-4 flex justify-end'>
                    <div className='flex-1'>
                        <input type="text" className='border p-1 rounded' value={particular} onChange={(e)=>setParticular(e.target.value)} />
                        <input type="text" className='border p-1 roudned' value={numberToCurrencyString(amount)} readOnly />
                    </div>
                    <button className='btn-primary' onClick={confirmClick} >Confirm</button>
                </div>
            </Modal>
        </>
    );
}

export default BillingFieldPicker;