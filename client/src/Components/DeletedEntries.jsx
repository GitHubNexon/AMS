import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import { formatDateToYYYMMdd, formatReadableDate } from '../helper/helper';
import Modal from './Modal';
import { showToast } from '../utils/toastNotifications';
import { IoReloadCircleOutline } from 'react-icons/io5';
import ViewEntry from './ViewEntry';

function DeletedEntries({ refresh=()=>{} }) {

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [count, setCount] = useState(0);
    const [rows, setRows] = useState([]);
    const [messageBox, setMessageBox] = useState({ show: false, message: '', callback: ()=>{} });
    const [viewEntryModal, setViewEntryModal] = useState({ show: false, entry: {}, callback: ()=>{} });
    
    useEffect(()=>{
        getEntriesDeleted();
    }, [page, limit]);

    async function getEntriesDeleted(){
        const response = await axios.get(`/entries/deleted?page=${page}&limit=${limit}`, { withCredentials: true });
        setCount(response.data.count);
        setRows(response.data.entries);
    }

    function prevClick(){
        if(page <= 1) return;
        setPage(page - 1);     
    }

    function nextClick(){
        // 100
        if(count < page * limit){
            return;
        }
        setPage(page + 1);
    }

    function undoClick(item){
        setMessageBox({ 
            show: true, 
            message: `Restore entry ${item.DVNo ? item.DVNo : item.JVNo ? item.JVNo : item.CRNo}?`, 
            callback: async ()=>{
                await axios.post(`/entries/deleted/undo/${item._id}`, { withCredentials: true });
                showToast('Entry restored', 'success');
                getEntriesDeleted();
                refresh();
                setMessageBox({ show: false, message: '', callback: ()=>{} });
            } 
        });
    }

    async function viewClick(item){
        setViewEntryModal({ 
            show: true, 
            entry: item, 
            callback: async ()=>{
                setMessageBox({ 
                    show: true, 
                    message: `Restore entry ${item.DVNo ? item.DVNo : item.JVNo ? item.JVNo : item.CRNo}?`, 
                    callback: async ()=>{
                        await axios.post(`/entries/deleted/undo/${item._id}`, { withCredentials: true });
                        showToast('Entry restored', 'success');
                        getEntriesDeleted();
                        refresh();
                        setMessageBox({ show: false, message: '', callback: ()=>{} });
                        setViewEntryModal({ show: false, entry: {}, callback: ()=>{} });
                    }
                })
            }       
        });
    }
    
    return (
        <>
        <div>
            <div className='flex mb-2'>
                <span className='text-gray-700 mr-2'>Recently deleted</span>
                <button onClick={getEntriesDeleted}><IoReloadCircleOutline /></button>
            </div>
            <div className='relative mb-2 text-[0.8em]'>
                <table className='w-[100%]'>
                    <thead>
                        <tr className='sticky top-0 border-b'>
                            <th className='px-2 py-1 border-r'>No</th>
                            <th className='px-2 py-1 border-r'>Entry type</th>
                            <th className='px-2 py-1 border-r'>Entry date</th>
                            <th className='px-2 py-1 border-r'>Date deleted</th>
                            <th className='px-2 py-1 border-r'>Deleted by</th>
                            <th className='px-2 py-1 border-r'>Particulars</th>
                            <th className='px-2 py-1'></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        rows.map((item, index)=>
                            <tr key={index} className='border-b'>
                                <td className='px-2 py-1 border-r'>{item.CRNo ? item.CRNo : item.JVNo ? item.JVNo: item.DVNo}</td>
                                <td className='px-2 py-1 border-r'>{item.EntryType}</td>
                                <td className='px-2 py-1 border-r'>{formatReadableDate(new Date(item.CRDate ? item.CRDate : item.JVDate ? item.JVDate : item.DVDate))}</td>
                                <td className='px-2 py-1 border-r'>{formatReadableDate(new Date(item.deletedDate))}</td>
                                <td className='px-2 py-1 border-r'>{item.deletedBy}</td>
                                <td className='px-2 py-1 border-r'>{item.Particulars}</td>
                                <td className='px-2 py-1 flex'>
                                    <button className='bg-gray-500 text-white px-2 rounded mr-2' onClick={()=>viewClick(item)} >View</button>
                                    <button className='bg-gray-500 text-white px-2 rounded mr-2' onClick={()=>undoClick(item)} >Undo</button>
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>
            <div className='flex relative items-center justify-center p-4'>
                <span className='text-[0.7em] text-gray-700 absolute left-0'>page {page} of {count < limit ? 1 : count / limit}</span>
                <button className='mr-2 text-[1.2em]' onClick={prevClick} ><FaChevronCircleLeft /></button>
                <button className='ml-2 text-[1.2em]' onClick={nextClick}><FaChevronCircleRight /></button>
                <span className='text-[0.7em] text-gray-700 absolute right-0'>({count}) entries found</span>
            </div>
        </div>
        <Modal show={viewEntryModal.show} closeCallback={()=>setViewEntryModal({ show: false, entry: {}, callback: ()=>{} })}>
            <div className='h-[85vh] w-[96vw] overflow-y-scroll border-t border-b p-4'>
                <ViewEntry entry={viewEntryModal.entry} />
            </div>
            <div className='p-2 flex'>
                <div className='flex-1'>
                    <span>Deleted by: {viewEntryModal.entry.deletedBy} ({formatDateToYYYMMdd(new Date(viewEntryModal.entry.deletedDate))})</span>
                </div>
                <button className='bg-gray-500 text-white px-2 py-1 mr-2 rounded hover:bg-gray-400 transition duration-500' onClick={viewEntryModal.callback} >Undo</button>
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessageBox({ show: false, message: '', callback: ()=>{} })} >
            <div className='flex-1 border-t border-b flex items-center justify-center text-center px-4 max-w-[300px]'>
                {messageBox.message}
            </div>
            <div className='p-2 flex justify-center'>
                <button className='btn-primary' onClick={messageBox.callback}>Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default DeletedEntries;