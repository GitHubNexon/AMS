import React, { useEffect, useRef } from 'react';
import { numberToCurrencyString, formatFullReadableDate, formatReadableDate } from '../helper/helper';
import logo from "../assets/images/NDC_BG.png";

function PrintJV({ journal={}, rows=[] }) {

    const printRef = useRef();

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
                <title>JOURNAL VOUCHER</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 0.8em;
                    }
                    .header{
                        display: flex;
                    }
                    .header img{
                        height: 80px;
                        width: 80px
                    }
                    .header div:nth-child(1){
                        flex: 1;
                    }
                    .header div:nth-child(2){
                        flex: 3;
           
                    }
                    .header div:nth-child(3){
                        flex: 1;
                    }
                    .title{
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                    }
                    .title span:first-of-type {
                        font-weight: bold;
                    }
                    .title span:last-of-type {
                        font-weight: bold;
                        margin-top: 15px;
                    }
                    .date{
                        display: flex;
                        align-items: end;
                        justify-content: end;
                        flex-direction: column;
                        margin-bottom: 10px;
                    }
                    .date div{
                        display: flex;
                        align-items: end;
                        justify-content: end;
                        margin-bottom: 5px;
                    }
                    .date div span{
                        border-bottom: 1px solid #000;
                    }
                    .date div span:nth-child(1){
                        font-weight: bold;
                        width: 60px;
                    }
                    .date div span:nth-child(2){
                        width: 150px;
                        text-align: center;
                    }
                    .entry{
                        width: 100%;
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
                        text-align: end;
                    }
                    .entry tbody tr td:nth-child(2){
                        text-align: start;
                    }
                    .entry thead tr{
                        border-bottom: 1px solid #000;
                        background-color:#e5e7eb;
                    }
                    .entry tbody tr:last-child{
                        border-top: 1px solid #000;
                        background-color:#e5e7eb;
                        font-weight: bold;
                    }
                    .particular{
                        border: 1px solid #000;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                    }
                    .particular div {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 25px;
                    }
                    .particular div span:nth-child(1){
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .particular div span:nth-child(2){
                        margin-left: 10px;
                    }
                    .end{
                        text-align: end;
                    }
                    .signatory-table{
                        border-collapse: collapse;
                        width: 100%;
                    }
                    .signatory-table tr td{
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
                    }
                    .p-1{
                        height: 15px;
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

    return (
        <div>
            <button type='button' onClick={printClick} className='btn-primary text-[1.2em] mr-4'>
                Print
            </button>
            <div ref={printRef} className='hidden'>
                <div className='header'>
                    <div>
                        <img src={logo} />
                    </div>
                    <div className='title'>
                        <span>NATIONAL DEVELOPMENT COMPANY</span>
                        <span>116 Tordesillas St., Salcedo Village, Makati City</span>
                        <span>Philippines</span>
                        <span>JOURNAL VOUCHER</span>
                    </div>
                    <div>
                        
                    </div>
                </div>  
                <div className='date'>
                    <div className='mb'>
                        <span>JV No:</span>
                        <span>{journal.JVNo}</span>
                    </div>
                    <div className='mb'>
                        <span>DATE:</span>
                        <span>{formatFullReadableDate(journal?.JVDate?.substr(0, 10) || '')}</span>
                    </div>
                </div>
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
                <div className='particular'>
                    <div>
                        <span>PARTICULARS:</span>
                        <span>{journal.Particulars.toUpperCase()}</span>
                    </div>
                    <div>
                        <span>ATTACHMENTS:</span>
                        <span>{journal.Attachments?.length > 0 ? journal.Attachments[0] : ""}</span>
                    </div>
                </div>


                <table className="signatory-table">
                    <tbody>
                        <tr>
                            <td className='b-l b'>PREPARED BY:</td>
                            <td className='b-r'>DATE:</td>
                            <td className=''>BUDGENT ITEM</td>
                            <td>BALANCE BEFORE</td>
                            <td className=''>THIS JV</td>
                            <td className='b-r'>BALANCE</td>
                        </tr>
                        {/* <tr>
                            <td className='b-l'></td>
                            <td className='b-r'></td>
                            <td></td>
                            <td></td>
                            <td className=''></td>
                            <td className='b-r'></td>
                        </tr> */}
                        <tr>
                            <td className='b-b b-l nb'>{journal?.PreparedBy?.name || ''}</td>
                            <td className='b-b b-r nb'>{formatReadableDate(journal?.JVDate?.substr(0, 10)) || ''}</td>
                            <td className='b-b'></td>
                            <td className='b-b'></td>
                            <td className='b-b'></td>
                            <td className='b-b b-r'></td>
                        </tr>
                        <tr>
                            <td className='b-l b'>VERIFIED BY:</td>
                            <td className='b-r'>DATE:</td>
                            <td colSpan={3} >BUDGET OFFICER:</td>
                            <td className='b-r'>DATE</td>
                        </tr>
                        {/* <tr>
                            <td className='b-l'></td>
                            <td className='b-r'></td>
                            <td></td>
                            <td></td>
                            <td className=''></td>
                            <td className='b-r'></td>
                        </tr> */}
                        <tr>
                            <td className='b-b b-l nb'>{journal?.ReviewedBy?.name || ''}</td>
                            <td className='b-b'></td>
                            <td className='b-b b-l'></td>
                            <td className='b-b'></td>
                            <td className='b-b'></td>
                            <td className='b-b b-r'></td>
                        </tr>
                        <tr>
                            <td className='b-l b'>APPROVED BY:</td>
                            <td className='b-r'>DATE:</td>
                            <td colSpan={3}>RECEIVED BY:</td>
                            <td className='b-r'>DATE:</td>
                        </tr>
                        {/* <tr>
                            <td className='b-l'></td>
                            <td className='b-r'></td>
                            <td></td>
                            <td></td>
                            <td className=''></td>
                            <td className='b-r'></td>
                        </tr> */}
                        <tr>
                            <td className='b-b b-l nb'>{journal?.ApprovedBy1?.name || ''}</td>
                            <td className='b-b b-r'></td>
                            <td colSpan={3} className='b-b'>COA RECEIVING CLERK</td>
                            <td className='b-b b-r'></td>
                        </tr>
                        <tr>
                            <td className='b-l b'>POSTED TO GL BY:</td>
                            <td className='b-r'>DATE:</td>
                            <td colSpan={3}>ACKNOWLEDGED BY:</td>
                            <td className='b-r'>DATE:</td>
                        </tr>
                        {/* <tr>
                            <td className='b-l'></td>
                            <td className='b-r'></td>
                            <td></td>
                            <td></td>
                            <td className=''></td>
                            <td className='b-r'></td>
                        </tr> */}
                        <tr>
                            <td className='b-b b-l'></td>
                            <td className='b-b b-r'></td>
                            <td colSpan={3} className='b-b'>COA OFFICER/REPRECENTATIVE:</td>
                            
                            <td className='b-b b-r'></td>
                        </tr>
                        <tr>
                            <td className='b-l b'>POSTED TO SL BY</td>
                            <td className='b-r'>DATE:</td>
                            <td className=''></td>
                            <td className=''></td>
                            <td className='b end'></td>
                            <td className='b-r b'></td>
                        </tr>
                        <tr>
                            <td className='b-l'><div className='p-1' /></td>
                            <td className='b-r'></td>
                            <td></td>
                            <td colSpan={2} className='b nb'>JV NO {journal.JVNo}</td>
                            <td className='b-r'></td>
                        </tr>
                        <tr>
                            <td className='b-b b-l'></td>
                            <td className='b-b b-r'></td>
                            <td className='b-b'></td>
                            <td className='b-b'></td>
                            <td className='b-b b end'></td>
                            <td className='b-b b-r'></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PrintJV