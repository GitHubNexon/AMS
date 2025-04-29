import React from 'react';
import { useNavigate,useLocation } from 'react-router-dom';

function ExpensesShortcuts() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='border-b'>
            <h1 className='font-bold py-2 px-4'>Expenses</h1>
            <ul className='flex text-[0.9em] pt-4'>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/AllExpenses' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/AllExpenses')} >All Expenses</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/Bills' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/Bills')} >Bills</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/Vendors' ? 'green-500' : 'transparent'}`}>
                    <button onClick={()=>navigate('/Vendors')} >Vendors</button>
                </li>
            </ul>
        </div>
    );
}

export default ExpensesShortcuts;