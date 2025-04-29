import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SalesShortcuts() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='border-b'>
            <h1 className='font-bold py-2 px-4'>Sales</h1>
            <ul className='flex text-[0.9em] pt-4'>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/allSales' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/allSales')} >All Sales</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/invoicestable' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/invoicestable')}>Invoices</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/customers' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/customers')} >Customers</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/productsandservices' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/productsandservices')} >Product & Services</button>
                </li>
            </ul>
        </div>
    );
}

export default SalesShortcuts;