import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import useBase from '../context/useBase';
import useAccountsLogic from '../context/useAccountsLogic';

// pass down state and setState
// will handle account selection (returns entire account object)
// use manualShow props to force open the modal (used when you want to hide the input)
function AccountPicker({selectedAccount=false, setSelectedAccount, className, nameOnly=false, filter=['ASSETS', 'LIABILITIES', 'CAPITAL', 'REVENUES/INCOME', 'EXPENSES'] /*, manualShow=false, manualClose=()=>{}*/ }) {

    const {base} = useBase([]);
    const {accounts} = useAccountsLogic();
    const [modal, setModal] = useState({show: false});
    const [dModal, setDModal] = useState({show: false, item: {code: '', name: '', description: ''}});
    const [category, setCategory] = useState();
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(()=>{
        if(!category){
            filterAccounts(search, filter[0]);        
        }else{
            filterAccounts(search, category);        
        }
    }, [search, category, base, accounts]);

    function filterAccounts(s, c){
        let accs = accounts.filter(i => i.category === c);
        if (s) {
            const regex = new RegExp(s, 'i');
            setFilteredAccounts(
                accs.filter(i => regex.test(i.code) || regex.test(i.name) || regex.test(i.otherField))
            );
        } else {
            setFilteredAccounts(accs);
        }
    }

    const [query, setQuery] = useState("");
    const handleSearch = (searchQuery) => {
        setSearch(searchQuery);
    };
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch(query);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    function selectAccount(){
        setModal({show: true});
    }

    function categoryChange(e){
        setCategory(e.target.value);
    }

    function infoClick(item){
        setDModal({show: true, item: item});
    }

    function accountSelect(item){
        setSelectedAccount(item);
        setModal({show: false});
        setDModal({show: false, item: {code: '', name: '', description: ''}});
    }

    return (
        <>
        <input 
            className={`
                border rounded border-gray-300 p-1 flex-1 w-[100%]
                ${className}    
            `} 
            type="text"
            placeholder='Select Account'
            value={selectedAccount ? `${nameOnly ? '' : selectedAccount && selectedAccount.code + " - "}${selectedAccount && selectedAccount.name}` : ''}
            onClick={selectAccount}
            readOnly />
        <Modal title='Select Account' show={modal.show} closeCallback={()=>setModal({show: false})} >
            <div className='p-4 flex flex-1 flex-col z-50'>
                <select className='border rounded p-1 mb-4' value={category} onChange={categoryChange} >
                    { base.accountCategories.filter(f=>filter.includes(f)).map((item, index)=><option key={index} value={item} >{item}</option>) }
                </select>
                <input type="text" className='border rounded p-1 mb-4' onChange={(e) => setQuery(e.target.value)} placeholder='Search' />
                <div className='h-[50vh] overflow-scroll text-xs relative'>
                    <table className=''>
                        <thead>
                            <tr className='bg-gray-200 sticky top-0'>
                                <th className='p-1'>Code</th>
                                <th className='p-1 w-[300px]'>Account</th>
                                <th className='p-1'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredAccounts.map((item, index)=>
                                    <tr key={index} className='hover:bg-gray-100 border-b'>
                                        <td className='p-1'>
                                            <button type='button' className='bg-blue-200 px-[5px] mr-2 rounded' onClick={()=>infoClick(item)}>?</button>
                                            {item.code}
                                        </td>
                                        <td className='p-1 text-[0.8em]'>{item.name}</td>
                                        <td className='p-1'>
                                            <button type='button' className='bg-green-600 hover:bg-green-500 text-[0.8em] p-1 rounded text-white' onClick={()=>accountSelect(item)}>Select</button>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
        <Modal show={dModal.show} closeCallback={()=>setDModal({show: false, item: {code: '', name: '', description: ''}})}>
            <div className='flex flex-col p-4'>
                <div className='flex mb-[10px]'>
                    <span className='w-[105px] font-bold'>Code: </span>
                    <span className='w-[50vw]'>{dModal && dModal.item.code}</span>
                </div>
                <div className='flex mb-[10px]'>
                    <span className='w-[105px] font-bold'>Account: </span>
                    <span className='w-[50vw]'>{dModal.item.name || ''}</span>
                </div>
                <div className='flex mb-[10px]'>
                    <span className='w-[105px] font-bold'>Description: </span>
                    <span className='max-w-[50vw]'>{dModal.item.description || ''}</span>
                </div>
            </div>
            <div className='flex justify-center p-4'>
                <button type='button' className='bg-green-500 hover:bg-green-400 px-2 py-1 rounded text-white' onClick={()=>accountSelect(dModal.item)}>Select this account</button>
            </div>
        </Modal>
        </>
    );
}

export default AccountPicker;