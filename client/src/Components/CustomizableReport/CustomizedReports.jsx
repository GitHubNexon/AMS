import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import AccountsTreePicker from './AccountsTreePicker';
import { showToast } from '../../utils/toastNotifications';
import { numberToCurrencyString } from '../../helper/helper';
import * as XLSX from "xlsx";

function CustomizedReports() {

    const [mode, setMode] = useState('add');
    const [reportsList, setReportsList] = useState([]);
    const [editReportModal, setEditReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
        

    const [atree, setAtree] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedField, setSelectedField] = useState(null);

    const [reportModal, setReportModal] = useState(false);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportContent, setReportContent] = useState([]);

    useEffect(() => {
        getList();
    }, []);

    async function getList() {
        const response = await axios.get('/reports/customized', { withCredentials: true });
        setReportsList(response.data);
    }

    function editReport(report) {
        setMode('edit')
        setSelectedReport(report);
        setEditReportModal(true);
    }

    function openReport(report) {
        setSelectedReport(report);
        setFromDate('');
        setToDate('');
        setReportContent([]);
        setReportModal(true);
    }

    async function saveReportLayoutClick() {
        if(!selectedReport.reportName){
            showToast("Enter report title", "warning");
            return;
        }
        // if (selectedReport.fields.some(field => !field.title)) {
        //     showToast("Enter field name", "warning");
        //     return;
        // }
        if(mode === 'edit'){
            await axios.patch(`/reports/customized/${selectedReport._id}`, selectedReport, { withCredentials: true });
        }else if(mode === 'add'){
            await axios.post('/reports/customized/', selectedReport, { withCredentials: true });
        }
        getList();
        setEditReportModal(false);
        setSelectedReport(null);
        setAtree(false);
        setAccounts([]);
        setSelectedField(null);
        showToast("Saved", "success");
    }

    function newLineClick() {
        const updatedReport = { ...selectedReport };
        const updatedFields = [...updatedReport.fields];

        updatedFields.push({
            title: "",
            value: [
                {
                    accounts: [],
                    operateNext: "add",
                },
            ],
        });

        updatedReport.fields = updatedFields;
        setSelectedReport(updatedReport);
    }

    function updateField(index, what, value) {
        const updatedReport = { ...selectedReport };
        const updatedFields = [...updatedReport.fields];
        updatedFields[index] = {
            ...updatedFields[index],
            [what]: value,
        };
        updatedReport.fields = updatedFields;
        setSelectedReport(updatedReport);
    }

    function selectAccountsClick(vitem, fieldIndex, valueIndex) {
        console.log("Selecting accounts:", vitem.accounts);
        setAccounts(vitem.accounts); // Set current accounts for editing
        setSelectedField({ fieldIndex, valueIndex }); // Save both field and value index
        setAtree(true); // Open modal
    }
    function confirmAccountsClick() {
        if (selectedField !== null) {
            const { fieldIndex, valueIndex } = selectedField; // Destructure the saved indices
            const updatedFields = [...selectedReport.fields];
            const fieldValues = [...updatedFields[fieldIndex].value];
    
            if (fieldValues[valueIndex]) {
                // Update the selected value's accounts
                fieldValues[valueIndex] = {
                    ...fieldValues[valueIndex],
                    accounts: [...accounts], // Update accounts
                };
    
                updatedFields[fieldIndex].value = fieldValues; // Update the fields
                setSelectedReport({
                    ...selectedReport,
                    fields: updatedFields,
                });
    
                setAtree(false); // Close modal
                setAccounts([]); // Reset accounts
                setSelectedField(null); // Reset selected field
            } else {
                console.warn(`Invalid indices for confirmAccountsClick: fieldIndex=${fieldIndex}, valueIndex=${valueIndex}`);
            }
        }
    }
    
    

    function operationsChange(item, fieldIndex, vitem, valueIndex, e) {
        const updatedReport = { ...selectedReport };
        const updatedFields = [...updatedReport.fields];
        const fieldValues = [...updatedFields[fieldIndex].value];
    
        if (fieldValues[valueIndex]) {
            fieldValues[valueIndex] = {
                ...fieldValues[valueIndex],
                operateNext: e.target.value, // Update operation
            };
    
            // Add a blank entry if no empty entry exists
            if (!fieldValues.some(entry => entry.operateNext === "")) {
                fieldValues.push({ accounts: [], operateNext: "" });
            }
    
            updatedFields[fieldIndex].value = fieldValues;
            updatedReport.fields = updatedFields;
            setSelectedReport(updatedReport);
        } else {
            console.warn(`Invalid indices for operationsChange: fieldIndex=${fieldIndex}, valueIndex=${valueIndex}`);
        }
    }
    

    function removeFromIndex(fieldIndex, valueIndex) {
        if(valueIndex === 0) return;
        if (selectedReport) {
            const updatedReport = { ...selectedReport };
            const updatedFields = [...updatedReport.fields];
            const fieldValues = [...updatedFields[fieldIndex].value];
    
            if (fieldValues[valueIndex]) {
                fieldValues.splice(valueIndex, 1); // Remove the entry at the specified index
                updatedFields[fieldIndex].value = fieldValues;
    
                updatedReport.fields = updatedFields;
                setSelectedReport(updatedReport);
            } else {
                console.warn(`Invalid indices: fieldIndex=${fieldIndex}, valueIndex=${valueIndex}`);
            }
        } else {
            console.warn('No report is selected.');
        }
    }

    function pushEmptyEntry() {
        const emptyEntry = {
            accounts: [],
            operateNext: '',
        };

        const updatedReport = { ...selectedReport };
        const updatedFields = [...updatedReport.fields];

        updatedFields[selectedField].value.push(emptyEntry);

        setSelectedReport({
            ...updatedReport,
            fields: updatedFields,
        });
    }

    function deleteLine(index) {
        if (selectedReport) {
            const updatedReport = { ...selectedReport };
            const updatedFields = [...updatedReport.fields];
    
            if (index >= 0 && index < updatedFields.length) {
                updatedFields.splice(index, 1); // Remove the item at the specified index
                updatedReport.fields = updatedFields;
    
                // Assuming you have a setState function to update the state
                setSelectedReport(updatedReport); // Update the state with the modified report
                console.log(`Deleted field at index ${index}:`, updatedFields);
            } else {
                console.warn('Invalid index provided.');
            }
        } else {
            console.warn('No report is selected.');
        }
    }

    function createNewReportClick(){
        console.log('test');
        // console.log(report);
        // setSelectedReport(report);


        setMode('add');
        setSelectedReport({
            reportName: "",
            fields: [{ title: "", value: [{accounts: [], operateNext: ""}] }]
        });
        setAtree(false);
        setAccounts([]);
        setSelectedField(null);
        setEditReportModal(true);
    }

    async function searchClick(){
        console.log(selectedReport._id, fromDate, toDate)
        if(!fromDate && !toDate){
            showToast("Please select date", "warning");
            return;
        }

        const response = await axios.get(`/reports/customized/${selectedReport._id}?from=${fromDate}&to=${toDate}`);
        console.log(response.data);
        setReportContent(response.data);

    }

    function exportClick(){
        // also check if it has string content that marks if this is loss
        const toExport = reportContent.map(m=>({
            [selectedReport.reportName]: m.title, 
            '': m.amount != 0 ? numberToCurrencyString(Math.abs(m.amount)) : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(toExport);

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Trigger file download
        XLSX.writeFile(workbook, `${selectedReport.reportName}.xlsx`);
    }

    return (
        <>
            <div>
                {/* <div className='flex mb-4'>
                    <div className='flex-1'>

                    </div>
                    <button onClick={createNewReportClick} className='x-2 py-1 rounded mr-2 bg-green-500 text-white hover:bg-green-400 transition duration-50 px-2'>Create</button>
                </div> */}
                <div className='flex flex-wrap'>
                    {
                        reportsList.map((item, index) =>
                            <div key={index} className='p-4 border shadow-lg rounded flex flex-col min-w-[300px] mr-5 mb-4'>
                                <span className='font-bold mb-4'>{item.reportName}</span>
                                <div className='flex items-end justify-end text-[0.8em]'>
                                    <button className='px-2 py-1 rounded mr-2 bg-green-500 text-white hover:bg-green-400 transition duration-500' onClick={() => editReport(item)}>Edit</button>
                                    <button className='px-2 py-1 rounded mr-2 bg-green-500 text-white hover:bg-green-400 transition duration-500' onClick={() => openReport(item)}>Report</button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            <Modal show={editReportModal} closeCallback={() => { setEditReportModal(false); setSelectedReport(null); }} >
                <div className='border-t border-b flex-1 min-h-[80vh] min-w-[95vw] p-4 flex flex-col text-[0.9em] overflow-y-scroll'>
                    <div className='flex items-end mb-5'>
                        <span className='mr-4'>Report Title:</span>
                        <input type="text" value={selectedReport ? selectedReport.reportName : ''} onChange={(e)=>setSelectedReport({...selectedReport, reportName: e.target.value})} className='border p-1 rounded flex-1' />
                    </div>
                    <div className='flex flex-col max-h-[70vh]'>
                        {
                            selectedReport && selectedReport.fields.map((item, index) =>
                                <div key={index} className='mb-4 flex'>
                                    <div className='flex items-center'>
                                        <button className='text-red-500 mx-2' onClick={()=>deleteLine(index)}>x</button>
                                        <span className='w-[30px]'>{index + 1}.</span>
                                        <span className='mr-2 w-[80px]'>Field name:</span>
                                        <input type="text" value={item.title} onChange={(e) => updateField(index, 'title', e.target.value)} className='border rounded p-1' />
                                    </div>
                                    <div className='flex items-center'>
                                        <span className='w-[10px]'></span>
                                        <span className='w-[50px]'>Value:</span>
                                        <div className='flex flex-wrap'>
                                            {
                                                item.value.map((vitem, vindex) =>
                                                    <div key={vindex} className='flex items-center'>
                                                        <div className='p-2 text-[0.8em] mr-1 flex flex-col'>
                                                            <span>{vitem.accounts.length} accounts selected</span>
                                                            <div className='flex'>
                                                                { vindex != 0 && <button className='text-red-500 mx-2' onClick={() => removeFromIndex(index, vindex)}>x</button> }
                                                                <button className='flex-1 bg-green-500 text-white px-2 py-1 rounded' onClick={() => selectAccountsClick(vitem, index, vindex)}>accounts</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <select className='border text-[0.8em] p-1 rounded' value={vitem.operateNext} onChange={(e) => operationsChange(item, index, vitem, vindex, e)} >
                                                                <option value="">end</option>
                                                                <option value="add">+</option>
                                                                <option value="sub">-</option>
                                                                <option value="prod">*</option>
                                                                <option value="diff">/</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    <div className='flex items-center justify-center p-2'>
                        <button className='border px-2 py-1 rounded bg-gray-500 text-white' onClick={newLineClick}>Add new line</button>
                    </div>
                    </div>
                </div>
                <div className='py-2 px-4 flex justify-end'>
                    <button className='px-2 py-1 rounded mr-2 bg-green-500 text-white hover:bg-green-400 transition duration-500' onClick={saveReportLayoutClick}>Save</button>
                </div>
            </Modal>
            <Modal show={atree} closeCallback={() => setAtree(false)}>
                <div className='border-t border-b flex-1'>
                    <AccountsTreePicker selectedAccounts={accounts} setSelectedAccounts={setAccounts} />
                </div>
                <div className='p-4 flex justify-end'>
                    <div className='flex-1'>
                        <span>{accounts.length} accounts selected</span>
                    </div>
                    <button className='bg-green-500 px-4 py-2 text-white rounded' onClick={confirmAccountsClick} >Confirm</button>
                </div>
            </Modal>
            <Modal title={<span className='text-[0.9em]'>{selectedReport && selectedReport.reportName}</span>} show={reportModal} closeCallback={()=>setReportModal(false)}>
                <div className='flex-1 border-t border-b w-[95vw]'>
                    <div className='p-2 border-b flex'>
                        <div className='flex items-center text-[0.9em] flex-1'>
                            <span className='mx-2'>From</span>
                            <input type="date" className='mx-2 border px-1 rounded' value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
                            <span className='mx-2'>to</span>
                            <input type="date" className='mx-2 border px-1 rounded' value={toDate} onChange={(e)=>setToDate(e.target.value)} />
                            <button className='mx-2 bg-green-500 px-2 rounded text-white' onClick={searchClick}>Search</button>
                        </div>
                        <button className='mx-2 bg-green-500 px-2 mr-4 rounded text-white' onClick={exportClick}>Export</button>
                    </div>
                    <div className='h-[80vh] overflow-y-scroll p-4 text-[0.9em]'>
                        <table>
                            <thead>
                                <tr className='border-b'>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                reportContent.map((item, index)=>
                                    <tr key={index} className='border-b'>
                                        <td className='border-r px-2 pt-4'>{item.title}</td>
                                        <td className='px-2 pt-4'>
                                            {
                                                item.amount != 0 &&
                                                <>
                                                    {/* {item.amount < 0 && <span className='mr-2'>net loss</span>} */}
                                                    {/* { numberToCurrencyString(Math.abs(item.amount)) } */}
                                                    { numberToCurrencyString(item.amount) }

                                                </>
                                            }
                                        </td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='p-2'>
                </div>
            </Modal>
        </>
    );
}

export default CustomizedReports;
