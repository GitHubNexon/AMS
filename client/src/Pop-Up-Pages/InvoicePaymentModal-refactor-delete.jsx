import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaFileInvoice, FaPaperclip, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useInvoicePayment from '../context/useInvoicePayment';
import AccountPicker from '../Components/AccountPicker';
import useBase from '../context/useBase';
import CurrencyInput from '../Components/CurrencyInput';
import { numberToCurrencyString, removeFileByName } from '../helper/helper';
import { showToast } from '../utils/toastNotifications';
import Modal from '../Components/Modal';
import { useLoader } from '../context/useLoader';
import { BsXCircle } from 'react-icons/bs';

const statuses = ['All', 'Pending', 'Past Due', 'Paid'];

// selectedCustomer: the default selected customer
function InvoicePaymentModal({selectedCustomer, closeCallback, refreshTable = ()=>{}}) {
    
    const {base} = useBase();
    const {loading} = useLoader();

    const {
        customer,
        customers, setCustomer,
        invoices,
        account, setAccount,
        paymentMethod, setPaymentMethod,
        referenceNo, setReferenceNo,
        memo, setMemo,
        myCredit,
        paymentDate, setPaymentDate,
        total, setTotal,
        newCredit, setNewCredit,
        appliedAmount, setAppliedAmount,
        amountReceived, setamountReceived,
        credit, setCredit,
        proceedPayment,
        fetchCustomerInvoices
    } = useInvoicePayment(selectedCustomer);

    const [filterStatus, setFilterStatus] = useState(statuses[0]);
    const [search, setSearch] = useState('');

    const [filteredInvoice, setFilteredInvoice] = useState([]);
    const [pagination, setPagination] = useState({start: 0, end: 9, jump: 10});

    const attachmentRef = useRef();
    const [attachment, setAttachment] = useState([]);
    const [dragging, setDragging] = useState(false);

    const [confirmModal, setConfirmModal] = useState({show: false, data: {}, callback: ()=>{}});

    const filteredResults = filteredInvoice
    .filter(fs => filterStatus === 'All' || fs.status.type === filterStatus)
    .filter(fq => !search || fq.temporaryInvoiceNumber?.toLowerCase().includes(search.toLowerCase()) || fq.officalInvoiceNumber?.toLowerCase().includes(search.toLowerCase()));

    const totalFilteredResults = filteredResults.length;

    // populate filteredInvoice with extra fields for data table
    useEffect(()=>{
        setFilteredInvoice(invoices.map((item, index)=>{
            return {...item, checked: false, n: index + 1};
        }));
    }, [invoices]);

    // loads payment method dropdown
    useEffect(()=>{
        if(base.paymentMethods){
            setPaymentMethod(base.paymentMethods[0]);
        }
    }, [base]);

    // useEffect(()=>{
    //     const totalAmount = filteredInvoice.map(m=>m.total).reduce((pre,cur)=>pre+cur,0)
    //     const totalPaid = filteredInvoice.map(m=>m.payment.map(p=>p.amount)).flat().reduce((pre,cur)=>pre+cur,0);
    //     console.log(totalAmount)
    //     console.log(totalPaid);
    //     if(credit === 0){
    //         setNewCredit(0);
    //     }
    //     if(credit > myCredit){
    //         setCredit(0);
    //         setNewCredit(0);
    //     }else{
    //         distributeAmountReceived(amountReceived, credit);
    //     }
    // }, [credit]);

    useEffect(()=>{


        const total = amountReceived + credit;
        const totalPaid = filteredInvoice.filter(f=>f.checked && f.pay).map(m=>m.pay).reduce((pre, cur)=> pre + cur, 0);
        // const apply = filteredInvoice.filter(f=>f.checked && f.pay).map(m=>m.pay).reduce((prev, cur)=>prev + cur, 0);

        setTotal(total ? parseFloat(total) : 0);
        setNewCredit(parseFloat(total) - parseFloat(totalPaid));
        setAppliedAmount(parseFloat(totalPaid));

        distributeAmountReceived(amountReceived, credit);

    }, [amountReceived, credit]);

    function creditSet(c){
        // guard clause if input is greater than current credit
        if(c > myCredit) return;
        const totalAmount = filteredInvoice.map(m=>m.total).reduce((pre,cur)=>pre+cur,0)
        const totalPaid = filteredInvoice.map(m=>m.payment.map(p=>p.amount)).flat().reduce((pre,cur)=>pre+cur,0);
        // if input is greater than total open balance - current amount received input
        if(c > ((totalAmount - totalPaid) - amountReceived) ){
            // set credit to remaining open balance (- amount received)
            setCredit( (totalAmount - totalPaid) - amountReceived );
            distributeAmountReceived(amountReceived, (totalAmount - totalPaid) - amountReceived)
            return;
        }
        setCredit(c);
        distributeAmountReceived(amountReceived, c);
    }

    function applyCreditChange(e){
        if(e.target.checked){
            creditSet(myCredit);
        }else{
            setCredit(0);
            distributeAmountReceived(amountReceived, 0);
        }
    }

    function clearPayment(){
        setamountReceived(0);
        setTotal(0);
        setNewCredit(0);
        setAppliedAmount(0);
        setCredit(0);
        setFilteredInvoice(filteredInvoice.map(invoice=>({...invoice, checked: false, pay: 0})));
    }

    // uses id in dropdown to switch customer info
    function customerChange(e){
        setCustomer(...customers.filter(item=>item._id === e.target.value));
    }

    async function saveClick(){
        if(validateBeforeSave()) return;
        const data = processPaymentInfo();
        setConfirmModal({show: true, data: data, callback: async (s)=>{
            loading(true);
            const response = await proceedPayment(data);
            await fetchCustomerInvoices();
            loading(false);
            // add response checking here
            clearPayment();
            setConfirmModal({show: false, data: {}, callback: ()=>{}});
            showToast('Payment saved!', 'success');
            if(s === 'saveclose'){
                closeCallback();
            }
            refreshTable();
        }});
    }

    function processPaymentInfo(){
        // harvest and clean data
        const paymentInfo = {
            customer: customer,
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            referenceNo: referenceNo || '',
            depositTo: account,
            memo: memo || '',
            appliedCredit: credit,
            newCredit: newCredit,
            appliedAmount: appliedAmount,
            amountReceived: amountReceived
        };
        const paidInvoices = filteredInvoice
        .filter(f=>f.checked && f.pay)
        .map(m=>({
            _id: m._id, 
            date: paymentDate,
            method: paymentMethod,
            referenceNo: referenceNo || '',
            account: account._id,
            amount: m.pay
        }));
        const files = attachmentRef.current.files;
        return {paymentInfo: paymentInfo, paidInvoices: paidInvoices, attachment: files};
    }

    function validateBeforeSave(){
        let flag = false;
        if(!customer){
            flag = true;
            showToast('Please select customer', 'warning');
        }
        if(!paymentDate){
            flag = true;
            showToast('Please select payment date');
        }
        if(!paymentMethod){
            flag = true;
            showToast('Please select payment method');
        }
        if(!account){
            flag = true;
            showToast('Please select deposit account', 'warning');
        }
        if(appliedAmount <= 0){
            flag = true;
            showToast('Please enter payment information', 'warning');
        }
        return flag;
    }

    // table filters
    function filterStatusChange(e){
        setFilterStatus(e.target.value);
    }

    function filterSearch(e){
        setSearch(e.target.value);
    }

    // input handlers
    function paymentMethodChange(e){
        setPaymentMethod(e.target.value);
    }

    function referenceNoChange(e){
        setReferenceNo(e.target.value);
    }

    function memoChange(e){
        setMemo(e.target.value);
    }

    function encodeAmountReceived(e){
        setamountReceived(e)
        distributeAmountReceived(e, credit);
    }

    function distributeAmountReceived(amount, credit){
        let inv = filteredInvoice.map(invoice=>({...invoice, checked: false, pay: 0}));
        let toDist = amount + credit;
        for(let i = 0; i < inv.length; i++){
            let remaining = parseFloat(inv[i].total - (inv[i].payment.map(p=>p.amount).reduce((acc, cur)=>acc + cur, 0)))
            if(toDist > 0){
                if(remaining >= toDist){
                    inv[i].pay = toDist;
                    inv[i].checked = true;
                    toDist = 0;
                }else{
                    inv[i].pay = remaining;
                    inv[i].checked = true;
                    toDist -= remaining;
                }
            }else{
                inv[i].checked = false;
                inv[i].pay = 0;
            }
        }
        setFilteredInvoice(inv);
    }

    // payment input on transaction tables
    function inputPayment(e, item){
        let newR = 0;
        if(!e || e === 0 || e > parseFloat(item.total - (item.payment.map(p=>p.amount).reduce((acc, cur)=>acc + cur, 0)))){
            newR = filteredInvoice.map(inv=>inv._id === item._id ? {...inv, checked: false, pay: 0} : inv);
            setFilteredInvoice(newR);
        }else{
            newR = filteredInvoice.map(inv=>inv._id === item._id ? {...inv, checked: true, pay: e} : inv);
            setFilteredInvoice(newR);
        };
        setamountReceived(newR.filter(f=>f.checked && f.pay).map(m=>m.pay).reduce((pre, cur)=>pre + cur,0) - credit);
    }

    // row checkbox
    function checkInput(e, row){
        const re = filteredInvoice.map(invoice=>{
            if(invoice._id === row._id){
                return {
                    ...invoice, 
                    checked: e.target.checked, 
                    pay: e.target.checked ? parseFloat(invoice.total - (invoice.payment.map(p=>p.amount).reduce((acc, cur)=>acc + cur, 0))) : 0
                };
            }
            return invoice;
        })
        setFilteredInvoice(re);
        setamountReceived(re.filter(f=>f.checked && f.pay).map(m=>m.pay).reduce((pre, cur)=>pre+cur,0) - credit);
    }

    // pagination
    function nextClick(){
        if(!((pagination.end + pagination.jump) > filteredInvoice.length)){
            setPagination({...pagination, start: pagination.start + pagination.jump, end: pagination.end + pagination.jump});
        }
    }

    function prevClick(){
        setPagination({...pagination, start: Math.max(0, pagination.start - pagination.jump), end: Math.max(pagination.jump - 1, pagination.end - pagination.jump)});
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

    return (
        <>
        <Modal show={confirmModal.show} closeCallback={()=>setConfirmModal({show: false, data: {}, callback: ()=>{}})} title='Confirm Payment'>
            {
                confirmModal.data.paymentInfo && 
                <div className='flex-1 py-2 px-4 flex-col text-[0.85em]'>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Payment date:</span>
                        <span>{confirmModal.data.paymentInfo.paymentDate}</span>
                    </div>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Payment method:</span>
                        <span>{confirmModal.data.paymentInfo.paymentMethod}</span>
                    </div>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Reference no:</span>
                        <span>{confirmModal.data.paymentInfo.referenceNo}</span>
                    </div>
                    <div className='flex mb-2'>
                        <span className='w-[130px] font-bold text-end mr-2'>Deposit to:</span>
                        <div className='flex flex-col'>
                            <span>{confirmModal.data.paymentInfo.depositTo.code} <span className='text-gray-400'>({confirmModal.data.paymentInfo.depositTo.category})</span></span>
                            <span className='w-[300px]'>{confirmModal.data.paymentInfo.depositTo.name}</span>
                        </div>
                    </div>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Amount received:</span>
                        <span>PHP {numberToCurrencyString(confirmModal.data.paymentInfo.amountReceived)}</span>
                    </div>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Applied amount:</span>
                        <span>PHP {numberToCurrencyString(confirmModal.data.paymentInfo.appliedAmount)}</span>
                    </div>
                    <div className='flex'>
                        <span className='w-[130px] font-bold text-end mr-2'>Applied credits:</span>
                        <span>PHP {numberToCurrencyString(confirmModal.data.paymentInfo.appliedCredit)}</span>
                    </div>
                    <div className='flex mb-4'>
                        <span className='w-[130px] font-bold text-end mr-2'>Amount to credit:</span>
                        <span>PHP {numberToCurrencyString(confirmModal.data.paymentInfo.newCredit)}</span>
                    </div>
                    <div className='flex flex-col mb-4 text-[0.9em]'>
                        <table>
                            <thead>
                                <tr className='border-b'>
                                    <th className='border-r py-1 px-2'>Invoice</th>
                                    <th className='border-r py-1 px-2'>Open Balance</th>
                                    <th className='border-r py-1 px-2'>Payment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    confirmModal.data.paidInvoices.map((item, index)=>
                                        <tr key={index} className='border-b' >
                                            <td className='py-1 px-2 text-center border-r'>
                                                {
                                                    filteredInvoice.filter(f=>f._id === item._id)[0].officalInvoiceNumber 
                                                    || filteredInvoice.filter(f=>f._id === item._id)[0].temporaryInvoiceNumber 
                                                } 
                                                <span className='ml-2 text-end text-gray-500'>
                                                    ({filteredInvoice.filter(f=>f._id === item._id)[0].invoiceDate.substr(0, 10)})
                                                </span>
                                            </td>
                                            <td className='py-1 px-2 text-center border-r'>
                                                {numberToCurrencyString(
                                                    filteredInvoice.filter(f=>f._id === item._id)[0].total 
                                                    - (filteredInvoice.filter(f=>f._id === item._id)[0].payment.map(m=>m.amount).reduce((pre, cur)=>pre + cur, 0))
                                                )}
                                            </td>
                                            <td className='py-1 px-2 text-center border-r'>{numberToCurrencyString(item.amount)}</td>
                                            <td className='py-1 px-2 text-center'>
                                                {
                                                    filteredInvoice.filter(f=>f._id === item._id)[0].total 
                                                    - (filteredInvoice.filter(f=>f._id === item._id)[0].payment.map(m=>m.amount).reduce((pre, cur)=>pre + cur, 0)) 
                                                    > item.amount ? 'Pay partially' : 'Pay full'
                                                }
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            }
            <div className='p-3 flex justify-end'>
                <button 
                    className='px-4 mr-2 py-1 bg-green-600 hover:bg-green-500 transition duration-500 text-white rounded' 
                    onClick={()=>confirmModal.callback('save')} >
                    Save
                </button>
                <button 
                    className='px-4 mr-2 py-1 bg-blue-600 hover:bg-blue-500 transition duration-500 text-white rounded' 
                    onClick={()=>confirmModal.callback('saveclose')} >
                    Save and close
                </button>
            </div>
        </Modal>
        <div className='glass fixed top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center'>
            <div className='flex flex-col h-[95vh] w-[95vw] border bg-white rounded-md'>
                <div className='p-3 flex border-b'>

                    <h1 className='flex-1 flex items-center'> <FaFileInvoice className='mr-2 text-gray-500' /> Receive Payment</h1>
                    <button onClick={closeCallback} ><FaTimes size={25} /></button>
                </div>
                <div className='flex-1 overflow-y-scroll text-[0.8em] flex-col'>
                    {/* customer & payment info */}
                    <div className='flex flex-wrap px-5 py-3 pb-5 bg-gray-100'>
                        {/* customer */}
                        <div className='flex flex-wrap flex-2'>
                            <div className='flex flex-col m-2'>
                                <label className='pb-2 font-bold'>Customer</label>
                                <select className='border rounded p-2 min-w-[250px]' value={customer && (customer.id || customer._id)} onChange={customerChange}>
                                    { customers.map((item, index)=> 
                                        <option key={index} value={item._id} >
                                            {`${item.firstName} ${item.middleName} ${item.lastName}`}
                                        </option>
                                    )}
                                </select>
                            </div>
                            <div className='flex flex-col m-2'>
                                <label className='pb-2 font-bold'>Email</label>
                                <input type="text" className='border rounded p-[7px] min-w-[250px]' value={customer && customer.email} readOnly />
                            </div>
                        </div>
                        {/* payment info */}
                        <div className='flex-1 flex flex-col text-end'>
                            <span className='text-[0.9em]'>AMOUNT RECEIVED</span>
                            <span className='font-bold text-[2.5em]'>
                                PHP {numberToCurrencyString(total)}
                            </span>
                        </div>
                    </div>
                    {/* payment options */}
                    <div className='flex flex-wrap pb-5 px-5 bg-gray-100'>
                        <div className='flex flex-col m-2 min-2-[250px]'>
                            <label className='mb-1 font-bold'>Payment Date</label>
                            <input type="date" className='border rounded p-[7px]' value={paymentDate} onChange={(e)=>setPaymentDate(e.target.value)} />
                        </div>
                        <div className='flex flex-col m-2 min-w-[250px]'>
                            <label className='mb-1 font-bold'>Payment method</label>
                            <select className='border rounded p-2' value={base.paymentMethod && base.paymentMethod[0]} onChange={paymentMethodChange}>
                                {base.paymentMethods && base.paymentMethods.map((item, index)=>
                                    <option key={index} value={item}>{item}</option>
                                )}
                            </select>
                        </div>
                        <div className='flex flex-col m-2 min-w-[250px]'>
                            <label className='mb-1 font-bold'>Reference no.</label>
                            <input type="text" className='rounded border p-[7px]' onChange={referenceNoChange} placeholder='Type here' />
                        </div>
                        <div className='flex flex-col m-2 min-w-[250px]'>
                            <label className='mb-1 font-bold'>Deposit to</label>
                            <AccountPicker selectedAccount={account} setSelectedAccount={setAccount} filter={['ASSETS', 'CAPITAL', 'REVENUES/INCOME']} />
                        </div>
                    </div>
                    <div className='flex flex-col flex-1 items-end justify-end bg-gray-100 px-5 pb-5'>
                        <label className='pb-1 font-bold'>Amount received</label>
                        <CurrencyInput
                            className={'p-1 rounded border'}
                            val={amountReceived}
                            setVal={(e)=>encodeAmountReceived(e)}
                            acceptZero={false} />
                        <div className='flex-1'>
                            <span className='inline-block font-bold mb-2 text-[1.3em]'>Credits</span>
                            <table className='text-[0.9em]'>
                                <thead>
                                    <tr className='border-b'>
                                        <th className='border-r px-2 py-1'>APPLY</th>
                                        <th className='border-r px-2 py-1'>OPEN BALANCE</th>
                                        <th className='px-2 py-1'>APPLY CREDIT</th>
                                    </tr>
                                </thead>
                                <tbody className='text-center'>
                                    {
                                        myCredit > 0 ? 
                                        <tr className='border-b'>
                                            <td className='border-r'>
                                                <input type="checkbox" checked={credit > 0} onChange={applyCreditChange} />
                                            </td>
                                            <td className='border-r'>
                                                <span>{numberToCurrencyString(parseFloat(myCredit))}</span>
                                            </td>
                                            <td>
                                                <CurrencyInput
                                                    className={'p-1 border rounded text-center'}
                                                    val={credit}
                                                    setVal={(c)=>creditSet(c)} />
                                            </td>
                                        </tr>
                                        :
                                        <tr className='border-b'>
                                            <td className='border-r'></td>
                                            <td className='border-r'>0.00</td>
                                            <td></td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* invoices */}
                    <div className='flex flex-col px-2 mb-5'>
                        <div className='flex-col px-3 py-3'>
                            <span className='font-bold text-[1.1em] mb-2 inline-block'>Outstanding Transactions</span>
                            <div>
                                <input type="text" className='border p-1 rounded mr-[15px]' value={search} onChange={filterSearch} placeholder='Find invoice No.' />
                                <select className='border p-1 w-[120px]' value={filterStatus} onChange={filterStatusChange} >
                                    <option value="All">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Past Due">Past Due</option>
                                    <option value="Partially Paid">Partially Paid</option>
                                </select>
                            </div>
                        </div>
                        <table className='text-left text-[0.9em]'>
                            <thead>
                                <tr className='border-b'>
                                    <th className='p-1 w-[50px] border-r'></th>
                                    <th className='p-1 border-r'>DESCRIPTION</th>
                                    <th className='p-1 border-r'>DUE DATE</th>
                                    <th className='p-1 border-r'>ORIGINAL AMOUNT</th>
                                    <th className='p-1 border-r'>OPEN BALANCE</th>
                                    <th className='p-1 w-[120px]'>PAYMENT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredResults
                                    .slice(pagination.start, pagination.end + 1)
                                    .map((item, index)=>
                                        <tr key={index} className='border-b hover:bg-gray-100'>
                                            <td className='p-2 pl-5 border-r flex items-center'>
                                                <span className='w-[20px]'>{item.n}. </span>
                                                <input type="checkbox" checked={item.checked} onChange={(event)=>checkInput(event, item)} />
                                            </td>
                                            <td className='px-2 border-r'>{item.temporaryInvoiceNumber || item.officialInvoiceNumber} ({item.invoiceDate.slice(0, 10)})</td>
                                            <td className='px-2 border-r'>{item.dueDate.slice(0, 10)}</td>
                                            <td className='text-end px-2 border-r'>{parseFloat(item.total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                                            <td className='text-end px-2 border-r'>
                                                {
                                                    parseFloat(item.total - (item.payment.map(p=>p.amount).reduce((acc, cur)=>acc + cur, 0)))
                                                    .toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')   
                                                }
                                            </td>
                                            <td>
                                                <CurrencyInput 
                                                    val={item.pay || 0} 
                                                    setVal={(e)=>inputPayment(e, item)} 
                                                    className={'p-1 border rounded'}
                                                    acceptZero={false}
                                                />
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                        <div className='mb-2 flex items-center justify-center p-1 relative'>
                            <span className='absolute left-[15px]'>
                                showing {Math.min(pagination.end + 1, totalFilteredResults)} out of {filteredInvoice.length} invoices
                            </span>
                            <button className='px-2 py-1 bg-green-500 text-white hover:bg-green-400 transition duration-500 rounded mr-1' onClick={prevClick}><FaChevronLeft /></button>
                            <button className='px-2 py-1 bg-green-500 text-white hover:bg-green-400 transition duration-500 rounded ml-1' onClick={nextClick}><FaChevronRight /></button>
                        </div>
                        <div className='flex flex-wrap p-2 justify-end'>
                            <div className='flex-col text-end'>
                                <div className='mb-2 flex'>
                                    <span className='w-[150px] font-bold'>Amount to Apply</span>
                                    <span className='w-[120px]'>PHP {numberToCurrencyString(appliedAmount)}</span>
                                </div>
                                <div className='mb-2 flex'>
                                    <span className='w-[150px] font-bold'>Amount to Credit</span>
                                    <span className='w-[120px]'>PHP {numberToCurrencyString(newCredit)}</span>
                                </div>
                                <button className='border border-gray-400 rounded-lg py-1 px-4 mt-2' onClick={clearPayment}>Clear Payment</button>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-wrap p-4 items-start'>
                        <div className='flex flex-col mb-4 mr-4'>
                            <span className='mb-2 font-bold'>Memo</span>
                            <textarea className='border p-1 min-w-[250px] h-[150px] resize-none' onChange={memoChange} placeholder='Type here'>{memo}</textarea>
                        </div>
                        <div className='flex flex-col mb-4'>
                            <span className='mb-2'><span className='font-bold mr-2'>Attachments</span>Maximum size: 20MB</span>
                            <button
                                className={`
                                    border mb-4 py-[50px] px-[20px] rounded flex flex-col items-center justify-center
                                    w-[250px] h-[150px] mr-4
                                    ${dragging ? 'border-green-200' : ''}
                                `} 
                                onClick={attachFileClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <FaPaperclip className='mb-4 text-lg' />
                                <span>{dragging ? 'Drop files here!' : 'Drag/Drop files here or click the icon'}</span>
                            </button>
                            <input 
                                type="file" 
                                accept=".doc, .docx, .odt, .rtf, .txt, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .odp, .pdf, .png, .jpg, .jpeg, .tiff, .html, .md" 
                                multiple 
                                className='hidden' 
                                ref={attachmentRef} 
                                onChange={attachValidate} 
                            />
                            {/* file attachment here! */}
                            <ul>
                                {
                                    attachment.map((item, index)=>
                                        <li key={index} className='flex mb-2'>
                                            <span className='w-[30px]'>{index+1}.</span>
                                            <span>{item}</span>
                                            <button className='ml-2 text-red-500 m-1' onClick={()=>removeAttachFile(item)}><BsXCircle /></button>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                    <div className='h-[100px]'></div>
                </div>
                <div className='flex p-4 border-t'>
                    <div className='flex-1'></div>
                    <button className='bg-green-600 transition duration-500 hover:bg-green-500 text-white px-4 py-1 rounded mr-5' onClick={saveClick} >Save</button>
                </div>
            </div>
        </div>
        </>
    );
}

export default InvoicePaymentModal;