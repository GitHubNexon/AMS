import React, { useState, useEffect } from 'react';
import { showToast } from '../utils/toastNotifications';
import axios from 'axios';
import AccountPicker from './AccountPicker';
import SubledgerPicker from './SubledgerPicker';
import { numberToCurrencyString } from '../helper/helper';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useLoader } from '../context/useLoader';
import GLinput from './GLInput';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function EntriesExport() {

    const { loading } = useLoader();

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [payment, setPayment] = useState(true);
    const [receipt, setReceipt] = useState(true);
    const [journal, setJournal] = useState(true);
    const [cancelled, setCancelled] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [slCode, setSlCode] = useState('');
    const [name, setName] = useState('');
    const [receiptEntryType, setReceiptEntryType] = useState('');

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0); // New state for total pages
    const [totalDocs, setTotalDocs] = useState(0);

    useEffect(() => {
        // if (!from || !to) {
        //     return;
        // }
        searchClick();
    }, [page, limit]);  // Use page and limit as dependencies for re-triggering the search

    async function searchClick() {
        searchEntries();
    }

    const [isLoading, setIsLoading] = useState(false);

    async function searchEntries() {
        // if (!from || !to) {
        //     showToast("Please select date", "warning");
        //     // return;
        // }
        try {
            // loading(true);
            setIsLoading(true);
            // API call to fetch the entries with pagination info
            const response = await axios.get(`/reports/entries/search?from=${from}&to=${to}&p=${payment}&r=${receipt}&j=${journal}&acc=${selectedAccount ? selectedAccount.code : ''}&sl=${slCode}&ret=${receiptEntryType}&page=${page}&limit=${limit}&c=${cancelled}`, 
                { withCredentials: true }
            );
            setIsLoading(false);
            // loading(false);

            console.log(response.data);

            // Set rows data and pagination info (totalPages)
            setRows(response.data.entries);
            setTotalPages(response.data.totalPages); // Get total pages from the response
            setTotalDocs(response.data.totalCount);
        } catch (error) {
            console.error("Error searching entries:", error);
            showToast("Failed searching entries", "error");
        }
    }

    function prevClick() {
        if (page <= 1) return;
        setPage(page - 1);
    }

    function nextClick() {
        if (page >= totalPages) return; // Don't go beyond total pages;
        setPage(page + 1);
    }

    async function exportClick() {
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        try {
            loading(true);
            const response = await axios.get(`/reports/entries/export?from=${from}&to=${to}&p=${payment}&r=${receipt}&j=${journal}&acc=${selectedAccount ? selectedAccount.code : ''}&sl=${slCode}&ret=${receiptEntryType}&c=${cancelled}`, {
                withCredentials: true,
                responseType: 'blob', // Important to handle binary data
            });
            loading(false);

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = 'transactions.xlsx'; // Specify the file name
            document.body.appendChild(link);
            link.click();

            URL.revokeObjectURL(url);
            document.body.removeChild(link);

            showToast("File downloaded successfully!", "success");
        } catch (error) {
            console.error("Error downloading the file:", error);
            showToast("Failed to download the file", "error");
        }
    }

    return (
        <div className='p-4 text-[0.9em] border rounded mb-4'>
            <div className='mb-4'>
                <span className='font-bold'>Export transactions</span>
            </div>
            <div className='flex items-center flex-wrap mb-4 text-[0.9em]'>
                <div className='mr-4'>
                    <span>Ledger</span>
                    <GLinput selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
                </div>
                <div className='min-w-[250px] mr-4'>
                    <span>Subledger</span>
                    <SubledgerPicker slCode={slCode} setSLCode={setSlCode} name={name} setName={setName} />
                </div>
                <div className='flex flex-col'>
                    <span>Receipt entry type</span>
                    <select className='border p-2 rounded' value={receiptEntryType} onChange={(e) => setReceiptEntryType(e.target.value)} >
                        <option value="">-</option>
                        <option value="cash">cash receipt</option>
                        <option value="deposit">deposit slip</option>
                    </select>
                </div>
            </div>
            <div className='flex flex-wrap items-center text-[0.9em]'>
                <div className='flex items-center mr-2 mb-4'>
                    <span className='mr-2'>Date from</span>
                    <input type="date" className='mr-2 border px-1 rounded' value={from} onChange={(e) => setFrom(e.target.value)} />
                    <span className='mr-2'>to</span>
                    <input type="date" className='mr-2 border px-1 rounded' value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div className='flex item-center mr-2 mb-4'>
                    <label className='mr-4'>
                        <input type="checkbox" className='mr-1' checked={payment} onChange={(e) => setPayment(e.target.checked)} />
                        Payment
                    </label>
                    <label className='mr-4'>
                        <input type="checkbox" className='mr-1' checked={receipt} onChange={(e) => setReceipt(e.target.checked)} />
                        Receipt
                    </label>
                    <label className='mr-4'>
                        <input type="checkbox" className='mr-1' checked={journal} onChange={(e) => setJournal(e.target.checked)} />
                        Journal
                    </label>
                    <label className='mr-4'>
                        <input type="checkbox" className='mr-1' checked={cancelled} onChange={(e) => setCancelled(e.target.checked)} />
                        Include cancelled entries
                    </label>
                </div>
                <div className='mb-4'>
                    {
                        isLoading ? 
                        <AiOutlineLoading3Quarters className="animate-spin font-bold text-[1.3em] inline-block w-[58px] px-2" /> :
                        <button className='bg-green-500 text-white px-2 rounded hover:bg-green-400 transition duration-500 mr-4' onClick={searchClick}>Search</button>
                    }
                    <button className='bg-gray-500 text-white px-2 rounded hover:bg-gray-400 transition duration-500 mr-4' onClick={exportClick}>Export</button>
                </div>
            </div>
            <div className='text-[0.8em]'>
                <div className='h-[50vh] overflow-y-scroll border-b border-l'>
                    <table className='w-[100%] relative'>
                        <thead>
                            <tr className='bg-green-600 text-white sticky top-0'>
                                <th className='p-1 border-r'>SLCODE</th>    
                                <th className='p-1 border-r'>SLNAME</th>    
                                <th className='p-1 border-r'>ACCTCODE</th>    
                                <th className='p-1 border-r'>ACCOUNT NAME</th>    
                                <th className='p-1 border-r'>SLDATE</th>    
                                <th className='p-1 border-r'>SLDOCCODE</th>    
                                <th className='p-1 border-r'>SLDOCNO</th>    
                                <th className='p-1 border-r'>SLDESC</th>    
                                <th className='p-1 border-r'>Receipt Entry Type</th>    
                                <th className='p-1 border-r'>Check No,</th>
                                <th className='p-1 border-r'>SLDEBIT</th> 
                                <th className='p-1 border-r'>SLCREDIT</th>    
                                <th className='p-1 border-r'>STATUS</th>
                                <th className='p-1'>PAYMENT ENTITY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.map((item, index) =>
                                    <tr key={index} className='border-b'>
                                        <td className='border-r p-1'>{item.SLCODE}</td>
                                        <td className='border-r p-1 text-[0.8em]'>{item.SLNAME}</td>
                                        <td className='border-r p-1'>{item.ACCTCODE}</td>
                                        <td className='border-r p-1 text-[0.8em]'>{item["ACCOUNT NAME"]}</td>
                                        <td className='border-r p-1'>{item.SLDATE}</td>
                                        <td className='border-r p-1'>{item.SLDOCCODE}</td>
                                        <td className='border-r p-1'>{item.SLDOCNO}</td>
                                        <td className='border-r p-1 text-[0.8em]'>{item.SLDESC}</td>
                                        <td className='border-r p-1'>{item["Check No,"]}</td>
                                        <td className='border-r p-1'>{item["Receipt Entry Type"]}</td>
                                        <td className='border-r p-1'>{item.SLDEBIT && item.SLDEBIT !== 0 ? numberToCurrencyString(item.SLDEBIT) : ''}</td>
                                        <td className='border-r p-1'>{item.SLCREDIT && item.SLCREDIT !== 0 ? numberToCurrencyString(item.SLCREDIT) : ''}</td>
                                        <td className='border-r p-1'>{item.status}</td>
                                        <td className='p-1'>{item.paymentEntity}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                <div className='flex items-center justify-center relative p-4'>
                    <span className='absolute left-0 top-[5px]'>{totalPages > 0 ? `page ${page} of ${totalPages}` : 'search entries'}</span>
                    <button onClick={prevClick} disabled={page <= 1} className='text-[1.5em] border rounded p-1 mr-2'><FaChevronLeft /></button>
                    <button onClick={nextClick} disabled={page >= totalPages} className='text-[1.5em] border rounded p-1 ml-2'><FaChevronRight /></button>
                    <span className='absolute right-0 top-[5px]'>{totalDocs} documents found</span>
                </div>
            </div>
        </div>
    );
}

export default EntriesExport;