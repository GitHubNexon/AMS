import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function EntriesShortcut() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='border-b'>
            <h1 className='font-bold py-2 px-4'>Entries</h1>
            <ul className='flex text-[0.9em] pt-4'>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/entries' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/entries')}>All Entries</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/paymentEntries' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/paymentEntries')}>Payment Entry</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/receiptEntries' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/receiptEntries')}>Receipt Entry</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/journalEntries' || location.pathname === '/lessee' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/journalEntries')}>Journal Entry</button>
                </li>
            </ul>
        </div>
    );
}

export default EntriesShortcut;
