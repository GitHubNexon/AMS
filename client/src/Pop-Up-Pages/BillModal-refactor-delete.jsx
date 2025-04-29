import React, { useEffect, useState, useRef } from 'react';
import Modal from '../Components/Modal';
import { RiBillFill, RiAttachment2 } from 'react-icons/ri';
import useBill from '../context/useBill';
import AccountPicker from '../Components/AccountPicker';
import CurrencyInput from '../Components/CurrencyInput';
import { numberToCurrencyString, redBorderMarker, removeFileByName, formatDateToYYYMMdd, formatReadableDate } from '../helper/helper';
import TaxPicker from '../Components/TaxPicker';
import VendorSelector from '../Components/VendorSelector';
import useBase from '../context/useBase';
import { showToast } from '../utils/toastNotifications';
import { BsXCircle } from 'react-icons/bs';

function BillModal({show, closeCallback, mode="add", selectedBill=null, selectedVendor=null, refresh=()=>{}}) {

    const { base } = useBase();

    const {
        selectedBillId, setSelectedBillId,
        vendor, setVendor,
        mailingAddress, setMailingAddress,
        terms, setTerms,
        billDate, setBillDate,
        dueDate, setDueDate,
        billNo, setBillNo,
        tags, setTags,
        categoryDetails, setCategoryDetails,
        pushBlankCategory,
        updateCategoryField,
        memo, setMemo,
        attachments, setAttachments,
        save,
        attachmentRef,
        downloadFileAttachment,
        deleteBill,
        referenceNo, setReferenceNo,
        clear,
        getRandomId,
        payment, setPayment
    } = useBill();

    const [dragging, setDragging] = useState(false);
    const [messageBox, setMessagebox] = useState({show: false, message: '', callback: ()=>{}});
    const [editMode, setEditMode] = useState(true);

    useEffect(()=>{
        if(!selectedBill) return;
        setVendor(selectedBill.vendor);
        setMailingAddress(selectedBill.mailingAddress);
        setTerms(selectedBill.terms);
        setBillDate(formatDateToYYYMMdd(new Date(selectedBill.billDate)));
        setDueDate(formatDateToYYYMMdd(new Date(selectedBill.dueDate)));
        setBillNo(selectedBill.billNo);
        setReferenceNo(selectedBill.reference);
        setTags(selectedBill.tags);
        setCategoryDetails(selectedBill.categoryDetails);
        setMemo(selectedBill.memo);
        setAttachments(selectedBill.attachments);
        setPayment(selectedBill.payment);
        if(selectedBill.status === 'paid'){
            setEditMode(false);
        }else{
            setEditMode(true);
        }
    }, [selectedBill]);

    useEffect(()=>{
        if(mode === 'edit' || mode === 'view'){
            setSelectedBillId(selectedBill._id);
        }else if(mode === 'add'){
            clear();
            setRandomBillNo();
        }
    }, [show]);

    async function setRandomBillNo(){
        const docs = await getRandomId();
        setBillNo((docs.data.id + 1).toString().padStart(6, '0'))
    }

    useEffect(()=>{
        if(base.paymentTerms.length === 0) return;
        setTerms(base.paymentTerms[0].term);
    }, []);

    async function saveClick(){
        const response = await save(mode);
        if(response.status === 200 && mode === "add"){
            closeCallback();
        }
        refresh();
    }
    
    function attachValidate(e){
        const allowedTypes = [
            "application/msword",  // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
            "application/vnd.oasis.opendocument.text",  // .odt
            "application/rtf",  // .rtf
            "text/plain",  // .txt
            "application/vnd.ms-excel",  // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  // .xlsx
            "application/vnd.oasis.opendocument.spreadsheet",  // .ods
            "text/csv",  // .csv
            "application/vnd.ms-powerpoint",  // .ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",  // .pptx
            "application/vnd.oasis.opendocument.presentation",  // .odp
            "application/pdf",  // .pdf
            "image/png",  // .png
            "image/jpeg",  // .jpg, .jpeg
            "image/tiff",  // .tiff
            "text/html",  // .html
            "text/markdown"  // .md
        ];
        const files = [...e.target.files];
        const totalSize = files.map(file => file.size).reduce((pre, cur) => pre + cur, 0) / 1048576;
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        // Check upload size
        if (totalSize > 25) {
            showToast("File attachments should not exceed 20MB", "warning");
            attachmentRef.current.value = null;
            return;
        }
        // Check file types
        if (invalidFiles.length > 0) {
            showToast("Invalid file types uploaded. Please upload valid business document files", "warning");
            attachmentRef.current.value = null;
            return;
        }
        // Update the attachment state with valid files
        setAttachments([...attachments, ...files.map(file => file.name)]);
    }

    // file attachment handling
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);  // Show that the button is ready for a drop
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);  // Remove drag state
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);  // Reset the drag state
        const files = [...e.dataTransfer.files];  // Get dropped files
        const dataTransfer = new DataTransfer();
        files.forEach(file => {
            dataTransfer.items.add(file); // Add each dragged file
        });
        attachmentRef.current.files = dataTransfer.files;
        attachValidate({ target: { files: dataTransfer.files } });
    };

    function attachFileClick(){
        attachmentRef.current.click();
    }

    async function removeAttachFile(name){
        setMessagebox({
            show: true,
            message: 'Are you sure you want to delete this file attachment?',
            callback: ()=>{
                removeFileByName(attachmentRef.current, name);
                setAttachments(attachments.filter(f=>f!=name));
                setMessagebox({show: false, message: '', callback: ()=>{}});
            }
        });
    }

    function downloadAttachment(item){
        downloadFileAttachment(selectedBillId, item);
    }

    return (
        <>
        <Modal title={<span className='flex items-center'><RiBillFill className='mr-2' /> Bill</span>} show={show} closeCallback={closeCallback} >
            <div className='flex flex-col flex-1 max-h-[75vh] min-w-[95vw] border-t border-b overflow-y-scroll'>
                <div className='flex flex-wrap bg-gray-100'>
                    <div className='py-4 px-8 flex-1 text-[0.8em]'>
                        <div className='flex flex-col mb-4'>
                            <span className='font-bold mb-1'>Vendor <span className='text-red-500'>*</span></span>
                            <VendorSelector selectedVendor={vendor} onVendorSelect={(v)=>setVendor(v)} />
                        </div>
                        <div className='flex flex-wrap mb-4'>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Mailing address</span>
                                <textarea 
                                    className='resize-none border rounded w-[200px] h-[100px] p-1' 
                                    onChange={(e)=>setMailingAddress(e.target.value)} value={mailingAddress} ></textarea>
                            </div>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Terms <span className='text-red-500'>*</span></span>
                                <select className='min-w-[100px] p-1 border rounded' value={terms || ''} onChange={(e)=>setTerms(e.target.value)} >
                                    { base.paymentTerms.map((item, index)=> <option value={item.term} key={index}>{item.term}</option>) }
                                </select>
                            </div>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Bill date <span className='text-red-500'>*</span></span>
                                <input className='p-1 border rounded' type="date" value={billDate} onChange={(e)=>setBillDate(e.target.value)} />
                            </div>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Due date <span className='text-red-500'>*</span></span>
                                <input className='p-1 border rounded' type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
                            </div>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Bill no.</span>
                                <input className='p-1 border rounded' type="text" value={billNo} onChange={(e)=>setBillNo(e.target.value)} />
                            </div>
                            <div className='flex flex-col mr-4 mb-2'>
                                <span className='mb-1 font-bold'>Reference</span>
                                <input className='p-1 border rounded' type="text" value={referenceNo} onChange={(e)=>setReferenceNo(e.target.value)} />
                            </div>
                        </div>
                        <div className='flex flex-col mr-4 mb-2'>
                            <span className='flex'>
                                <span className='flex-1 font-bold mb-1'>Tags</span>
                                <button className='mb-1 text-blue-500' >Manage tags</button>
                            </span>
                            <input className='p-1 border rounded' type="text" value={tags} onChange={(e)=>setTags(e.target.value)} />
                        </div>
                    </div>
                    <div className='flex-1 max-w-[300px] p-4 flex flex-col items-end'>
                        <span className='text-[0.8em]'>BALANCE DUE</span>
                        <span className='text-[1.5em] font-bold'>PHP {numberToCurrencyString(categoryDetails.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0))}</span>
                    </div>
                </div>
                <div className='flex flex-col px-8 py-4'>
                    <span className='font-bold mb-4'>Category details</span>            
                    <table className='w-[100%] text-[0.7em]'>
                        <thead>
                            <tr className='border-b'>
                                <th className='p-1 border-r'>#</th>
                                <th className='p-1 border-r'>CATEGORY <span className='text-red-500'>*</span></th>
                                <th className='p-1 border-r'>DESCRIPTION <span className='text-red-500'>*</span></th>
                                <th className='p-1 border-r'>AMOUNT <span className='text-red-500'>*</span></th>
                                <th className='p-1 border-r'>TAX</th>
                                <th className='p-1'></th>
                            </tr>
                        </thead>
                        <tbody>
                        { categoryDetails.map((item, index)=>
                            <tr key={index} className='border-b'>
                                <td className='p-1 border-r'>{index + 1}</td>
                                <td className='p-1 border-r'>
                                    <AccountPicker
                                        selectedAccount={item.category}
                                        setSelectedAccount={(e)=>updateCategoryField(index, 'category', e)}
                                        filter={['LIABILITIES', 'EXPENSES']} />
                                </td>
                                <td className='p-1 border-r'>
                                    <input 
                                        type="text" 
                                        className='border p-1 rounded w-[100%]'
                                        value={item.description}
                                        onChange={(e)=>updateCategoryField(index, 'description', e.target.value)} />
                                </td>
                                <td className='w-[140px] p-1 border-r text-end'>
                                    <CurrencyInput 
                                        className={'border p-1 rounded w-[100%] text-end'}
                                        val={item.amount}
                                        setVal={(e)=>updateCategoryField(index, 'amount', e)} />
                                </td>
                                <td className='text-center border-r w-[150px]'>
                                    <TaxPicker selectedTax={item.tax} setSelectedTax={(e)=>updateCategoryField(index, 'tax', e)} />
                                </td>
                                <td className='text-center w-[60px]'>
                                    {
                                        editMode &&
                                        <button className='underline text-red-500' onClick={()=>updateCategoryField(index, 'delete')}>Remove</button>
                                    }
                                </td>
                            </tr>
                        ) }
                        </tbody>
                    </table>
                    <div className='flex mt-2 text-[0.8em]'>
                        {
                            editMode &&
                            <button 
                                className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-400 transition duration-500'
                                onClick={pushBlankCategory} >Add Line</button>
                        }
                    </div>
                </div>
                <div className='px-8 py-4 flex flex-col'>
                    <span className='font-bold mb-4'>Item Details</span>
                </div>
                <div className='flex flex-wrap px-8 py-4 text-[0.8em]'>
                    <div className='flex flex-col mb-4 mr-2'>
                        <span className='mb-1 font-bold'>Memo</span>
                        <textarea className='resize-none w-[300px] h-[100px] p-1 border rounded' onChange={(e)=>setMemo(e.target.value)} value={memo} ></textarea>
                    </div>
                    <div className='flex flex-col mb-4 mr-2'>
                        <span className='mb-1 font-bold'>Attachments</span>
                        <button 
                            className={`
                                border mb-4 py-[50px] px-[20px] rounded flex flex-col items-center justify-center
                                w-[250px] h-[100px]
                                ${dragging ? 'border-green-200' : ''}
                            `} 
                            onClick={attachFileClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop} >
                            <RiAttachment2 className='text-[2em]' />
                            <span>Drag/Drop files here or click the icon</span>
                        </button>
                        <input 
                            type="file" 
                            accept=".doc, .docx, .odt, .rtf, .txt, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .odp, .pdf, .png, .jpg, .jpeg, .tiff, .html, .md" 
                            multiple 
                            className='hidden' 
                            ref={attachmentRef} 
                            onChange={attachValidate} />
                    </div>
                </div>
                <div className='text-[0.8em] px-8 mb-4 flex flex-col'>
                    <span className='mb-2'>Attachments:</span>
                    <ul>
                        {/* file attachment here! */}
                        <ul>
                        {
                            attachments.map((item, index)=>
                                <li key={index} className='flex mb-2'>
                                    <span className='w-[30px]'>{index+1}.</span>
                                    {
                                        mode === 'edit' ?
                                        <button className='underline text-blue-500' onClick={()=>(downloadAttachment(item))}>{item}</button>
                                        :
                                        <span>{item}</span>
                                    }
                                    {
                                        editMode &&
                                        <button className='ml-2 text-red-500 m-1' onClick={()=>removeAttachFile(item)}><BsXCircle /></button>
                                    }
                                </li>
                            )
                        }
                        </ul>
                    </ul>
                </div>
                <div className='text-[0.8em] flex flex-col px-8 mb-8'>
                    <span className='mb-2 font-bold'>Payment History</span>
                    {
                        payment.map((item, index)=>
                            <div key={index} className='mb-1 border rounded p-4 flex flex-wrap'>
                                <div className='flex flex-col mr-4'>
                                    <div className='mb-1 flex'>
                                        <span className='w-[120px] text-end mr-2 font-bold'>Date:</span>
                                        <span>{formatReadableDate(item.paymentDate)}</span>
                                    </div>
                                    <div className='mb-1 flex'>
                                        <span className='w-[120px] text-end mr-2 font-bold'>Reference:</span>
                                        <span>{item.reference}</span>
                                    </div>
                                    <div className='mb-1 flex'>
                                        <span className='w-[120px] text-end mr-2 font-bold'>Payment Method:</span>
                                        <span>{item.method}</span>
                                    </div>
                                    <div className='mb-1 flex'>
                                        <span className='w-[120px] text-end mr-2 font-bold'>Account:</span>
                                        <span>{item.account.code} - {item.account.name}</span>
                                    </div>
                                    <div className='mb-1 flex'>
                                        <span className='w-[120px] text-end mr-2 font-bold'>Amount:</span>
                                        <span>₱ {numberToCurrencyString(item.amount)}</span>
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-bold mb-2'>Attached files</span>
                                    <ul>
                                        {
                                            item.attachment.map((item, index)=>
                                                <li key={index} className='flex mb-1'>
                                                    <span className='w-[20px]'>{index + 1}.</span>
                                                    <button className='underline text-blue-500' onClick={()=>downloadAttachment(item)}>{item}</button>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='px-2 py-4 flex items-end justify-end'>            
                {
                    editMode &&
                    <>
                        <button className='border-[2px] px-4 py-1 rounded mr-4' onClick={saveClick} >Save</button>
                        <button className='px-4 py-1 rounded bg-green-500 text-white hover:bg-green-400 transition duration-500 mr-4'>Save and schedule payment</button>
                    </>
                }
            </div>
        </Modal>
        <Modal show={messageBox.show} closeCallback={()=>setMessagebox({show: false, message: '', callback: ()=>{}})}>
            <div className='flex-1 p-4 flex items-center justify-center text-center'>
                <span className='max-w-[250px]'>{messageBox.message}</span>
            </div>
            <div className='p-4 flex justify-center'>
                <button className='bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500 transition duration-500' onClick={messageBox.callback}>Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default BillModal;