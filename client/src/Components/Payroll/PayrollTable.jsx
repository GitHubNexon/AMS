import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { formatStringDateToDDMMMYY } from '../../helper/helper';
import PayrollModal from './PayrolModal';

function PayrollTable() {

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [query, setQuery] = useState('');
    const [queryDebounce, setQueryDebounce] = useState('');
    const [rows, setRows] = useState([]);

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(()=>{
        const handler = setTimeout(()=> setQuery(queryDebounce), 500);
        return ()=> clearTimeout(handler);
    }, [queryDebounce]);

    useEffect(()=>{
        getRows();
    }, [page, limit, query]);

    async function getRows(){
        const response = await axios.get(`/payroll?page=${page}&limit=${limit}&query=${query}`, { withCredentials: true });
        console.log(response.data.rows);
        setRows(response.data.rows);
        setTotalItems(response.data.count);
        setTotalPages(response.data.pages);
    }

    const [payrollModal, setPayrollModal] = useState(false);
    const [payrollData, setPayrollData] = useState(null);

    function openClick(item){
        setPayrollData(item);
        setPayrollModal(true);
    }

    return (
        <>
        
        <div className='flex flex-col p-2'>
            <div className='mb-2'>
                <span className='mr-2'>Search</span>
                <input type="text" className='border p-1 rounded' value={queryDebounce} onChange={(e)=>setQueryDebounce(e.target.value)} />
            </div>
            <div>
                <table className='w-[100%] text-[0.9em]'>
                    <thead>
                        <tr className='border-b'>
                            <th className='border-r p-1'>Description</th>
                            <th className='border-r p-1'>Pay Period</th>
                            <th className='p-1'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rows.map((item, index)=>
                                <tr key={index} className='border-b'>
                                    <td className='p-1 mr-2 border-r'>{
                                        item.linkedJournal ? item.linkedJournal.Particulars : 'no journal created'
                                    }</td>
                                    <td className='p-1 mr-2 border-r'>{formatStringDateToDDMMMYY(item.from.substr(0, 10))} - {formatStringDateToDDMMMYY(item.to.substr(0, 10))}</td>
                                    <td className='p-1'>
                                        <button className='btn-primary' onClick={()=>openClick(item)} >Open</button>
                                    </td>
                                </tr>
                            )
                        }
                        <tr>
                            <td colSpan={3}>
                                <div className='flex items-center justify-center p-4'>
                                    <button
                                        className="mr-2 p-1 border rounded disabled:opacity-50"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page <= 1}
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        className="ml-2 p-1 border rounded disabled:opacity-50"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <PayrollModal open={payrollModal} close={()=>setPayrollModal(false)} data={payrollData} refresh={getRows} />
        </>
    );
}

export default PayrollTable;