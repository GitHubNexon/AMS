import React, { useEffect, useState } from 'react';
import reportsApi from '../api/reportsApi';
import { numberToCurrencyString } from '../helper/helper';

function InvoiceStatusOverview({ onButtonClick }) {

    const [status, setStatus] = useState({overdue: {amount: 0, invoices: 0}, recent: {amount: 0, invoices: 0}, open: {amount: 0, invoices: 0}});
    const [percentage, setPercentage] = useState([33, 33, 33]);
    const [activeButton, setActiveButton] = useState(null); 

    useEffect(()=>{
        fetchStatus();
    }, [])

    async function fetchStatus(){
        try{
            const response = await reportsApi.invoiceStatusOverview();
            setStatus(response);
        }catch(error){
            console.error('failed to fetch invoice status', error);
        }
    }

    useEffect(()=>{
        setPercentage(mapToPercentage(status.overdue.amount, status.open.amount, status.recent.amount));
    }, [status]);

    // corresponds to div percentage width divided by 3
    function mapToPercentage(num1, num2, num3) {
        const total = num1 + num2 + num3;
        let percentage1 = Math.round((num1 / total) * 100);
        let percentage2 = Math.round((num2 / total) * 100);
        let percentage3 = 100 - (percentage1 + percentage2);
        return [percentage1, percentage2, percentage3];
    }

    const handleButtonClick = (type) => {
        if (activeButton === type) {
            setActiveButton(null);
            onButtonClick(null); 
        } else {
            setActiveButton(type);
            onButtonClick(type);
        }
    };

    return (
        <div className='flex'>
            <div style={{ width: `${percentage[0]}%` }} className="h-[85px] flex flex-col min-w-[150px]">
                <span className='text-[1.2em] font-bold'>₱ {numberToCurrencyString(status.overdue.amount)}</span>
                <span className='text-[0.8em] text-gray-800'>{status.overdue.invoices} overdue invoices</span>
                <button
                    className={`p-2 mt-[auto] transition-all duration-100 rounded 
                        ${activeButton === 'overdue' ? 'border-b-[10px] border-orange-200' : 'bg-orange-500 hover:border-b-[10px]'} 
                        ${activeButton !== 'overdue' ? '' : 'bg-orange-500'}`}
                    onClick={() => handleButtonClick("overdue")}
                ></button>
            </div>

            <div style={{ width: `${percentage[1]}%` }} className="h-[85px] min-w-[150px] flex flex-col">
                <span className='text-[1.2em] font-bold'>₱ {numberToCurrencyString(status.open.amount)}</span>
                <span className='text-[0.8em] text-gray-800'>{status.open.invoices} open invoice with credits</span>
                <button
                    className={`p-2 mt-[auto] transition-all duration-100 rounded 
                        ${activeButton === 'open' ? 'border-b-[10px] border-gray-500' : 'bg-gray-500 hover:border-b-[10px]'} 
                        ${activeButton !== 'open' ? '' : 'bg-gray-700'}`}
                    onClick={() => handleButtonClick("open")}
                ></button>
            </div>

            <div style={{ width: `${percentage[2]}%` }} className="h-[85px] min-w-[150px] flex flex-col">
                <span className='text-[1.2em] font-bold'>₱ {numberToCurrencyString(status.recent.amount)}</span>
                <span className='text-[0.8em] text-gray-800'>{status.recent.invoices} recently paid</span>
                <button
                    className={`p-2 mt-[auto] transition-all duration-100 rounded 
                        ${activeButton === 'recent' ? 'border-b-[10px] border-green-200' : 'bg-green-500 hover:border-b-[10px]'} 
                        ${activeButton !== 'recent' ? '' : 'bg-green-500'}`}
                    onClick={() => handleButtonClick("recent")}
                ></button>
            </div>
        </div>
    );
}

export default InvoiceStatusOverview;