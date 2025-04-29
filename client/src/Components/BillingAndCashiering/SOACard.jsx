import React, { useEffect, useState } from 'react';
import SOACardEditor from './SOACardEditor';
import { FaFilePen } from 'react-icons/fa6';
import { numberToCurrencyString } from '../../helper/helper';

function SOACard({ data, editRow=()=>{} }) {

    function numberify(amount){
        return amount ? numberToCurrencyString(amount) : '';
    }

    function formatDateToDayMonthYear(date) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate(); // Get day of the month
        const month = months[date.getMonth()]; // Get abbreviated month name
        const year = date.getFullYear(); // Get full year
        return `${day}-${month}-${year}`;
    }

    function updateClick(){
        editRow(data);
    }

    return (
        <>
        <tr>
            <td className='p-1' rowSpan={2}>
                <div className='text-green-600 flex items-center justify-center'>
                    <button className='text-[1.5em]' onClick={updateClick} ><FaFilePen /></button>
                </div>
            </td>
            <td className='p-1' >
                <div className='max-w-[200px]'>
                    <span>{ data.row1.particular}</span>
                </div>
            </td>
            <td className='p-1' >
                <span>{ numberify(data.row1.billingAmount) }</span>
            </td>
            <td className='p-1' ></td>
            <td className='p-1' ></td>
            <td className='p-1' ></td>
            <td className='p-1' >{ numberify(data.row1.penalty) }</td>
            <td className='p-1' >{ numberify(data.row1.amountDue) }</td>
            <td className='p-1' >{ numberify(data.row1.outstandingBalance) }</td>
            <td className='p-1' >{ data ? data.row1.dueDate ? formatDateToDayMonthYear(new Date(data.row1.dueDate)) : "" : "" }</td>
            <td className='p-1' >{ data.row1.daysDelayed === 0 ? "" : data.row1.daysDelayed }</td>
        </tr>
        <tr className='bg-gray-100 border-b'>
            <td className='p-1' >
                <div className='max-w-[200px]'>
                    <span>{ data.row2.particular }</span>
                </div>
            </td>
            <td className='p-1' ></td>
            <td className='p-1' >{ data.row2 ? data.row2.paymentDate ? formatDateToDayMonthYear(new Date(data.row2.paymentDate)) : '' : '' }</td>
            <td className='p-1' >{data.row2.paymentRefNo}</td>
            <td className='p-1' >{ numberify(data.row2.paymentAmount) }</td>
            <td className='p-1' ></td>
            <td className='p-1' >{ numberify(data.row2.amountDue) }</td>
            <td className='p-1' >{ data.row2.paymentAmount ? numberify(data.row2.outstandingBalance) : "-" }</td>
            <td className='p-1' ></td>
            <td className='p-1' ></td>
        </tr>
        </>
    );
}

export default SOACard;