import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import SubledgerPicker from '../SubledgerPicker';
import CurrencyInput from '../CurrencyInput';
import { showToast } from '../../utils/toastNotifications';
import axios from 'axios';
import { formatReadableDate, numberToCurrencyString } from '../../helper/helper';
import { useLoader } from '../../context/useLoader';

function FileMaintenance({ show=false, close=()=>{} }) {

    const [modal, setModal] = useState({ show: false, mode: "add", id: "" });
    const [messageBox, setMessageBox] = useState({ show: false, message: "", callback: ()=>{} });
    const {loading} = useLoader();

    const [riskN, setRiskN] = useState("");
    const [slCode, setSlCode] = useState("");
    const [name, setName] = useState("");
    const [maxAccAmt, setMaxAccAmt] = useState(null);
    const [bondAmt, setBondAmt] = useState(null);
    const [pettyCash, setPettyCash] = useState(null);
    const [bondPeriodStart, setBondPeriodStart] = useState("");
    const [bondPeriodEnd, setBondPeriodEnd] = useState("");
    const [isBonded, setIsBonded] = useState(true); 

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchDebounce, setSearchDebounce] = useState("");

    useEffect(()=>{
        const trigger = setTimeout(()=>setSearch(searchDebounce), 500);
        return ()=>clearTimeout(trigger);        
    }, [searchDebounce]);

    useEffect(()=>{
        getFiles();
    }, [page, search]);

    async function getFiles(){
        const response = await axios.get(`/ca/FileMaintenance?page=${page}&search=${search}`, { withCredentials: true });
        setRows(response.data.data);
        setTotalPages(response.data.totalPages);
    }

    function addNewClick(){
        reset();
        setModal({ show: true, mode: "add", id: "" });
    }

    async function modalSaveClick(){
        if(!riskN && !slCode){
            showToast("Enter file maintenance information", "warning");
            return;
        }
        if(modal.mode === "add"){
            loading(true);
            await axios.post(`/ca/FileMaintenance`, {
                riskNumber: riskN,
                subledger: {
                    slCode: slCode,
                    name: name
                },
                maxAccAmount: maxAccAmt,
                bondAmount: bondAmt,
                pettyCash: pettyCash,
                bondPeriodStart: bondPeriodStart,
                bondPeriodEnd: bondPeriodEnd,
                bonded: isBonded
            }, { withCredentials: true });
            loading(false);
            showToast("Saved", "success");
            getFiles();
            setModal({ show: false, mode: "add", id: ""});
            reset();
        }else if(modal.mode === "edit"){
            loading(true);
            await axios.patch(`/ca/FileMaintenance/${modal.id}`, {
                riskNumber: riskN,
                subledger: {
                    slCode: slCode,
                    name: name
                },
                maxAccAmount: maxAccAmt,
                bondAmount: bondAmt,
                pettyCash: pettyCash,
                bondPeriodStart: bondPeriodStart,
                bondPeriodEnd: bondPeriodEnd,
                bonded: isBonded
            }, { withCredentials: true });
            loading(false);
            showToast("Saved", "success");
            getFiles();
        }
    }

    function editClick(item){
        setModal({ show: true, mode: "edit", id: item._id })
        setRiskN(item.riskNumber);
        setSlCode(item.subledger.slCode);
        setName(item.subledger.name);
        setMaxAccAmt(item.maxAccAmount);
        setBondAmt(item.bondAmount);
        setPettyCash(item.pettyCash);
        setBondPeriodStart(item.bondPeriodStart.substring(0, 10));
        setBondPeriodEnd(item.bondPeriodEnd.substring(0, 10));
        setIsBonded(item.bonded);
    }

    function deleteClick(){
        setMessageBox({
            show: true,
            message: "Confirm delete this file?",
            callback: async ()=>{
                loading(true);
                await axios.delete(`/ca/FileMaintenance/${modal.id}`, { withCredentials: true })
                loading(false);
                showToast("File deleted", "success");
                getFiles();
                setModal({ show: false, mode: "add", id: ""});
                reset();
                setMessageBox({ show: false, message: "", callback: ()=>{} });
            }
        });
    }

    function reset(){
        setRiskN("");
        setSlCode("");
        setName("");
        setMaxAccAmt(null);
        setBondAmt(null);
        setPettyCash(null);
        setBondPeriodStart("");
        setBondPeriodEnd("");
        setIsBonded(true);
    }

    function handlePrevPage() {
        if (page > 1) setPage(prev => prev - 1);
    }

    function handleNextPage() {
        if (page < totalPages) setPage(prev => prev + 1);
    }

    return (
        <>
        <Modal title='File Maintenance' show={show} closeCallback={close}>
            <div className='h-[10vh] border-t border-b flex items-center px-4'>
                <div className='flex-1'>
                    <input type="text" className='border p-1 rounded' value={searchDebounce} onChange={(e)=>setSearchDebounce(e.target.value)} placeholder='Search' />
                </div>
                <button className='btn-primary' onClick={addNewClick} >Add new</button>
            </div>
            <div className='h-[80vh] w-[96vw] overflow-y-scroll text-[0.8em] p-2'>
                <table className='w-[100%]'>
                    <thead>
                        <tr className='bg-green-600 text-white'>
                            <th className='border-r p-1'>Risk n.</th>
                            <th className='border-r p-1'>ITEM</th>
                            <th className='border-r p-1 w-[200px]'>MAXIMUM AMOUNT OF ACCOUNTABILITY</th>
                            <th className='border-r p-1'>AMOUNT OF BOND</th>
                            <th className='border-r p-1' colSpan={2}>BOND PERIOD</th>
                            <th className='border-r p-1'>BONDED</th>
                            <th className='border-r p-1'>PETTY CASH</th>
                            <th className='border-r p-1'>NET CA Allowed</th>
                            <th className='p-1'></th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            rows.map((item, index)=>
                                <tr className='border-b text-center' key={index} >
                                    <td className='border-r p-1'>{item.riskNumber}</td>
                                    <td className='border-r p-1'>{item.subledger.name}</td>
                                    <td className='border-r p-1'>{numberToCurrencyString(item.maxAccAmount)}</td>
                                    <td className='border-r p-1'>{numberToCurrencyString(item.bondAmount)}</td>
                                    <td className='border-r p-1'>{formatReadableDate(new Date(item.bondPeriodStart))}</td>
                                    <td className='border-r p-1'>{formatReadableDate(new Date(item.bondPeriodEnd))}</td>
                                    <td className='border-r p-1'>{item.bonded ? 'Y' : 'N'}</td>
                                    <td className='border-r p-1'>{item.pettyCash ? numberToCurrencyString(item.pettyCash) : ''}</td>
                                    <td className='border-r p-1'>{numberToCurrencyString(item.bondAmount - (item?.pettyCash || 0))}</td>
                                    <td className='py-1 px-4'>
                                        <button className='btn-primary' onClick={()=>editClick(item)} >Edit</button>
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                <div className='flex items-center p-4 justify-center relative'>
                    <span className='absolute left-[15px]'>Page {page} of {totalPages}</span>
                    <button className='border p-2 rounded mr-2' disabled={page <= 1} onClick={handlePrevPage} ><FaChevronLeft/></button>
                    <button className='border p-2 rounded ml-2' disabled={page >= totalPages} onClick={handleNextPage} ><FaChevronRight /></button>
                </div>
            </div>
        </Modal>
        <Modal show={modal.show} closeCallback={()=>setModal({ show: false, mode: "add", id: "" })} title='File Maintenance' >
            <div className='flex-1 border-t border-b text-[0.9em] flex flex-col p-4'>
                <div className='flex flex-col mb-4'>
                    <span>Risk n.</span>
                    <input type="text" className="border p-1 rounded" value={riskN} onChange={(e)=>setRiskN(e.target.value)} />
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Item</span>
                    <SubledgerPicker 
                        slCode={slCode} 
                        name={name} 
                        setSLCode={setSlCode}
                        setName={setName} />
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Maximum amount of accountability</span>
                    <CurrencyInput val={maxAccAmt} setVal={(v)=>setMaxAccAmt(v)} className={'border p-1 rounded'} />
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Amount of bond</span>
                    <CurrencyInput val={bondAmt} setVal={(v)=>setBondAmt(v)} className={'border p-1 rounded'} />
                </div>
                {/* <div className='flex flex-col mb-4'>
                    <span>Petty Cash</span>
                    <CurrencyInput val={pettyCash} setVal={(v)=>setPettyCash(v)} className={'border p-1 rounded'} />
                </div> */}
                <div className='mb-4'>
                    <label>
                        <input type="checkbox" className='mr-2' checked={isBonded} onChange={(e)=>setIsBonded(e.target.checked)} />
                        Bonded
                    </label>
                </div>
                <div className='flex flex-col mb-4'>
                    <span>Bond period</span>
                    <div className='flex items-center'>
                        <input type="date" className='border p-1 rounded mr-1' value={bondPeriodStart} onChange={(e)=>setBondPeriodStart(e.target.value)} />
                        <span>-</span>
                        <input type="date" className='border p-1 rounded ml-1' value={bondPeriodEnd} onChange={(e)=>setBondPeriodEnd(e.target.value)} />
                    </div>
                </div>
                
            </div>
            <div className='py-2 px-4 flex items-end justify-end'>
                {
                    modal.mode === "edit" &&
                    <button className='mr-4 text-[0.8em] underline text-red-500' onClick={deleteClick} >delete</button>
                }
                <button className='btn-primary' onClick={modalSaveClick} >Save</button>
            </div>
        </Modal>        
        <Modal show={messageBox.show} closeCallback={()=>setMessageBox({ show: false, message: "", callback: ()=>{} })}>
            <div className='flex items-center justify-center p-4 flex-1'>
                <span>{messageBox.message}</span>
            </div>
            <div className='flex items-center justify-center p-4'>
                <button className='btn-primary' onClick={messageBox.callback} >Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default FileMaintenance;