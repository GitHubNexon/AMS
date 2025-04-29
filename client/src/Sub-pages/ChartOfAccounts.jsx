import React, { useEffect, useRef, useState } from 'react';
import useBase from '../context/useBase';
import Modal from '../Components/Modal';
// import TaxPicker from '../Components/TaxPicker';
import { redBorderMarker } from '../helper/helper';
import useAccountsLogic from '../context/useAccountsLogic';
import DataTable from 'react-data-table-component';
import { FaMagnifyingGlass, FaPencil } from 'react-icons/fa6';
import { formatMMMDDYYYY } from '../helper/helper';
import AccountPicker from '../Components/AccountPicker';
import { showToast } from '../utils/toastNotifications';
import SubledgerTable from '../Components/SubledgerTable';
import TaxTable from "../Sub-pages/TaxTable";
import { FaTable } from 'react-icons/fa6';
import { RiNodeTree } from 'react-icons/ri';
import AccountsTree from '../Components/AccountsTree';
import { useDataPreloader } from '../context/DataPreloader';

function ChartOfAccounts() {

    const {accounts, addNewAccount, updateAccount, fetchAccounts, archiveAccount} = useAccountsLogic();
    const {base} = useBase();
    const {refreshAccounts} = useDataPreloader();

    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [account, setAccount] = useState({
        mode: 'add', 
        show: false, _id: '', 
        category: '', 
        code: '', 
        name: '', 
        description: '', 
        isSubAccount: false, 
        parentAccount: {}, 
        subAccount: []
    });
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState('ALL');
    const [messagebox, setMessagebox] = useState({show: false, message: '', callback: ()=>{}});
    const [isChildAccount, setIsChildAccount] = useState(false);
    const [parentAccount, setParentAccount] = useState(null);

    const codeRef = useRef();
    const accountNameRef = useRef();

    useEffect(()=>{
        setAccount({...account, parentAccount: parentAccount});
    }, [parentAccount]);

    useEffect(()=>{
        filterTable(search, category);
    }, [accounts]);

    useEffect(()=>{
        filterTable(search, category);
    }, [search, category]);

    function subaccountToggle(e){
        setIsChildAccount(e.target.checked);
        setAccount({...account, isSubAccount: e.target.checked, parentAccount: {}});
        if(!isChildAccount) setParentAccount(null);
    }

    function filterTable(s, c) {
        let accs = accounts;
        switch (c) {
            case 'ALL':
                accs = accounts.filter(i => !i.archived);
                break;
            case 'ARCHIVE':
                accs = accounts.filter(i => i.archived);
                break;
            default:
                accs = accounts.filter(i => i.category === c);
        }
    
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

    const columns = [
        { name: 'Code', selector: row=>row.code, sortable: true, width: '120px'},
        { name: 'Account', selector: row=>row.name, sortable: true},
        { name: 'Parent Account', selector: row=>row.parentAccount ? `${row.parentAccount.code} - ${row.parentAccount.name}` : '', sortable: true },
        { name: 'Sub Accounts', selector: row=>row.subAccount.length > 0 ? row.subAccount.length : '', sortable: true, width: '150px' },
        { name: 'Category', selector: row=>row.category, sortable: true, width: '150px'},    
        {
            name: 'Actions',
            cell: row => (
              <button
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
                onClick={() => editAccount(row)}
              >
                <FaPencil />
              </button>
            ),
            width: '80px'
        },    
    ];

    const conditionalRowStyles = [
        {
            when: row => true, // Apply this style to all rows
            style: {
                cursor: 'pointer', // Change cursor to pointer on hover
                '&:hover': {
                    backgroundColor: '#f2f2f2', // Change background on hover
                },
            },
        },
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: '#f1f1f1', borderBottomColor: '#ccc', borderBottomWidth: '2px', minHeight: '40px' } },
        rows: { style: { minHeight: '30px', padding: '5px', fontSize: '0.7em' } },
    };

    function editAccount(item){
        setIsChildAccount(item.isSubAccount);
        setParentAccount(item.parentAccount);
        setAccount({...item, show: true, mode: "edit"});
    }

    function addNewClick(){
        setIsChildAccount(false);
        setParentAccount(null);
        setAccount({
            mode: 'add', 
            show: true, 
            _id: '', 
            category: base.accountCategories[0], 
            code: '', 
            name: '', 
            description: '', 
            isSubAccount: false, 
            parentAccount: {}, 
            openingBalance: '',
            openingBalanceAsOf: '',
            taxes: [],
            subAccount: []
        });
    }
    
    async function saveClick(){
        if(checkinput()) return;
        let response = undefined;
        switch(account.mode){
            case "add":
                response = await addNewAccount({
                    category: account.category,
                    code: account.code,
                    name: account.name,
                    description: account.description,
                    isSubAccount: account.isSubAccount,
                    parentAccount: account.parentAccount.code
                });
            break;
            case "edit":
                response = await updateAccount({
                    category: account.category,
                    code: account.code,
                    name: account.name,
                    description: account.description,
                    isSubAccount: account.isSubAccount,
                    parentAccount: account.parentAccount
                }, account._id);
            break;
        }
        if(!response) return;
        if(response.status === 200){
            setAccount({
                mode: 'add', 
                show: false, 
                _id: '', 
                category: '',
                code: '', 
                name: '', 
                description: '', 
                isSubAccount: false, 
                parentAccount: {}
            });
            fetchAccounts();
            refreshAccounts();
        }
        if(response.status === 409){
            redBorderMarker(codeRef.current);
        }
    };

    function checkinput(){
        let flag = false;
        if(!account.code){
            redBorderMarker(codeRef.current);
            flag = true;
        }
        if(!account.name){
            redBorderMarker(accountNameRef.current);
            flag = true;
        }
        if(isChildAccount){
            if(!parentAccount){
                showToast('Please select parent account', 'warning');
                flag = true;
            }
        }
        return flag;
    }

    function accountTypeChange(e){
        setAccount({...account, category: e.target.value});
    }

    function codeChange(e){
        setAccount({...account, code: e.target.value});
    }

    function asOfChange(e){
        setAccount({...account, openingBalanceAsOf: e.target.value});
    }

    function nameChange(e){
        setAccount({...account, name: e.target.value});
    }

    function descriptionChange(e){
        setAccount({
            ...account, 
            description: e.target.value
        });
    }

    function archiveAccountClick(){
        setMessagebox({
            ...messagebox, 
            show: true, 
            message: `Are you sure you want to archive account: ${account.code}`,
            callback: async ()=>{
                const response = await archiveAccount(account._id);
                console.log(response)
                if(response.status === 200){
                    setAccount({
                        mode: 'add', 
                        show: false, 
                        _id: '', 
                        category: '', 
                        code: '', 
                        name: '', 
                        description: '', 
                        isSubAccount: false, 
                        parentAccount: {}, 
                        subAccount: []
                    });
                    setMessagebox({show: false, callback: ()=>{}});
                    fetchAccounts();
                }
            }
        });
    }

    function closeModal(){
        setAccount({...account, show: false})
    }

    const [viewMode, setViewMode] = useState('table');

    function editFromTree(account){
        const acc = account;
        acc.parentAccount = acc.parent;
        delete acc.parent;
        acc.subAccount = acc.nodes.map(m=>({
            archived: m.archived,
            category: m.category,
            code: m.code,
            dateAdded: m.dateAdded,
            description: m.description,
            isSubAccount: m.isSubAccount,
            name: m.name,
            parentAccount: m.parentAccount,
            _v: m._v,
            _id: m._id
        }));
        setIsChildAccount(acc.isSubAccount);
        setParentAccount(acc.parentAccount);
        setAccount({...acc, show: true, mode: "edit"});
    }

    return (
        <>
        <Modal title='Account' show={account.show} closeCallback={closeModal}>
            <div className='text-[0.8em] flex flex-wrap min-w-[300px] max-h-[70vh] flex-1 overflow-y-scroll border-t border-b'>
                <div className='flex flex-col m-5'>
                    <div className='flex flex-col mb-3'>
                        <label className='m-1'>Category</label>
                        <select className='flex-1 border p-1 rounded' value={account.category || ''} onChange={accountTypeChange} >
                            { base.accountCategories.map((item, index)=><option key={index} value={item}>{item}</option>) }
                        </select>
                    </div>
                    <div className='flex flex-col mb-3'>
                        <label className='m-1'>Code</label>
                        <input type="text" className='border p-1 rounded' value={account.code || ''} onChange={codeChange} ref={codeRef} placeholder='Type here' />
                    </div>
                    <div className='flex flex-col mb-3'>
                        <label className='m-1'>Account name</label>
                        <textarea 
                            className='border p-1 rounded resize-none min-w-[200px]' 
                            value={account.name || ''} 
                            onChange={nameChange} 
                            ref={accountNameRef} 
                            placeholder='Type here' ></textarea>
                    </div>
                    <div className='flex flex-col mb-3'>
                        <label className='m-1'>Description</label>
                        <textarea
                            className='border p-1 rounded resize-none h-[100px] min-w-[200px]' 
                            value={account.description || ''} 
                            onChange={descriptionChange} 
                            placeholder='Type here' ></textarea>
                    </div>
                </div>
                <div className='flex flex-col m-5'>
                    <div className='flex items-center mb-3'>
                        <input type="checkbox" id="sub" className='m-1' checked={isChildAccount || false} onChange={subaccountToggle} />
                        <label htmlFor="sub" className='ml-2'>Make this a subaccount</label>
                    </div>
                    { isChildAccount &&
                        <div className='mb-4'>
                            <label className='m-1'>Parent account</label>
                            <AccountPicker selectedAccount={parentAccount} setSelectedAccount={setParentAccount} />
                        </div>
                    }
                    { account.subAccount &&
                        <div className='flex flex-col text-[0.8em]'>
                            <span className='mb-2 font-bold'>Sub accounts</span>
                            <ul>
                            { account.subAccount.map((item, index)=> <li key={index} className='mb-1'>{item.code} - {item.name}</li>) }
                            </ul>
                        </div>
                    }
                </div>
            </div>
            <div className='py-3 flex items-end justify-end'>
                { account.archived ? 
                    <span className='text-xs mr-5 text-gray-400'>Account archived on {formatMMMDDYYYY(account.archivedDate)}</span> :
                    <>
                    { account.mode === 'edit' &&  <button className='mr-4 text-red-500 text-xs underline' onClick={archiveAccountClick}>Archive</button> }
                    <button className='mr-5 bg-green-600 text-white px-2 py-1 transition duration-300 hover:bg-green-500 rounded' onClick={saveClick} >Save</button>
                    </>
                }
            </div>
        </Modal>
        <Modal show={messagebox.show} closeCallback={()=>{setMessagebox({...messagebox, show: false})}} >
            <div className='flex-1 flex items-center justify-center p-4'>
                <span>{messagebox.message}?</span>
            </div>
            <div className='p-4 flex justify-center'>
                <button className='bg-green-500 hover:bg-green-400 px-2 py-1 rounded text-white transition duration-300' onClick={messagebox.callback}>Confirm</button>
            </div>
        </Modal>
        <div className='p-3'>
            <div className='flex items-center mb-5'>
                <h1 className='text-l flex-1'>Chart of Accounts</h1>
                <button className='mr-5 bg-green-600 text-white px-2 py-1 transition duration-300 hover:bg-green-500 rounded' onClick={addNewClick}>Add New</button>
            </div>
            <div className='text-[0.5em] sm:text-[0.9em] lg:text-[0.8em] flex'>
                { viewMode === 'table' ? (
                        <>
                        <button className={`
                                py-1 px-1 
                                ${
                                    category === 'ALL' 
                                    ? `border-l-2 border-l-gray-200 border-r-2 border-r-gray-200 border-t-2 border-t-gray-200` 
                                    : 'border-b-2 border-b-gray-200 border bg-gray-50'
                                }
                            `} 
                            onClick={()=>setCategory('ALL')} >All Accounts</button>
                        {
                            base.accountCategories && 
                            base.accountCategories.map((item, index)=>
                                <button className={`
                                    py-1 px-1
                                    ${
                                        category === item 
                                        ? `border-l-2 border-l-gray-200 border-r-2 border-r-gray-200 border-t-2 border-t-gray-200`
                                        : 'border-b-2 border-b-gray-200 border bg-gray-50'
                                    }
                                `}  
                                key={index} 
                                onClick={()=>setCategory(item)} > {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()} </button>
                            )
                        }
                        <button className={`
                            py-1 px-1 
                            ${
                                category === 'ARCHIVE' 
                                ? `border-l-2 border-l-gray-200 border-r-2 border-r-gray-200 border-t-2 border-t-gray-200`
                                : 'border-b-2 border-b-gray-200 border'
                            }
                            `}  
                            onClick={()=>setCategory('ARCHIVE')}>Archive</button>
                        <div className='flex-1 border-b-2 border-b-gray-200' />
                        </>
                    ) : <div className='border-b-2 w-[100%] p-4'></div>
                }
            </div>
            <div className='border-l-2 border-l-gray-200 border-r-2 border-r-gray-200 border-b-2 border-b-gray-200'>
                <div className='p-2 flex justify-end rounded text-[0.8em] mr-2'>
                    {
                        viewMode === 'table' &&
                        <div className='flex items-center border border-gray-400 p-1 rounded'>
                            <input
                                type="text"
                                placeholder="Search"
                                value={query || ''}
                                onChange={ (e) => setQuery(e.target.value) }
                                className='px-2 outline-none'
                            />
                            <FaMagnifyingGlass className='text-gray-600' />
                        </div>
                    }
                    <button className={`ml-2 py-1 px-2 border rounded ${viewMode === 'table' && 'bg-gray-200'}`} onClick={()=>setViewMode('table')} ><FaTable /></button>
                    <button className={`mr-2 py-1 px-2 border rounded ${viewMode === 'tree' && 'bg-gray-200'}`} onClick={()=>setViewMode('tree')} ><RiNodeTree /></button>
                </div>
                {
                    viewMode === 'table' ? (
                        <DataTable
                            columns={columns}
                            data={filteredAccounts}
                            customStyles={customStyles}
                            onRowClicked={editAccount}
                            conditionalRowStyles={conditionalRowStyles} // Add row hover styles
                            pagination />
                    ) : <AccountsTree editAccount={editFromTree} />
                }
            </div>
            <div className='mt-4'>
                <SubledgerTable />
            </div>
            <div className='mt-4'>
                <TaxTable />
            </div>
        </div>
        </>
    );
}

export default ChartOfAccounts;