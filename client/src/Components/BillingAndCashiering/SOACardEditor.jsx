import React, { useEffect, useState, useRef } from 'react';
import Modal from '../Modal';
import CurrencyInput from '../CurrencyInput';
import axios from 'axios';
import { showToast } from '../../utils/toastNotifications';
import { formatDateToYYYMMdd, numberToCurrencyString } from '../../helper/helper';
import EntriesQuickBrowser from '../EntriesQuickBrowser';
import { MdFileUpload } from "react-icons/md";

const dr1 = {
    particular: '',
    billingAmount: null,
    penalty: null,
    amountDue: null,
    outstandingBalance: null,
    dueDate: '',
    daysDelayed: ''
};

const dr2 = {
    particular: '',
    paymentDate: '',
    paymentRefNo: '',
    paymentAmount: null,
    amountDue: null,
    outstandingBalance: null
};

function SOACardEditor({ show=false, close=()=>{}, data=null, mode='add', client={}, account={}, refresh=()=>{} }) {

    // billing
    const [row1, setRow1] = useState(dr1); 
    const row1Ref = useRef(); // ???
    // payment
    const [row2, setRow2] = useState(dr2);
    const [lastSoa, setLastSoa] = useState(null);
    const [isRentalEscalation, setIsRentalEscalation] = useState(false);
    const [rentalEscalationAsOf, setRentalEscalationAsOf] = useState('');
    // const [autoCompute, setAutoCompute] = useState(true);
    const [penalty, setPenalty] = useState(0);

    const [selectedEntries, setSelectedEntries] = useState([]);
    const [entriesAmount, setEntriesAmount] = useState(0);
    const [entriesPushMode, setEntriesPushMode] = useState('bill');


    useEffect(()=>{
        const totalDebit = selectedEntries.map(m=>m.SLDEBIT).reduce((pre,cur)=>pre+cur,0);
        const totalCredit = selectedEntries.map(m=>m.SLCREDIT * -1).reduce((pre,cur)=>pre+cur,0);
        setEntriesAmount(parseFloat((totalDebit + totalCredit).toFixed(2)));
    }, [selectedEntries]);

    // autofill: amount due on billing amount change
    useEffect(()=>{
        setRow1({
            ...row1, 
            amountDue: row1.billingAmount,
            // outstandingBalance: row1.billingAmount + row1.penalty + (lastSoa ? lastSoa.row2.outstandingBalance : 0)
        });
    }, [row1.billingAmount]);

    // autofill: outstanding balance on amout due change
    useEffect(()=>{
        setRow1({
            ...row1,
            outstandingBalance: row1.billingAmount + (row1.penalty ? row1.penalty : 0) + (lastSoa ? lastSoa.row2.outstandingBalance : 0) + row2.paymentAmount
        });
    }, [row1.amountDue]);

    // autofill: outstanding balance on payment amount change
    useEffect(()=>{
        setRow2({
            ...row2,
            amountDue: row2.paymentAmount
        });
    }, [row2.paymentAmount]);

    useEffect(()=>{
        setRow2({
            ...row2,
            outstandingBalance: row1.outstandingBalance + row2.amountDue
        });
    }, [row2.amountDue]);

    // autofill: days delayed on due date change
    useEffect(()=>{
        let d = 0;
        if(row1.dueDate){
            d = getDaysDelayed(new Date(row1.dueDate), row2.paymentDate ? new Date(row2.paymentDate) : '');
        };
        setRow1({
            ...row1,
            daysDelayed: d
        });
    }, [row1.dueDate, row2.paymentDate]);

    // autofill: penalty on days delayed
    useEffect(() => {
        setRow1(prevRow1 => ({
            ...prevRow1,
            penalty: row1.billingAmount * (penalty/100) * row1.daysDelayed / 30
        }));
    }, [row1.daysDelayed]);

    // autofill: amount due on penalty change
    useEffect(() => {
        setRow1({
            ...row1,
            amountDue: row1.penalty + row1.billingAmount
        });
    }, [row1.penalty]);

    useEffect(()=>{
        setRow2({
            ...row2,
            outstandingBalance: row2.amountDue + row1.outstandingBalance
        });
    }, [row1.outstandingBalance]);


    useEffect(()=>{
        if(client){
            if(client.penalty) setPenalty(client.penalty);
        }
        if(mode === "add"){
            reset();
            getLastEntry(null);
            // get last entry
        }else if(mode === 'edit' && data && show){
            // populate data
            getLastEntry(data._id);
            setRow1(data.row1);
            row1Ref.current = data.row1; 
            setRow2(data.row2);
            console.log(data.isRentalEscalation);
            setIsRentalEscalation(data.isRentalEscalation);
            setRentalEscalationAsOf(data ? data.rentalEscalationDate ? formatDateToYYYMMdd(new Date(data.rentalEscalationDate)) : "" : "");
        }
    }, [show]);

    function getDaysDelayed(dueDate, paymentDate) {
        const due = new Date(dueDate);
        const payment = paymentDate ? new Date(paymentDate) : new Date(); // Use paymentDate or current date
        // Calculate the difference in milliseconds
        const diffTime = payment - due;
        // Convert to days
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        // Ensure we return 0 if there is no delay
        return diffDays > 0 ? diffDays : 0;
    }

    async function getLastEntry(id){
        const response = await axios.get(`/statementOfAccount/last/${id ? id : 'latest'}/${client.slCode}`, { withCredentials: true });
        setLastSoa(response.data);
    }

    function saveClick(){
        // validate input
        if(!validation()) return;
        saveSoa();
    }

    function validation(){
        let flag = true;
        if(!row1.dueDate){
            if(!isRentalEscalation){
                flag = false;
                showToast("Enter due date", "warning");
            }else{
                if(!rentalEscalationAsOf){
                    flag = false;
                    showToast("Enter rental escalation as of date", "warning");    
                }
            }
        }

        return flag;
    }

    async function saveSoa(){
        if(mode === "add"){
            await axios.post('/statementOfAccount', {
                ledger: { code: account.code, name: account.name },
                subledger: { slCode: client.slCode, name: client.name },
                row1: row1,
                row2: row2,
                isRentalEscalation: isRentalEscalation,
                rentalEscalationDate: rentalEscalationAsOf
            }, { withCredentials: true });
            showToast("Saved successfuly", "success");
            close();
            reset();
        }else if(mode === "edit"){
            await axios.patch(`/statementOfAccount/${data._id}`, {
                ledger: { code: account.code, name: account.name },
                subledger: { slCode: client.slCode, name: client.name },
                row1: row1,
                row2: row2,
                isRentalEscalation: isRentalEscalation,
                rentalEscalationDate: rentalEscalationAsOf
            }, { withCredentials: true });
            showToast("Saved successfuly", "success");
        }
        refresh();
    }

    function reset(){
        setRow1(dr1);
        setRow2(dr2);
        setIsRentalEscalation(false);
    }
    
    const [messageBox, setMessageBox] = useState({ show: false, message: '', callback: ()=>{} });

    function deleteClick(){
        setMessageBox({
            show: true,
            message: "Are you sure you want to delete this row?",
            callback: async ()=>{
                await axios.delete(`/statementOfAccount/${data._id}`, { withCredentials: true });
                showToast("Deleted successfuly", "success");
                setMessageBox({ show: false, message: '', callback: ()=>{} });
                close();
                reset();
                refresh();
            }
        });
    }

    function formatDateToDayMonthYear(date) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate(); // Get day of the month
        const month = months[date.getMonth()]; // Get abbreviated month name
        const year = date.getFullYear(); // Get full year
        return `${day}-${month}-${year}`;
    }

    function numberify(amount){
        return amount ? numberToCurrencyString(amount) : '';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);                                                 
        return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    }

    async function pushClick(){
        if(selectedEntries.length === 0) return;
        console.log(entriesAmount, entriesPushMode);
        switch(entriesPushMode){
            case "bill":
                // find if there is related due date on this month
                const d = selectedEntries[0].SLDATE.split('/');
                const response = await axios.get(`/soa/duedate/${client.slCode}/${parseInt(d[1])}/${d[0]}`, { withCredentials: true });
                console.log(response.data);
                setRow1({
                    ...row1,
                    particular: formatDate(selectedEntries[0].SLDATE),
                    billingAmount: entriesAmount,
                    dueDate: formatDateToYYYMMdd(new Date(response.data.duedate))
                });
            break;
            case "payment":
                setRow2({
                    ...row2,
                    paymentAmount: entriesAmount * -1,
                    paymentDate: selectedEntries[0].SLDATE,
                    paymentRefNo: selectedEntries[0].SLDOCNO
                });
            break;
            case "escalation":
                setRow1({
                    ...row1,
                    particular: "Rental rate escalation",
                    billingAmount: entriesAmount
                }); 
                setIsRentalEscalation(true);
                setRow2(dr2);
                setRentalEscalationAsOf(selectedEntries[0].SLDATE);
            break;
        };
        setSelectedEntries([]);
    };
    
    return (
        <>
        <Modal show={show} closeCallback={close} title={`${mode} ${mode === 'add' ? 'new' : ''} row`} >
            <div className='flex-1 border-t border-b p-2 min-h-[70vh]'>
                <div className='overflow-x-scroll pb-4'>
                    <table className='text-[0.9em]'>
                        <thead className='sticky top-[-15px]'>
                            <tr className='bg-orange-200 border-t border-black'>
                                <th className='border-r border-l border-black p-1'></th>
                                <th className='border-r border-black p-1'>BILLING</th>
                                <th colSpan={3} className='border-r border-b border-black p-1'>PAYMENT</th>
                                <th className='border-r border-black p-1'>PENALTY</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-black p-1'>OUTSTANDING</th>
                                <th className='border-r border-black p-1'>DUE</th>
                                <th className='border-r border-black p-1'>DAYS</th>
                            </tr>
                            <tr className='border-b border-black bg-orange-200'> 
                                <th className='border-r border-l border-black p-1'>PARTICULARS</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-t border-black p-1'>DATE</th>
                                <th className='border-r border-black p-1'>REF No.</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-black p-1'>{penalty ? `${penalty}% pa` : ''}</th>
                                <th className='border-r border-black p-1'>DUE</th>
                                <th className='border-r border-black p-1'>BALANCE</th>
                                <th className='border-r border-black p-1'>DATE</th>
                                <th className='border-r border-black p-1'>DELAYED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* last soa */}
                            {
                                lastSoa &&
                                <>
                                    <tr className='bg-gray-100'>
                                        <td className='max-2-[200px]'>
                                            <div className='flex flex-col items-start'>
                                                <span className='bg-green-500 text-white mb-1 flex overflow-hidden pl-2'>
                                                    prev row
                                                    <div className='w-[20px] h-[20px] bg-gray-100 ml-2 rotate-[45deg] translate-x-[10px]'></div>
                                                </span>
                                                <span>{lastSoa.row1.particular}</span>                                    
                                            </div> 
                                        </td>
                                        <td className='text-end'>{ numberify(lastSoa.row1.billingAmount) }</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row1.penalty) }</td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row1.amountDue) }</td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row1.outstandingBalance) }</td>
                                        <td className='p-1 text-center' >{ lastSoa ? lastSoa.row1.dueDate ? formatDateToDayMonthYear(new Date(lastSoa.row1.dueDate)) : "" : "" }</td>
                                        <td className='p-1 text-center' >{ lastSoa.row1.daysDelayed }</td>
                                    </tr>
                                    <tr className='bg-gray-100'>
                                        <td className='p-1' >
                                            <div className='max-w-[200px]'>
                                                <span>{ lastSoa.row2.particular }</span>
                                            </div>
                                        </td>
                                        <td className='p-1' ></td>
                                        <td className='p-1 text-center' >{ lastSoa ? lastSoa.row2.paymentDate ? formatDateToDayMonthYear(new Date(lastSoa.row2.paymentDate)) : '' : '' }</td>
                                        <td className='p-1 text-center' >{lastSoa.row2.paymentRefNo}</td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row2.paymentAmount) }</td>
                                        <td className='p-1' ></td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row2.amountDue) }</td>
                                        <td className='p-1 text-end' >{ numberify(lastSoa.row2.outstandingBalance) }</td>
                                        <td className='p-1' ></td>
                                        <td className='p-1' ></td>
                                    </tr>
                                </>
                            }

                            {/* bill */}
                            <tr className='border-t'>
                                <td className='p-1'>
                                    <input 
                                        type="text"
                                        className='border-b' 
                                        value={row1.particular} 
                                        onChange={(e)=>setRow1({...row1, particular: e.target.value})} />
                                </td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row1.billingAmount) ? null : row1.billingAmount} 
                                        setVal={(v)=>setRow1({...row1, billingAmount: v})} />
                                </td>
                                <td className='p-1'></td>
                                <td className='p-1'></td>
                                <td className='p-1'></td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row1.penalty) ? null : row1.penalty} 
                                        setVal={(v)=>setRow1({...row1, penalty: v})} />
                                </td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row1.amountDue) ? null : row1.amountDue} 
                                        setVal={(v)=>setRow1({...row1, amountDue: v})} />
                                </td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row1.outstandingBalance) ? null : row1.outstandingBalance} 
                                        setVal={(v)=>setRow1({...row1, outstandingBalance: v})} />
                                </td>
                                <td className='p-1'>
                                    <input 
                                        type="date"
                                        className='border-b w-[95px] text-center' 
                                        value={ row1.dueDate ? formatDateToYYYMMdd(new Date(row1.dueDate)) : '' } 
                                        onChange={(e)=>setRow1({...row1, dueDate: e.target.value})}  />
                                </td>
                                <td className='p-1'>
                                    <input 
                                        type="number" 
                                        className='border-b w-[80px] text-center' 
                                        value={row1.daysDelayed ? row1.daysDelayed : 0} 
                                        onChange={(e)=>setRow1({...row1, daysDelayed: e.target.value})} />
                                </td>
                            </tr>

                            {/* payment */}
                            <tr>
                                <td className='p-1'>
                                    <input 
                                        type="text"
                                        className='border-b' 
                                        value={row2.particular} 
                                        onChange={(e)=>setRow2({...row2, particular: e.target.value})} />
                                </td>
                                <td className='p-1'></td>
                                <td className='p-1'>
                                    <input 
                                        type="date"
                                        className='border-b w-[95px] text-center' 
                                        value={row2.paymentDate ? formatDateToYYYMMdd(new Date(row2.paymentDate)) : ''} 
                                        onChange={(e)=>setRow2({...row2, paymentDate: e.target.value})}  />
                                </td>
                                <td className='p-1'>
                                    <input 
                                        type="text"
                                        className='border-b w-[100px] text-center' 
                                        value={row2.paymentRefNo} 
                                        onChange={(e)=>setRow2({...row2, paymentRefNo: e.target.value})} />
                                </td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row2.paymentAmount) ? null : row2.paymentAmount} 
                                        setVal={(v)=>setRow2({...row2, paymentAmount: v * -1})} />
                                </td>
                                <td className='p-1'></td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row2.amountDue) ? null : row2.amountDue} 
                                        setVal={(v)=>setRow2({...row2, amountDue: v})} />
                                </td>
                                <td className='p-1'>
                                    <CurrencyInput 
                                        className={'border-b w-[120px] text-end'}
                                        val={isNaN(row2.outstandingBalance) ? null : row2.outstandingBalance} 
                                        setVal={(v)=>setRow2({...row2, outstandingBalance: v})} />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={10}>
                                    <div className='border-b p-1 flex'>
                                        <label className='mx-4 flex items-center'>
                                            <input type="checkbox" className='mr-1' checked={isRentalEscalation} onChange={(e)=>setIsRentalEscalation(e.target.checked)} />
                                            Rental Rate Escalation
                                        </label>
                                        {
                                            isRentalEscalation &&
                                            <div className='flex items-center'>
                                                <span className='mr-2'>As of</span>
                                                <input 
                                                    type="date" 
                                                    className='border px-1 rounded' 
                                                    value={ rentalEscalationAsOf ? formatDateToYYYMMdd(new Date(rentalEscalationAsOf)) : '' } 
                                                    onChange={(e)=>setRentalEscalationAsOf(e.target.value)} />
                                            </div>
                                        }
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='mt-4 text-[0.8em]'>
                    <div className='flex text-[1.3em]'>
                        <div className='flex-1 flex'>
                            <span>find from entries</span>
                        </div>
                        <div className='flex items-center mr-4'>
                            <span className='mr-2'>Amount:</span>
                            <input type="text" className='border p-1 rounded mr-2' value={numberToCurrencyString(parseFloat(entriesAmount.toFixed(2)))} readOnly />
                            <span className='mr-2'>push as</span>
                            <select className='border p-1 rounded mr-2' value={entriesPushMode} onChange={(e)=>setEntriesPushMode(e.target.value)}>
                                <option value="bill">Bill</option>
                                <option value="payment">Payment</option>
                                <option value="escalation">Escalation</option>
                            </select>
                            <button className='btn-primary text-[1.5em]' onClick={pushClick} ><MdFileUpload /></button>
                        </div>
                    </div>
                    <EntriesQuickBrowser
                        selected={selectedEntries}
                        setSelected={setSelectedEntries}
                        preGL={account.code}
                        preSL={client.slCode} />
                </div>
            </div>
            <div className='flex justify-end py-2 px-4'>
                <div className='flex-1'>
                    {
                        mode === 'edit' && data &&
                        <button className='underline text-red-500' onClickCapture={deleteClick} >delete</button>
                    }
                </div>
                <button className='btn-primary text-[1.2em]' onClick={saveClick} >Save</button>
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessageBox({ show: false, message: '', callback: ()=>{} })} >
            <div className='flex-1 border-t border-b p-4 flex items-center justify-center'>
                <span className='text-center text-[1.3em]'>{messageBox.message}</span>
            </div>
            <div className='p-2 flex justify-center'>
                <button className='btn-primary' onClick={messageBox.callback} >Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default SOACardEditor;