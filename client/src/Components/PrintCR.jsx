import React, { useEffect, useRef, useState } from 'react';
import { numberToCurrencyString, formatReadableDate, formatFullReadableDate } from '../helper/helper';
import logo from "../assets/images/NDC_BG.png";
import axios from 'axios';

/**
 * CAUTION!! this refers to cash receipt entry voucher not disbursement voucher
 */
function PrintCR({ receipt={}, rows=[] }) {

    const printRef = useRef();
    const [or, setOr] = useState(null);

    // get or here?
    useEffect(()=>{
        if(receipt._id){
            findOr(receipt._id);
        }
    }, [receipt]);

    async function findOr(id){
        const data = await axios.get(`/or/find/${id}`, {
            withCredentials: true,
        });
        console.log(data.data)
        setOr(data.data)
    }

    function printClick() {
        const printContents = printRef.current.innerHTML;
    
        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        document.body.appendChild(iframe);
    
        const iframeDoc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
    
        // Write the content and styles to the iframe
        iframeDoc.document.open();
        iframeDoc.document.write(`
        <!DOCTYPE html>
            <html>
            <head>
                <title>CASH RECEIPT ENTRY</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .header{
                        display: flex;
                        margin-bottom: 25px;
                    }
                    .header img{
                        height: 150px;
                        width: 150px
                    }
                    .header div{
                        flex: 1;
                    }
                    .title{
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                    }
                    .title span:first-of-type {
                        font-weight: bold;
                        font-size: 0.8em;
                        margin-bottom: 15px;
                    }
                    .title span:last-of-type {
                        font-weight: bold;
                        font-size: 0.8em;
                        margin-top: 15px;
                    }
                    .entry{
                        width: 100%;
                        font-size: 0.8em;
                        border: 1px solid #000;
                        border-collapse: collapse;
                    }
                    .entry td, .entry th{
                        padding: 10px;
                    }
                    .entry th:not(:last-child){
                        border-right: 1px solid #000;
                    }
                    .entry tbody tr td{
                        border-right: 1px dotted #000;
                    }
                    .entry thead tr{
                        background-color:#e5e7eb;
                        border-bottom: 1px solid #000;
                    }
                    .entry tbody tr:last-child{
                        background-color:#e5e7eb;
                        border-top: 1px solid #000;
                    }
                    .entry tbody tr:last-child td:not(:last-child){
                        border-right: 1px solid #000;
                    }
                    .end{
                        text-align: end;
                    }
                    .added-table{
                        border-collapse: collapse;
                        width: 100%;
                    }
                    .added-table tr td{
                        padding: 5px 10px;
                    }
                    .b-l {
                        border-left: 1px solid #000;
                    }
                    .b-r {
                        border-right: 1px solid #000;
                    }
                    .b-t {
                        border-top: 1px solid #000;
                    }
                    .b-b {
                        border-bottom: 1px solid #000;
                    }
                    .b{
                        font-weight: bold;
                    }
                    .nb{
                        white-space: nowrap;
                        display: inline-block;
                    }
                   
                    @media print {
                        .hidden-on-screen {
                            display: block;
                        }
                        .print-footer {
                            position: fixed;
                            bottom: 0;
                            width: 100%;
                            text-align: center;
                            font-size: 12px;
                        }

                        .page-number {
                            position: running(pageFooter);
                        }
                    }
                    @page {
                        size: auto; /* Ensure it adapts to content */
                        margin: 20mm; /* Adjust margins to fit footer */
                    }
                    @page :left {
                        @bottom-center {
                            content: "Page " counter(page) " of " counter(pages);
                        }
                    }
                    @page :right {
                        @bottom-center {
                            content: "Page " counter(page) " of " counter(pages);
                        }
                    }
                </style>
            </head>
            <body>
                ${printContents}
            </body>
        </html>
        `);
        iframeDoc.document.close();   
    
        // Trigger print
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    
        // Remove the iframe after printing
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
      }

      const [total, setTotal] = useState('');

      useEffect(()=>{
        if(rows.length > 0){
            setTotal(rows[rows.length - 1] ? rows[rows.length - 1].d1: "");            
        }
      }, [rows]);
  
      return (
            <div>
                <button type="button" onClick={printClick} className='btn-primary text-[1.2em] mr-4'>
                    Print
                </button>
                <div ref={printRef} className='hidden'>
                    <div className='header'>
                        <div>
                            <img src={logo} />
                        </div>
                        <div className='title'>
                            <span>National Development Company</span>
                            <span>6, 7, & 8F, NDC Building, 116 Tordesillas, Bel-Air, Makati, Metro Manila, 1200</span>
                            <span>accounting@ndc.gov.ph | (02) 8840 4937</span>
                            <span>https://www.ndc.gov.ph/</span>
                            <span>{receipt.ReceiptEntryType === "Deposit Slip"
                                ? "Deposit Slip Entry"
                                : "Cash Receipt Entry"}</span>
                        </div>
                        <div>
                            
                        </div>
                    </div>  

                    <table className='added-table'>
                        <tbody>
                            <tr>
                                <td rowSpan={2} className='b-b b-t b-r b-l'>
                                    {receipt.ReceiptEntryType === "Deposit Slip" ? "Account Name": "Payor"}:  {receipt.ReceiptEntryType === "Deposit Slip" ? "National Development Company" : or ? or.client.name : receipt.PaymentEntity?.name || ''}
                                </td>
                                <td className='b-t b-b'>Account No:</td>
                                <td className='b-t b-b b-r'></td>
                                <td className='b-t b-b b-r'>{receipt.ReceiptEntryType === "Deposit Slip" ? "Deposit Slip" : "Official Receipt"}</td>
                            </tr>
                            <tr>
                                <td className='b-b'></td>
                                <td className='b-b b-r'>{receipt.ReceiptEntryType === "Deposit Slip" ? "" : "Address:"}</td>
                                <td className='b-b b-r'>Number: {receipt.CRNo}</td>
                            </tr>
                            <tr>
                                <td rowSpan={4} className='b-b b-l b-r'>Particulars: {receipt.Particulars}</td>
                                <td className='b-b b-r'>Mode of Payment</td>
                                <td className='b-b b-r'>Details/Reference</td>
                                <td className='b-b b-r'>Date: {formatFullReadableDate(new Date(receipt.CRDate))}</td>
                            </tr>
                            <tr>
                                <td className='b-b b-r'>{receipt.paymentMethods === "Cash" ? "/" : "x"} Cash</td>
                                <td className='b-b b-r'></td>
                                <td rowSpan={3} className='b-b b-r'>Amount: {or ? numberToCurrencyString(or.amount) : total}</td>
                            </tr>
                            <tr>
                                <td className='b-b b-r'>{receipt.paymentMethods === "Cheque" ? "/" : receipt.ReceiptEntryType === "Deposit Slip" ? "/" : "x"}{" "} Check</td>
                                <td className='b-b b-r'></td>
                            </tr>
                            <tr>
                                <td className='b-b b-r'>{receipt.paymentMethods === "Others" ? "/" : "x"} Others</td>
                                <td className='b-b b-r'></td>
                            </tr>        
                        </tbody>
                    </table>


                    <table className='entry'>
                        <thead>
                            <tr>
                                <th colSpan={2}>ACCOUNT DISTRIBUTION</th>
                                <th colSpan={2}>GENERAL LEDGER</th>
                                <th colSpan={2}>SUBSIDIARY LEDGER</th>
                            </tr>
                            <tr>
                                <th>Code</th>
                                <th>Account Title</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Debit</th>
                                <th>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                rows.slice(0, -1).map((m, index)=>
                                    <tr key={index}>
                                        <td className='end'>{m.accountCode}</td>
                                        <td>{m.accountTitle}</td>
                                        <td>{m.d1}</td>
                                        <td>{m.c1}</td>
                                        <td>{m.d2}</td>
                                        <td>{m.c2}</td>
                                    </tr>
                                )
                            }
                            <tr>
                                <td colSpan={2}>{rows[rows.length - 1].accountTitle}</td>
                                <td>{rows[rows.length - 1].d1}</td>
                                <td>{rows[rows.length - 1].c1}</td>
                                <td>{rows[rows.length - 1].d2}</td>
                                <td>{rows[rows.length - 1].c2}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className='added-table'>
                        <tbody>
                            <tr>
                                <td className='b-l'></td>
                                <td></td>
                                <td className='b-r'></td>
                            </tr>
                            <tr>
                                <td className='b b-l'>Prepared By:</td>
                                <td className='b'>Reviewed By:</td>
                                <td className='b b-r'>Approved By</td>
                            </tr>
                            <tr>
                                <td className='b-l'></td>
                                <td></td>
                                <td className='b-r'></td>
                            </tr>
                            <tr>
                                <td className='b-l'>{receipt.PreparedBy?.name}</td>
                                <td>{receipt.ReviewedBy?.name}</td>
                                <td className='b-r'>{receipt.ApprovedBy1?.name}</td>
                            </tr>
                            <tr>
                                <td className='b-l'>{receipt.PreparedBy?.position}</td>
                                <td>{receipt.ReviewedBy?.position}</td>
                                <td className='b-r'>{receipt.ApprovedBy1?.position}</td>
                            </tr>
                            <tr>
                                <td className='b-b b-l'></td>
                                <td className='b-b'></td>
                                <td className='b-b b-r'></td>
                            </tr>
                        </tbody>
                    </table>
                   
                </div>
            </div>
      );
}

export default PrintCR
