import React, { useState, useEffect, useRef } from 'react';
import useBase from './useBase';
import { formatDateToYYYMMdd } from '../helper/helper';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { showToast } from '../utils/toastNotifications';

function useBillPayment() {

    const {base} = useBase();

    const [account, setAccount] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentDate, setPaymentDate] = useState(formatDateToYYYMMdd(new Date()));
    const [paymentMethod, setPaymentMethod] = useState();
    const [referenceNo, setReferenceNo] = useState('');
    const [amount, setAmount] = useState(0);
    const [billNo, setBillNo] = useState('');
    const attachmentRef = useRef();
    const [attachment, setAttachment] = useState([]);

    useEffect(()=>{
        if(base.paymentMethods.length > 0) setPaymentMethod(base.paymentMethods[0]);
    }, [base]);

    function processPayment(){
        const info = {
            billId: selectedBill._id,
            vendor: selectedBill.vendor,
            paymentDate: paymentDate,
            method: paymentMethod,
            reference: referenceNo,
            billNo: billNo,
            amount: amount,
            account: account,
            attachment: attachment
        }
        return {data: info, files: attachmentRef.current.files};
    }

    function checkInput(){
        let flag = false;
        if(amount <= 0){
            flag = true;
            showToast('Please enter amount', 'warning');
        }
        if(!account){
            flag = true;
            showToast('Please enter account', 'warning');
        }
        return flag;
    }

    async function pay(){
        if(checkInput()) return false;
        const info = processPayment();
        const formData = new FormData();
        formData.append('json', JSON.stringify(info.data));
        [...info.files].forEach((file)=>{
            formData.append('files', file);
        });
        const response = await axios.post(`${API_BASE_URL}/bills/pay`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        });
        if(response.status === 200){
            showToast('Payment saved', 'success');
            clear();
        }else{
            showToast('Unable to process paymetn');
        }
        return response;
    }

    function clear(){
        setSelectedBill(null);
        setPaymentDate(formatDateToYYYMMdd(new Date()));
        setPaymentMethod();
        setReferenceNo('');
        setBillNo('');
        setAmount(0);
        setAccount(null);
        setAttachment([]);
    }

    return {
        account, setAccount,
        selectedBill, setSelectedBill,
        paymentDate, setPaymentDate,
        paymentMethod, setPaymentMethod,
        referenceNo, setReferenceNo,
        amount, setAmount,
        pay,
        billNo, setBillNo,
        attachmentRef,
        attachment, setAttachment
    };
}

export default useBillPayment;