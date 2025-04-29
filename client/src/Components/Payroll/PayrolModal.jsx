import React, { useContext, useEffect, useState } from 'react';
import Modal from '../Modal';
import { FaGear, FaX } from 'react-icons/fa6';
import PayrollSettings from './PayrollSettings';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa6';
import SubledgerPicker from '../SubledgerPicker';
import CurrencyInput from '../CurrencyInput';
import { showToast } from '../../utils/toastNotifications';
import JournalModal from '../../Pop-Up-Pages/JournalModal';
import { LedgerSheetContext } from '../../context/LedgerSheetContext';

function PayrollModal({ data=null, open=false, close=()=>{}, refresh=()=>{}, id=null }) {

    const [_id, set_id] = useState(id); // refers to current payroll _id
    const {pushToGrid} = useContext(LedgerSheetContext);

    const [payrollSettings, setPayrollSettings] = useState(false);

    const [earningRows, setEarningRows] = useState([]);
    const [deductionRows, setDeductionRows] = useState([]);
    const [rows, setRows] = useState([]);

    const [linkedJournal, setLinkedJournal] = useState(null);

    function closer(){
        setLinkedJournal(null);
        setRows([]);
        set_id(null);
        close();
    }

    
    useEffect(()=>{
        if(open){
            getRows();
        }
    }, [open]);
    
    async function getRows(){
        const response = await axios.get("/payroll/settings", { withCrsedentials: true });
        setEarningRows(response.data.filter(f=>f.type === "earning"));   
        setDeductionRows(response.data.filter(f=>f.type === "deduction"));
        console.log(data);
        if(data){
            setRows(data.rows);
            set_id(data._id);
            setFrom(data.from.substr(0, 10));
            setTo(data.to.substr(0, 10));
            setLinkedJournal(data.linkedJournal ? data.linkedJournal : null);
        }
    }

    function plusClick() {
        setRows(prevRows => [
            ...prevRows,
            {
                workGroup: null,
                basicPay: null,
                overTime: null,
                underTime: null,
                // Dynamically add earning fields
                ...Object.fromEntries(earningRows.map(e => [e.name, null])),
                // Dynamically add deduction fields
                ...Object.fromEntries(deductionRows.map(d => [d.name, null]))
            }
        ]);
    }    

    function updateRow(index, field, value) {
        setRows(prev => 
            prev.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        );
    }

    function xClick(index){
        setRows([...rows.filter((_, idx)=>idx !== index)]);
    }

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [journalModal, setJournalModal] = useState({ show: false, entryData: {}, onSave: ()=>{}, mode: "payroll" });

    function openJournal(){
        setJournalModal({
            show: true,
            entryData: linkedJournal,
            mode: "edit"
        });
    }

    function nextClick(){
        if(!from || !to){
            showToast("Please select pay period.");
            return;
        }
        if(rows.length === 0) return;
        const check = rows.filter(f=>f.workGroup === null);
        if(check.length > 0){
            showToast("All rows must have workgroup", "warning");
            return;
        }
        
        setJournalModal({
            show: true,
            entryData: {
                JVNo: "",
                Particulars: `PAYROLL ENTRIES OF NDC REGULAR(PLANTILLA) OFFICERS/STAFF FOR THE MONTH OF ${formatDate(to)}`,
                Attachments: `PAYROLL COMPUTATION, DAILY TIME RECORD OF EMPLOYEES AND OTHER SUPPORTING DOCUMENTS`
            },
            mode: "payroll"
        });

        const sls = [];

        const table = [...earningRows, ...deductionRows];

        rows.forEach((item) => {
            const bp = item.basicPay + item.overTime - item.underTime;
            Object.keys(item).forEach((key) => {

                // Ignore static fields
                if (["overTime", "underTime", "workGroup"].includes(key)) return;
                if(key === "basicPay"){
                    sls.push({
                        ledger: {
                            code: "50101010",
                            name: "Salaries & Wages - Regular"
                        },
                        subledger: {
                            slCode: item.workGroup?.slCode || "",
                            name: item.workGroup?.name || ""
                        },
                        dr: bp,
                        cr: null
                    });
                }
    
                if (item[key]) {
                    const tableItem = table.find(f => f.name === key);
                    if (tableItem) {
                        sls.push({
                            ledger: {
                                code: tableItem.debitTo.code,
                                name: tableItem.debitTo.name
                            },
                            subledger: {
                                slCode: item.workGroup?.slCode || "",
                                name: item.workGroup?.name || ""
                            },
                            dr: item[key],
                            cr: null
                        });
                    }
                }

            });
        });

        sls.sort((a, b)=> a.ledger.code.localeCompare(b.ledger.code));
        pushToGrid(sls);
    }

    function closeJournal(){
        setJournalModal({ show: false, entryData: {}, onSave: ()=>{}, mode: "payroll" });
    }

    async function journalSaved(j){
        // link
        // check if this is a draft else save this to payroll database
        // no need condition: jv creation is restricted on front end unless payroll entry is saved
        if(_id){
            await axios.post('/payroll/link', { pId: _id, jId: j.entry._id }, { withCredentials: true });
        }
        setLinkedJournal(j.entry);
        refresh();
        closeJournal();
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: "numeric", month: "long" };
        return date.toLocaleDateString("en-US", options).toLocaleUpperCase();
    }

    async function saveClick(){
        const payroll = {
            from: from,
            to: to,
            rows: rows,
            _id: _id
        };
        const response = await axios.post("/payroll", payroll, { withCredentials: true });
        set_id(response.data._id);
        showToast("Saved!", "success");
    }

    return (
        <>
        <Modal show={open} closeCallback={closer} >
            <div className='flex-1 border-t border-b min-w-[96vw] text-[0.9em]'>
                <div className='py-2 px-4 flex'>
                    <div className='flex-1 flex'>
                        <div className='flex flex-col'>
                            <span>Pay period</span>
                            <div>
                                <input type="date" className='border p-1 rounded' value={from} onChange={(e)=>setFrom(e.target.value)} />
                                <span className='mx-2'>-</span>
                                <input type="date" className='border p-1 rounded' value={to} onChange={(e)=>setTo(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <button onClick={()=>setPayrollSettings(true)}>
                        <FaGear />
                    </button>
                </div>
                <div className='h-[70vh] overflow-y-scroll relative'>
                    <table className='w-[100%] text-[0.8em]'>
                        <thead>
                            <tr className='border-t'>
                                <th rowSpan={2}></th>
                                <th rowSpan={2} className='border-r sticky left-0 border-b border-l bg-gray-100 '>WORKGROUP</th>
                                <th colSpan={3 + earningRows.length} className='p-1 bg-green-100 border-r border-b'>EARNINGS</th>
                                <th colSpan={deductionRows.length} className='p-1 border-b bg-orange-100 border-r'>DEDUCTIONS</th>
                            </tr>
                            <tr className='border-b'>
                                <th className='p-1 border-r bg-green-100'>Basic Pay</th>
                                <th className='p-1 border-r bg-green-100'>Overtime</th>
                                <th className='p-1 border-r bg-orange-100'>Undertime</th>
                                {
                                    earningRows.map((item, index)=>
                                        <th key={index} className='p-1 border-r  bg-green-100'>{item.name}</th>
                                    )
                                }
                                {
                                    deductionRows.map((item, index)=>
                                        <th key={index} className='p-1 border-r bg-orange-100'>{item.name}</th>
                                    )
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.map((item, index)=>
                                    <tr key={index}>
                                        <td>
                                            <div className='flex items-center justify-center px-2'>
                                                <button className='text-[0.8em] text-red-500' onClick={()=>xClick(index)}><FaX /></button>
                                            </div>
                                        </td>
                                        <td className="bg-white sticky left-0">
                                            <div className='w-[250px] shadow-lg'>
                                                <SubledgerPicker name={item.workGroup?.name || ""} slCode={item.workGroup?.slCode || ""} setAll={(v)=>updateRow(index, "workGroup", v)} />
                                            </div>
                                        </td>
                                        <td>
                                            <CurrencyInput val={item.basicPay} setVal={(v)=>updateRow(index, "basicPay", v)} className={'border p-2 rounded'} />
                                        </td>
                                        <td>
                                            <CurrencyInput val={item.overTime} setVal={(v)=>updateRow(index, "overTime", v)} className={'border p-2 rounded'} />
                                        </td>
                                        <td>
                                            <CurrencyInput val={item.underTime} setVal={(v)=>updateRow(index, "underTime", v)} className={'border p-2 rounded'} />
                                        </td>
                                        {
                                            earningRows.map((itemE, indexE)=>
                                                <td key={indexE}>
                                                    <CurrencyInput val={item[itemE.name]} setVal={(v)=>updateRow(index, itemE.name, v)} className={'border p-2 rounded'} />
                                                </td>   
                                            )
                                        }
                                        {
                                            deductionRows.map((itemD, indexD)=>
                                                <td key={indexD}>
                                                    <CurrencyInput val={item[itemD.name]} setVal={(v)=>updateRow(index, itemD.name, v)} className={'border p-2 rounded'} />
                                                </td>  
                                            )
                                        }
                                    </tr>
                                )
                            }
                            <tr>
                                <td></td>
                                <td className='sticky left-0 z-10'>
                                    <div className='flex justify-center p-2'>
                                        <button className='bg-green-600 text-white p-1 rounded-lg' onClick={plusClick} ><FaPlus /></button>
                                    </div>
                                </td>
                                <td colSpan={2 + earningRows.length + deductionRows.length}>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='p-4 flex'>
                <div className='flex-1'>
                    
                </div>
                <button className='btn-secondary mr-4' onClick={saveClick} >Save</button>
                {
                    linkedJournal ? (
                        <button className='btn-primary mr-4' onClick={openJournal}>Open Journal</button>
                    ) : (
                        _id ? 
                        <button className='btn-primary mr-4' onClick={nextClick} >Create Journal</button> :
                        <span>save this payroll to create journal</span>
                    )
                }
            </div>
        </Modal>
        <PayrollSettings show={payrollSettings} close={()=>setPayrollSettings(false)} />
        <JournalModal
            isOpen={journalModal.show}
            onClose={closeJournal}
            entryData={journalModal.entryData}
            onSaveJournal={journalSaved}
            mode={journalModal.mode} />
        </>
    );
}

export default PayrollModal;