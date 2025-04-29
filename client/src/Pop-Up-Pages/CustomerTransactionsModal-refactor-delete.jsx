import React, { useEffect } from 'react';
import Modal from '../Components/Modal';
import CustomerFormApi from '../api/CustomerFormApi';

function CustomerTransactionsModal({ show=false, close=()=>{}, id='' }) {

    useEffect(()=>{
        console.log(id);
        if(id){
            getTransactions();
        }
    }, [id]);

    async function getTransactions(){
        try{
            const response = await CustomerFormApi.getInvoices(id, 0, 3, '');
            console.log(response);
        }catch(error){
            console.error(error);
        }
    }

    return (
        <Modal title='Transactions' show={show} closeCallback={close} />
    );
};

export default CustomerTransactionsModal;