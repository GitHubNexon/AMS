import React, { useEffect, useState } from 'react';
import useCustomersTable from './useCustomersTable';
import InvoicesApi from '../api/InvoicesApi';
import CustomerFormApi from '../api/CustomerFormApi';

function useInvoicePayment(selectedCustomer) {

    const {customers} = useCustomersTable();    // customer list to populate dropdown
    const [customer, setCustomer] = useState(selectedCustomer); // selected customer
    const [invoices, setInvoices] = useState([]);   // invoices from selected customer
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [referenceNo, setReferenceNo] = useState(null);
    const [account, setAccount] = useState(null);
    const [memo, setMemo] = useState(null);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [total, setTotal] = useState(0); // total ammount (received + credit applied)
    const [appliedAmount, setAppliedAmount] = useState(0);  // calculated total applied payment to invoices (sum(payment from invoices))
    const [amountReceived, setamountReceived] = useState(0); // total received amount (total - credit applied)
    const [myCredit, setMyCredit] = useState(); // credit balance from selected user
    const [credit, setCredit] = useState(0);    // holds credit used(applied) to payment
    const [newCredit, setNewCredit] = useState(0);  // new credit to save from calculated over payment

    useEffect(()=>{
        fetchCustomerInvoices();
    }, [customer]);

    async function fetchCustomerInvoices(){
        const response = await InvoicesApi.getInvoiceByCustomerId(customer.id || customer._id, ['Pending', 'Past Due', 'Partially Paid']);
        const cred = await CustomerFormApi.getCredit(customer.id || customer._id);
        setInvoices(response.data)
        setMyCredit(cred.credit);
    }

    async function proceedPayment(data){
        const response = await InvoicesApi.pay(data);
        return response;
    }

    return { 
        customers,
        customer, setCustomer,
        invoices, setInvoices,
        paymentMethod, setPaymentMethod,
        referenceNo, setReferenceNo,
        account, setAccount,
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
    };
}

export default useInvoicePayment;
