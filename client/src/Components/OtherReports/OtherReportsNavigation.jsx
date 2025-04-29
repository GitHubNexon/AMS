import React, { useState, useEffect } from 'react';
import TransactionList from './TransactionList';
import GeneralLedger from './GeneralLedger';
import Subsidiary from './Subsidiary';
import SummaryDepositSlip from './SummaryDepositSlip';
import SummaryDisbursementVoucher from './SummaryDisbursementVoucher';
import SummaryJournalVoucher from './SummaryJournalVoucher';
import SummaryCashReceipt from './SummaryCashReceipt';

function OtherReportsNavigation() {

    const [transactionList, setTransactionList] = useState(false);
    const [generalLedgerReport, setGeneralLedgerReport] = useState(false);
    const [subsidiaryReport, setSubsidiaryReport] = useState(false);
    const [depositSlipReport, setDepositSlipReport] = useState(false);
    const [disbursementVoucherReport, setDisbursementVoucherReport] = useState(false);
    const [journalVoucherReport, setJournalVoucherReport] = useState(false);
    const [cashReceiptReport, setCashReceiptReport] = useState(false);

    return (
        <>
        <div className='border p-2 mb-4 flex flex-wrap text-[0.8em]'>
            <button className='btn-primary m-1' onClick={()=>setTransactionList(true)}>Transaction List</button>
            <button className='btn-primary m-1' onClick={()=>setGeneralLedgerReport(true)}>General Ledger</button>
            <button className='btn-primary m-1' onClick={()=>setSubsidiaryReport(true)}>Subsidiary Report</button>
            <button className='btn-primary m-1' onClick={()=>setDepositSlipReport(true)}>Summary of Deposit Slips</button>
            <button className='btn-primary m-1' onClick={()=>setDisbursementVoucherReport(true)}>Summary of Disbursment Vouchers</button>
            <button className='btn-primary m-1' onClick={()=>setJournalVoucherReport(true)}>Summary of Journal Vouchers</button>
            <button className='btn-primary m-1' onClick={()=>setCashReceiptReport(true)}>Summary of Cash Receipts</button>
        </div>
        <TransactionList open={transactionList} close={()=>setTransactionList(false)} />
        <GeneralLedger open={generalLedgerReport} close={()=>setGeneralLedgerReport(false)} />
        <Subsidiary open={subsidiaryReport} close={()=>setSubsidiaryReport(false)} />
        <SummaryDepositSlip show={depositSlipReport} close={()=>setDepositSlipReport(false)} />
        <SummaryDisbursementVoucher show={disbursementVoucherReport} close={()=>setDisbursementVoucherReport(false)} />
        <SummaryJournalVoucher show={journalVoucherReport} close={()=>setJournalVoucherReport(false)} />
        <SummaryCashReceipt show={cashReceiptReport} close={()=>setCashReceiptReport(false)} />
        </>
    );
}

export default OtherReportsNavigation;