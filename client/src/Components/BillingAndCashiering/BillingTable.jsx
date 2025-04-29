import React, { useEffect, useState } from 'react';
import { formatDateToMonthYear, numberToCurrencyString, formatDateToYYYMMdd } from '../../helper/helper';
import axios from 'axios';
import BillingRow from './BillingRow';
import { FaChevronLeft, FaChevronRight  } from "react-icons/fa";

function BillingTable() {

    const [asofDate, setAsofDate] = useState(formatDateToYYYMMdd(new Date()));
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(()=>{
        if(!asofDate) return;
        getBilling();
    }, [asofDate, page]);

    async function getBilling(){
        const response = await axios.get(`/statementOfAccount/billing/${asofDate}?page=${page}`, { withCredentials: true });
        console.log(response.data);
        setRows(response.data.data.filter(v=>v !== null));
        setTotalPages(response.data.totalPages);
    }

    function handlePrevPage() {
        if (page > 1) setPage(prev => prev - 1);
    }

    function handleNextPage() {
        if (page < totalPages) setPage(prev => prev + 1);
    }

    return (
        <div className='p-8 flex flex-col'>
            <div className='flex mb-2 items-center'>
                  <span className='mr-4 font-bold'>Billing</span>  
                  <span className='mr-2'>AS OF</span>
                  <input type="date" className='border px-2 rounded' value={asofDate} onChange={(e)=>setAsofDate(e.target.value)} />
            </div>
            <div className='text-[0.7em] overflow-x-scroll'>
                <table className='w-[100%]'>
                    <thead>
                        <tr className='bg-green-500 text-white'>
                            <th className='border-r p-1'>SLCODE</th>
                            <th className='border-r p-1'>PAYEE</th>
                            <th className='border-r p-1'>BALANCES AS OF {asofDate && formatDateToMonthYear(asofDate)} (RENTAL)</th>
                            <th className='border-r p-1'>BILLING FOR {asofDate && formatDateToMonthYear(asofDate)} (RENTAL)</th>
                            <th className='border-r p-1'>PENALTIES (Inclusive of VAT)</th>
                            <th className='border-r p-1'>ESCALATION {asofDate && formatDateToMonthYear(asofDate)} (Inclusive of VAT)</th>
                            <th className='border-r p-1'>ARREARS (Inclusive of VAT)</th>
                            <th className='border-r p-1'>BALANCE AS OF {asofDate && formatDateToMonthYear(asofDate)} (ASSESSMENT)</th>
                            <th className='border-r p-1'>BILLING FOR {asofDate && formatDateToMonthYear(asofDate)} (ASSESSMENT)</th>
                            <th className='border-r p-1'>TOTAL SALES (VAT INCLUSIVE)</th>
                            <th className='border-r p-1'>LESS OF VAT</th>
                            <th className='border-r p-1'>AMOUNT NET OF VAT</th>
                            <th className='border-r p-1'>AMOUNT DUE</th>
                            <th className='border-r p-1'>TOTAL AMOUNT DUE</th>
                            <th className='p-1'>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rows.length > 0 ? rows.map((item, index)=>
                                <BillingRow key={item._id} item={item} index={index} asof={asofDate} />
                            ) : <></>
                        }
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center relative mt-4 text-[0.9em]">
                <span className='absolute left-[15px]'>Page {page} of {totalPages}</span>
                <button className="px-2 py-1 mr-2 border rounded" disabled={page <= 1} onClick={handlePrevPage}><FaChevronLeft  /></button>
                <button className="px-2 py-1 ml-2 border rounded" disabled={page >= totalPages} onClick={handleNextPage}><FaChevronRight /></button>
            </div>
        </div>
    );
}

export default BillingTable;