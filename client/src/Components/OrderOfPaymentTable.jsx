import React, { useContext, useEffect, useState } from 'react';
import OrderOfPaymentModal from './OrderOfPaymentModal';
import { FaChevronLeft } from 'react-icons/fa6';
import { FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { formatDateToYYYMMdd, formatReadableDate } from '../helper/helper';
import ReceiptModal from '../Pop-Up-Pages/ReceiptModal';
import { LedgerSheetContext } from '../context/LedgerSheetContext';
import { useAuth } from '../context/AuthContext';
import { IoRefresh } from 'react-icons/io5';
import { numberToCurrencyString } from '../helper/helper';

function OrderOfPaymentTable() {

    const {pushToGrid} = useContext(LedgerSheetContext);
    const {user} = useAuth();

    const [OrModal, setOrModal] = useState({show: false, editList: [], createList: []});
   
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [date, setDate] = useState('');
    const [search, setSearch] = useState('');
    const [debounceSearch, setDebounceSearch] = useState('');
    const [noCashReceipt, setNoCashReceipt] = useState(false);
    const [noDepositSlip, setNoDepositSlip] = useState(false);

    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState([]);
    const [docsCount, setDocsCount] = useState(0);

    const [imbalance, setImbalance] = useState([]);
   
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearch(debounceSearch);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [debounceSearch]);

    useEffect(()=>{
        getOrList();
        getImbalance();
    }, [page, limit, date, search, noCashReceipt, noDepositSlip]);

    async function getImbalance(){
        const response = await axios.get(`/or/imbalance`, { withCredentials: true });
        setImbalance(response.data);
    }

    async function getOrList(){
        console.log("getting or list");
        const response = await axios.get(
            `/or?date=${date}&search=${search}&page=${page}&limit=${limit}&noCashReceipt=${noCashReceipt}&noDepositSlip=${noDepositSlip}`, 
            {withCredentials: true}
        );
        if(response.data.or.length === 0 && page > 1){
            setPage(page - 1);
            return;
        }
        setRows(response.data.or);  
        setDocsCount(response.data.count);
    }

    async function refresher(updated){
        // setSelected([]);
        const s = selected;
        for(let i = 0; i < s.length; i++){
            const f = updated.filter(f=>f._id === s[i]._id)
            if(f.length === 1){
                s[i] = f[0];
            }
        }
        const newAdded = updated.filter(f=> !selected.map(m=>m._id).includes(f._id)).filter(f=>f._id);
        console.log("newly added to append in selected", newAdded);
        setSelected([...s, ...newAdded]);
        await getOrList();
    }

    function createClick(){
        // opens OR modal and set 1 empty card
        setOrModal({
            show: true, 
            editList: [],
            createList: [
                {
                    orderOfPaymentNo: '', date: '', client: { slCode: '', name: '' }, amount: 0, remarks: '',
                    gl: [
                        { code: "10301010B", name: "RENTAL RECEIVABLE", amount: 0 },
                        { code: "19902080", name: "Withholding Tax at Source", amount: 0 },
                        { code: "20501030", name: "Output Tax", amount: 0}
                    ]
                }
            ]
        });
    }

    function checkRow(e, item){
        if(e){
            setSelected([...selected, item]);
        }else{
            setSelected(selected.filter(f=>f._id !== item._id));
        }
    }

    function prevClick(){
        if(page <= 1) return;
        setPage(page - 1);
    }

    function nextClick(){
        setPage(page + 1);
    }

    function openOrClick(){
        // format selected to OR cards
        const f = selected.map(m=>({ ...m, date: formatDateToYYYMMdd(new Date(m.date)) }));
        setOrModal({show: true, editList: f});
    }

    const [receiptModal, setReceiptModal] = useState({ show: false, entryData: {}, onSave: ()=>{}, mode: "OR" });

    function close(){
        setReceiptModal({ show: false, entryData: {}, onSave: ()=>{}, mode: "OR" });
        getOrList();
    }

    async function openReceipt(item, entryId){
        const response = await axios.get(`/entries/find/${entryId}`, { withCredentials: true });
        setReceiptModal({
            show: true,
            entryData: response.data,
            onSave: (entry)=>{
                console.log("saved?", entry);
            },
            mode: "edit"
        });
    }

    function createCashReceipt(item){
        setReceiptModal({ 
            show: true, 
            entryData: {
                CRNo: "",
                _id: null,
                Particulars: "PAYMENT OF ACCOUNT-  " + item.remarks,
                ReceiptEntryType: "Cash Receipt",
                PaymentEntity: item.client,
                paymentMethods: item.paymentMethod,
                orId: item._id,
                ReviewedBy: { name: "", position: "", _id: "" },
                ApprovedBy1: { name: "", position: "", _id: "" },
            },
            onSave: (entry)=>{
                // link this item to created entry
                console.log(entry);
            },
            mode: "OR"
        });
        console.log(numberToCurrencyString(item.amount));
        item.gl.unshift({
            code: item.paymentMethod === "Cash" || item.paymentMethod === "Cheque" ? "10101010" : "10102020",
            name: item.paymentMethod === "Cash" || item.paymentMethod === "Cheque" ?  "CASH-COLLECTING OFFICERS" : "CASH IN BANK- LOCAL CURRENCY, CURRENT ACCOUNT",
            slCode: item.paymentMethod === "Cash" || item.paymentMethod === "Cheque" ? "9410" : item.bank.slCode,
            slName: item.paymentMethod === "Cash" || item.paymentMethod === "Cheque" ? "PERA LIZA P. JULIAN" : item.bank.name,
            amount: item.amount || 0
        });
        console.log(item.gl);
        pushToGrid(item.gl.map((m, index) => ({
            ledger: {
                code: m.code,
                name: m.name
            },
            subledger: {
                slCode: m.slCode,
                name: m.slName
            },
            dr: index === 0 ? numberToCurrencyString(Math.abs(m.amount)) : (m.amount < 0 ? numberToCurrencyString(Math.abs(m.amount)) : null),
            cr: index !== 0 && m.amount > 0 ? numberToCurrencyString(Math.abs(m.amount)) : null
        })));        
    }

    function createDepositSlip(item){
        setReceiptModal({ 
            show: true, 
            entryData: {
                CRNo: "",
                _id: null,
                Particulars: "DEPOSIT OF COLLECTION",
                ReceiptEntryType: "Deposit Slip",
                PaymentEntity: { slCode: "9410", name: "PERA LIZA P. JULIAN" },
                orId: item._id,
                ReviewedBy: { name: "", position: "", _id: "" },
                ApprovedBy1: { name: "", position: "", _id: "" },
            },
            onSave: (entry)=>{
                // link this item to created entry
                console.log(entry);
            },
            mode: "OR"
        });
        const push = [];
        push.push(
            {
                ledger: { code: "10102020", name: "CASH IN BANK- LOCAL CURRENCY, CURRENT ACCOUNT" },
                subledger: { slCode: item.bank?.slCode || "", name: item.bank?.name || "" },
                dr: numberToCurrencyString(item.amount), cr: null,
            },
            {
                ledger: { code: "10101010", name: "CASH-COLLECTING OFFICERS" },
                subledger: { slCode: "9410", name: "PERA LIZA P. JULIAN" },
                dr: null, cr: numberToCurrencyString(item.amount),
            },
        );
        pushToGrid(push);
    }

    function getAmounts(item){
        const amount = parseFloat(item.amount.toFixed(2));
        const netAmount = parseFloat(item.gl.filter(f=>typeof f.amount === 'number').map(m=>m.amount).reduce((pre,cur)=>pre+cur,0).toFixed(2));
        return (
            <>
                <td className={`border-r p-1 ${netAmount != 0 && netAmount != amount && 'text-red-500'}`} >{numberToCurrencyString(amount)}</td>
                <td className={`border-r p-1 ${netAmount != 0 && netAmount != amount && 'text-red-500'}`} >
                    {netAmount === 0 ? <span className='text-blue-500 text-[0.8em]'>to be filled by accounting</span> : numberToCurrencyString(netAmount)}
                </td>
            </>
        );
    }

    function mismatch(e){
        console.log(e.target.checked);
        if(e.target.checked){
            setRows(imbalance);
        }else{
            getOrList();
        }
    }

    return (
        <>
        <div>
            <div className='py-4 px-8 flex mb-4'>
                <h1 className="font-bold flex-1">Order of Payment</h1>
                <button className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-400 transition duration-500' onClick={createClick}>Create</button>
            </div>
            <div className='px-8'>
                <div className='flex mb-2 text-[0.9em] items-center'>
                    <div className='flex-1 flex items-start'>
                        <div>
                            <span className='mr-2'>Date</span>
                            <input type="date" className='border rounded px-1 mr-4' value={!date ? '' : date} onChange={(e)=>setDate(e.target.value)} />
                        </div>
                        <input type="text" className='border rounded px-1 mr-4' value={debounceSearch} onChange={(e)=>setDebounceSearch(e.target.value)} placeholder='search' />
                        <div className='text-[0.8em] flex-1'>
                            <label className='mr-4 flex items-center'>
                                <input type="checkbox" className='mr-1' checked={!noCashReceipt ? false : noCashReceipt} onChange={(e)=>setNoCashReceipt(e.target.checked)} />
                                no cash receipt entry
                            </label>
                            <label className='mr-4 flex items-center'>
                                <input type="checkbox" className='mr-1' checked={!noDepositSlip ? false : noDepositSlip} onChange={(e)=>setNoDepositSlip(e.target.checked)} />
                                no deposit slip entry
                            </label>
                            {
                                imbalance.length > 0 &&
                                <label className='text-red-500 flex items-center'>
                                    <input type="checkbox" className='mr-1' onChange={(e)=>mismatch(e)} />
                                    mismatch amount per treasury vs amount per accounting ({imbalance.length}) 
                                </label>
                            }
                        </div>
                    </div>
                    <div className='flex items-center justify-center text-[1.3em] mr-4'>
                        <button onClick={getOrList} ><IoRefresh /></button>
                    </div>
                    <div>
                        <input type="number" className='border w-[50px] mr-1 text-end px-1 rounded' value={limit} onChange={(e)=>setLimit(e.target.value)} />
                        <span>rows</span>
                    </div>
                </div>
                <table className='w-[100%] text-[0.8em] mb-4'>
                    <thead>
                        <tr className='bg-green-500 text-white'>
                            <th className='border-r p-1 text-center' ></th>
                            <th className='border-r p-1 text-center' >OR NO.</th>
                            <th className='border-r p-1 text-center' >DATE</th>
                            <th className='border-r p-1 text-center' >CLIENT</th>
                            <td className='border-r p-1 text-center'>AMOUNT PER TREASURY</td>
                            <td className='border-r p-1 text-center'>AMOUNT PER ACCOUNTING</td>
                            {
                                user.access.includes('orx') &&
                                <th className='p-1 text-center'>ACTION</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                    { rows.map((item, index)=>
                        <tr 
                            key={index} 
                            className={`${(item.deletedDate || item.cancelledDate) && 'bg-gray-100 text-gray-600'} border-b hover:bg-gray-100 cursor-pointer`} 
                            onClick={(e)=>checkRow(!selected.filter(f=>f._id === item._id).length > 0, item)} >
                            <td className='border-r p-1 text-center'>
                                <input type="checkbox" checked={selected.filter(f=>f._id === item._id).length > 0} onChange={(e)=>checkRow(e.target.checked, item)} />
                            </td>
                            <td className='border-r p-1'>{item.orderOfPaymentNo}</td>
                            <td className='border-r p-1'>{formatReadableDate(item.date)}</td>
                            <td className='border-r p-1'>{item.client.name}</td>
                            { getAmounts(item) }
                            {
                                user.access.includes('orx') && 
                                <td className='p-1 flex justify-end'>
                                    {
                                        (!item.deletedDate && !item.cancelledDate) ? (
                                            <>
                                                { item.linkedCashReceiptEntry ?
                                                    <button 
                                                        className='bg-blue-500 text-white px-3 rounded mr-2 hover:bg-blue-400 transition duration-500' 
                                                        onClick={(e)=>{e.preventDefault(); e.stopPropagation(); openReceipt(item, item.linkedCashReceiptEntry._id)}} 
                                                    >
                                                        Open cash receipt entry
                                                    </button> 
                                                    :
                                                    <button 
                                                        className='bg-green-500 text-white px-2 rounded mr-2 hover:bg-green-400 transition duration-500' 
                                                        onClick={(e)=>{e.preventDefault(); e.stopPropagation(); createCashReceipt(item)}} 
                                                    >
                                                        Create cash receipt entry
                                                    </button> 
                                                }
                                                {item.linkedDepositSlipEntry ? (
                                                    <button
                                                        className="bg-blue-500 text-white px-3 rounded mr-2 hover:bg-blue-400 transition duration-500"
                                                        onClick={(e)=>{e.preventDefault(); e.stopPropagation(); openReceipt(item, item.linkedDepositSlipEntry._id)}}
                                                    >
                                                        Open deposit slip entry
                                                    </button>
                                                ) : (
                                                    item.linkedCashReceiptEntry?.paymentMethods !== "Others" && (
                                                    <button
                                                        className="bg-green-500 text-white px-2 rounded mr-2 hover:bg-green-400 transition duration-500"
                                                        onClick={(e)=>{e.preventDefault(); e.stopPropagation(); createDepositSlip(item)}} >
                                                        Create deposit slip entry
                                                    </button>
                                                    )
                                                )}
                                            </>
                                        ):(
                                            <span className='mr-4'>({
                                                item.deletedDate ? `deleted ${item.deletedDate.substr(0, 10)}` : `cancelled ${item.cancelledDate.substr(0, 10)}`
                                            })</span>
                                        )
                                    }
                                </td>
                            }
                        </tr>
                    )}
                    </tbody>
                </table>
                <div className='flex items-center justify-center relative'>
                    <span className='absolute left-0 text-[0.8em] top-0'>{docsCount} records found</span>
                    <button className='mr-2 border rounded p-1' onClick={prevClick}><FaChevronLeft /></button>
                    <button className='ml-2 border rounded p-1' onClick={nextClick}><FaChevronRight /></button>
                    { 
                        selected.length > 0 && 
                        <div className='border py-0 text-[0.8em] absolute right-0 top-0'>
                            <span className='mx-1'>selected ({selected.length})</span>
                            <button className='bg-green-500 text-white px-2' onClick={openOrClick}>open OR</button>
                            <button className='bg-gray-500 text-white px-2' onClick={()=>setSelected([])}>uncheck all</button>
                        </div>
                    }
                </div>
            </div>
        </div>
        <OrderOfPaymentModal 
            show={OrModal.show} 
            toEdit={OrModal.editList} 
            toCreate={OrModal.createList}
            close={()=>{
                setOrModal({...OrModal, show: false, editList: []});
            }}
            refresh={refresher}
            tableRefresh={getOrList}
            selected={selected}
            setSelected={setSelected} />
        <ReceiptModal 
            isOpen={receiptModal.show} 
            onClose={close}
            entryData={receiptModal.entryData}
            onSaveReceipt={close}
            mode={receiptModal.mode} />
        </>
    );
}

export default OrderOfPaymentTable;