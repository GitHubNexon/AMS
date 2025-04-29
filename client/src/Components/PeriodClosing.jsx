import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaGear } from 'react-icons/fa6';
import Modal from './Modal';
import AccountPicker from './AccountPicker';
import AccountsTreePicker from './CustomizableReport/AccountsTreePicker';
import { showToast } from '../utils/toastNotifications';
import { getFirstAndLastDayOfMonth, formatDateToYYYMMdd, formatReadableDate, numberToCurrencyString } from '../helper/helper';
import { useLoader } from '../context/useLoader';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import YearDropdown from './YearDropdown';
import { useDataPreloader } from '../context/DataPreloader';

function PeriodClosing() {

    const { getLastClosing } = useDataPreloader();

    const {user} = useAuth();
    const {loading} = useLoader();

    const [closingModal, setClosingModal] = useState(false);
    const [closingDate, setClosingDate] = useState('');
    const [beforeClosingDate, setBeforeClosingDate] = useState('');
    const [trialBalance, setTrialBalance] = useState([]);

    const [income, setIncome] = useState({totalDr: 0, totalCr: 0});
    const [expenses, setExpenses] = useState({totalDr: 0, totalCr: 0});
    const [currentRetainedEarnings, setCurrentRetainedEarnings] = useState({totalCr: 0, totalDr: 0});
    const [incomeExpenseSummary, setIncomeExpenseSummary] = useState(0);
    const [futureTotal, setFutureTotal] = useState({totalDr: 0, totalCr: 0});

    const [retainedEarningsAccount, setRetainedEarningsAccount] = useState(null);
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [expensesAccounts, setExpensesAccounts] = useState([]);
    const [setupModal, setSetupModal] = useState(false);
    const [accountTree, setAccountTree] = useState([]);
    const [accountTreeModal, setAccountTreeModal] = useState(false);
    const [accountTreeMode, setAccontTreeMode] = useState('');
    
    const [closedList, setClosedList] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [docsCount, setDocsCount] = useState(0);
    const [mode, setMode] = useState('add');
    const [messageModal, setMessageModal] = useState({show: false, callback: ()=>{}, message: ''});
    const [reCloseId, setReCloseId] = useState('');


    useEffect(()=>{
        getClosingList();
    }, [page, limit]);

    useEffect(()=>{
        getAccountingSetup();
    }, []);

    useEffect(()=>{
        if(mode === 'view' || mode === 'reopen' || mode === 'reclose'){
            if(closingDate) closeClick(closingDate);
        }
    }, [mode])

    function prevClick(){
        if(page <= 1) return;
        setPage(page - 1);
    }

    function nextClick(){
        setPage(page + 1);
    }

    async function getClosingList(){
        const response = await axios.get(`closing?page=${page}&limit=${limit}`, { withCredentials: true });
        if(response.data.list.length === 0 && page > 1){
            setPage(page - 1);
            return;
        }
        setClosedList(response.data.list);  
        setDocsCount(response.data.count);
    }

    async function getAccountingSetup(){
        const response = await axios.get(`base/accounting`, { withCredentials: true });
        setIncomeAccounts(response.data.incomeAccounts);
        setExpensesAccounts(response.data.expensesAccounts);
        setRetainedEarningsAccount(response.data.retainedEarningAccount);
    }

    async function setupSaveClick(){
        await axios.patch('base/accounting', {
            incomeAccounts: incomeAccounts,
            expensesAccounts: expensesAccounts,
            retainedEarningAccount: retainedEarningsAccount
        }, {withCredentials: true});
        showToast("Saved", "success");
        setSetupModal(false);
    }

    function EditClick(what){
        setAccountTreeModal(true);
        if(what === 'income'){
            setAccontTreeMode('income');
            setAccountTree(incomeAccounts);
        }else if(what === 'expenses'){
            setAccontTreeMode('expenses');
            setAccountTree(expensesAccounts);
        }
    }

    function accountTreeConfirmClick(){
        if(accountTreeMode === 'income'){
            setIncomeAccounts(accountTree);
        }else if(accountTreeMode === 'expenses'){
            setExpensesAccounts(accountTree)
        }
        setAccountTreeModal(false);
    }

    async function closeClick(date){
        if(!date){
            showToast('Please select date', 'warning');
            return;
        }
        if(mode != 'view'){
            loading(true);
            const check = await axios.get(`/closing/check/${date}`, {withCredentials: true});
            if(check.data.length > 0){
                showToast(`Unable to close at this date. Last closing period: ${formatReadableDate(check.data[0].closingDate)}`, 'info');
                loading(false);
                return;
            }
            getLastClosing();
        }
        // get date - 1
        let d = new Date(date)
        d.setDate(d.getDate() - 1);
        const r = getFirstAndLastDayOfMonth(formatDateToYYYMMdd(d));
        setBeforeClosingDate(r.lastDay)
        loading(true);
        // get trial balance from date before closing date
        if(mode === 'view'){
            // on view mode the last day is deducted by 1 day (closing is last day of the year)
            const viewDeduct = new Date(r.lastDay);
            viewDeduct.setDate(viewDeduct.getDate() - 1);
            r.lastDay = viewDeduct;
        }
        console.log("Getting updated trial balance", r.firstDay, r.lastDay);
        const response = await axios.get(`/reports/fullTrialBalance/${r.firstDay}/${r.lastDay}`, { withCredentials: true });
        console.log(response.data);
        loading(false);
        const rt = response.data.filter(f=>f.code === retainedEarningsAccount.code)[0];
        const incomes = response.data.filter(f=>incomeAccounts.includes(f.code));
        const incomesDR = incomes.map(m=>m.totalDr).reduce((pre,cur)=>pre+cur,0); 
        const incomesCR = incomes.map(m=>m.totalCr).reduce((pre,cur)=>pre+cur,0);
        const income = Math.abs(incomesCR) - Math.abs(incomesDR);
        const expenses = response.data.filter(f=>expensesAccounts.includes(f.code))
        const expensesDR = expenses.map(m=>m.totalDr).reduce((pre,cur)=>pre+cur,0); 
        const expensesCR = expenses.map(m=>m.totalCr).reduce((pre,cur)=>pre+cur,0);
        const expense = Math.abs(expensesCR) - Math.abs(expensesDR);
        setIncomeExpenseSummary(Math.abs(income) - Math.abs(expense));
        setIncome({totalDr: incomesDR, totalCr: incomesCR});
        setExpenses({totalDr: expensesDR, totalCr: expensesCR});
        // process changes to accounts
        const totalAll = response.data.filter(f=>!incomeAccounts.includes(f.code) && !expensesAccounts.includes(f.code) && f.name != 'TOTAL' );
        const totalAllDr = totalAll.map(m=>m.totalDr).reduce((pre,cur)=>pre+cur,0);
        const totalAllCr = totalAll.map(m=>m.totalCr).reduce((pre,cur)=>pre+cur,0);
        setFutureTotal({totalDr: totalAllDr, totalCr: totalAllCr});
        // show after trial balance
        setTrialBalance(response.data);
        setClosingModal(true);
        setCurrentRetainedEarnings({totalCr: rt.totalCr, totalDr: rt.totalDr});
    }

    function renderBeforeClosing(item, index){
        let isRT = false;
        let isInc = false;
        let isExp = false;
        if(item.code === retainedEarningsAccount.code){
            isRT = true;
        }
        if(incomeAccounts.includes(item.code)){
            isInc = true;
        }
        if(expensesAccounts.includes(item.code)){
            isExp = true;
        }
        return (
            <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`}>
                <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>{item.name}</td>
                <td className='p-1 border-r text-end'>{item.totalDr > 0 ? numberToCurrencyString(item.totalDr) : ''}</td>
                <td className='p-1 border-r text-end'>{item.totalCr > 0 ? numberToCurrencyString(item.totalCr) : ''}</td>
            </tr>
        );
    }

    function renderDuringClosing(item, index){
        let isRT = false;
        let isInc = false;
        let isExp = false;
        if(item.code === retainedEarningsAccount.code){
            isRT = true;
            let rtval = (currentRetainedEarnings.totalCr -currentRetainedEarnings.totalDr) + incomeExpenseSummary;
            return (
                <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`} >
                    <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>{item.name}</td>
                    <td className='p-1 border-r text-end'>{rtval < 0 ? numberToCurrencyString(Math.abs(rtval)) : ''}</td>
                    <td className='p-1 border-r text-end'>{rtval > 0 ? numberToCurrencyString(rtval) : ''}</td>
                </tr>
            );
        }
        if(incomeAccounts.includes(item.code)){
            isInc = true;
        }
        if(expensesAccounts.includes(item.code)){
            isExp = true;
        }
        return (
            <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`}>
                <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>{item.name}</td>
                {
                    isInc ?
                    <>
                        <td className='p-1 border-r text-end'>{item.totalCr > 0 ? numberToCurrencyString(item.totalCr) : ''}</td>
                        <td className='p-1 border-r text-end'>{item.totalDr > 0 ? numberToCurrencyString(item.totalDr) : ''}</td>
                    </>
                    :
                    <>
                        <td className='p-1 border-r text-end'>{item.totalCr > 0 ? numberToCurrencyString(item.totalCr) : ''}</td>
                        <td className='p-1 border-r text-end'>{item.totalDr > 0 ? numberToCurrencyString(item.totalDr) : ''}</td>
                    </>
                    
                }
            </tr>
        );
    }

    function renderAfterClosing(item, index){
        let isRT = false;
        let isInc = false;
        let isExp = false;
        if(item.name === 'TOTAL'){
            return (
                <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`} >
                    <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>TOTAL</td>
                    <td className='p-1 border-r text-end'>{numberToCurrencyString(futureTotal.totalDr)}</td>
                    <td className='p-1 border-r text-end'>{numberToCurrencyString(futureTotal.totalCr + incomeExpenseSummary)}</td>
                </tr>
            );
        }    
        if(item.code === retainedEarningsAccount.code){
            isRT = true;
            let rtval = (currentRetainedEarnings.totalCr -currentRetainedEarnings.totalDr) + incomeExpenseSummary;
            return (
                <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`} >
                    <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>{item.name}</td>
                    <td className='p-1 border-r text-end'>{rtval < 0 ? numberToCurrencyString(Math.abs(rtval)) : ''}</td>
                    <td className='p-1 border-r text-end'>{rtval > 0 ? numberToCurrencyString(rtval) : ''}</td>
                </tr>
            );
        }
        if(incomeAccounts.includes(item.code)){
            isInc = true;
        }
        if(expensesAccounts.includes(item.code)){
            isExp = true;
        }
        return (
            <tr key={index} className={`text-[0.8em] border-b ${isRT && 'bg-yellow-100'} ${isInc && 'bg-green-100 border-gray-400'} ${isExp && 'bg-red-100 border-gray-400'}`} >
                <td className='p-1 border-r whitespace-nowrap break-keep max-w-[200px] overflow-x-hidden'>{item.name}</td>
                <td className='p-1 border-r text-end'>{!isRT && !isInc && !isExp ? item.totalDr > 0 ? numberToCurrencyString(item.totalDr) : '' : ''}</td>
                <td className='p-1 border-r text-end'>{!isRT && !isInc && !isExp ? item.totalCr > 0 ? numberToCurrencyString(item.totalCr) : '' : ''}</td>
            </tr>
        );
    }

    async function confirmClosingClick(){
        setMessageModal({
            show: true,
            message: `Confirm period closing?`,
            callback: async ()=>{
                const ledgers = [
                    {
                        type: incomeExpenseSummary > 0 ? 'CR' : 'DR',
                        ledger: {
                            code: retainedEarningsAccount.code,
                            name: retainedEarningsAccount.name,
                        },
                        dr: incomeExpenseSummary < 0 ? incomeExpenseSummary : null,
                        cr: incomeExpenseSummary > 0 ? incomeExpenseSummary : null
                    }
                ];
                const incomes = trialBalance.filter(f=>incomeAccounts.includes(f.code));
                const expensesAcc = trialBalance.filter(f=>expensesAccounts.includes(f.code));
                // must change logic here to zero all subledgers on this ledger
                const incomeLedgers = incomes.map(m=>({
                    type: 'DR',
                    ledger: {
                        code: m.code,
                        name: m.name
                    },
                    dr: m.totalCr,
                    cr: null
                }));
                const expenseLedgers = expensesAcc.map(m=>({
                    type: 'CR',
                    ledger: {
                        code: m.code,
                        name: m.name
                    },
                    dr: null,
                    cr: m.totalDr
                }));
                // exportExcel(expensesAcc);
                ledgers.push(...expenseLedgers);
                ledgers.push(...incomeLedgers);
                const u = {name: user.name, position: user.userType}
                const entry = {
                    JVDate: new Date(closingDate),
                    EntryType: 'Closing',
                    Particulars: `Period closing ${formatReadableDate(closingDate)}`,
                    CreatedBy: u,
                    PreparedBy: u,
                    CertifiedBy: u,
                    ReviewedBy: u,
                    formType: 'hidden',
                    ledgers: ledgers
                };
                let r = [currentRetainedEarnings][0];
                if(incomeExpenseSummary > 0){
                    r.totalCr += incomeExpenseSummary;
                }else{
                    r.totalDr + incomeExpenseSummary;
                }
                console.log({
                    closing: {
                        beforeDate: beforeClosingDate,
                        closingDate: closingDate,
                        incomeAccountsAmount: income,
                        expenseAccountsAmount: expenses,
                        summary: incomeExpenseSummary,
                        beforeRetainedEarning: currentRetainedEarnings,
                        afterRetainedEarning: r
                    },
                    entry: entry
                });
                console.log(mode);
                if(mode === 'reclose'){
                    console.log('call new API for re closing', reCloseId);
                    // instead of updating the re closing entry we just delete it and use the same endpoint for entering new closing
                    await axios.delete(`/closing/${reCloseId}`, { withCredentials: true });
                }
                await axios.post(`/closing`, {
                    closing: {
                        beforeDate: beforeClosingDate,
                        closingDate: closingDate,
                        incomeAccountsAmount: income,
                        expenseAccountsAmount: expenses,
                        summary: incomeExpenseSummary,
                        beforeRetainedEarning: currentRetainedEarnings,
                        afterRetainedEarning: r
                    },
                    entry: entry
                }, { withCredentials: true });
                setClosingDate('');
                setClosingModal(false);
                showToast('Period closed', 'success');
                setMessageModal({show: false, message: '', callback: ()=>{}});
                getClosingList();
            }
        });
    }

    function reOpenClick(item){
        console.log(item);
        setMessageModal({
            show: true,
            message: `Are you sure you want to re-open this period: ${formatReadableDate(new Date(item.closingDate))}?`,
            callback: async ()=>{
                setMode('reopen');
                const response = await axios.patch(`closing/${item._id}`, {withCredentials: true});
                console.log(response);
                setMessageModal({show: false, callback: ()=>{}, message: ''});
                getClosingList();
                getLastClosing();
            }
        });
    }

    async function viewClick(item){
        
        console.log(item.closingDate);
        setClosingDate(formatDateToYYYMMdd(new Date(item.closingDate)));
        setMode('view');   
        // closeClick(item.closingDate);
        // ISSUE HERE: closing data not appearing on view

    }

    function closingModalClose(){
        setMode('add');
        setClosingModal(false);
        if(mode === 'view' || mode === 'reopen' || mode === 'reclose'){
            setClosingDate('');
        }
    }

    function reCloseClick(item){
        console.log(item);        
        setClosingDate(formatDateToYYYMMdd(new Date(item.closingDate)));
        setReCloseId(item._id);
        setMode('reclose');
        getLastClosing();
    }

    async function deleteClick(item){
        setMessageModal({
            show: true,
            message: "Are you sure you want to delete this record?",
            callback: async ()=>{
                await axios.delete(`/closing/${item._id}`, { withCredentials: true });
                showToast('Record deleted', 'success');
                setMessageModal({show: false, message: '', callback: ()=>{}});
                getClosingList();
            }
        });
    }

    return (
        <>
        <div className='border rounded mb-8 p-4'>
            <div className='flex p-2 text-[0.9em] mb-2'>
                <div className='flex-1'>
                    <span className='font-bold'>Accounting Period Closing</span>
                </div>
                <button onClick={()=>setSetupModal(true)} className='absolute bottom-0 left-0 text-white' ><FaGear /></button>
            </div>
            <div className='mb-4'>
                <YearDropdown date={closingDate} setDate={setClosingDate} />                
                <button className='btn-primary' onClick={()=>closeClick(closingDate)}>Close</button>
            </div>
            <div className='text-[0.8em] flex'>
                <div>
                    <table>
                        <thead>
                            <tr className='bg-green-600 text-white'>
                                <th className='py-1 px-2 border-r'>DATE</th>
                                <th className='py-1 px-2 border-r'>INCOME & EXPENSES SUMMARY</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            closedList.map((item, index)=>
                                <tr key={index} className='border-b'>
                                    <td className='py-1 px-2 border-r'>{formatReadableDate(item.closingDate)}</td>
                                    <td className='py-1 px-2 border-r'>{!item.closed ? 'close to show summary' : numberToCurrencyString(item.summary)}</td>
                                    <td className='py-1 px-2'>
                                        {
                                            item.closed ?
                                            <button className='bg-gray-500 text-white px-2 rounded mr-2' onClick={()=>reOpenClick(item)} >Re-Open</button>
                                            :
                                            <button className='bg-green-500 text-white px-2 rounded mr-2' onClick={()=>reCloseClick(item)} >Close</button>
                                        }
                                        { item.closed && <button className='bg-gray-500 text-white px-2 rounded mr-2' onClick={()=>viewClick(item)} >View</button> }
                                        { !item.closed && <button className='bg-red-500 text-white px-2 rounded mr-2' onClick={()=>deleteClick(item)} >Delete</button>}
                                    </td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                    <div className='flex items-center justify-center p-2 text-[1.5em]'>
                        <button className='mr-2 text-gray-600' onClick={prevClick} ><FaChevronCircleLeft /></button>
                        <button className='ml-2 text-gray-600' onClick={nextClick} ><FaChevronCircleRight /></button>
                    </div>
                </div>
            </div>
        </div>
        <Modal 
            show={closingModal} 
            closeCallback={closingModalClose}
            title={                
                <div className='flex p-2 text-[0.7em]'>
                    <div className='p-2 bg-yellow-100 border mr-2' />
                    <span className='mr-4'>Retained Earnings</span>
                    <div className='p-2 bg-green-100 border mr-2' />
                    <span className='mr-4'>Income</span>
                    <div className='p-2 bg-red-100 border mr-2' />
                    <span className='mr-4'>Expenses</span>
                </div>
            } >
            <div className='flex flex-col p-2 flex-1 border-t border-b min-h-[80vh] max-h-[80vh] min-w-[96vw] max-w-[96vw] overflow-y-scroll'>
                <div className='flex text-[0.8em] overflow-x-scroll'>
                    <div className='border flex-1 m-1 flex flex-col'>
                        <div className='relative'>
                            <table className='w-[100%]'>
                                <thead>
                                    <tr className='border-b sticky top-0 bg-green-500 text-white'>
                                        <th className='p-1 border-r'>
                                            <div className='flex flex-col'>
                                                <span className='text-start text-[0.8em]'>Before Closing {formatReadableDate(beforeClosingDate)}</span>
                                                <span>Account</span>
                                            </div>
                                        </th>
                                        <th className='p-1 border-r'>Debit</th>
                                        <th className='p-1'>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { trialBalance.map((item, index)=>renderBeforeClosing(item, index)) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='border flex-1 m-1 flex flex-col'>
                        <div className='relative'>
                            <table className='w-[100%]'>
                                <thead>
                                    <tr className='border-b sticky top-0 bg-green-500 text-white'>
                                        <th className='p-1 border-r'>
                                            <div className='flex flex-col'>
                                                <span className='text-start text-[0.8em]'>During Closing</span>
                                                <span>Account</span>
                                            </div>
                                        </th>
                                        <th className='p-1 border-r'>Debit</th>
                                        <th className='p-1'>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { trialBalance.map((item, index)=> renderDuringClosing(item, index)) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='border flex-1 m-1 flex flex-col'>
                        <div className='relative'>
                            <table className='w-[100%]'>
                                <thead>
                                    <tr className='border-b sticky top-0 bg-green-500 text-white'>
                                        <th className='p-1 border-r'>
                                            <div className='flex flex-col'>
                                                <span className='text-start text-[0.8em]'>After Closing {formatReadableDate(closingDate)}</span>
                                                <span>Account</span>
                                            </div>
                                        </th>
                                        <th className='p-1 border-r'>Debit</th>
                                        <th className='p-1'>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { trialBalance.map((item, index)=> renderAfterClosing(item, index)) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className='text-[0.9em] flex flex-col p-4'>
                    <span className='mb-2'>CLOSING ENTRY FOR {formatReadableDate(closingDate)}</span>
                    <div className='mb-1 flex'>
                        <span className='w-[250px] border-r border-b'>INCOME ACCOUNTS</span>
                        <span className='w-[150px] border-r border-b text-end'>{income.totalCr > 0 ? numberToCurrencyString(income.totalCr) : ''}</span>
                        <span className='w-[150px] border-r border-b text-end'>{income.totalDr > 0 ? numberToCurrencyString(income.totalDr) : ''}</span>
                    </div>
                    <div className='mb-1 flex'>
                        <span className='w-[250px] border-r border-b'>EXPENSES ACCOUNTS</span>
                        <span className='w-[150px] border-r border-b text-end'>{expenses.totalCr > 0 ? numberToCurrencyString(expenses.totalCr) : ''}</span>
                        <span className='w-[150px] border-r border-b text-end'>{expenses.totalDr > 0 ? numberToCurrencyString(expenses.totalDr) : ''}</span>
                    </div>
                    <div className='mb-1 flex'>
                        <span className='w-[250px] border-r border-b'>INCOME & EXPENSES SUMMARY</span>
                        <span className='w-[150px] border-r border-b text-end'>{incomeExpenseSummary < 0 ? numberToCurrencyString(incomeExpenseSummary) : '' }</span>
                        <span className='w-[150px] border-r border-b text-end'>{incomeExpenseSummary > 0 ? numberToCurrencyString(incomeExpenseSummary) : ''}</span>
                    </div>
                </div>
            </div>  
            <div className='px-4 py-2 flex justify-end'>
                { mode != 'view' && <button className='btn-primary' onClick={confirmClosingClick} >Confirm</button> }
            </div>
        </Modal>
        <Modal show={setupModal} closeCallback={()=>setSetupModal(false)} >
            <div className='border-t border-b flex-1 p-4 text-[0.9em]'>
                <div className='flex items-center mb-4'>
                    <span className='mr-2'>Retained Earnings Account</span>
                    <AccountPicker className={'mr-2'} selectedAccount={retainedEarningsAccount} setSelectedAccount={setRetainedEarningsAccount} />
                </div>
                <div className='flex items-start mb-4'>
                    <span className='mr-2'>Income Accounts</span>
                    <div className='flex flex-wrap flex-1 max-w-[500px] border p-1 rounded mr-2 max-h-[20vh] overflow-y-scroll text-[0.9em]'>
                    {
                        incomeAccounts.map((item, index)=>
                            <span key={index} className='mr-2 ' >{item},</span>
                        )
                    }
                    </div>
                    <button className='bg-gray-500 text-white px-1 rounded' onClick={()=>EditClick('income')} >Edit</button>
                </div>
                <div className='flex items-start mb-4'>
                    <span className='mr-2'>Expenses Accounts</span>
                    <div className='flex flex-wrap flex-1 max-w-[500px] border p-1 rounded mr-2 max-h-[20vh] overflow-y-scroll text-[0.9em]'>
                    {
                        expensesAccounts.map((item, index)=>
                            <span key={index} className='mr-2 ' >{item},</span>
                        )
                    }
                    </div>
                    <button className='bg-gray-500 text-white px-1 rounded' onClick={()=>EditClick('expenses')} >Edit</button>
                </div>
            </div>
            <div className='p-2 flex justify-end'>
                <button className='btn-primary' onClick={setupSaveClick}>Save</button>
            </div>
        </Modal>
        <Modal show={accountTreeModal} closeCallback={()=>setAccountTreeModal(false)} >
            <div className='border-t border-b flex-1 p-4 text-[0.9em]'>
                <AccountsTreePicker selectedAccounts={accountTree} setSelectedAccounts={setAccountTree} />
            </div>
            <div className='p-2 flex justify-end'>
                <button className='btn-primary' onClick={accountTreeConfirmClick}>Confirm</button>
            </div>
        </Modal>
        <Modal show={messageModal.show} closeCallback={()=>setMessageModal({show: false, callback: ()=>{}, message: ''})} >
            <div className='flex-1 border-t border-b p-4 flex items-center justify-center max-w-[400px] text-center'>
                <span>{messageModal.message}</span>
            </div>
            <div className='p-2 flex items-center justify-center'>
                <button className='btn-primary' onClick={messageModal.callback} >Confirm</button>
            </div>
        </Modal>
        </>
        
    );
}

export default PeriodClosing;