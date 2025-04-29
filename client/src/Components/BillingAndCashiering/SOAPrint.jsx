import React, { useRef } from 'react'
import { numberToCurrencyString } from '../../helper/helper';

function SOAPrint({ soa=null }) {

    const printRef = useRef();

    function formatDateToDayMonthYear(date) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate(); // Get day of the month
        const month = months[date.getMonth()]; // Get abbreviated month name
        const year = date.getFullYear(); // Get full year
        return `${day}-${month}-${year}`;
    }

    function printClick(){
        console.log(soa);

        // return;
        const printContents = printRef.current.innerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
        iframeDoc.document.open();
        iframeDoc.document.write(`
            <!DOCTYPE html>
              <html>
              <head>
                  <title>STATEMENT OF ACCOUNT</title>
                  <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                    }
                    .title{
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .title .text:nth-child(1){
                        font-size: 1em;
                        font-weight: bold;
                    }
                    .title .text:nth-child(4){
                        margin-top: 10px;
                        margin-bottom: 20px;
                        font-weight: bold;
                    }
                    table {
                        border-collapse: collapse;
                        border: 1px solid #000;
                        margin-top: 20px;
                        font-size: 0.8em;
                    }
                    table thead tr {
                        background-color: #fbd29c;
                    }
                    table tr th {
                        padding: 5px;
                        border-right: 1px solid #000;
                    }
                    table thead tr:nth-child(1) th{
                        border-top: 1px solid #000;
                    }
                    table thead tr th:nth-child(1){
                        border-left: 1px solid #000;
                    }
                    table thead tr:nth-child(2) th{
                        border-bottom: 1px solid #000;
                    }
                    table thead tr:nth-child(1) th:nth-child(3){
                        border-bottom: 1px solid #000;
                    }
                    table tbody tr td{
                        padding: 5px;
                    }
                    table tbody tr:nth-child(even) td{
                        background-color: #f1f1f1;
                    }
                    table tbody tr:last-child td {
                        background-color: #fbd29c;
                    }
                    @media print {
                        .hidden-on-screen {
                            display: block;
          
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
        iframe.contentWindow.focus();
        iframe.contentWindow.addEventListener('afterprint', () => {
            document.body.removeChild(iframe);
        });
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 3000);
    }

    function numberify(n){
        if(typeof n !== 'number') return 0;
        return n === 0 ? '' : n < 0 ? `(${numberToCurrencyString(Math.abs(n))})` : numberToCurrencyString(n);
    }

    return (
        <>
            <button className='bg-gray-500 text-white mr-4 py-[2px] px-2 rounded' onClick={printClick} >Print</button>
            {
                soa &&
                <div ref={printRef} className='hidden'>
                    <div className='title'>
                        <span className='text'>NATIONAL DEVELOPMENT COMPANY</span>
                        <span className='text'>116 Tordesillas Street</span>
                        <span className='text'>Salcedo Village, Makati City</span>
                        <span className='text'>STATEMENT OF ACCOUNT</span>
                    </div>
                    <div>
                        <span>Our records show that as of {soa.asofDate} NDC has an outstanding {soa.account && soa.account.name} of PHP {numberToCurrencyString(soa.totals.oustandingBalance)} from {soa.client.name}. detailed as follows:</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th className='border-r border-black'></th>
                                <th className='border-r border-black'>BILLING</th>
                                <th className='border-r border-b border-black' colSpan={3}>PAYMENT</th>
                                <th className='border-r border-black'>PENALTY</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>OUTSTANDING</th>
                                <th className='border-r border-black'>DUE</th>
                                <th>DAYS</th>
                            </tr>
                            <tr> 
                                <th className='border-r border-black'>PARTICULARS</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>DATE</th>
                                <th className='border-r border-black'>REF No.</th>
                                <th className='border-r border-black'>AMOUNT</th>
                                <th className='border-r border-black'>{soa.client.penalty > 0 ? `${soa.client.penalty}% pa` : ''}</th>
                                <th className='border-r border-black'>DUE</th>
                                <th className='border-r border-black'>BALANCE</th>
                                <th className='border-r border-black'>DATE</th>
                                <th>DELAYED</th>
                            </tr>
                        </thead>
                        <tbody>
                        {

                            soa.rows.map((item, index)=>
                                <React.Fragment key={index}>
                                <tr>
                                    <td>{item.row1.particular}</td>
                                    <td>{numberify(item.row1.billingAmount || 0)}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>{numberify(item.row1.penalty || 0)}</td>
                                    <td>{numberify(item.row1.amountDue || 0)}</td>
                                    <td>{numberify(item.row1.outstandingBalance || 0)}</td>
                                    <td>{formatDateToDayMonthYear(new Date(item.row1.dueDate))}</td>
                                    <td>{item.row1.daysDelayed}</td>
                                </tr>
                                <tr>
                                    <td>{item.row2.particulars}</td>
                                    <td></td>
                                    <td>{item.row2.paymentDate && formatDateToDayMonthYear(new Date(item.row2.paymentDate))}</td>
                                    <td>{item.row2.paymentRefNo}</td>
                                    <td>{numberify(item.row2.paymentAmount || 0)}</td>
                                    <td></td>
                                    <td>{numberify(item.row2.amountDue || 0)}</td>
                                    <td>{numberify(item.row2.outstandingBalance || 0)}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </React.Fragment>
                            )
                        }
                        <tr>
                            <td>TOTAL</td>
                            <td>{numberify(soa.totals.totalBillingAmount || 0)}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{numberify(soa.totals.totalPenalty || 0)}</td>
                            <td>{numberify(soa.totals.totalPaymentAmount || 0)}</td>
                            <td>{numberify(soa.totals.oustandingBalance || 0)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            }
        </>    
    );
}

export default SOAPrint;