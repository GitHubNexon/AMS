import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import logo from '../../assets/images/NDC_BG.png'
import { FaPlus, FaBook } from 'react-icons/fa6';
import CurrencyInput from '../CurrencyInput';
import BillingFieldPicker from './BillingFieldPicker';
import { formatReadableDate, numberToCurrencyString } from '../../helper/helper';

function Billing({ soa=null, sl={}, mode='add' }) {
    
    const [show, setShow] = useState(false);

    const [billingInvoice, setBillingInvoice] = useState('');
    const [date, setDate] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [tin, setTin] = useState('');

    const [rows, setRows] = useState([]);
    const [bookIndex, setBookIndex] = useState(null);
    const [billPickerModal, setBillPickerModal] = useState(false);

    const [totalAmount, setTotalAmount] = useState(0);
    
    // get sl info from slCode
    useEffect(()=>{
        if(sl){
            setCustomerName(sl.name);
            setTin(sl.tin);
            setAddress(sl.address);
        }
    }, [sl]);

    useEffect(()=>{
        if(!rows.length > 0) return;
        setTotalAmount(rows.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0))
    }, [rows]);

    // toggle between create and edit mode
    
    function saveClick(){
        console.log(soa);
        console.log(rows);
        if(mode === 'add'){

            // save this billing info


        }
    }

    function billingClick(){
        setShow(true);
    }

    function plusClick(){
        setRows([...rows, {
            qty: '',
            particulars: '',
            amount: 0
        }]);
    }

    function updateRow(index, fields, values) {
        setRows((prevRows) =>
            prevRows.map((row, i) => i === index ? {
                ...row,
                ...Object.fromEntries(fields.map((field, j) => [field, values[j]])),
            } : row)
        );
    }
    
    function removeIndex(index){
        setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    }

    const [dueDate, setDueDate] = useState('');

    function bookSelect(particular, amount, dueDate){
        updateRow(bookIndex, ['particulars', 'amount'], [particular, amount]);
        setBillPickerModal(false);
        setBookIndex(null);
        setDueDate(dueDate);
    }

    function bookClick(index){
        setBookIndex(index);
        setBillPickerModal(true);
    }

    return (
        <>
            <button className='btn-primary mr-4' onClick={billingClick} >Billing</button>
            <Modal show={show} closeCallback={()=>setShow(false)} >
            <div className='flex'>
                <div className='border-t border-b w-[100px] border-r shadow flex flex-col p-2'>
                    <button className='btn-primary text-[0.8em]'>Create new</button>
                </div>
                <div className='flex-1 border-t border-b flex flex-col p-2 min-h-[80vh] max-h-[80vh] overflow-y-scroll'>
                    <div className='flex flex-col border-b border-black'>

                        <div className='flex'>
                            <div className='flex flex-col text-[0.6em] items-center justify-end flex-[1]'>
                                <img src={logo} className='h-[70px] w-[100px]' />
                                <div className='flex flex-col text-[0.8em] text-center items-center mb-2 flex-[1]'>
                                    <span>Tel No: 8840-4838 Loc. 236</span>
                                    <span>(Cashier)</span>
                                    <span>www.ndc.gov.ph</span>
                                    <span>info@ndc.gov.ph</span>
                                </div>
                            </div>
                            <div className='flex flex-col text-center text-[0.8em] px-4 flex-[3]'>
                                <span className='font-bold mb-1 text-[1.1em]'>National Development Company</span>
                                <span>NDC Bldg., 116 Tordesillas Street</span>
                                <span>Salcedo Village, Makati City, Philippines 1227</span>
                                <span>VAT Reg. TIN: 000-164-120-00000</span>
                            </div>
                            <div className='flex-[1]'>

                            </div>
                        </div>
                        <div className='flex'>
                            <div className='flex flex-col text-[0.6em] items-center flex-[1]'>
                
                            </div>
                            <div className='flex-[3]'>

                            </div>
                            <div className='flex flex-col justify-end items-end text-[0.9em] ml-4 mb-2 flex-[1]'>
                                <div className='flex'>
                                    <span className='mr-2 w-[130px]'>BILLING INVOICE:</span>
                                    <input type="text" className='border-b w-[150px]' value={billingInvoice || ''} onChange={(e)=>setBillingInvoice(e.target.value)} />
                                </div>
                                <div className='flex'>
                                    <span className='mr-2 w-[130px] text-end'>DATE:</span>
                                    <input type="date" className='border-b w-[150px]' value={date || ''} onChange={(e)=>setDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='m-1 border border-black flex flex-col p-1 text-[0.8em]'>
                        <div className='flex mb-1'>
                            <span className='w-[140px] p-1'>CUSTOMER NAME:</span>
                            <textarea className='border-b flex-1 resize-none p-1' value={customerName || ''} onChange={(e)=>setCustomerName(e.target.value)} ></textarea>
                        </div>
                        <div className='flex mb-1'>
                            <span className='w-[140px] p-1'>ADDRESS:</span>
                            <textarea className='border-b flex-1 resize-none p-1' value={address || ''} onChange={(e)=>setAddress(e.target.value)} ></textarea>
                        </div>
                        <div className='flex mb-1'>
                            <span className='w-[140px] p-1'>TIN:</span>
                            <input type="text" className='border-b flex-1 p-1' value={tin || ''} onChange={(e)=>setTin(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <table className='border border-black m-1 w-[100%] text-[0.9em]'>
                            <thead>
                                <tr className='border-b border-black'>
                                    <th></th>
                                    <th className='p-1 text-center' >Qty.</th>
                                    <th className='p-1 text-center' >Unit</th>
                                    <th className='p-1 text-center border-r border-black min-w-[300px]' >PARTICULARS</th>
                                    <th className='p-1 text-center' >AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    rows.map((item, index)=>
                                        <tr key={index}>
                                            <td className='p-1 flex items-center'>
                                                <button className='text-red-500 mr-2' onClick={()=>removeIndex(index)} >x</button>
                                                <button className='mr-2 text-green-700' onClick={()=>bookClick(index)} >
                                                    <FaBook />
                                                </button>
                                            </td>
                                            <td className='pt-[16px]'>
                                                <input 
                                                    type="text" 
                                                    className='border-b text-center w-[120px]' 
                                                    value={item.qty || ''} 
                                                    onChange={(e)=>updateRow(index, ['qty'], [e.target.value])} />
                                            </td>
                                            <td className='border-r border-black' colSpan={2}>
                                                <textarea  
                                                    className='border-b w-[100%]'
                                                    value={item.particulars || ''}
                                                    onChange={(e)=>updateRow(index, ['particulars'], [e.target.value])} >
                                                </textarea>
                                                {/* <input type="text" className='border-b w-[100%]' value={item.particulars} onChange={(e)=>updateRow(index, ['particulars'], [e.target.value])} /> */}
                                            </td>
                                            <td className='pt-[16px]'>
                                                <CurrencyInput val={item.amount} setVal={(v)=>updateRow(index, ['amount'], [v])} acceptZero={false} className={'border-b text-end px-2'} />
                                            </td>
                                        </tr>
                                    )
                                }
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className='border-r border-black p-1'>
                                        <button className='btn-primary' onClick={plusClick} ><FaPlus /></button>
                                    </td>
                                    <td></td>
                                </tr>
                                {
                                    (dueDate && soa.penalty) &&
                                    <>
                                        <tr>
                                            <td className='p-1 flex items-center'>
                                                <button className='text-red-500 mr-2' onClick={()=>setDueDate('')} >x</button>
                                            </td>
                                            <td></td>
                                            <td colSpan={2} className='border-r border-black text-[0.7em]' >
                                                <span className='font-bold'>Due date:</span> { formatReadableDate(new Date(dueDate)) }
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td colSpan={2} className='border-r border-black text-[0.7em]' >
                                                In case of failure or delay in monthly payment of rental, lessee shall pay
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td colSpan={2} className='border-r border-black text-[0.7em]' >
                                                interest thereon at per month untill full payment thereof
                                            </td>
                                            <td></td>
                                        </tr>
                                    </>
                                }
                                <tr>
                                    <td colSpan={4} className='h-[25px] border-r border-black'></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>VATable Sales</td>
                                    <td colSpan={2} className='border-r border-black text-end pr-2'>Total Sales (VAT inclusive)</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2} >VAT-Excempt Sales</td>
                                    <td colSpan={2} className='border-r border-black text-end pr-2'>Less: VAT</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2} >Zero Rated Sales</td>
                                    <td colSpan={2} className='border-r border-black text-end pr-2'>Amount: Net of VAT</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2} >VAT Amount</td>
                                    <td colSpan={2} className='border-r border-black text-end pr-2'>Amount Due</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2}></td>
                                    <td colSpan={2} className='border-r border-black text-end pr-2'>Add: VAT</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={2}></td>
                                    <td colSpan={2} className='border-r border-black text-end font-bold pr-2'>TOTAL AMOUNT DUE</td>
                                    <td className='text-end px-2'>{totalAmount > 0 ? numberToCurrencyString(totalAmount) : ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='flex py-2 px-4 text-[0.8em] items-center justify-end'>
                <button className='btn-secondary mr-2' >Send</button>
                <button className='btn-secondary mr-2'>Print</button>
                <button className='btn-primary mr-2' onClick={saveClick} >Save</button>
            </div>
            </Modal>
            <BillingFieldPicker 
                open={billPickerModal} 
                close={()=>setBillPickerModal(false)}
                slCode={sl}
                soa={soa}
                select={bookSelect} />
        </>
    )
};

export default Billing