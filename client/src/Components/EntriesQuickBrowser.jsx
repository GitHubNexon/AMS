import React, { useEffect, useState, useRef } from 'react';
import DateRangePicker from './DateRangePicker';
import { formatDateToYYYMMdd, numberToCurrencyString } from '../helper/helper';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

// selectEntries is state (* array of selected rows) setter prop that uplift selected rows from ths component 
function EntriesQuickBrowser({ preGL, preSL, preSearch, preEntry, selected=[], setSelected=()=>{} }) {

    const [gl, setGl] = useState('');
    const [sl, setSl] = useState('');
    const [query, setQuery] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [p, setP] = useState('true');
    const [r, setR] = useState('true');
    const [j, setJ] = useState('true');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(0); // New state for total pages
    const [totalDocs, setTotalDocs] = useState(0);

    const [rows, setRows] = useState([]);

    const [debounceQuery, setDebounceQuery] = useState('');
    const timeoutRef = useRef(null);

    const [entryType, setEntryType] = useState('');

    useEffect(()=>{
        // delay implemented due to state async update before search is called
        setTimeout(()=>{
            if(preGL) setGl(preGL);
            if(preSL) setSl(preSL);
            if(preSearch) setDebounceQuery(preSearch);
            const states = {
                payment: { p: 'true', r: '', j: '' },
                receipt: { p: '', r: 'true', j: '' },
                journal: { p: '', r: '', j: 'true' },
                default: { p: 'true', r: 'true', j: 'true' }, // default is always empty string
            };
            const { p, r, j } = states[preEntry] || states.default;
            setP(p);
            setR(r);
            setJ(j);
            setEntryType(preEntry);
        }, 500);
    }, [preGL, preSL, preSearch, preEntry]);

    useEffect(()=>{
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setQuery(debounceQuery);
        }, 500);
        return () => clearTimeout(timeoutRef.current);
    }, [debounceQuery])

    useEffect(()=>{
        searchEntries();
    }, [gl, sl, query, from, to, p, r, j, page]);

    async function searchEntries(){
        const response = await axios.get(`/reports/entries/search?from=${from}&to=${to}&p=${p}&r=${r}&j=${j}&acc=${gl}&sl=${sl}&ret=&page=${page}&limit=${limit}&c=false&query=${query}`, 
            { withCredentials: true }
        );
        setRows(response.data.entries);
        setTotalPages(response.data.totalPages); // Get total pages from the response
        setTotalDocs(response.data.totalCount);
    }

    function dateSelect(e){
        setFrom(formatDateToYYYMMdd(e.startDate));
        setTo(formatDateToYYYMMdd(e.endDate));
    }

    function prevClick(){
        if(page <= 1) return;
        setPage(page - 1);
    }

    function nextClick(){
        if(page >= totalPages) return;
        setPage(page + 1);
    }

    function filterEntryType(e) {
        setEntryType(e.target.value);
        const states = {
            payment: { p: 'true', r: '', j: '' },
            receipt: { p: '', r: 'true', j: '' },
            journal: { p: '', r: '', j: 'true' },
            default: { p: 'true', r: 'true', j: 'true' },
        };
        const { p, r, j } = states[e.target.value] || states.default;
        setP(p);
        setR(r);
        setJ(j);
    }

    function check(e, item) {
        if (e.target.checked) {
            setSelected([...selected, item]); // Add item if checked
        } else {
            let d = selected.filter(f=>!(f._id === item._id && f.ACCTCODE === item.ACCTCODE && f.SLCODE === item.SLCODE && f.SLDEBIT === item.SLDEBIT && f.SLCREDIT === item.SLCREDIT));
            setSelected(d); // Remove item if unchecked
        }
    }

    function isChecked(item){
        return selected.some(f =>
            f._id === item._id &&
            f.ACCTCODE === item.ACCTCODE &&
            f.SLCODE === item.SLCODE &&
            f.SLDEBIT === item.SLDEBIT &&
            f.SLCREDIT === item.SLCREDIT
        );
    }

    function rowClick(item){       
        if (!isChecked(item)) {
            setSelected([...selected, item]); // Add item if checked
        } else {
            let d = selected.filter(f=>!(f._id === item._id && f.ACCTCODE === item.ACCTCODE && f.SLCODE === item.SLCODE && f.SLDEBIT === item.SLDEBIT && f.SLCREDIT === item.SLCREDIT));
            setSelected(d); // Remove item if unchecked
        }
    }

    return (
        <div>
            <div className='flex p-2'>
                <div className='mr-4 flex items-center'>
                    <span className='mr-2 font-bold'>GL:</span>
                    <input 
                        type="text" 
                        value={gl} 
                        onChange={(e)=>setGl(e.target.value)} 
                        className='border rounded-lg px-2 py-[7px] shadow w-[120px]' 
                        placeholder='account code' />
                </div>
                <div className='mr-4 flex items-center'>
                    <span className='mr-2 font-bold'>SL:</span>
                    <input 
                        type="text" 
                        value={sl}
                        onChange={(e)=>setSl(e.target.value)}
                        className='border rounded-lg px-2 py-[7px] shadow w-[120px]' 
                        placeholder='subledger code' />
                </div>
                <div className='mr-4 flex items-center'>
                    <span className='mr-2 font-bold'>Search:</span>
                    <input 
                        type="text" 
                        value={debounceQuery}
                        onChange={(e)=>setDebounceQuery(e.target.value)}
                        className='border rounded-lg px-2 py-[7px] shadow' 
                        placeholder='type here' />
                </div>
                <div className='mr-4'>
                    <DateRangePicker onChange={dateSelect} />
                </div>
                <div className='mr-4 flex items-center shadow-lg'>
                    <select value={entryType} onChange={filterEntryType} className='border rounded-lg px-2 py-[9px]' >
                        <option value="">All</option>
                        <option value="payment">Payment</option>
                        <option value="receipt">Receipt</option>
                        <option value="journal">Journal</option>
                    </select>
                </div>
            </div>
            <table className='text-[0.9em] w-[100%]'>
                <thead>
                    <tr className='border-b'>
                        <th className='border-r px-1' ></th>
                        <th className='border-r px-1' >GL</th>
                        <th className='border-r px-1' >SL</th>
                        <th className='border-r px-1' >Doc no.</th>
                        <th className='border-r px-1' >Date</th>
                        <th className='border-r px-1' >Particulars</th>
                        <th className='border-r px-1' >Debit</th>
                        <th className='border-r px-1' >Credit</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        rows.map((item, index)=>
                            <tr key={index} className='border-b hover:bg-gray-100' onClick={()=>rowClick(item)} >
                                <td className='border-r px-1'><input type="checkbox" checked={isChecked(item)} onChange={(e)=>check(e, item)} /></td>
                                <td className='border-r px-1' >{item.ACCTCODE} - {item['ACCOUNT NAME']}</td>
                                <td className='border-r px-1' >{item.SLCODE} - {item.SLNAME}</td>
                                <td className='border-r px-1' >{item.SLDOCNO}</td>
                                <td className='border-r px-1' >{item.SLDATE}</td>
                                <td className='border-r px-1'>{item.SLDESC}</td>
                                <td className='border-r px-1' >{item.SLDEBIT ? numberToCurrencyString(item.SLDEBIT) : ''}</td>
                                <td className='border-r px-1' >{item.SLCREDIT ? numberToCurrencyString(item.SLCREDIT) : ''}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div className='flex items-center justify-center p-4 relative'>
                <span className='absolute left-0'>page {page} of {totalPages}</span>
                <button className='mr-2' onClick={prevClick} ><FaChevronLeft /></button>
                <button className='ml-2' onClick={nextClick} ><FaChevronRight /></button>
                <span className='absolute right-0'>{totalDocs} entries</span>
            </div>
        </div>
    );
}

export default EntriesQuickBrowser;