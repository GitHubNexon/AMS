import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaX } from 'react-icons/fa6';
import { formatReadableDate, numberToCurrencyString } from '../helper/helper';
import Modal from './Modal';

function LogsModal({ show=true, close=()=>{}, id=null }) {

    const [logs, setLogs] = useState([]);
    const [logModal, setLogModal] = useState({show: false, log: null});

    useEffect(()=>{
        if(!id) return;
        getLogs(id);
    }, [id]);

    async function getLogs(id){
        const response = await axios.get(`/entries/logs/${id}`, { withCredentials: true });
        setLogs(response.data);
    }

    function showLog(log){
        console.log(log);
        setLogModal({show: true, log: log});
    }

    function sToT(date){
        const d = new Date(date);
        const time12hr = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
        return time12hr;
    }

    function displayLogs(logs) {
        let renderingDate = '';
        let lastRenderedDate = '';
        let toRender = [];    
        for (let i = 0; i < logs.length; i++) {
            renderingDate = formatReadableDate(new Date(logs[i].updatedDate));
            // Add a key for the date header
            if (lastRenderedDate !== renderingDate) {
                toRender.push(
                    <span key={`date-${i}`} className='mb-2 mt-4'>{renderingDate}</span>
                );
            }
            const time12hr = sToT(logs[i].updatedDate);
            // Add a key for the log entry
            toRender.push(
                <div key={`log-${i}`} className='flex text-[0.8em] bg-white shadow p-2'>
                    <button className='border-b flex flex-1' onClick={()=>showLog(logs[i])} >
                        <span className='flex-1 text-start'>{logs[i].updatedBy}</span>
                        <span>{time12hr}</span>
                    </button>
                </div>
            );
            lastRenderedDate = renderingDate;
        }
        return toRender;
    }    

    return (
        <>
        <div className={`fixed top-0 left-0 bottom-0 right-0 glass flex ${show ? "" : "invisible" }`} >
            <div className='flex-1' onClick={close}>

            </div>
            <div className='flex-1 min-w-[350px] bg-white shadow-lg flex flex-col'>
                <div className='border-b p-2 flex'>
                    <div className='flex-1'>
                        <span>Version History</span>
                    </div>
                    <button onClick={close}><FaX /></button>
                </div>
                <div className='bg-gray-100 flex-1 overflow-y-scroll p-4 flex flex-col'>
                    { displayLogs(logs) }
                </div>
            </div>
        </div>
        <Modal show={logModal.show} closeCallback={()=>setLogModal({show: false, log: null})} >
            <div className='flex-1 border-t p-4 flex flex-col text-[0.9em]'>
                <div className='flex flex-col'>
                    <span className='mb-4'>By {logModal.log && logModal.log.updatedBy} on {logModal.log && formatReadableDate(logModal.log.updatedDate)} {logModal.log && sToT(logModal.log.updatedDate)}</span>
                    {
                        logModal.log && logModal.log.updated.field === "Attached file" ?
                        <span>* Attached file: {logModal.log && logModal.log.updated.newValue}</span>
                        :
                        logModal.log && logModal.log.updated.field === "Removed attachment" ?
                        <span>* Removed attachment: {logModal.log && logModal.log.updated.oldValue}</span>
                        :
                        logModal.log && logModal.log.updated.field === "Ledgers" ?
                        <>
                        <span>* Updated ledgers:</span>
                        <div className='flex'>
                            <div className='flex-1'>
                                <span className='font-bold'>From</span>
                            </div>
                            <div className='flex-1'>
                                <span className='font-bold'>To</span>
                            </div>
                        </div>
                        <div className='flex text-[0.8em] h-[70vh] overflow-y-scroll'>
                            <div className='flex-1 mr-2 relative'>
                                <table>
                                    <thead>
                                        <tr className='border-b sticky top-0 bg-white'>
                                            <th className='border-r px-2'>Ledger</th>
                                            <th className='border-r px-2'>Subledger</th>
                                            <th className='border-r px-2'>Credit</th>
                                            <th className='px-2'>Debit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        logModal.log && logModal.log.updated.oldValue.map((item, index)=>
                                            <tr key={index} className='border-b'>
                                                <td className='border-r px-2'>{item.glCode} {item.glName}</td>
                                                <td className='border-r px-2'>{item.slCode} {item.slName}</td>
                                                <td className='border-r px-2'>{item.cr > 0 ? numberToCurrencyString(item.cr) : ''}</td>
                                                <td className='px-2'>{item.dr > 0 ? numberToCurrencyString(item.dr) : ''}</td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className='flex-1 ml-2'>
                                <table>
                                    <thead>
                                        <tr className='border-b sticky top-0 bg-white'>
                                            <th className='border-r px-2'>Ledger</th>
                                            <th className='border-r px-2'>Subledger</th>
                                            <th className='border-r px-2'>Credit</th>
                                            <th className='px-2'>Debit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        logModal.log && logModal.log.updated.newValue.map((item, index)=>
                                            <tr key={index} className='border-b'>
                                                <td className='border-r px-2'>{item.glCode} {item.glName}</td>
                                                <td className='border-r px-2'>{item.slCode} {item.slName}</td>
                                                <td className='border-r px-2'>{item.cr > 0 ? numberToCurrencyString(item.cr) : ''}</td>
                                                <td className='px-2'>{item.dr > 0 ? numberToCurrencyString(item.dr) : ''}</td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>
                        :
                        logModal.log && logModal.log.updated.field === "Restored" ||
                        logModal.log && logModal.log.updated.field === "Cancelled" ||
                        logModal.log && logModal.log.updated.field === "Undo cancel" ||
                        logModal.log && logModal.log.updated.field === "Deleted" ?
                        <span>* {logModal.log && logModal.log.updated.field} entry</span>
                        :
                        <span>* Updated {logModal.log && logModal.log.updated.field} from {logModal.log && logModal.log.updated.oldValue} to {logModal.log && logModal.log.updated.newValue}</span>
                    }
                </div>
            </div>
        </Modal>
        </>
    );
}

export default LogsModal;