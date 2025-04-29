import React, { useEffect, useState } from 'react';
import SOA from './SOA';
import Modal from '../Modal';
import axios from 'axios';
import { formatMMMDDYYYY, formatReadableDate, formatDateToYYYMMdd, numberToCurrencyString } from '../../helper/helper';
import GLInput from '../GLInput';
import { FaPlus } from 'react-icons/fa6';
import { MdOutlineSync } from "react-icons/md";
import SOACardEditor from './SOACardEditor';
import SOACard from './SOACard';
import SOAPrint from './SOAPrint';

import wip from "../../assets/images/wip.png"

function SOATable({slCode='', name='', data={}}) {

    const [fromDate, setFromDate] = useState(() => {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1); // Subtract 1 year
        return formatDateToYYYMMdd(lastYear); // Format the date
    });      
    const [asofDate, setAsofDate] = useState(formatDateToYYYMMdd(new Date()));
    const [account, setAccount] = useState({code: '10301010B', name: 'RENTAL RECEIVABLE'});
    const [soaEditorModal, setSoaEditorModal] = useState({ show: false, data: null, mode: 'add' });
    const [rows, setRows] = useState([]);

    const [totals, setTotals] = useState(
        {
            totalBillingAmount: 0,
            totalPaymentAmount: 0,
            totalPenalty: 0,
            totalAmountDue: 0,
            oustandingBalance: 0
        }
    );

    const [perBook, setPerBook] = useState(0);

    useEffect(()=>{
        if(!fromDate && !asofDate && !account) return;
        getRows();
        getTotal();
        getBookBalance();
    }, [fromDate, asofDate, account, slCode]);
    
    async function getBookBalance(){
        // get book balance and variance
        const response = await axios.get(`/reports/book/summary?gl=${account.code}&sl=${slCode}&to=${asofDate}`, { withCredentials: true });
        setPerBook(response.data.debit - response.data.credit);
    }

    async function getRows(){
        const response = await axios.get(`/statementOfAccount/${fromDate}/${asofDate}/${account.code}/${slCode}`);
        setRows(response.data);
    }

    async function getTotal(){
        if(asofDate && slCode && account.code){
            const response = await axios.get(`/statementOfAccount/total/${asofDate}/${slCode}/${account.code}`, { withCredentials: true });
            setTotals(response.data);
        }
    }

    function plusClick(){
        setSoaEditorModal({ show: true, data: null, mode: 'add' });
    }

    function editRow(data){
        setSoaEditorModal({ show: true, data: data, mode: 'edit' });
    }

    async function recalcClick(){
        await axios.get(`/statementOfAccount/recalc/${slCode}/${account.code}`, { withCredentials: true });
        getRows();
        getTotal();
        getBookBalance();
    }

    function refresher(){
        getRows();
        getTotal();
        getBookBalance();
    }

    return (
        <>
        <div className='flex flex-col min-w-[90vw]'>
                <div className='flex border-b shadow p-2'>
                    <div className='flex-1 flex'>
                        <div className='flex mr-4 items-center'>
                            <span className='mr-2' >From</span>
                            <input 
                                type="date" 
                                value={fromDate}
                                onChange={(e)=>setFromDate(e.target.value)}
                                className='border px-1 py-1 rounded' />
                        </div>
                        <div className='flex mr-4 items-center'>
                            <span className='mr-2'>As of</span>
                            <input 
                                type="date" 
                                value={asofDate}
                                onChange={(e)=>setAsofDate(e.target.value)}
                                className='border px-1 py-1 rounded' />
                        </div>
                        <div className='flex mr-4 items-center'>
                            <span className='mr-2'>Account</span>
                            <div className='w-[250px]'>
                                <GLInput selectedAccount={account} setSelectedAccount={setAccount} />
                            </div>
                        </div>
                    </div>
                    <span>{slCode} - {data.name}</span>
                </div>
                <div className='h-[60vh] overflow-y-scroll border-b'>

                {/* <img src={wip} className='h-[200px] w-[200px]' /> */}

                <div className='flex flex-col'>
                    <table className='text-[0.9em]'>
                        <thead className='sticky top-[-15px]'>
                            <tr className='bg-orange-200 border-t border-black'>
                                <th className='border-r border-l border-black p-1' rowSpan={2}>
                                    <button onClick={recalcClick} className='text-[1.44em]' ><MdOutlineSync /></button>
                                </th>
                                <th className='border-r border-black p-1'></th>
                                <th className='border-r border-black p-1'>BILLING</th>
                                <th className='border-r border-b border-black p-1' colSpan={3}>PAYMENT</th>
                                <th className='border-r border-black p-1'>PENALTY</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-black p-1'>OUTSTANDING</th>
                                <th className='border-r border-black p-1'>DUE</th>
                                <th className='border-r border-black p-1'>DAYS</th>
                            </tr>
                            <tr className='border-b border-black bg-orange-200'> 
                                <th className='border-r border-black p-1'>PARTICULARS</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-black p-1'>DATE</th>
                                <th className='border-r border-black p-1'>REF No.</th>
                                <th className='border-r border-black p-1'>AMOUNT</th>
                                <th className='border-r border-black p-1'>{data.penalty ? `${data.penalty}% pa` : ''}</th>
                                <th className='border-r border-black p-1'>DUE</th>
                                <th className='border-r border-black p-1'>BALANCE</th>
                                <th className='border-r border-black p-1'>DATE</th>
                                <th className='border-r border-black p-1'>DELAYED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.map((item, index)=>
                                    <React.Fragment key={index}>
                                        <SOACard data={item} editRow={editRow} />
                                    </React.Fragment>
                                )
                            }
                            <tr>
                                <td colSpan={10}>
                                <div className='flex p-4 justify-center'>
                                    <button className='bg-green-600 text-white p-2 rounded-xl' onClick={plusClick} ><FaPlus /></button>
                                </div>
                                </td>
                            </tr>
                            <tr className='bg-orange-200 border border-black font-bold'>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'>TOTAL</td>
                                <td className='border-r border-black p-1'>
                                    {numberToCurrencyString(totals.totalBillingAmount)}
                                </td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'>
                                    {numberToCurrencyString(totals.totalPaymentAmount)}
                                </td>
                                <td className='border-r border-black p-1'>
                                    {numberToCurrencyString(totals.totalPenalty)}
                                </td>
                                <td className='border-r border-black p-1'>
                                    {numberToCurrencyString(totals.totalAmountDue)}
                                </td>
                                <td className='border-r border-black p-1'>
                                    {numberToCurrencyString(totals.oustandingBalance)}
                                </td>
                                <td className='border-r border-black p-1'></td>
                                <td className='border-r border-black p-1'></td>
                            </tr>
                            <tr className='bg-orange-200 border border-black font-bold'>
                                <td colSpan={8} className='p-1 border-r border-black text-end'>BALANCE PER BOOK</td>
                                <td className='p-1'>{numberToCurrencyString(perBook)}</td>
                                <td className='p-1'></td>
                                <td className='p-1'></td>
                            </tr>
                            <tr className='bg-orange-200 border border-black font-bold'>
                                <td colSpan={8} className='p-1 border-r border-black text-end'>VARIANCE</td>
                                <td className='p-1'>{numberToCurrencyString(perBook - totals.totalPenalty - totals.totalAmountDue)}</td>
                                <td className='p-1'></td>
                                <td className='p-1'></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
            <div className='p-2 flex justify-end'>
                <SOAPrint soa={{
                    asofDate: asofDate,
                    client: data,
                    account: account,
                    totals: totals,
                    rows: rows
                }} />
                <button className='btn-primary text-[1.3em] mr-4'>Save</button>
            </div>
        </div>
        <SOACardEditor 
            show={soaEditorModal.show} 
            client={data}
            account={account}
            data={soaEditorModal.data}
            mode={soaEditorModal.mode}
            refresh={refresher}
            close={()=>setSoaEditorModal({ show: false, data: null, mode: 'add' })} />
        </>
    );
}

export default SOATable;