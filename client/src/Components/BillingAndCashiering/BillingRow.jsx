import React, { useEffect, useState } from 'react';
import { numberToCurrencyString } from '../../helper/helper';
import CurrencyInput from '../CurrencyInput';
import axios from 'axios';
import { useDataPreloader } from '../../context/DataPreloader';
import BillingPrint from './BillingPrint';
import { showToast } from '../../utils/toastNotifications';

function BillingRow({ item, index, asof }) {

    const {subledgers} = useDataPreloader();

    const [arrears, setArrears] = useState(item.arrears ? item.arrears : null );
    const [assessmentBalance, setAssessmentBalance] = useState(item.assessmentBalance ? item.assessmentBalance : null);
    const [assessmentBilling, setAssessmentBilling] = useState(item.assessmentBilling ? item.assessmentBilling : null);

    const [totalSales, setTotalSales] = useState(0);
    const [lessOfVat, setLessOfVat] = useState(0);
    const [amountNetVat, setAmountNetVat] = useState(0);
    const [amountDue, setAmountDue] = useState(0);
    const [totalAmountDue, setTotalAmountDue] = useState(0);

    const [vat, setVat] = useState(0);

    // get subledger tax data
    useEffect(() => {
        if (item.subledger) getFullSLInfo();
    }, [item.subledger, subledgers]); 

    useEffect(() => {
        setTotalSales(
            Number(arrears || 0) + 
            // Number(assessmentBalance || 0) +  
            // Number(assessmentBilling || 0) +
            Number(item?.row1?.outstandingBalance - item?.recordedEscalation || 0) +
            Number(item?.row1?.penalty || 0) +
            Number(item?.recordedEscalation || 0) 
        );
    }, [arrears, assessmentBalance, assessmentBilling, item]);
    
    useEffect(() => {
        const netVat = vat > 0 ? totalSales / 1.12 : totalSales;
        setAmountNetVat(netVat);
        setLessOfVat(netVat * vat); // Move lessOfVat here to ensure it's based on the updated netVat
    }, [totalSales, vat]);
    
    useEffect(() => {
        setLessOfVat(Number(amountNetVat || 0) * Number(vat || 0));
    }, [amountNetVat, vat]);
    
    useEffect(() => {
        const netVat = vat > 0 ? totalSales / 1.12 : totalSales;
        const lessVat = netVat * vat;
        const due = Number(assessmentBalance || 0) + Number(assessmentBilling || 0) + lessVat + netVat;
    
        setAmountNetVat(netVat);
        setLessOfVat(lessVat);
        setAmountDue(due);
        setTotalAmountDue(due); // Ensure totalAmountDue updates correctly
    }, [totalSales, vat, assessmentBalance, assessmentBilling]);
    
    useEffect(() => {
        setTotalAmountDue(Number(amountDue || 0));
    }, [amountDue]);
    
    async function getFullSLInfo(){
        if(!item.subledger) return;
        const sl = subledgers.filter(f=>f.slCode === item.subledger.slCode)[0];
        setVat(sl ? sl.vat ? sl.vat / 100 : 0 : 0);
    }

    async function saveClick(){
        await axios.patch(`/statementOfAccount/${item._id}`, {
            ledger: item.ledger,
            subledger: item.subledger,
            row1: item.row1,
            row2: item.row2,
            isRentalEscalation: item.isRentalEscalation,
            rentalEscalationDate: item.rentalEscalationAsOf,
            arrears: arrears,
            assessmentBalance: assessmentBalance,
            assessmentBilling: assessmentBilling
        }, { withCredentials: true });
        showToast("Saved", "success");
    }

    return (
          <tr key={index} className='border-b'>
            <td className='p-1 border-r'>{item.subledger.slCode}</td>
            <td className='p-1 border-r'>{item.subledger.name}</td>
            {/* outstanding balance is full balance from last row in billing (includes current billing amount, penalty, and escalations) */}
            <td className='p-1 border-r'>{(item.row1.outstandingBalance - item.row1.billingAmount - item.row1.penalty - item.recordedEscalation) > 0 ? numberToCurrencyString(item.row1.outstandingBalance - item.row1.billingAmount - item.row1.penalty - item.recordedEscalation) : ''}</td>
            <td className='p-1 border-r'>{item.row1.billingAmount ? numberToCurrencyString(item.row1.billingAmount) : ''}</td>
            <td className='p-1 border-r'>{item.row1.penalty ? numberToCurrencyString(item.row1.penalty) : ''}</td>
            <td className='p-1 border-r'>{numberToCurrencyString(item.recordedEscalation ? item.recordedEscalation : 0)}</td>
            <td className='p-1 border-r'>
                <input className={'border p-1 text-end w-[120px]'} value={arrears ? parseFloat(arrears) : 0} onChange={(e)=>setArrears(e.target.value)} />
            </td>
            <td className='p-1 border-r'>
                <input className={'border p-1 text-end w-[120px]'} value={assessmentBalance ? parseFloat(assessmentBalance) : 0} onChange={(e)=>setAssessmentBalance(e.target.value)} />
            </td>
            <td className='p-1 border-r'>
                <input className={'border p-1 text-end w-[120px]'} value={assessmentBilling ? parseFloat(assessmentBilling) : 0} onChange={(e)=>setAssessmentBilling(e.target.value)} />
            </td>
            <td className='p-1 border-r'>{totalSales ? numberToCurrencyString(totalSales) : ''}</td>
            <td className='p-1 border-r'>{lessOfVat ? numberToCurrencyString(lessOfVat) : ''}</td>
            <td className='p-1 border-r'>{amountNetVat ? numberToCurrencyString(amountNetVat) : ''}</td>
            <td className='p-1 border-r'>{amountDue ? numberToCurrencyString(amountDue) : ''}</td>
            <td className='p-1 border-r'>{totalAmountDue ? numberToCurrencyString(totalAmountDue) : ''}</td>
            <td className='p-1'>
                <div className='flex'>
                    <button className='btn-primary mr-2' onClick={saveClick} >Save</button>
                    <BillingPrint data={{
                        ...item,
                        arrears: arrears, 
                        assessmentBalance: assessmentBalance, 
                        assessmentBilling: assessmentBilling,
                        vat: vat, 
                        totalSales: totalSales, 
                        lessOfVat: lessOfVat, 
                        amountNetVat: amountNetVat, 
                        amountDue: amountDue, 
                        totalAmountDue: totalAmountDue,
                        asof: asof
                    }} />
                </div>
            </td>
        </tr>
    );
}

export default BillingRow;