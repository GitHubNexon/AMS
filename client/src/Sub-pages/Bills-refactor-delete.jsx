import React, { useEffect, useState } from 'react';
import ExpensesShortcuts from '../Components/ExpensesShortcuts';
import BillModal from '../Pop-Up-Pages/BillModal';
import { showToast } from '../utils/toastNotifications';
import axios from 'axios';
import { numberToCurrencyString, formatReadableDate } from '../helper/helper';
import useBill from '../context/useBill';
import Modal from '../Components/Modal';
import BillPaymentModal from '../Pop-Up-Pages/BillPaymentModal';
import { FaPesoSign, FaChevronLeft, FaChevronRight, FaMagnifyingGlass } from 'react-icons/fa6';
import { FaEdit, FaTrash, FaFolder } from 'react-icons/fa';
import BatchBillPaymentModal from '../Pop-Up-Pages/BatchBillPaymentModal';
import BillRecurringModal from '../Pop-Up-Pages/BillRecurringModal';

function Bills() {

    const { deleteBill } = useBill();

    const [billButtonType, setBillButtonType] = useState('bill');
    const [billStatusFilter, setBillStatusFilter] = useState('unpaid');
    const [filter, setFilter] = useState('');
    const [billModal, setBillModal] = useState({show: false, mode: "add", bill: null});

    const [bills, setBills] = useState([]);

    const [pagination, setPagination] = useState({start: 0, limit: 10});
    const [docsCount, setDocsCount] = useState(0);
    const [messageBox, setMessagebox] = useState({show: false, message: '', callback: ()=>{}});

    const [paymentModal, setPaymentModal] = useState({show: false, bill: null});
    const [recurringBillModal, setRecurringBillModal] = useState({show: false});

    const [batchPaymentModal, setBatchPaymentModal] = useState({show: false});
    
    // seach debouncing
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    useEffect(()=>{
        const timerId = setTimeout(()=>{
            setDebouncedTerm(searchTerm);
        }, 500);
        return ()=>{
            clearTimeout(timerId);
        };
    }, [searchTerm]);
    useEffect(()=>{
        // search function here
        setPagination({start: 0, limit: 10});
        getBills();
    }, [debouncedTerm]);
    // end search debouncing

    useEffect(()=>{
        setPagination({start: 0, limit: 10});
        getBills();
    }, [filter]);

    useEffect(()=>{
        getBills();
    }, [pagination, billStatusFilter]);

    useEffect(()=>{
        setFilter('');
        setPagination({start: 0, limit: 10});
        setDocsCount(0);
    }, [billStatusFilter]);

    async function getBills(){
        const response = await axios.get(
            `/bills?start=${pagination.start}&limit=${pagination.limit}&status=${billStatusFilter}&query=${debouncedTerm}&filter=${filter}`, 
            {withCredentials: true}
        );
        setBills(response.data.bills);
        setDocsCount(response.data.count);
    }

    function addClick(){
        switch(billButtonType){
            case "bill":
                setBillModal({...billModal, mode: "add", show: true});
            break;
            case "recurring bill":
                setRecurringBillModal({show: true});
            break;
        }
    }

    function prev(){
        if(pagination.start <= 0){
            return;
        }
        setPagination({
            ...pagination,
            start: pagination.start - pagination.limit
        });
    }

    function next(){
        if((pagination.start + pagination.limit) >= docsCount){
            return;
        }
        setPagination({
            ...pagination,
            start: pagination.start + pagination.limit,
        });
    }

    function editClick(bill){
        setBillModal({show: true, mode: "edit", bill: bill});
    }

    function deleteClick(bill){
        setMessagebox({
            show: true,
            message: `Are you sure you want to delete this bill?`,
            callback: async ()=>{
                await deleteBill(bill._id);
                getBills();
                setMessagebox({show: false, message: '', callback: ()=>{}});
            }
        });        
    }


    function payClick(bill){
        setPaymentModal({show: true, bill: bill});
    }

    function closePaymentModal(){
        setPaymentModal({show: false, bill: null});
        getBills();
    }


    return (
        <>
        <ExpensesShortcuts />
        <div className='mx-auto p-8'>
            <div className='flex mb-4'>
                <h1 className='flex-1 font-bold'>Bills</h1>
                <button className='border-[2px] p-1 w-[150px] mr-4 text-[0.9em] hover:bg-gray-200 transition duration-500 font-bold' onClick={()=>setBatchPaymentModal({show: true})}>Pay bills</button>
                <div className='w-[150px] flex text-[0.8em] rounded'>
                    <button className='bg-green-500 text-white flex-1 hover:bg-green-400 transition duration-500 font-bold' onClick={addClick} >
                        Add {billButtonType}
                    </button>
                    <select className='w-[20px] bg-green-500 text-white cursor-pointer hover:bg-green-400 transution duration-500' value={billButtonType} onChange={(e)=>setBillButtonType(e.target.value)} >
                        <option value="bill" className='bg-white text-black text-[1.3em]'>Create bill</option>
                        <option value="recurring bill" className='bg-white text-black text-[1.3em]'>Create recuring bill</option>
                    </select>
                </div>
            </div>
            <div className='text-[0.9em]'>
                <div className='border-b flex mb-2'>
                    <button 
                        className={`px-2 py-1 border-b-[2px] border-${billStatusFilter === 'unpaid' ? 'green-500' : 'transparent'}`} 
                        onClick={()=>setBillStatusFilter('unpaid')} >
                        Unpaid
                    </button>
                    <button 
                        className={`px-2 py-1 border-b-[2px] border-${billStatusFilter === 'paid' ? 'green-500' : 'transparent'}`} 
                        onClick={()=>setBillStatusFilter('paid')} >
                        Paid
                    </button>
                    {/* <div className='flex justify-end flex-1'>
                        <select className='text-violet-500 mr-4'>
                            <option value="">Show Bill Payments</option>
                        </select>
                        <select className='text-blue-500'>
                            <option value="">How to manage bills</option>
                        </select>
                    </div> */}
                </div>
                <div>
                    <div className='mb-4 flex'>
                        <select className='border px-2 py-1 rounded mr-4 w-[150px]' onChange={(e)=>setFilter(e.target.value)} value={filter} >
                            <option value="">Filters</option>
                            { 
                                billStatusFilter === 'unpaid' ? (
                                    <>
                                    <option value="overdue">Overdue</option>
                                    <option value="today">Due Today</option>
                                    <option value="partial">Partially Paid</option>
                                    </>
                                ) : (
                                    <>
                                    <option value="paid">Paid</option>
                                    </>
                                )
                            }
                        </select>
                        {/* <button className='border text-[0.8em] px-4 py-1 rounded-xl bg-gray-200'>Bill date: Last 12 months</button> */}
                        <div className='flex items-center border border-gray-400 rounded px-2 py-1'>
                            <input 
                                type="text" 
                                className='mr-2 outline-none w-[250px]' 
                                placeholder='bill no., reference, tags, vendor.' 
                                onChange={(e)=>setSearchTerm(e.target.value)} />
                            <FaMagnifyingGlass />
                        </div>
                    </div>
                    {
                        billStatusFilter === 'unpaid' &&
                        <table className='text-[0.8em] mt-2 w-[100%]'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='p-1 border-r'>
                                        {/* <input type="checkbox" /> */}
                                    </th>
                                    <th>REFERENCE</th>
                                    <th className='p1 border-r'>VENDOR</th>
                                    <th>DATE</th>
                                    <th className='p1 border-r'>DUE DATE</th>
                                    <th className='p1 border-r'>BILL AMOUNT</th>
                                    <th className='p1 border-r'>STATUS</th>
                                    <th className='p1'>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                            { bills.map((item, index)=>
                                <tr key={index} className='border-b text-center'>
                                    <td className='p-2 border-r'>{index + 1 + pagination.start}</td>
                                    <td className='p-2 border-r'>{item.reference}</td>
                                    <td className='p-2 border-r'>{item.vendor.vendorName}</td>
                                    <td>{formatReadableDate(item.billDate)}</td>
                                    <td className={`p-2 border-r ${new Date() >= new Date(item.dueDate) ? 'text-red-600' : ''}`}>{formatReadableDate(item.dueDate)}</td>
                                    <td className='p-2 border-r'>
                                        <div className='flex flex-col'>
                                            <span>₱ {numberToCurrencyString(item.totalAmount)}</span>
                                            { 
                                                item.totalPaid > 0 
                                                && (item.totalPaid != item.totalAmount) 
                                                && <span className='text-green-600'>(Paid ₱ {numberToCurrencyString(item.totalPaid)})</span>
                                            }
                                        </div>
                                    </td>
                                    <td className='p-2 border-r'>{item.status}</td>
                                    <td className='p-2 flex items-center justify-center'>
                                        <button 
                                            className='mr-3 text-lg bg-green-600 p-1 rounded text-white hover:bg-green-500 transition duration-500' 
                                            onClick={()=>payClick(item)} >
                                            <FaPesoSign />
                                        </button>
                                        <button 
                                            className='mr-3 text-lg bg-blue-600 p-1 rounded text-white hover:bg-blue-500 transition duration-500' 
                                            onClick={()=>editClick(item)} >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className='mr-3 text-lg bg-red-600 p-1 rounded text-white hover:bg-red-500 transition duration-500' 
                                            onClick={()=>deleteClick(item)} >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ) }
                            </tbody>
                        </table>
                    }
                    {
                        billStatusFilter === 'paid' &&
                        <table className='text-[0.8em] mt-2 w-[100%]'>
                            <thead>
                                <tr className='border-b'>
                                    <th>REFERENCE</th>
                                    <th className='p1 border-r'>VENDOR</th>
                                    <th className='p1 border-r'>BILL DATE</th>
                                    <th className='p1 border-r'>DUE DATE</th>
                                    <th className='p1 border-r'>BILL AMOUNT</th>
                                    <th className='p1'>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                            { bills.map((item, index)=>
                                <tr key={index} className='border-b text-center'>
                                    <td className='p-2 border-r'>{item.reference}</td>
                                    <td className='p-2 border-r'>{item.vendor.vendorName}</td>
                                    <td className='p-2 border-r'>{formatReadableDate(item.billDate)}</td>
                                    <td className='p-2 border-r'>{formatReadableDate(item.dueDate)}</td>
                                    <td className='p-2 border-r'>
                                        <span>₱ {numberToCurrencyString(item.categoryDetails.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0))}</span>
                                    </td>
                                    <td className='p-2 flex items-center justify-center'>
                                        <button 
                                            className='mr-3 text-lg bg-yellow-600 p-1 rounded text-white hover:bg-yellow-500 transition duration-500' 
                                            onClick={()=>editClick(item)} >
                                            <FaFolder />
                                        </button>
                                        <button 
                                            className='mr-3 text-lg bg-red-600 p-1 rounded text-white hover:bg-red-500 transition duration-500' 
                                            onClick={()=>deleteClick(item)} >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ) }
                            </tbody>
                        </table>
                    }
                    <div className='flex items-center relative justify-center p-4'>
                        <span className='absolute left-0 text-[0.8em]'>{docsCount} records found</span>
                        <button className='border px-2 py-1 rounded mr-2' onClick={prev} ><FaChevronLeft /></button>
                        <button className='border px-2 py-1 rounder ml-2' onClick={next}><FaChevronRight /></button>
                    </div>
                </div>
            </div>
        </div>
        <BillModal 
            show={billModal.show} 
            closeCallback={()=>setBillModal({show: false, bill: null})}
            mode={billModal.mode}
            selectedBill={billModal.bill && billModal.bill}
            selectedVendor={billModal.bill && billModal.bill.vendor}
            refresh={getBills} />
        <Modal show={messageBox.show} closeCallback={()=>setMessagebox({show: false, message: '', callback: ()=>{}})}>
            <div className='flex-1 p-4 flex items-center justify-center text-center'>
                <span className='max-w-[250px]'>{messageBox.message}</span>
            </div>
            <div className='p-4 flex justify-center'>
                <button className='bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500 transition duration-500' onClick={messageBox.callback}>Confirm</button>
            </div>
        </Modal>
        <BillPaymentModal show={paymentModal.show} bill={paymentModal.bill} closeCallback={closePaymentModal} />
        <BatchBillPaymentModal show={batchPaymentModal.show} close={()=>setBatchPaymentModal({show: false})} refresh={getBills} />
        <BillRecurringModal show={recurringBillModal.show} close={()=>setRecurringBillModal(false)} />
        </>
    );
}

export default Bills;
