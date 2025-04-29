import React, { useEffect, useState, useRef } from 'react';
import Modal from '../Components/Modal';
import logo from '../assets/images/NDC_BG.png'
import { formatStringDateToDDMMMYY, numberToCurrencyString, currencyStringToNumber, formatLedgers } from '../helper/helper';
import useBase from '../context/useBase';

import PrintJV from '../Components/PrintJV';

import {usePDF} from 'react-to-pdf';
import axios from 'axios';

function RentAccrualPreview({ show, close, data }) {

    const [entryData, setEntryData] = useState(null);

    const {toPDF, targetRef} = usePDF({filename: 'RENT ACCRUAL.pdf', pageSize: 'legal'});

    const { base } = useBase();

    useEffect(()=>{
        if(data){
            setEntryData(data);
        }
    }, [data]);

    function exportPDFClick(){
        toPDF();
    }

    async function exportXLSXClick(){
        console.log('export to excel', formatLedgers(entryData.ledgers));
        axios({
            url: '/entries/accrual/rental',
            method: 'POST',
            data: {...entryData, table: formatLedgers(entryData.ledgers)},
            responseType: 'blob'
        })
        .then((response)=>{
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'rental_accrual.xlsx';
            link.click();
            window.URL.revokeObjectURL(link.href);
        })
        .catch((error)=>{
            console.error('Error downloading the file: ', error);
        });
        const response = await axios.post('/entries/accrual/rental', {...entryData, table: formatLedgers(entryData.ledgers)});
        // console.log(response);
    }

    // works for accrual vouchers with pre defined format on base
    // function formatLedgers(ledgers){
    //     // main credit/debit refers to receivable accounts, security deposits goes to another account
    //     // build ledgers with breakdown
    //     // main debit code on base
    //     const mainDebitCode = base.rentalAccrual.accrual.debitTo.code;
    //     // main credit code on base
    //     const mainCreditCode = base.rentalAccrual.accrual.creditTo.code;
    //     // security deposit debit code
    //     const depositDebitCode = base.rentalAccrual.securityDeposit.debitTo.code;
    //     // security deposit credit code
    //     const depositCreditCode = base.rentalAccrual.securityDeposit.creditTo.code;
    //     // entire row object of main debit account
    //     let mainDebit = {};
    //     // holds total of all main debits on debit accounts
    //     let mainDebitd1 = 0;
    //     // holds row object of main credit acount
    //     let mainCredit = {};
    //     // hilds total of all main credits on credit account
    //     let mainCreditc1 = 0;
    //     // holds breakdown of subledgers grouped by ledgers(main debit account)
    //     let mainDebitBreakdown = [];
    //     // holds breakdown of subledgers grouped by ledgers(main credit account)
    //     const mainCreditBreakdown = [];
    //     // deposit
    //     let depositDebit = {};
    //     let depositCredit = {};
    //     let depositDebitd1 = 0;
    //     let depositCreditc1 = 0;
    //     let depositDebitBreakdown = [];
    //     let depositCreditBreakdown = [];
    //     // holds totals to be displayed in bottom if table
    //     let totald1 = 0;
    //     let totalc1 = 0;
    //     let totald2 = 0;
    //     let totalc2 = 0;
    //     // breakdown
    //     for(let i = 0; i < ledgers.length; i++){
    //         // seperate parent accounts
    //         if(ledgers[i].ledger.code === mainDebitCode){
    //             mainDebitd1 = mainDebitd1 + ledgers[i].dr;
    //             totald1 += mainDebitd1;
    //             mainDebit = {
    //                 accountCode: ledgers[i].ledger.code,
    //                 accountTitle: ledgers[i].ledger.name,
    //                 d1: numberToCurrencyString(mainDebitd1),
    //                 c1: '',
    //                 d2: '',
    //                 c2: ''
    //             };
    //             mainDebitBreakdown.push({
    //                 accountCode: ledgers[i].subledger.slCode,
    //                 accountTitle: ledgers[i].subledger.name,
    //                 d1: '',
    //                 c1: '',
    //                 d2: numberToCurrencyString(ledgers[i].dr),
    //                 c2: ''
    //             });
    //             totald2 += ledgers[i].dr;
    //         }else if(ledgers[i].ledger.code === mainCreditCode){
    //             mainCreditc1 += ledgers[i].cr;
    //             totalc1 += mainCreditc1;
    //             mainCredit = {
    //                 accountCode: ledgers[i].ledger.code,
    //                 accountTitle: ledgers[i].ledger.name,
    //                 d1: '',
    //                 c1: numberToCurrencyString(mainCreditc1),
    //                 d2: '',
    //                 c2: ''
    //             };
    //             mainCreditBreakdown.push({
    //                 accountCode: ledgers[i].subledger.slCode,
    //                 accountTitle: ledgers[i].subledger.name,
    //                 d1: '',
    //                 c1: '',
    //                 d2: '',
    //                 c2: numberToCurrencyString(ledgers[i].cr)
    //             });
    //             totalc2 += ledgers[i].cr;
    //         }else if(ledgers[i].ledger.code === depositDebitCode){
    //             depositDebitd1 += ledgers[i].dr;
    //             totald1 += depositDebitd1;
    //             depositDebit = {
    //                 accountCode: ledgers[i].ledger.code,
    //                 accountTitle: ledgers[i].ledger.name,
    //                 d1: numberToCurrencyString(depositDebitd1),
    //                 c1: '',
    //                 d2: '',
    //                 c2: ''
    //             }; 
    //             depositDebitBreakdown.push({
    //                 accountCode: ledgers[i].subledger.slCode,
    //                 accountTitle: ledgers[i].subledger.name,
    //                 d1: '',
    //                 c1: '',
    //                 d2: numberToCurrencyString(ledgers[i].dr),
    //                 c2: ''
    //             });
    //             totald2 += ledgers[i].dr;
    //         }else if(ledgers[i].ledger.code === depositCreditCode){
    //             depositCreditc1 += ledgers[i].cr;
    //             totalc1 += depositCreditc1;
    //             depositCredit = {
    //                 accountCode: ledgers[i].ledger.code,
    //                 accountTitle: ledgers[i].ledger.name,
    //                 d1: '',
    //                 c1: numberToCurrencyString(depositDebitd1),
    //                 d2: '',
    //                 c2: ''
    //             };
    //             depositCreditBreakdown.push({
    //                 accountCode: ledgers[i].subledger.slCode,
    //                 accountTitle: ledgers[i].subledger.name,
    //                 d1: '',
    //                 c1: '',
    //                 d2: '',
    //                 c2: numberToCurrencyString(ledgers[i].cr)
    //             });
    //             totalc2 += ledgers[i].cr;
    //         }
    //     }
    //     // regroup into one array in right order
    //     const rows = [ 
    //         {}, 
    //         mainDebit, 
    //         ...mainDebitBreakdown, 
    //         {}, 
    //         mainCredit, 
    //         ...mainCreditBreakdown, 
    //         {},
    //         depositDebit,
    //         ...depositDebitBreakdown,
    //         {},
    //         depositCredit,
    //         ...depositCreditBreakdown,
    //         {},
    //         {
    //             accountCode: '',
    //             accountTitle: '',
    //             d1: numberToCurrencyString(totald1),
    //             c1: numberToCurrencyString(totalc1),
    //             d2: numberToCurrencyString(totald2),
    //             c2: numberToCurrencyString(totalc2)
    //         }
    //     ];
    //     return rows;
    // }

    return (
        <Modal show={show} closeCallback={close}>
            <div className='flex-1 border-t border-b'>
            { entryData &&
                <div className='flex flex-col'>
                    <div className='flex justify-end p-2 text-[0.8em] border-b'>
                        {/* <button className='mr-2 bg-gray-600 px-4 py-1 rounded text-white' onClick={exportPDFClick}>Export PDF</button> */}
                        <PrintJV journal={data} rows={formatLedgers(entryData.ledgers)} />
                        <button className='mr-2 bg-green-600 px-4 py-1 rounded text-white' onClick={exportXLSXClick}>Export XLSX</button>
                    </div>
                    <div className='p-4 h-[80vh] overflow-y-scroll'>
                        <div className='flex flex-col' ref={targetRef} >
                            {/* header */}
                            <div className='flex'>
                                <div className='w-[100px]'>
                                    <img src={logo} />
                                </div>
                                <div className='flex flex-col flex-[1] justify-center text-center text-[0.8em] font-bold'>
                                    <span>NATIONAL DEVELOPMENT COMPANY</span>
                                    <span>JOURNAL VOUCHER</span>
                                </div>
                                <div className='flex flex-col justify-center text-[0.7em]'>
                                    <div className='flex border-b font-bold'>
                                        <span className='w-[50px]'>JV No.</span>
                                        <span className='text-center w-[80px]'>{entryData.JVNo}</span>
                                    </div>
                                    <div className='flex border-b'>
                                        <span className='w-[50px]'>DATE:</span>
                                        <span className='text-center w-[80px]'>{formatStringDateToDDMMMYY(entryData.JVDate)}</span>
                                    </div>
                                </div>
                            </div>
                            {/* table */}
                            <div className='text-[0.8em] border'>
                                <table className='w-[100%]'>
                                    <thead>
                                        <tr className='border-b'>
                                            <th colSpan={2} className='px-2 py-1 border-r'>ACCOUNT DISTRIBUTION</th>
                                            <th colSpan={2} className='px-2 py-1 border-r'>GENERAL LEDGER</th>
                                            <th colSpan={2} className='px-2 py-1 border-r'>SUBSIDIARY LEDGER</th>
                                        </tr>
                                        <tr className='border-b'>
                                            <th className='px-2 py-1 border-r w-[130px]'>ACCOUNT CODE</th>
                                            <th className='px-2 py-1 border-r w-[250px]'>ACCOUNT TITLE</th>
                                            <th className='px-2 py-1 border-r w-[100px]'>DEBIT</th>
                                            <th className='px-2 py-1 border-r w-[100px]'>CREDIT</th>
                                            <th className='px-2 py-1 border-r w-[100px]'>DEBIT</th>
                                            <th className='px-2 py-1 w-[100px]'>CREDIT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { formatLedgers(entryData.ledgers).map((item, index)=>(             
                                        <tr className='border-b' key={index}>
                                            <td className='border-r text-end px-2 py-1'>{item.accountCode}</td>
                                            <td className='border-r px-2 py-1'>{item.accountTitle}</td>
                                            <td className='border-r text-end px-2 py-1'>{item.d1}</td>
                                            <td className='border-r text-end px-2 py-1'>{item.c1}</td>
                                            <td className='border-r text-end px-2 py-1'>{item.d2}</td>
                                            <td className='text-end px-2 py-1'>{item.c2}</td>
                                        </tr>
                                    )) }
                                    </tbody>
                                </table>
                            </div>
                            <div className='flex flex-col text-[0.7em]'>
                                <div className='border p-2 flex flex-col'>
                                    <span className='ml-2 mb-2'>EXPLANATION:</span>
                                    <span className='ml-4'>{entryData.Particulars}</span>
                                </div>
                                <div className='border p-2 flex flex-col'>
                                    <span className='ml-2 mb-2'>ATTACHMENTS:</span>
                                    <span className='ml-4'>{entryData.Attachments.length > 0 ? entryData.Attachments.reduce((pre,cur)=>pre+' '+cur) : ''}</span>
                                </div>
                                <div className='border flex'>
                                    <div className='flex flex-[2] border p-2'>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>PREPARED BY:</span>
                                            <span className='font-bold'>{entryData.PreparedBy?.name}</span>
                                        </div>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>DATE:</span>
                                            <span>{entryData.JVDate}</span>
                                        </div>
                                    </div>
                                    <div className='flex-[2] flex border p-2 text-center text-[0.9em]'>
                                        <div className='flex-[1] flex justify-center'>
                                            <span>BUDGET ITEM</span>
                                        </div>
                                        <div className='flex-[1] flex justify-center'>
                                            <span>BALANCE BEFORE</span>
                                        </div>
                                        <div className='flex-[1] flex justify-center'>
                                            <span>THIS JV</span>
                                        </div>
                                    </div>
                                    <div className='flex-[1] border p-2 flex justify-center'>
                                        <span>BALANCE</span>
                                    </div>
                                </div>
                                <div className='border flex'>
                                    <div className='flex flex-[2] border p-2'>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>VERIFIED BY:</span>
                                            <span className='font-bold'>{entryData.CertifiedBy?.name}</span>
                                        </div>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>DATE:</span>
                                        </div>
                                    </div>
                                    <div className='flex-[2] flex border p-2 text-center text-[0.9em]'>
                                        <span>BUDGET OFFICER:</span>
                                    </div>
                                    <div className='flex-[1] border p-2 flex'>
                                        <span>DATE</span>
                                    </div>
                                </div>
                                <div className='border flex'>
                                    <div className='flex flex-[2] border p-2'>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>APPROVED BY:</span>
                                            <span className='font-bold'>{entryData.ApprovedBy1?.name}</span>
                                        </div>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>DATE:</span>
                                        </div>
                                    </div>
                                    <div className='flex-[2] flex flex-col border p-2 text-[0.9em]'>
                                        <span>RECEIVED BY:</span>
                                        {/* <span className='font-bold'>{entryData.ReceivedBy}</span> */}
                                        <span className='h-[20px]'></span>
                                        <span>COA RECEIVING CLERK</span>
                                    </div>
                                    <div className='flex-[1] border p-2 flex'>
                                        <span>DATE</span>
                                    </div>
                                </div>
                                <div className='border flex'>
                                    <div className='flex flex-[2] border p-2'>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>POSTED TO GL BY:</span>
                                        </div>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>DATE</span>
                                        </div>
                                    </div>
                                    <div className='flex-[2] flex flex-col border p-2 text-[0.9em]'>
                                        <span>ACKNOWLEDGER BY:</span>
                                        <span className='h-[20px]'></span>
                                        <span>COA OFFICER/REPRESENTATIVE</span>
                                    </div>
                                    <div className='flex-[1] border p-2 flex'>
                                        <span>DATE</span>
                                    </div>
                                </div>
                                <div className='border flex'>
                                    <div className='flex flex-[2] border p-2'>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>POSTED TO SL BY:</span>
                                        </div>
                                        <div className='flex flex-col flex-[1]'>
                                            <span>DATE</span>
                                        </div>
                                    </div>
                                    <div className='flex-[2] flex flex-col border p-2 text-[0.9em] text-end'>
                                        <span className='font-bold'>JV No.</span>
                                    </div>
                                    <div className='flex-[1] border p-2 flex'>
                                        <span className='font-bold'>{entryData.JVNo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            </div>
        </Modal>
    );
}

export default RentAccrualPreview;