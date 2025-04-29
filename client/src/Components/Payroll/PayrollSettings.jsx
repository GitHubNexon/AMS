import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import AccountPicker from '../AccountPicker';
import { FaPlus, FaX } from 'react-icons/fa6';
import axios from 'axios';
import { showToast } from '../../utils/toastNotifications';
import SubledgerPicker from '../SubledgerPicker';

function PayrollSettings({show=false, close=()=>{}}) {

    const [earningRows, setEarningRows] = useState([]);
    const [deductionRows, setDeductionRows] = useState([]);

    useEffect(()=>{
        if(show){
            getRows();
        }
    }, [show]);

    async function getRows(){
        const response = await axios.get("/payroll/settings", { withCredentials: true });
        setEarningRows(response.data.filter(f=>f.type === "earning"));   
        setDeductionRows(response.data.filter(f=>f.type === "deduction"));
    }

    function plusClickEarnings(){
        setEarningRows([...earningRows, {
            name: "",
            type: "earning",
            debitTo: null,
            creditTo: null,
            creditToSL: null
        }]);
    }

    function plusClickDeductions(){
        setDeductionRows([...deductionRows, {
            name: "",
            type: "deduction",
            debitTo: null,
            creditTo: null,
            creditToSL: null,
        }]);
    }

    function xClickEarnings(index){
        setEarningRows([...earningRows.filter((_, idx)=>idx !== index)]);
    }

    function xClickDeductions(index){
        setDeductionRows([...deductionRows.filter((_, idx)=>idx !== index)]);
    }

    function earningsUpdate(index, field, value) {
        setEarningRows(prevEarnings => 
            prevEarnings.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        );
    }

    function deductionsUpdate(index, field, value) {
        setDeductionRows(prevDeductions => 
            prevDeductions.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        );
    }

    async function saveClick(){
        const newRows = [...earningRows, ...deductionRows];
        console.log(newRows);
        await axios.post("/payroll/settings", { rows: newRows }, { withCredentials: true });
        getRows();
        showToast("Setting saved", "success");
    }

    return (
        <Modal show={show} title='Payroll Settings' closeCallback={close}>
            <div className='flex-1 flex flex-col text-[0.8em] border-t border-b'>
                <div className='border m-2 p-1 rounded'>
                    <span>Earnings</span>
                    <div className='h-[30vh] overflow-y-scroll relative'>
                        <table className='w-[100%]'>
                            <thead>
                                <tr className='border-b sticky top-0 bg-white'>
                                    <th className='p-1 border-r'></th>
                                    <th className='p-1 border-r'>Description</th>
                                    <th className='p-1 border-r'>Debit to GL</th>
                                    {/* <th className='p-1 border-r'>Credit to GL</th>
                                    <th className='p-1'>Credit to SL</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    earningRows.map((item, index)=>
                                        <tr key={index}>
                                            <td>
                                                <div className='text-red-500 flex items-center justify-center p-1'>
                                                    <button onClick={()=>xClickEarnings(index)}><FaX /></button>
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className='border p-2 rounded' 
                                                    value={item.name} 
                                                    onChange={(e)=>earningsUpdate(index, "name", e.target.value)} />
                                            </td>
                                            <td>
                                                <AccountPicker 
                                                    className={'p-2'}
                                                    selectedAccount={item.debitTo}
                                                    setSelectedAccount={(v)=>earningsUpdate(index, "debitTo", v)} />
                                            </td>
                                            {/* <td>
                                                <AccountPicker 
                                                    className={'p-2'}
                                                    selectedAccount={item.creditTo}
                                                    setSelectedAccount={(v)=>earningsUpdate(index, "creditTo", v)} />
                                            </td>
                                            <td>
                                                <div className='min-w-[150px]'>
                                                    <SubledgerPicker
                                                        name={item.creditToSL?.name || ''}
                                                        slCode={item.creditToSL?.slCode || ''}
                                                        setAll={(v)=>earningsUpdate(index, "creditToSL", v)} />
                                                </div>
                                            </td> */}
                                        </tr>
                                    )
                                }
                                <tr>
                                    <td colSpan={5}>
                                        <div className='p-2 flex justify-center'>
                                            <button onClick={plusClickEarnings}><FaPlus /></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>  
                <div className='border m-2 p-1 rounded'>
                    <span>Deductions</span>
                    <div className='h-[30vh] overflow-y-scroll relative'>
                        <table className='w-[100%]'>
                            <thead>
                                <tr className='border-b sticky top-0 bg-white'>
                                    <th className='p-1 border-r'></th>
                                    <th className='p-1 border-r'>Description</th>
                                    <th className='p-1 border-r'>Debit to GL</th>
                                    {/* <th className='p-1 border-r'>Credit to GL</th>
                                    <th className='p-1'>Credit to SL</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    deductionRows.map((item, index)=>
                                        <tr key={index}>
                                            <td>
                                                <div className='text-red-500 flex items-center justify-center p-1'>
                                                    <button onClick={()=>xClickDeductions(index)}><FaX /></button>
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className='border p-2 rounded' 
                                                    value={item.name} 
                                                    onChange={(e)=>deductionsUpdate(index, "name", e.target.value)} />
                                            </td>
                                            <td>
                                                <AccountPicker 
                                                    className={'p-2'}
                                                    selectedAccount={item.debitTo}
                                                    setSelectedAccount={(v)=>deductionsUpdate(index, "debitTo", v)} />
                                            </td>
                                            {/* <td>
                                                <AccountPicker 
                                                    className={'p-2'}
                                                    selectedAccount={item.creditTo}
                                                    setSelectedAccount={(v)=>deductionsUpdate(index, "creditTo", v)} />
                                            </td>
                                            <td>
                                                <div className='min-w-[150px]'>
                                                    <SubledgerPicker
                                                        name={item.creditToSL?.name || ''}
                                                        slCode={item.creditToSL?.slCode || ''}
                                                        setAll={(v)=>deductionsUpdate(index, "creditToSL", v)} />
                                                </div>
                                            </td> */}
                                        </tr>
                                    )
                                }
                                <tr>
                                    <td colSpan={5}>
                                        <div className='p-2 flex justify-center'>
                                            <button onClick={plusClickDeductions}><FaPlus /></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='p-2 flex justify-center'>
                <button className='btn-primary' onClick={saveClick} >Save</button>
            </div>
        </Modal>
    );
}

export default PayrollSettings;