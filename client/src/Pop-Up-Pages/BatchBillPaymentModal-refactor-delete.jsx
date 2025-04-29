import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { formatReadableDate, numberToCurrencyString, formatDateToYYYMMdd } from '../helper/helper';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import useBase from '../context/useBase';
import { showToast } from '../utils/toastNotifications';
import AccountPicker from '../Components/AccountPicker';

function BatchBillPaymentModal({ show=false, close, refresh=()=>{} }) {

    const {base} = useBase();

    const [filter, setFilter] = useState('');
    const [checkAll, setCheckAll] = useState(false);
    const [pagination, setPagination] = useState({rows: 10, start: 0, end: 9});
    const [messageBox, setMessageBox] = useState({show: false, content: [], callback: ()=>{}});

    const [data, setData] = useState([]);
    const [docN, setDocN] = useState(0);

    const [paymentDate, setPaymentDate] = useState(formatDateToYYYMMdd(new Date()));
    const [paymentMethod, setPaymentMethod] = useState();
    const [referenceNo, setReferenceNo] = useState('');
    const [account, setAccount] = useState(null);

    useEffect(()=>{
        if(base.paymentMethods.length === 0) return;
        setPaymentMethod(base.paymentMethods[0]);
    }, [base])

    useEffect(()=>{
        fetchBills();
    }, [filter]);

    useEffect(()=>{
        clear();
    }, [show])

    async function fetchBills(){
        setPagination({rows: 10, start: 0, end: 9});
        const response = await axios.get(`${API_BASE_URL}/bills?start=&limit=&status=unpaid&query=&filter=${filter}`, { withCredentials: true });
        setData(response.data.bills.map(m=>({...m, checked: false})));
        setDocN(response.data.count);
    }
    
    // pagination
    function prev(){
        if(pagination.start <= 0) return;
        setPagination({...pagination, start: pagination.start - pagination.rows, end: pagination.end - pagination.rows});
    }

    function next(){
        if((pagination.end + 1) >= data.length) return;
        setPagination({...pagination, start: pagination.end + 1, end: pagination.end + pagination.rows});
    }

    // check single row
    function checkRow(index, e){
        setData(prevItems=>prevItems.map(m=>m._id === data[index]._id ? {...m, checked: e.target.checked} : m));
    }

    // check all rows
    function checkCol(e){
        setCheckAll(e.target.checked);
        setData(data.map(m=>({...m, checked: e.target.checked})));
    }

    function processData(){
        const checked = data.filter(f=>f.checked);
        if(checked.length <= 0){
            showToast('Please select bills.', 'warning');
            return false;
        }
        if(!paymentDate){
            showToast('Please enter payment date', 'warning');
            return false;
        }
        if(!account){
            showToast('Please select account', 'warning');
            return false;
        }
        let processed = {
            bills: checked,
            paymentDate: paymentDate,
            method: paymentMethod,
            referenceNo: referenceNo,
            account: account
        };
        return processed;
    }
    
    async function confirmClick(){
        const processed = processData();
        if(!processed) return;
        console.log(processed);
        setMessageBox({
            ...messageBox,
            show: true,
            content: processed.bills,
            callback: ()=>{
                savePayment(processed);
            }
        });
    }

    async function savePayment(data){
        const response = await axios.post(`${API_BASE_URL}/bills/pay/batch`, data, { withCredentials: true });   
        if(response.status === 200){
            showToast('Payment saved', 'success');
            fetchBills();
            close();
            clear();
            refresh();
            setMessageBox({show: false, content: [], callback: ()=>{}});
        }else{
            showToast('Unable so save payment', 'warning');
        }
    }

    function clear(){
        setPaymentDate(formatDateToYYYMMdd(new Date()));
        setReferenceNo('');
        setAccount(null);    
    }

    return (
        <>
        <Modal title='Pay bills' show={show} closeCallback={close}>
            <div className='flex-1 flex flex-col border-t border-b min-h-[65vh] overflow-y scroll'>
                <div className='text-[0.8em] p-4'>
                    <div className='flex items-center'>
                        <span className='mr-2 font-bold'>Filter:</span>
                        <select className='border rounded p-1' value={filter} onChange={(e)=>setFilter(e.target.value)} >
                            <option value="">All</option>
                            <option value="overdue">Overdue</option>
                            <option value="today">Due Today</option>
                        </select>
                    </div>
                </div>
                <div className='flex flex-wrap p-2'>
                    <div className='px-4'>
                        <table className='text-[0.7em] text-center'>
                            <thead>
                                <tr className='border-b bg-gray-200'>
                                    <th></th>
                                    <th className='py-1 px-2 border-r'>
                                        <input type="checkbox" value={checkAll} onChange={(e)=>checkCol(e)} />
                                    </th>
                                    <th className='py-1 px-2 border-r'>VENDOR</th>
                                    <th className='py-1 px-2 border-r'>DUE DATE</th>
                                    <th className='py-1 px-2'>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                            { data.slice(pagination.start, pagination.end + 1).map((item, index)=>
                                <tr className='border-b' key={index} >
                                    <td className='text-end'>
                                        <span>{index  + 1 + pagination.start}.</span>
                                    </td>
                                    <td className='py-1 px-2 border-r'>
                                        <input type="checkbox" checked={item.checked} onChange={(e)=>checkRow(index, e)} />
                                    </td>
                                    <td className='border-r py-1 px-2'>
                                        {item.vendor.vendorName}
                                    </td>
                                    <td className='border-r py-1 px-2'>
                                        {formatReadableDate(item.dueDate)}
                                    </td>
                                    <td className='py-1 px-2'>
                                        ₱ {numberToCurrencyString(item.openBalance)}
                                    </td>
                                </tr>
                            ) }
                            </tbody>
                        </table>
                        <div className='flex p-1 items-center justify-center relative'>
                            <span className='absolute left-0 text-[0.6em]'>{docN} records found</span>
                            <button 
                                className='mr-1 p-1 text-[0.8em] bg-green-500 text-white rounded hover:bg-green-400 transition duration-500'
                                onClick={prev} >
                                <FaChevronLeft />
                            </button>
                            <button 
                                className='ml-1 p-1 text-[0.8em] bg-green-500 text-white rounded hover:bg-green-400 transition duration-500' 
                                onClick={next}>
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                    <div className='flex-col text-[0.8em] pr-4'>
                        <div className='flex mb-2 items-center'>
                            <span className='mr-2 w-[120px] text-end font-bold'>Payment date:</span>
                            <input 
                                type="date" 
                                className='border p-1 rounded border-gray-400 w-[150px]'
                                value={paymentDate}
                                onChange={(e)=>setPaymentDate(e.target.value)} />
                        </div>
                        <div className='flex mb-2 items-center'>
                            <span className='mr-2 w-[120px] text-end font-bold'>Payment method:</span>
                            <select 
                                className='border p-1 rounded border-gray-400 w-[150px]'
                                value={paymentMethod}
                                onChange={(e)=>setPaymentMethod(e.target.value)} >
                            { base.paymentMethods.map((item, index)=>
                                <option key={index} value={item}>{item}</option>
                            ) }
                            </select>
                        </div>
                        <div className='flex mb-2 items-center'>
                            <span className='mr-2 w-[120px] text-end font-bold'>Rerefence no.</span>
                            <input 
                                type="text" 
                                className='border p-1 rounded border-gray-400 w-[150px]'
                                value={referenceNo}
                                onChange={(e)=>setReferenceNo(e.target.value)} />
                        </div>
                        <div className='flex mb-2 items-center'>
                            <span className='mr-2 w-[120px] text-end font-bold'>Paid from:</span>
                            <AccountPicker filter={['LIABILITIES', 'CAPITAL']} className={'border-gray-400 w-[150px]'} selectedAccount={account} setSelectedAccount={setAccount} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='p-4 flex items-end justify-end'>
                <button className='bg-green-500 hover:bg-green-400 transition duration-500 px-2 py-1 rounded text-white' onClick={confirmClick}>Confirm</button>
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessageBox({show: false, content: [], callback: ()=>{}})} >
            <div className='border-t border-b flex-1 flex flex-col p-4'>
                <span className='mb-2'>Confirm payment for:</span>
                <div className='max-h-[50vh] overflow-y-scroll'>
                    <table className='text-[0.8em]'>
                        <thead>
                            <tr className='border-b'>
                                <th className='py-1 px-2 border-r'></th>
                                <th className='py-1 px-2 border-r'>BILL NO</th>
                                <th className='py-1 px-2 border-r'>REFERENCE</th>
                                <th className='py-1 px-2 border-r'>DUE DATE</th>
                                <th className='py-1 px-2 border-r'>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                        { messageBox.content.map((item, index)=>
                            <tr key={index} className='mb-2 border-b text-center'>
                                <td className='py-1 px-2 border-r'>{index + 1}.</td>
                                <td className='py-1 px-2 border-r'>{item.billNo}</td>
                                <td className='py-1 px-2 border-r'>{item.reference}</td>
                                <td className='py-1 px-2 border-r'>{formatReadableDate(item.dueDate)}</td>
                                <td className='py-1 px-2 border-r'>₱ {numberToCurrencyString(item.openBalance)}</td>
                            </tr>
                        ) }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='p-4 flex justify-center'>
                <button 
                    className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-400 transition duration-500'
                    onClick={messageBox.callback} >
                    Confirm
                </button>
            </div>
        </Modal>
        </>
    );
}

export default BatchBillPaymentModal;