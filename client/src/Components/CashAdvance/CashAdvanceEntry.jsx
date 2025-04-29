import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import CASLPicker from './CASLPicker';
import axios from 'axios';
import CurrencyInput from '../CurrencyInput';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toastNotifications';
import { useLoader } from '../../context/useLoader';

function CashAdvanceEntry({ show=false, close=()=>{}, mode="add", refresh=()=>{}, data=null }) {

    const {loading} = useLoader();
    const { user } = useAuth();

    const [caNo, setCaNo] = useState('');
    const [selectedSL, setSelectedSL] = useState({ slCode: '', name: '' });
    const [date, setDate] = useState('');

    const [fileId, setFileId] = useState('');
    const [isbonded, setIsBonded] = useState('N');
    const [bondPeriodStart, setBondPeriodStart] = useState('');
    const [bondPeriodEnd, setBondPeriodEnd] = useState('');
    const [amountOfBond, setAmountOfBond] = useState(null);

    const [begBalCA, setBagBalCA] = useState(null);
    const [begBalPC, setBagBalPC] = useState(null);
    const [netBal, setNetBal] = useState(null);

    const [amount, setAmount] = useState(null);
    const [particulars, setParticulars] = useState("");
    const [preparedBy, setPreparedBy] = useState('');
    const [adjCaBal, setAdjCaBal] = useState(null);

    const [unliquidated, setUnliquidated] = useState([]);

    const [messageBox, setMessagebox] = useState({ show: false, message: '', callback: ()=>{} });

    function reset(){
        setCaNo('');
        setSelectedSL({ slCode: '', name: '' });
        setDate('');
        setFileId('');
        setIsBonded('N');
        setBondPeriodStart('');
        setBondPeriodEnd('');
        setAmountOfBond(null);
        setBagBalCA(null);
        setBagBalPC(null);
        setNetBal(null);
        setAmount(null);
        setParticulars("");
        setPreparedBy('');
        setAdjCaBal(null);
        generateCA();
        setUnliquidated([]);
        setPreparedBy(`${user.firstName} ${user.lastName}`);
    };

    async function createClick(){
        if(!date && !selectedSL.slCode){
            showToast("Select date and name", "warning");
            return;
        }
        if(isbonded === 'N'){
            setMessagebox({
                show: true,
                message: "No bond on file maintenance. Confirm request for cash advance?",
                callback: async ()=>{
                    await requestCa();
                    setMessagebox({ show: false, message: '', callback: ()=>{} });
                }
            });
        }else{
            await requestCa();
        }
    }

    async function requestCa(){
        if(amount <= 0){
            showToast('Please enter amount', 'warning');
            return;
        }
        if(unliquidated.length > 0){
            showToast('Unliquidated cash advance found', 'warning');
            return;
        }
        if(adjCaBal < 0){
            showToast('Amount should not exceed Net Balance', "warning");
            return;
        }
        const ca = {
            caNo: caNo,
            date: date,
            file: fileId,
            amount: amount,
            caBal: begBalCA,
            pettyCash: begBalPC,
            particulars: particulars,
            preparedBy: preparedBy
        };
        loading(true);
        // to adjust: feedback for failed request
        await axios.post('/ca/CashAdvance', ca, { withCredentials: true });
        loading(false);
        showToast("Cash Advance created!", "success");
        refresh();
        reset();
        close();
    }

    // automatically computes CA adjustment balance
    useEffect(()=>{
        setAdjCaBal(netBal - amount)
    }, [amount, netBal]);
    
    useEffect(()=>{
        if(show){
            if(mode === "add"){
                // generate unique CA no
                reset();
            }else if(mode === "edit"){
                // no actual edit mode
                if(data){
                    setCaNo(data.caNo);
                    setSelectedSL(data.file.subledger);
                    setDate(data.date.substr(0, 10));
                    setFileId(data.file._id);
                    setIsBonded(data.file.bonded ? 'Y' : 'N');
                    setBondPeriodStart(data.file.bondPeriodStart.substr(0, 10));
                    setBondPeriodEnd(data.file.bondPeriodEnd.substr(0, 10));
                    setAmountOfBond(data.file.bondAmount);
                    setBagBalCA(data?.caBal || 0);
                    setBagBalPC(data?.pettyCash || 0);
                    setNetBal(data.file.maxAccAmount -  ((data?.caBal || 0) + (data?.pettyCash || 0)));
                    setAmount(data.amount);
                    setParticulars(data.particulars);
                    setPreparedBy(data.preparedBy);
                    setAdjCaBal((data?.caBal || 0) - (data?.pettyCash || 0) - data.amount);
                }
            }
        }
    }, [show]);

    useEffect(()=>{
        if(selectedSL.slCode && date){
            // get bond data
            if(mode === "add"){
                findFile();
            }
        }else{
            setFileId('');
            setIsBonded('N');
            setBondPeriodStart('');
            setBondPeriodEnd('');
            setAmountOfBond(null);
            setBagBalCA(null);
            setBagBalPC(null);
            setNetBal(null);
        }
    }, [selectedSL, date]);

    async function findFile(){
        const response = await axios.get(`/ca/FileMaintenance/${selectedSL.slCode}/${date}`, { withCredentials: true });
        const data = response.data;
        const unliq = await axios.get(`/ca/CashAdvance/unliquidated/${data._id}`, { withCredentials: true });
        setUnliquidated(unliq.data);
        if(data){
            setFileId(data._id);
            setIsBonded(data.bonded ? 'Y' : 'N');
            setBondPeriodStart(data.bondPeriodStart.substr(0, 10));
            setBondPeriodEnd(data.bondPeriodEnd.substr(0, 10));
            setAmountOfBond(data.bondAmount);
            setBagBalCA(data?.caBal || 0);
            setBagBalPC(data?.pettyCash || 0);
            setNetBal(data.maxAccAmount - ((data?.caBal || 0) + (data?.pettyCash || 0)));
        }else{
            setIsBonded('N');
            setBondPeriodStart('');
            setBondPeriodEnd('');
            setAmountOfBond(null);
        }
    }

    async function generateCA(){
        const response = await axios.get('/ca/CashAdvance/no', { withCredentials: true });
        setCaNo(response.data.id);
    }

    async function deleteClick(item){
        const confirm = window.confirm("Delete this Cash advance?");
        if(confirm){
            loading(true);
            await axios.delete(`/ca/CashAdvance/${item._id}`, { withCredentials: true });
            loading(false);
            close();
            refresh();
        }
    }

    return (
        <>
        <Modal title='Request for Cash Advance' show={show} closeCallback={close}>
            <div className='flex-1 border-t border-b text-[0.9em] p-4 flex flex-col'>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>CA NO.</span>
                    <input className='border p-1 rounded' type="text" value={caNo} onChange={(e)=>setCaNo(e.target.value)} />
                </div>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>DATE</span>
                    <input type="date" className='border p-1 rounded min-w-[200px]' disabled={mode === 'edit'} value={date} onChange={(e)=>setDate(e.target.value)} />
                </div>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>NAME</span>
                    <CASLPicker selectedSL={selectedSL} setSelectedSL={setSelectedSL} disabled={mode === 'edit'} />
                </div>
                <div className='flex items-center mb-1'>
                    <div className='flex items-center mr-2'>
                        <span className='w-[130px] font-bold'>BONDED?</span>
                        <select className='border p-1 rounded' value={isbonded} onChange={(e)=>setIsBonded(e.target.value)} disabled >
                            <option value="N">N</option>
                            <option value="Y">Y</option>
                        </select>
                    </div>
                    <div className='flex items-center mr-2'>
                        <span className='mr-2'>Bond Period</span>
                        <input type="date" className='border p-1 rounded mr-2' value={bondPeriodStart} onChange={(e)=>setBondPeriodStart(e.target.value)} disabled />
                        <input type="date" className='border p-1 rounded mr-2' value={bondPeriodEnd} onChange={(e)=>setBondPeriodEnd(e.target.value)} disabled />
                    </div>
                    <div className='flex items-center mr-2'>
                        <span className='mr-2'>Amount of Bond</span>
                        <CurrencyInput className={'border p-1 rounded mr-2'} val={amountOfBond} setVal={(v)=>setAmountOfBond(v)} disabled />
                    </div>
                </div>
                <div className='flex items-center mb-1'>
                    <div className='flex items-center'>
                        <span className='w-[130px] font-bold'>Beg bal of CA</span>
                        <CurrencyInput className={'border p-1 rounded mr-2'} val={begBalCA} setVal={(v)=>setBagBalCA(v)} disabled />
                    </div>
                    <div className='flex items-center'>
                        <span className='mr-2'>Bal of Petty Cash</span>
                        <CurrencyInput className={'border p-1 rounded mr-2'} val={begBalPC} setVal={(v)=>setBagBalPC(v)} disabled />
                    </div>
                    <div className='flex items-center'>
                        <span className='mr-2'>Net Balance</span>
                        <CurrencyInput className={'border p-1 rounded mr-2'} val={netBal} setVal={(v)=>setNetBal(v)} disabled />
                    </div>
                </div>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>Amount</span>
                    <CurrencyInput className={'border p-1 rounded mr-2'} val={amount} setVal={(v)=>setAmount(v)} />
                </div>
                <div className='flex mb-1'>
                    <span className='w-[150px] font-bold'>Particulars</span>
                    <textarea className='border w-[100%] resize-none' value={particulars} onChange={(e)=>setParticulars(e.target.value)} ></textarea>
                </div>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>Prepared By</span>
                    <input type="text" className='border p-1 rounded' value={preparedBy} onChange={(e)=>setPreparedBy(e.target.value)} />
                </div>
                <div className='flex items-center mb-1'>
                    <span className='w-[130px] font-bold'>Adj CA Balance</span>
                    <CurrencyInput className={`border p-1 rounded mr-2 ${adjCaBal < 0 && 'text-red-500'}`} val={adjCaBal} setVal={(v)=>setAdjCaBal(v)} disabled />
                </div>
                <div>
                    {unliquidated.length > 0 && <span className='text-red-500 m-r2'>Unliquidated Cash Advance: </span>}
                    {
                        unliquidated.map((item, index)=>
                            <span key={index} className='text-red-500 mr-2 underline' >{item.caNo},</span>
                        )
                    }
                </div>
            </div>
            <div className='flex justify-end p-2'>
                {
                    mode === "edit" &&
                    <button className='underline text-red-500' onClick={()=>deleteClick(data)}>delete</button>
                }
                {
                    mode === "add" &&
                    <button className='btn-primary' onClick={createClick} >Create</button>
                }
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessagebox({ show: false, ...messageBox })} >
            <div className='border-t flex-1 flex items-center justify-center p-4'>
                <span className='text-center'>{messageBox.message}</span>
            </div>
            <div className='flex items-center justify-center p-2'>
                <button className='btn-primary' onClick={messageBox.callback} >Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default CashAdvanceEntry;