import React, { useEffect } from 'react';
import { formatReadableDate, numberToCurrencyString } from '../helper/helper';

function ViewEntry({ entry={} }) {

    useEffect(()=>{
        console.log(entry);
    }, [entry]);

    return (
        <div className='flex flex-col text-[0.9em]'>
            <div className='flex flex-wrap mb-8'>
                <div className='flex mr-4'>
                    <span className='mr-2 font-bold'>Entry Type: </span>
                    <span className='underline'>{entry.EntryType}</span>
                </div>
                <div className='flex mr-4'>
                    <span className='mr-2 font-bold'>No: </span>
                    <span className='underline'>{entry.DVNo ? entry.DVNo : entry.JVNo ? entry.JVNo : entry.CRNo}</span>
                </div>
                <div className='flex mr-4'>
                    <span className='mr-2 font-bold'>Entry Date: </span>
                    <span className='underline'>{formatReadableDate(new Date(entry.DVDate ? entry.DVDate : entry.JVDate ? entry.JVDate : entry.CRDate))}</span>
                </div>
                {
                    entry.EntryType === 'Payment' &&
                    <>
                        <div className='flex mr-4'>
                            <span className='mr-2 font-bold'>Check Number: </span>
                            <span className='underline'>{entry.CheckNo}</span>
                        </div>
                        <div className='flex mr-4'>
                            <span className='mr-2 font-bold'>Payment Entity: </span>
                            <span className='underline'>{entry.PaymentEntity.name}</span>
                        </div>
                    </>
                }
                {
                    entry.EntryType === 'Receipt' &&
                    <>
                        <div className='flex mr-4'>
                            <span className='mr-2 font-bold'>Receipt Entry Type: </span>
                            <span className='underline'>{entry.ReceiptEntryType}</span>
                        </div>
                        <div className='flex mr-4'>
                            <span className='mr-2 font-bold'>Payment Method: </span>
                            <span className='underline'>{entry.paymentMethods}</span>
                        </div>
                    </>
                }
            </div>
            <div className='flex text-[0.9em] mb-8'>
                <table className='w-[100%]'>
                    <thead>
                        <tr className='border-b'>
                            <th className='px-2 py-1 border-r'>LEDGER CODE</th>
                            <th className='px-2 py-1 border-r'>LEDGER</th>
                            <th className='px-2 py-1 border-r'>SL CODE</th>
                            <th className='px-2 py-1 border-r'>SUBLEDGER</th>
                            <th className='px-2 py-1 border-r'>DEBIT</th>
                            <th className='px-2 py-1 border-r'>CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            entry.ledgers && entry.ledgers.map((item, index)=>
                                <tr key={index} className='border-b'>
                                    <td className='border-r px-1'>{item.ledger.code}</td>
                                    <td className='border-r px-1'>{item.ledger.name}</td>
                                    <td className='border-r px-1'>{item.subledger.slCode}</td>
                                    <td className='border-r px-1'>{item.subledger.name}</td>
                                    <td className='border-r px-1 text-end'>{item.dr > 0 ? numberToCurrencyString(item.dr) : ''}</td>
                                    <td className='border-r text-end'>{item.cr > 0 ? numberToCurrencyString(item.cr) : ''}</td>
                                </tr>
                            )
                        }
                        {
                            entry.ledgers && 
                            <tr className='border-b'>
                                <td className='border-r px-1'></td>
                                <td className='border-r px-1'></td>
                                <td className='border-r px-1'></td>
                                <td className='border-r px-1 text-end font-bold'>TOTAL</td>
                                <td className='border-r px-1 text-end'>{ numberToCurrencyString(entry.ledgers.map(m=>m.dr).reduce((pre,cur)=>pre+cur,0)) }</td>
                                <td className='border-r text-end'>{ numberToCurrencyString(entry.ledgers.map(m=>m.cr).reduce((pre,cur)=>pre+cur,0)) }</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div className='flex flex-col'>
                <div className='flex mb-4'>
                    <span className='font-bold mr-2'>Particulars:</span>
                    <span className='underline'>{entry.Particulars}</span>
                </div>
                {
                    entry.PreparedBy &&
                    <>
                    <div className='flex'>
                        <div className='flex mr-4'>
                            <span className='font-bold mr-2'>Prepared By: </span>
                            <span className='underline'>{entry.PreparedBy && entry.PreparedBy.name}</span>
                        </div>
                        {
                            entry.EntryType === 'Receipt' || entry.EntryType === 'Journal' &&
                            <div className='flex mr-4'>
                                <span className='font-bold mr-2'>Reviewed By:</span>
                                <span className='underline'>{entry.ReviewedBy && entry.ReviewedBy.name}</span>
                            </div>
                        }
                        <div className='flex mr-4'>
                            <span className='font-bold mr-2'>Certified By:</span>
                            <span className='underline'>{entry.CertifiedBy && entry.CertifiedBy.name}</span>
                        </div>
                        <div className='flex mr-4'>
                            <span className='font-bold mr-2'>Approved By:</span>
                            <span className='underline'>{entry.ApprovedBy1 && entry.ApprovedBy1.name}</span>
                        </div>
                        <div className='flex mr-4'>
                            <span className='font-bold mr-2'>Approved By:</span>
                            <span className='underline'>{entry.ApprovedBy2 && entry.ApprovedBy2.name}</span>
                        </div>
                    </div>
                    </>
                }
            </div>
        </div>
    );
}

export default ViewEntry;