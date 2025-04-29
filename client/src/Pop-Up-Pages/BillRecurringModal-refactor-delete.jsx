import React from 'react';
import Modal from '../Components/Modal';

function BillRecurringModal({ show=false, close=()=>{} }) {

    return (
        <Modal title='Recurring bill' show={show} closeCallback={close} >
            <div className='flex-1 border-t border-b p-4'>

            </div>
            <div className='p-4'>

            </div>
        </Modal>
    );
}

export default BillRecurringModal;