import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom';

const ReportNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className='border-b overflow-auto'>
            <h1 className='font-bold py-2 px-4'>Budget Monitoring</h1>
            <ul className='flex text-[0.9em] pt-4 mb-2'>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/BudgetAnalytics' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/BudgetAnalytics')}>Budget Analytics</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] border-${location.pathname === '/BudgetMonitoring' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/BudgetMonitoring')}>Budget Monitoring</button>
                </li>
            </ul>
        </div>
    );
}

export default ReportNavigation