import React, { useContext, useState } from 'react';
import Modal from './Modal';
import CurrencyInput from './CurrencyInput';
import AccountPicker from './AccountPicker';
import SubledgerPicker from './SubledgerPicker';
import { showToast } from '../utils/toastNotifications';
import { LedgerSheetContext } from '../context/LedgerSheetContext';

function OtherDeductionModal({ show, close }) {

    const { pushOtherDeductionToSelectedRow } = useContext(LedgerSheetContext);

    const [amount, setAmount] = useState(null);
    const [type, setType] = useState('dr');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [slCode, setSlCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    function confirmClick(){
        if(!amount && !selectedAccount && !slCode && !description){
            showToast('Enter complete information', 'warning');
            return;
        }
        pushOtherDeductionToSelectedRow({
            amount: amount,
            type: type,
            ledger: selectedAccount,
            subledger: {
                slCode: slCode,
                name: name
            },
            description: description
        });
        close();
    }

    return (
        <Modal title='Other deduction' show={show} closeCallback={close} >
            <div className='border-t border-b flex-1 p-4 flex flex-col text-[0.9em]'>
                <div className='flex mb-4'>
                    <AccountPicker className={'mr-2'} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
                    <div className='min-w-[200px]'>
                        <SubledgerPicker slCode={slCode} setSLCode={setSlCode} name={name} setName={setName} />
                    </div>
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Amount</span>
                    <div>
                        <CurrencyInput val={amount} setVal={(v)=>setAmount(v)} className={'border px-2 py-1 rounded shadow mr-4'} />
                        <label className='mr-4'>
                            <input type="radio" className='mr-1' checked={type === 'dr'} onChange={()=>setType('dr')} />Debit
                        </label>
                        <label className='mr-4'>
                            <input type="radio" className='mr-1' checked={type === 'cr'} onChange={()=>setType('cr')} />Credit
                        </label>
                    </div>
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Description</span>
                    <textarea className='border rounded shadow resize-none p-2' value={description} onChange={(e)=>setDescription(e.target.value)} ></textarea>
                </div>
            </div>
            <div className='p-4 flex items-center justify-center'>
                <button type='button' className='btn-primary' onClick={confirmClick} >Confirm</button>
            </div>
        </Modal>
    );
}

export default OtherDeductionModal;