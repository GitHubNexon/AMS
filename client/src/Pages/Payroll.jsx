import React, { useEffect, useState } from 'react';
import PayrollModal from '../Components/Payroll/PayrolModal';
import PayrollTable from '../Components/Payroll/PayrollTable';

function Payroll() {

    const [payrollModal, setPayrollModal] = useState(false);

    useEffect(()=>{
        console.log(payrollModal);
    }, [payrollModal]);

    return (
        <>
            <div className='text-[0.9em]'>
                <div className='p-2 border-b flex'>
                    <div className='flex-1 p-2'>
                        <span className='font-bold'>Payroll</span>
                    </div>
                    <div className='flex px-4 flex'>
                        <button className='btn-primary' onClick={()=>setPayrollModal(true)} >Add new</button>
                    </div>
                </div>
                <div className='p-1'>
                    <PayrollTable />
                </div>
            </div>
            <PayrollModal 
                open={payrollModal}
                close={()=>setPayrollModal(false)} />
        </>
    );
}

export default Payroll;