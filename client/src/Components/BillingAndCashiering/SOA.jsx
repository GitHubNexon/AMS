import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react'
import { FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import RowEditor from './RowEditor';
import CurrencyInput from '../CurrencyInput';
import { numberToCurrencyString, formatDateToYYYMMdd, formatReadableDate } from '../../helper/helper';
import AccountPicker from '../AccountPicker';
import { showToast } from '../../utils/toastNotifications';
import SOAPrint from './SOAPrint';
import Billing from './Billing';

const rowsTemplate = {
    expanded: false,
    particulars1: '',
    particulars2: '',
    billingAmount: null,
    penalty: null,
    billAmountDue: null,
    billOutstandingBalance: null,
    dueDate: '',
    daysDelayed: '',
    paymentDate: '',
    paymentRefNo: '',
    paymentAmount: null,
    paymentAmountDue: null,
    paymentOutstandingBalance: null,
};

// data is subledger info
function SOA({ mode='add', slCode='', name='', soa=[], setSoa=()=>{}, data={}, refresh=()=>{} }) {

    const [ asofDate, setAsOfDate ] = useState('');
    const [rows, setRows] = useState([rowsTemplate]);
    // penalty percentage
    const [penalty, setPenalty] = useState(0);

    const [totalBillingAmount, setTotalBillingAmount] = useState(0);
    const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
    const [totalPenalty, setTotalPenalty] = useState(0);
    const [totalAmountDue, setTotalAmountDue] = useState(0);
    const [totalOutstandingBalance, setTotalOutstandingBalance] = useState(0); 

    const [account, setAccount] = useState(null);
    const [perBook, setPerBook] = useState(0);

    const tableRef = useRef(null);

    useEffect(()=>{
        if(!account && !asofDate) return;
        getBookBalance(account.code, slCode, asofDate );
    }, [account]);

    useEffect(()=>{
        console.log(mode);
        if(mode === 'add'){
            setAsOfDate('');
            // default
            setAccount({ code: "10301010B", name: "RENTAL RECEIVABLE" });
            setRows([rowsTemplate]);
            console.log(rows)
            getBookBalance("10301010B", slCode, formatDateToYYYMMdd(new Date()));
            setPerBook(0);
            setTotalBillingAmount(0);
            setTotalPaymentAmount(0);
            setTotalPenalty(0);
            setTotalAmountDue(0);
            setTotalOutstandingBalance(0);
        }else{
            setAccount(soa.account);
            setAsOfDate(formatDateToYYYMMdd(new Date(soa.date)));
            setRows(soa.rows);
            getBookBalance(soa.account.code, slCode, formatDateToYYYMMdd(new Date(soa.date)));
        }
    }, [mode]);

    useEffect(()=>{
        if(data && data.penalty){
            setPenalty(data.penalty);
        }
    }, [data]);

    useEffect(()=>{
        if(mode === 'add' && account){
            
            findLastEntry(asofDate);
        }
        if(account && asofDate){
            getBookBalance(mode === "edit" ? "10301010B" : account ? account.code: '10301010B', slCode, formatDateToYYYMMdd(new Date(asofDate)));
        }
    }, [asofDate, account]);
    
    async function findLastEntry(date){
        const response = await axios.get(`/soa/last/${slCode}/${account.code}`, { withCredentials: true });
        if(response.data){
            // check if date param is less than the date of last entry
            if(new Date(date) <= new Date(response.data.date)){
                setAsOfDate('');
                showToast(`Last SOA date is ${formatReadableDate(new Date(response.data.date))}`, 'warning');
            }else{
                if(response.data.rows.length > 0 && mode === 'add'){
                    const append = response.data.rows[response.data.rows.length - 1];
                    /**
                     * since this is add mode and we cannot proceed until date is filled, therefore the rows must be empty
                     * and we can append this row in first line. we added a field called preAdded so when asof date is changed later
                     * no changes will be made
                     */
                    append.preAdded = true;
                    const pre = rows.filter(f=>f.preAdded);
                    if(pre.length === 0){
                        console.log(append);
                        setRows(prevRows => [append, ...prevRows]);
                        // issue here auto compute is not triggered all the way to computing penalty
                        ayawMagCompute();
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (rows.length > 0) {
            // Total Billing Amount (Handling null/undefined)
            setTotalBillingAmount(rows.filter(f => numberBaIto(f.billingAmount)).map(m => m.billingAmount).reduce((pre, cur) => pre + cur, 0));
            // Total Payment Amount (Handling null/undefined)
            setTotalPaymentAmount(rows.filter(f => numberBaIto(f.paymentAmount)).map(m => m.paymentAmount).reduce((pre, cur) => pre + cur, 0));
            // Total Penalty (Handling null/undefined)
            setTotalPenalty(rows.filter(f => numberBaIto(f.penalty)).map(m => m.penalty).reduce((pre, cur) => pre + cur, 0));
            const bad = rows.filter(f =>numberBaIto(f.billAmountDue)).map(m=>m.billAmountDue);
            const pad = rows.filter(f =>numberBaIto(f.paymentAmountDue)).map(m=>m.paymentAmountDue);
            const ad = [...bad, ...pad].reduce((pre, cur)=>pre+cur,0);
            setTotalAmountDue(ad);
            const last = rows[rows.length - 1];
            let lad = 0;
            if(numberBaIto(last.billOutstandingBalance)){
                if(numberBaIto(last.paymentAmountDue)){
                    lad = last.billOutstandingBalance + last.paymentAmountDue;
                }else{
                    lad = last.billOutstandingBalance;
                }
            }
            setTotalOutstandingBalance(lad);
        }
    }, [rows]);

    async function getBookBalance(gl, sl, asofDate){
        // get book balance and variance
        const response = await axios.get(`/reports/book/summary?gl=${gl}&sl=${sl}&to=${asofDate}`, { withCredentials: true });
        setPerBook(response.data.debit - response.data.credit);
    }

    function ayawMagCompute(){
        /**
         * workaround kapag ayaw mag auto compute ng table
         * i trigger yung useEffect after 1/2 sec
         */
        const table = tableRef.current;
        if (table) {
            // Select the first row's third column input
            const input = table.querySelector("tbody tr:nth-child(1) td:nth-child(3) input");
            if (input) {
                input.focus();
                setTimeout(() => {
                    input.blur();
                }, 500); // Adjust timing if needed
            }
        }
    }

    function numberBaIto(n){
        // js boang 
        return typeof n === "number" && n !== null && n !== undefined;
    }

    function updateRow(index, whatArray, valueArray) {
        let newRows = [...rows];
        newRows[index] = { ...newRows[index] };
        // Ensure both arrays are the same length
        if (Array.isArray(whatArray) && Array.isArray(valueArray) && whatArray.length === valueArray.length) {
            for (let i = 0; i < whatArray.length; i++) {
                newRows[index][whatArray[i]] = valueArray[i];
            }
        } else {
            console.error("Mismatched or invalid parameters:", whatArray, valueArray);
            return;
        }
        // Fire twice due to unknown bug (assuming this is necessary)
        for (let t = 0; t < 2; t++) {
            // Recalculate for the entire array
            for (let i = 0; i < newRows.length; i++) {
                if (newRows[i]['dueDate']) {
                    newRows[i]['daysDelayed'] = newRows[i]['paymentDate']
                        ? getDaysDelayed(newRows[i]['dueDate'], newRows[i]['paymentDate'])
                        : getDaysDelayed(newRows[i]['dueDate'], asofDate);
                }
                // Compute penalty
                const p = parseFloat((newRows[i]['billingAmount'] * (penalty / 100) * newRows[i]['daysDelayed'] / 30).toFixed(2));
                newRows[i]['penalty'] = p;
                // Compute bill amount due
                newRows[i]['billAmountDue'] = newRows[i]['billingAmount'] + (newRows[i]['penalty'] || 0);
                // Compute paymentAmountDue
                newRows[i]['paymentAmountDue'] = newRows[i]['paymentAmount'];
                // Compute paymentOutstandingBalance
                if (newRows[i]['paymentAmountDue']) {
                    newRows[i]['paymentOutstandingBalance'] = parseFloat(newRows[i]['paymentAmountDue'] + newRows[i]['billOutstandingBalance']);
                }
                // Compute bill outstanding balance (depends on previous rows)
                if(!newRows[i].preAdded){
                    if (i > 0) {
                        const prevBillOutstanding = parseFloat(newRows[i - 1]['billOutstandingBalance'] + (newRows[i - 1]['paymentAmountDue'] || 0)) || 0;
                        newRows[i]['billOutstandingBalance'] = parseFloat(prevBillOutstanding + newRows[i]['billAmountDue']);
                    } else {
                        newRows[i]['billOutstandingBalance'] = parseFloat(newRows[i]['billAmountDue']);
                    }
                }
            }
        }
        setRows(newRows);
    }
    
    function getDaysDelayed(dueDate, paymentDate) {
        const due = new Date(dueDate);
        const payment = new Date(paymentDate);
        // Ensure valid date parsing
        if (isNaN(due) || isNaN(payment)) return 0;
        // Normalize to UTC (Fix: Months are zero-based)
        const dueUTC = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
        const paymentUTC = Date.UTC(payment.getFullYear(), payment.getMonth(), payment.getDate());
        // Ensure no negative values
        return paymentUTC > dueUTC ? (paymentUTC - dueUTC) / (1000 * 60 * 60 * 24) : 0;
    }

    function addNewRowClick(){
        setRows([...rows, rowsTemplate]);
    }

    function removeRow(index) {
        setRows(prevRows => prevRows.filter((_, i) => i !== index));
    }
    
    async function saveClick(){
        if(mode === 'add'){
            const soa = {
                account: account,
                slCode: slCode,
                name: name,
                date: asofDate,
                rows: rows
            };
            const data = await axios.post('/soa', soa, { withCredentials: true });
            console.log(data);
            setSoa(data.data);
            showToast("Saved successfuly", "success");
        }else{
            const savesoa = {
                account: account,
                slCode: slCode,
                name: name,
                date: asofDate,
                rows: rows
            };
            console.log(soa);
            await axios.patch(`/soa/${soa._id}`, savesoa, { withCredentials: true });
            showToast("Saved successfuly", "success");
        }
        refresh();
        // reset book balance

    }

    function moveUp(index) {
        setRows(prevRows => {
            if (index === 0) return prevRows; // Prevent moving the first item up
            const newRows = [...prevRows]; 
            [newRows[index], newRows[index - 1]] = [newRows[index - 1], newRows[index]]; // Swap items
            return [...newRows]; // Ensure React detects the change
        });
    }
    
    function moveDown(index) {
        const r = rows;
        setRows(prevRows => {
            if (index >= prevRows.length - 1) return prevRows; // Prevent moving the last item down
            const newRows = [...prevRows]; 
            [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]]; // Swap items
            return [...newRows]; // Ensure React detects the change
        });
    }
    
    return (
        <div className='flex flex-col h-[92vh]'>
            <div className='flex-1 flex flex-col border-b border-t overflow-y-scroll p-4 pb-[200px] relative'>
                {/* <div className='flex flex-col items-center mb-2'>
                    <span className='font-bold'>NATIONAL DEVELOPMENT COMPANY</span>
                    <span className='text-[0.8em]'>116 Tordesillas Street</span>
                    <span className='mb-4 text-[0.8em]'>Salcedo Village, Makati City</span>
                    <span className='font-bold'>STATEMENT OF ACCOUNT</span>
                </div>
                <div className='flex flex-col mb-4 items-start'>
                    <span className='font-bold bg-orange-200 mb-4'>{name}</span>
                    <div className='justify'>
                        <span className='mr-2'>Our records show that as of
                        <input type="date" className='border px-1 rounded shadow mx-2' value={asofDate} onChange={(e)=>setAsOfDate(e.target.value)} />
                        NDC has an outstanding
                        <div className='inline mx-2'><AccountPicker className={'max-w-[250px]'} nameOnly={true} selectedAccount={account} setSelectedAccount={setAccount} /></div>
                        of PHP {numberToCurrencyString(totalOutstandingBalance)} from {name}. detailed as follows:</span>
                    </div>
                </div> */}
                {
                    asofDate ? (
                    <>
                    <table className='border border-black text-[0.9em]' ref={tableRef} >
                        <thead className='sticky top-[-15px]'>
                            <tr className='bg-orange-200'>
                                <th className='border-r border-black'></th>
                                <th className='border-r border-black'></th>
                                <th className='border-r border-black'>BILLING</th>
                                <th className='border-r border-b border-black' colSpan={3}>PAYMENT</th>
                                <th className='border-r border-black'>PENALTY</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>OUTSTANDING</th>
                                <th className='border-r border-black'>DUE</th>
                                <th>DAYS</th>
                                <th></th>
                            </tr>
                            <tr className='border-b border-black bg-orange-200'> 
                                <th className='border-r border-black'></th>
                                <th className='border-r border-black'>PARTICULARS</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>DATE</th>
                                <th className='border-r border-black'>REF No.</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>{penalty > 0 ? `${penalty}% pa` : ''}</th>
                                <th className='border-r border-black'>DUE</th>
                                <th className='border-r border-black'>BALANCE</th>
                                <th className='border-r border-black'>DATE</th>
                                <th>DELAYED</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.map((item, index)=>
                                    <React.Fragment key={index}>
                                    {/* bill */}
                                    <tr className=''>
                                        <td rowSpan={2}>
                                            <button className='ml-2' onClick={()=>updateRow(index, ['expanded'], [!item.expanded])} >
                                                { item.expanded ? <FaChevronDown /> : <FaChevronRight /> }
                                            </button>
                                        </td>
                                        <td className='flex p-1'>
                                            <input 
                                                type="text" 
                                                className='border-b flex-1 p-1' 
                                                value={item.particulars1} 
                                                onChange={(e)=>updateRow(index, ['particulars1'], [e.target.value])} 
                                                placeholder='Type here' />
                                        </td>
                                        <td>
                                            <div className='flex'>
                                                <CurrencyInput
                                                    val={item.billingAmount} 
                                                    setVal={(v)=>updateRow(index, ['billingAmount'], [v])} 
                                                    className={'p-1 text-end flex-1 border-b w-[120px]'} />
                                            </div>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <div className='flex'>
                                                <CurrencyInput
                                                    val={item.penalty}
                                                    setVal={(v)=>updateRow(index, ['penalty'], [v])}
                                                    className={'w-[150px] p-1 text-center flex-1 border-b w-[120px]'} />
                                            </div>
                                        </td>
                                        <td>
                                            <div className='flex'>
                                                <CurrencyInput
                                                    val={item.billAmountDue}
                                                    setVal={(v)=>updateRow(index, ['billAmountDue'], [v])}
                                                    className={'p-1 text-center flex-1 border-b w-[120px]'} />
                                            </div>
                                        </td>
                                        <td className='text-end pr-3'>
                                            <div className='flex'>
                                                <CurrencyInput
                                                    val={item.billOutstandingBalance}
                                                    setVal={(v)=>updateRow(index, ['billOutstandingBalance'], [v])}
                                                    className={'p-1 text-center flex-1 border-b w-[120px]'} />
                                            </div>
                                        </td>
                                        <td>
                                            <input type="date"
                                                value={item.dueDate}
                                                onChange={(e)=>updateRow(index, ['dueDate'], [e.target.value])}
                                                className='p-[3px] border-b text-center' />
                                        </td>
                                        <td>
                                            <input type="number"
                                                value={item.daysDelayed}
                                                onChange={(e)=>updateRow(index, ['daysDelayed'], [e.target.value])}
                                                className='p-1 border-b text-center' />
                                        </td>
                                        <td className='p-1' >
                                            <button onClick={()=>moveUp(index)} >⬆</button>
                                        </td>
                                    </tr>
                                    {/* payment */}
                                    <tr className={`${!item.expanded && 'border-b border-black'}`}>
                                        <td className='flex p-1'>
                                            <input 
                                                type="text" 
                                                className='border-b flex-1 p-1' 
                                                value={item.particulars2} 
                                                onChange={(e)=>updateRow(index, ['particulars2'], [e.target.value])} 
                                                placeholder='Type here' />
                                        </td>
                                        <td></td>
                                        <td>
                                            <input 
                                                type="date" 
                                                value={item.paymentDate && item.paymentDate.replaceAll('/', '-')} 
                                                onChange={(e)=>updateRow(index, ['paymentDate'], [e.target.value])}
                                                className='border-b p-[3px] text-center' />
                                        </td>
                                        <td>
                                            <input 
                                                type="text"
                                                value={item.paymentRefNo}
                                                onChange={(e)=>updateRow(index, ['paymentRefNo'], [e.target.value])}
                                                className='p-1 border-b text-center' />
                                        </td>
                                        <td>
                                            <div className='flex'>
                                                <CurrencyInput 
                                                    val={item.paymentAmount} 
                                                    setVal={(v)=>updateRow(index, ['paymentAmount'], [v])} 
                                                    className={'p-1 flex-1 border-b text-center w-[120px]'} />
                                            </div>
                                        </td>
                                        <td></td>
                                        <td>
                                            <div className='flex'>
                                                <CurrencyInput
                                                    val={item.paymentAmountDue}
                                                    setVal={(v)=>updateRow(index, ['paymentAmountDue'], [v])}
                                                    className={'p-1 border-b text-center w-[120px]'} />
                                            </div>
                                        </td>
                                        <td>
                                            <CurrencyInput
                                                val={item.paymentOutstandingBalance}
                                                setVal={(v)=>updateRow(index, ['paymentOutstandingBalance'], [v])}
                                                className={'p-1 flex-1 border-b text-center w-[120px]'} />
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td className='p-1'>
                                            <button onClick={()=>moveDown(index)} >⬇</button>
                                        </td>
                                    </tr>
                                    {
                                        item.expanded &&
                                        <tr className='border-b border-black'>
                                            <td colSpan={10} className='p-1'>
                                                <RowEditor glCode={account.code} slCode={slCode} index={index} updater={updateRow} deleter={removeRow} />
                                            </td>
                                        </tr>
                                    }
                                    </React.Fragment>
                                )
                            }
                            <tr className='border-b border-black'>
                                <td className='p-1' colSpan={12}>
                                    <div className='p-2 flex items-center justify-center'>
                                        <button className='p-1 rounded-lg text-white bg-green-600' onClick={addNewRowClick} ><FaPlus /></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='font-bold bg-orange-200'>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'>TOTAL</td>
                                <td className='border-r border-black p-1 text-end'>{numberToCurrencyString(totalBillingAmount)}</td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1 text-center'>{numberToCurrencyString(totalPaymentAmount)}</td>
                                <td className='border-r border-black p-1 text-center'>{numberToCurrencyString(totalPenalty)}</td>
                                <td className='border-r border-black p-1 text-center'>{numberToCurrencyString(totalAmountDue < 0 ? 0 : totalAmountDue)}</td>
                                <td className='border-r border-black p-1 text-center'>{numberToCurrencyString(totalOutstandingBalance < 0 ? 0 : totalOutstandingBalance)}</td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='flex p-4'>
                        <div className='flex-1'></div>
                        <div className='flex flex-col mr-2'>
                            <span>Per book</span>
                            <input type="text" className='border py-1 rounded px-2' value={numberToCurrencyString(perBook)} readOnly={true} />
                        </div>
                        <div className='flex flex-col mr-2'>
                            <span>Variance</span>
                            <input type="text" className='border py-1 rounded px-2' value={numberToCurrencyString(perBook - totalOutstandingBalance - totalPenalty)} readOnly={true} />
                        </div>
                    </div>
                    </>
                    ) : (
                        <div className='flex items-center justify-center text-gray-500 p-4'>
                            <span>Please select (as of) date</span>
                        </div>
                    )
                }
            </div>
            <div className='flex p-4 text-[1.3em]'>
                <div className='flex flex-1 items-end'>
                    {/* {
                        soa && 
                        <Billing soa={soa} sl={{...data, penalty: penalty}} mode={mode} />
                    } */}
                    <SOAPrint soa={{
                        penalty: penalty,
                        asofDate: asofDate,
                        account: account,
                        rows: rows,
                        totalPaymentAmount: totalPaymentAmount,
                        totalPenalty: totalPenalty,
                        totalAmountDue: totalAmountDue,
                        totalOutstandingBalance: totalOutstandingBalance
                    }} />
                    {/* <button className='text-red-500 underline text-[0.8em]'>delete</button> */}
                </div>
                <button className='btn-primary' onClick={saveClick} >Save</button>
            </div>
        </div>
    );
}

export default SOA;