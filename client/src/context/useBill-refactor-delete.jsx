import React, { useEffect, useState, useRef } from 'react';
import useBase from './useBase';
import { formatDateToYYYMMdd } from '../helper/helper';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { showToast } from '../utils/toastNotifications';

function useBill() {

    const {base} = useBase();

    const [selectedBillId, setSelectedBillId] = useState('');
    const [referenceNo, setReferenceNo] = useState('');
    const [vendor, setVendor] = useState(null);
    const [mailingAddress, setMailingAddress] = useState('');
    const [terms, setTerms] = useState(null);
    const [billDate, setBillDate] = useState(formatDateToYYYMMdd(new Date()));
    const [dueDate, setDueDate] = useState('');
    const [billNo, setBillNo] = useState('');
    const [tags, setTags] = useState('');
    const [categoryDetails, setCategoryDetails] = useState([
        {
            category: null,
            description: '',
            amount: 0,
            tax: [],
        }
    ]);
    const [memo, setMemo] = useState('');
    const [attachments, setAttachments] = useState([]);
    const attachmentRef = useRef();
    const [payment, setPayment] = useState([]);

    useEffect(()=>{
        if(base.paymentTerms.length === 0) return;
        setTerms(base.paymentTerms[0].term);
    }, [base]);

    // calculate due date based on terms and bill date
    useEffect(() => {
        if (!terms || !billDate) return;
        const days = base.paymentTerms.find(f => f.term === terms)?.value || 0;        
        let result = new Date(billDate);
        result.setDate(result.getDate() + days);
        setDueDate(formatDateToYYYMMdd(result));
    }, [terms, billDate]);
    
    // push blank item to category details
    function pushBlankCategory(){
        setCategoryDetails([...categoryDetails, {
            category: null,
            description: '',
            amount: 0,
            tax: []
        }]);
    }

    async function getRandomId(){
        const id = await axios.get(`${API_BASE_URL}/bills/id`, { withCredentials: true});
        return id;
    }

    function updateCategoryField(index, field, value){
        let updatedFields = [...categoryDetails];
        switch(field){
            case 'category':
                updatedFields[index] = {...updatedFields[index], category: value}
            break;
            case 'description':
                updatedFields[index] = {...updatedFields[index], description: value};
            break;
            case 'amount':
                if(!value) return;
                // calcualte tax ???
                updatedFields[index] = {...updatedFields[index], amount: value};
            break;
            case 'tax':
                // re calculate ammount based on tax ???
                updatedFields[index] = {...updatedFields[index], tax: [...value]};
            break;
            case 'delete':
                updatedFields = categoryDetails.filter((_, i)=>i !== index);
            break;
        }
        setCategoryDetails(updatedFields);
    }

    function processSavedData(){
        const bill = {
            vendor: { vendorId: vendor.value, vendorName: vendor.label },
            mailingAddress: mailingAddress,
            terms: terms,
            billDate: billDate,
            dueDate: dueDate,
            billNo: billNo,
            reference: referenceNo,
            tags: tags,
            categoryDetails: categoryDetails.filter(f=>f.category).map(c=>({
                category: c.category,
                description: c.description,
                amount: c.amount,
                tax: c.tax
            })),
            memo: memo,
            attachments: attachments
        };
        const files = attachmentRef.current.files;
        return {bill: bill, files: files};
    }

    function checkInput(){
        let flag = false;
        if(!vendor) flag = true;
        if(!billDate) flag = true;
        if(!dueDate) flag = true;
        if(categoryDetails.filter(f=>f.category && f.description && f.amount).length <= 0) flag = true;
        if(flag){
            showToast("Please enter bill information", "warning");
        }
        return flag;
    }

    async function save(mode){
        if(checkInput()) return false;
        const bill = processSavedData();
        const formData = new FormData();
        formData.append('json', JSON.stringify(bill.bill));
        [...bill.files].forEach((file)=>formData.append('files', file));
        let response;
        if(mode === 'add'){
            response = await axios.post(`${API_BASE_URL}/bills`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        }else if(mode === 'edit'){
            response = await axios.patch(`${API_BASE_URL}/bills/${selectedBillId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        }
        if(response.status === 200){
            if(mode === "add"){
                showToast("Bill posted", "success");
                clear();
            }else{
                // edit (clear file input)
                attachmentRef.current.value = '';
                showToast("Bill updated", "success");
            }
        }else{
            showToast("Unable to post bill.");
        }
        return response;
    }

    async function saveAndSchedule(){

    }

    function clear(){
        setVendor(null);
        setMailingAddress('');
        setTerms(base.paymentTerms.length > 0 ? base.paymentTerms[0].term : '');
        setBillDate(formatDateToYYYMMdd(new Date()));
        setDueDate(formatDateToYYYMMdd(new Date(new Date().setDate(new Date().getDate() + 15))));
        setBillNo('');
        setTags('');
        setCategoryDetails([
            {
                category: null,
                description: '',
                amount: 0,
                tax: [],
            }
        ]);
        setMemo('');
        setSelectedBillId('');
        setAttachments([]);
        if(attachmentRef.current) attachmentRef.current.value = '';
        setReferenceNo('');
        setPayment([]);
        
    }

    async function downloadFileAttachment(id, name){
        try{
            if(attachmentRef.current &&([...attachmentRef.current.files].filter(f=>f.name === name).length > 0)){
                return;
            }
            const response = await axios.get(`/bills/attachment/${id}/${name}`, {withCredentials: true, responseType: 'blob'});
            // Create a new Blob object using the response data
            const blob = new Blob([response.data], { type: 'image/png' }); // Adjust the MIME type as necessary
            // Create a link element
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob); // Create a URL for the Blob
            link.download = name; // Set the file name for the download
            // Append to the body (needed for Firefox)
            document.body.appendChild(link);
            // Trigger the download
            link.click();
            // Clean up and remove the link
            link.remove();
        }catch(error){
            console.error(error);
        }
    }

    async function deleteBill(id){
        try{
            const response = await axios.delete(`/bills/${id}`, { withCredentials: true });
            if(response.status === 200){
                showToast("Bill deleted", "success");
            }else{
                showToast("unable to delete bill, please try again later.", "danger");
            }
            return response;
        }catch(error){
            console.error(error);
        }    
    }

    return {
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
        save,
        saveAndSchedule,
        updateCategoryField,
        memo, setMemo,
        attachments, setAttachments,
        attachmentRef,
        downloadFileAttachment,
        deleteBill,
        referenceNo, setReferenceNo,
        clear,
        getRandomId,
        payment, setPayment
    };
}

export default useBill