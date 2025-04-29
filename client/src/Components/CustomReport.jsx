import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { FaPlus, FaX } from 'react-icons/fa6';
import AccountPicker from './AccountPicker';
import axios from 'axios';
import { showToast } from '../utils/toastNotifications';

// pass constant report name here (used to load report content)
function CustomReport({ reportName = "", refresh = ()=>{}, open = false, close = ()=>{} }) {

    const [messageBox, setMessageBox] = useState({ show: false, message: "", callback: ()=>{} });

    const [layout, setLayout] = useState({
        title: "",
        rows: [
            { 
                title: "", 
                accounts: [
                  
                ] 
            }
        ]
    });

    useEffect(()=>{
        if(open && reportName){
            getReportInfo();            
        }
    }, [open]);

    async function getReportInfo(){
        const response = await axios.get(`/reports/custom/${reportName}`, {withCredentials: true});
        if(response.data.length > 0){
            setLayout(response.data[0])
        }
    }

    async function saveClick(){
        setMessageBox({
            show: true,
            message: "Are you sure you want to save this report?",
            callback: async ()=>{
                const toSave = layout;
                console.log(toSave);
                delete toSave._id;
                await axios.patch(`/reports/custom/${reportName}`, toSave, {withCredentials: true});
                refresh();
                setMessageBox({...messageBox, show: false});
                showToast("Layout saved!", "success");
            }
        });
        console.log(reportName, layout);
    }

    // main report title
    function titleChange(e){
        setLayout({...layout, title: e.target.value});
    }

    function addNewRowClick(index = null) {
        setLayout((prevLayout) => {
            const newRow = { 
                title: "", 
                accounts: [] // Initial empty account
            };
    
            const newRows = [...prevLayout.rows];
            if (index !== null && index >= 0 && index < prevLayout.rows.length) {
                newRows.splice(index + 1, 0, newRow); // Insert the new row after the specified index
            } else {
                newRows.push(newRow); // Add to the end if no valid index is provided
            }
    
            return {
                ...prevLayout,
                rows: newRows,
            };
        });
    }

    function editRowTitle(index, newTitle){
        setLayout((prevLayout) => ({
            ...prevLayout,
            rows: prevLayout.rows.map((row, rowIndex) => rowIndex === index ? { ...row, title: newTitle } : row),
        }));
    }

    function deleteRow(index) {
        setMessageBox({
            show: true,
            message: "Are you sure you want to remove this row?",
            callback: ()=>{
                setLayout((prevLayout) => ({
                    ...prevLayout,
                    rows: prevLayout.rows.filter((_, i) => i !== index),
                }));
                setMessageBox({...messageBox, show: false});
            }
        });
    }

    function accountPick(rowIndex, item){
        console.log(rowIndex, item);
        setLayout((prevLayout) => ({
            ...prevLayout,
            rows: prevLayout.rows.map((row, index) => index === rowIndex ? { ...row, accounts: [...row.accounts, { code: item.code, name: item.name }] } : row)
        }));
    }

    function deleteAccountFromRow(rowIndex, accountIndex) {
        setMessageBox({
            show: true,
            message: "Are you sure you want to remove this account?",
            callback: ()=>{
                setLayout((prevLayout) => ({
                    ...prevLayout,
                    rows: prevLayout.rows.map((row, index) =>
                        index === rowIndex ? {
                            ...row,
                            accounts: row.accounts.filter((_, accIndex) => accIndex !== accountIndex),
                        } : row
                    ),
                }));
                setMessageBox({...messageBox, show: false});
            }
        });
    }

    return (
        <>
        <Modal show={open} closeCallback={close} >
            <div className='flex flex-col flex-1 border-t border-b p-4 max-h-[80vh] min-w-[95vw] overflow-y-scroll text-[0.9em]'>
                <div className='flex flex-col mb-6'>
                    <input type="text" className='border-b text-center' value={layout.title} onChange={titleChange} placeholder='Report Title' readOnly />
                </div>
                <div>
                {
                    layout.rows.length === 0 ? (
                        <div className='flex justify-center'>
                            <button className='mb-4 bg-gray-200 p-1 rounded-lg' onClick={()=>addNewRowClick(0)} >
                                <FaPlus className='text-green-600' />
                            </button>
                        </div>
                    ) : 
                    layout.rows.map((item, index)=>
                        <div key={index}>
                        <div className='flex items-start mb-2 border p-1 shadow' >
                            <div className='flex items-center p-2'>
                                <button className='text-white bg-red-500 rounded-lg p-1 mr-2 text-[0.5em]' onClick={()=>deleteRow(index)} ><FaX /></button>
                                <span className='mr-2'>{index + 1}. </span>
                                <input type="text" className='border-b px-1' value={item.title} onChange={(e)=>editRowTitle(index, e.target.value)} placeholder='Title' />
                                <span>:</span>
                            </div>
                            <div className='flex flex-1 items-start flex-wrap'>
                                {
                                    item.accounts.map((itemA, indexA)=>
                                        <div key={indexA} className='flex items-center px-2 py-1 mt-1 mb-1 mr-2 bg-gray-300 rounded'>
                                            <span className='mr-2 text-[0.7em]'>{itemA.code} {itemA.name}</span>
                                            <button className='text-[0.7em] bg-red-500 text-white p-1 rounded-lg' onClick={()=>deleteAccountFromRow(index, indexA)}><FaX /></button>
                                        </div>
                                    )
                                }
                                <div className='flex m-1'>
                                    <AccountPicker className={'text-[0.8em] border-green-700 shadow'} setSelectedAccount={(a)=>accountPick(index, a)}  />
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-center'>
                            <button className='mb-4 bg-gray-200 p-1 rounded-lg' onClick={()=>addNewRowClick(index)} >
                                <FaPlus className='text-green-600' />
                            </button>
                        </div>
                        </div>
                    )
                }
                </div>
            </div>
            <div className='p-2 flex justify-end'>
                <button className='bg-green-600 text-white hover:bg-green-500 transition duration-500 px-4 mr-5 py-1 rounded' onClick={saveClick}>Save</button>
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessageBox({...messageBox, show: false})}>
            <div className='flex flex-1 p-4 text-center'>
                <span>{messageBox.message}</span>
            </div>
            <div className='flex justify-center py-4'>
                <button className='bg-green-600 hover:bg-green-600 transition duration-500 text-white px-2 py-1 rounded' onClick={messageBox.callback}>Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default CustomReport;