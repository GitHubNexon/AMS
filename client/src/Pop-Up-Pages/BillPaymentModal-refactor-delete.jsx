import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import { RiBillFill } from 'react-icons/ri';
import { FaPaperclip } from 'react-icons/fa6';
import { BsXCircle } from 'react-icons/bs';
import { formatReadableDate, numberToCurrencyString } from '../helper/helper';
import useBase from '../context/useBase';
import useBill from '../context/useBill';
import useBillPayment from '../context/useBillPayment';
import CurrencyInput from '../Components/CurrencyInput';
import AccountPicker from '../Components/AccountPicker';
import { showToast } from '../utils/toastNotifications';

function BillPaymentModal({show=false, bill=null, closeCallback=()=>{}}) {

    const {base} = useBase();
    const {
        account, setAccount,
        selectedBill, setSelectedBill,
        paymentDate, setPaymentDate,
        paymentMethod, setPaymentMethod,
        referenceNo, setReferenceNo,
        amount, setAmount,
        pay,
        attachmentRef,
        attachment, setAttachment
    } = useBillPayment();
    const { downloadFileAttachment } = useBill();

    useEffect(()=>{
        if(!bill) return;
        setSelectedBill(bill);
        setAmount(bill.openBalance || 0);
    }, [bill]);

    useEffect(()=>{
        if(!bill) return;
        if(amount > (bill.openBalance || 0)){
            setAmount(bill.openBalance || 0);
        }
    }, [amount]);

    async function paymentClick(){
        const response = await pay();
        if(response.status === 200){
            closeCallback();
        }
    }

    const [dragging, setDragging] = useState(false);
    function attachFileClick(){
        attachmentRef.current.click();
    }

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
        // Create a DataTransfer object to assign the dragged files to the input element
        const dataTransfer = new DataTransfer();
        files.forEach(file => {
            dataTransfer.items.add(file); // Add each dragged file
        });
        // Set the files on the file input element using the ref
        attachmentRef.current.files = dataTransfer.files;
        // Use attachValidate to validate files
        attachValidate({ target: { files: dataTransfer.files } });
    };

    function attachFileClick(){
        attachmentRef.current.click();
    }

    function removeAttachFile(name){
        removeFileByName(attachmentRef.current, name);
        setAttachment(attachment.filter(f=>f!=name));
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
        setAttachment(files.map(file => file.name));
    }

    function downloadAttachment(id, filename){
        downloadFileAttachment(id, filename);
    }

    return (
        <Modal title={<span className='flex items-center'><RiBillFill className='mr-2' /> Pay bill</span>} show={show} closeCallback={closeCallback} >
            <div className='flex flex-wrap flex-1 border-t border-b px-4 py-2 max-h-[70vh] overflow-y-scroll'>
                { bill &&
                    <>
                    <div className='text-[0.8em] flex-col mr-2 border-r pr-2 mb-4'>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Vendor:</span>
                            <span>{bill.vendor.vendorName}</span> 
                        </div>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Bill no:</span>
                            <span>{bill.billNo}</span>
                        </div>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Reference:</span>
                            <span>{bill.reference}</span>
                        </div>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Bill date:</span>
                            <span>{formatReadableDate(bill.billDate)}</span>
                        </div>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Due date:</span>
                            <span>{formatReadableDate(bill.billDate)}</span>
                        </div>
                        <div className='flex mb-1'>
                            <span className='mr-2 w-[70px] font-bold text-end'>Memo:</span>
                            <span className='max-w-[200px]'>{bill.memo}</span>
                        </div>
                        <div>
                            <ul className='mt-2'>
                            {
                                bill.attachments.map((item, index)=>
                                    <li key={index} className='mb-1'>
                                        <button className='w-[200px] px-1 text-start underline text-blue-500' onClick={()=>downloadAttachment(bill._id, item)} >{item}</button>
                                    </li>        
                               )
                            }
                            </ul>
                        </div>
                    </div>
                    <div className='flex-col mr-2 px-2'>
                        <table className='text-[0.7em] mb-4 w-[100%]'>
                            <thead>
                                <tr className='border-b bg-gray-200'>
                                    <th className='py-1 px-2 border-r'>CATEGORY</th>
                                    <th className='py-1 px-2 border-r'>DESCRIPTION</th>
                                    <th className='py-1 px-2'>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                            { bill.categoryDetails.map((c, cindex)=>
                                <tr key={cindex} className='border-b'>
                                    <td className='py-1 px-2 border-r max-w-[250px]'>{c.category?.code || 'N/A'} - {c.category?.name || 'N/A'}</td>
                                    <td className='py-1 px-2 border-r max-w-[250px]'>{c.description || 'No description'}</td>
                                    <td className='py-1 px-2'>₱ { numberToCurrencyString(c.amount || 0) }</td>
                                </tr>
                            ) }
                            <tr className='border-b bg-gray-200'>
                                <td></td>
                                <td className='text-end font-bold'>Amount:</td>
                                <td className='font-bold'>₱ { numberToCurrencyString(bill.openBalance) }</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className='flex flex-wrap'>
                            <div className='flex flex-col flex-1 mb-4 mr-2'>
                                <span className='mb-2 text-[0.7em]'><span className='font-bold mr-2'>Attachments</span>Maximum size: 20MB</span>
                                <button
                                    className={`
                                        border mb-4 px-[15px] rounded flex flex-col items-center justify-center
                                        w-[200px] h-[100px] mr-4
                                        ${dragging ? 'border-green-200' : ''}
                                    `} 
                                    onClick={attachFileClick}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <FaPaperclip className='mb-4 text-[1em]' />
                                    <span className='text-[0.6em]'>{dragging ? 'Drop files here!' : 'Drag/Drop files here or click the icon'}</span>
                                </button>
                                <input 
                                    type="file" 
                                    accept=".doc, .docx, .odt, .rtf, .txt, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .odp, .pdf, .png, .jpg, .jpeg, .tiff, .html, .md" 
                                    multiple 
                                    className='hidden' 
                                    ref={attachmentRef} 
                                    onChange={attachValidate} 
                                />
                                <ul className='text-[0.7em]'>
                                {
                                    attachment.map((item, index)=>
                                        <li key={index} className='flex mb-1 w-[200px]'>
                                            <span className='w-[20px]'>{index+1}.</span>
                                            <span>{item}</span>
                                            <button className='ml-2 text-red-500 m-1' onClick={()=>removeAttachFile(item)}><BsXCircle /></button>
                                        </li>
                                    )
                                }
                                </ul>
                            </div>
                            <div className='flex flex-1 flex-col text-[0.8em] items-end'>
                                <div className='flex mb-2 items-center'>
                                    <span className='mr-2 w-[120px] text-end font-bold'>Payment date:</span>
                                    <input 
                                        type="date" 
                                        className='border p-1 rounded border-gray-400 w-[150px]' 
                                        onChange={ (e)=>setPaymentDate(e.target.value) } 
                                        value={paymentDate} />
                                </div>
                                <div className='flex mb-2 items-center'>
                                    <span className='mr-2 w-[120px] text-end font-bold'>Payment method:</span>
                                    <select 
                                        className='border p-1 rounded border-gray-400 w-[150px]' 
                                        onChange={ (e)=>setPaymentMethod(e.target.value) } 
                                        value={paymentMethod} >
                                    { base.paymentMethods.map((item, index)=>
                                        <option key={index} value={item}>{item}</option>
                                    ) }
                                    </select>
                                </div>
                                <div className='flex mb-2 items-center'>
                                    <span className='mr-2 w-[120px] text-end font-bold'>Rerefence no.</span>
                                    <input 
                                        type="text" 
                                        className='border p-1 rounded border-gray-400 w-[150px]'
                                        onChange={(e)=>setReferenceNo(e.target.value)}
                                        value={referenceNo} />
                                </div>
                                <div className='flex mb-2 items-center'>
                                    <span className='mr-2 w-[120px] text-end font-bold'>Paid from:</span>
                                    <AccountPicker 
                                        selectedAccount={account} 
                                        setSelectedAccount={setAccount} 
                                        className={'w-[150px] border-gray-400'} 
                                        // filter={['LIABILITIES', 'CAPITAL', ]} />
                                        filter={['ASSETS', 'CAPITAL', 'REVENUES/INCOME' ]} />
                                </div>
                                <div className='flex mb-2 items-center'>
                                    <span className='mr-2 w-[120px] text-end font-bold'>Amount:</span>
                                    <span className='mr-2 w-[140px]'>₱ {numberToCurrencyString(amount)}</span>
                                    {/* changed to make amount readonly */}
                                    {/* <CurrencyInput
                                        className={'border p-1 w-[150px] rounded border-gray-400'}
                                        val={amount}
                                        setVal={(v)=>setAmount(v)}
                                        acceptZero={true} /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                }
            </div>
            <div className='p-4 flex items-end justify-end'>
                <button className='bg-green-600 px-4 py-1 rounded text-white hover:bg-green-500 transition duration-500' onClick={paymentClick}>Mark as paid</button>
            </div>
        </Modal>
    );
}

export default BillPaymentModal;