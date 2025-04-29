import React, { useEffect, useRef, useState } from 'react';
import logo from "../assets/images/NDC_BG.png";
import { formatReadableDate, formatFullReadableDate, numberToCurrencyString, formatLedgers } from '../helper/helper';

function PrintDV({ dv=null }) {

    const printRef = useRef();

    const [totalDebitLedger, setTotalDebitLedger] = useState(0);
    const [totalCreditLedger, setTotalCreditLedger] = useState(0);

    useEffect(()=>{
        console.log(dv);
        if(dv.ledgers){
            const totalDebitLedger = dv.ledgers
            .filter((ledger) => ledger.type === "DR")
            .reduce((sum, ledger) => sum + (ledger.dr || 0), 0);        
            const totalCreditLedger = dv.ledgers
            .filter((ledger) => ledger.type === "CR")
            .reduce((sum, ledger) => sum + (ledger.cr || 0), 0);
            setTotalDebitLedger(totalDebitLedger);
            setTotalCreditLedger(totalCreditLedger);
        }
    }, [dv])

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
                <title>DISBURSEMENT VOUCHER</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 0.8em;
                    }
                    .header{
                        display: flex;
                    }
                    .header div:nth-child(1){
                        flex: 1;
                    }
                    .header div:nth-child(2){
                        text-align: center;
                        flex: 2;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .header div:nth-child(2) span:nth-child(1){
                        margin-bottom: 10px
                    }
                    .header div:nth-child(3){
                        flex: 1;
                    }
                    .header img{
                        height: 100px;
                        width: 100px;
                    }

                   
                    .c{
                        text-align: center;
                    }
                    .bt{
                        border-top: 1px solid #000;
                    }
                    .bl{
                        border-left: 1px solid #000;
                    }
                    .bb{
                        border-bottom: 1px solid #000;
                    }
                    .br{
                        border-right: 1px solid #000;
                    }
                    .p5{
                        padding: 5px;
                    }
                    .b{
                        font-weight: bold;
                    }
                    .vt{
                        vertical-align: top;
                    }
                    .end{
                        text-align: end;
                    }
                    .ledgers tr td:not(:last-child){
                        border-right: 1px dotted #000;
                        padding: 5px 10px;
                    }
                    .ledgers tr:last-child td{
                        border: 1px solid #000;
                        padding: 10px 20px;
                    }
                    .mw{
                        width: 150px
                    }
                    table{
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .line{
                        display: inline-block;
                        width: 90%;
                        border-bottom: 1px solid #000;
                    }
                    .space{
                        min-height: 20px;
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
        <>
            <button type="button" className='btn-primary mr-4 text-[1.2em]' onClick={printClick} >Print</button>
            <div ref={printRef} className='hidden'>

                <div className='header'>
                    <div>
                        <img src={logo} />
                    </div>
                    <div>
                        <span className='b'>NATIONAL DEVELOPMENT COMPANY</span>
                        <span>116, TOrdesillas Salcedo Village, Makati City</span>
                        <span>Philippines</span>
                    </div>
                    <div>

                    </div>
                </div>

                <table>
                    <tbody>
                        <tr>
                            <td colSpan={5} className='bt br bb bl b c p5' >DISBURSEMENT VOUCHER</td>
                        </tr>
                        <tr>
                            <td className='bl br p5' colSpan={4}>MODE OF PAYMENT</td>
                            <td className='br bb p5'>DV No: <span className='b' >{dv?.DVNo || ""}</span></td>
                        </tr>
                        <tr>
                            <td rowSpan={2} className='bl bb p5'><input type="checkbox" /> Check</td>
                            <td rowSpan={2} className='bb p5'><input type="checkbox" /> Draft</td>
                            <td rowSpan={2} className='bb p5'><input type="checkbox" /> Memo</td>
                            <td rowSpan={2} className='bb br p5'><input type="checkbox" /> Others</td>
                            <td className='bb br p5'>Check No: <span className='b'>{dv?.CheckNo || ""}</span></td>
                        </tr>
                        <tr>
                            <td className='bb br p5'>Date: <span className='b'>{dv.DVDate ? formatFullReadableDate(new Date(dv.DVDate)) : ''}</span></td>
                        </tr>
                        <tr>
                            <td colSpan={3} className='bl br p5'>Payee/Office:</td>
                            <td className='br p5'>TIN/Employee No.</td>
                            <td className='br p5'>ReferenceNo</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className='b bb br bl p5'>{dv?.PaymentEntity?.name || ''}</td>
                            <td className='b bb br p5'>{dv?.PaymentEntity?.tin || ''}</td>
                            <td className='bb br p5'>Date:</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className='bl p5 br'>Address:</td>
                            <td colSpan={2} className='c b p5 bb br'>Responsibility Center</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className='bl br bb p5'>{dv?.PaymentEntity?.address || ''}</td>
                            <td className='bb br p5'>Group:</td>
                            <td className='bb br p5'>Code:</td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='p5 br c b bl bb'>PARTICULARS</td>
                            <td className='br bb p5 b bl c'>AMOUNT </td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='br p5 bb bl vt'>{dv.Particulars}</td>
                            <td className='br bb p5'>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Php</td>
                                            <td className='end b'>{numberToCurrencyString(totalDebitLedger)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>less</td>
                                        </tr>
                                        {
                                            dv.ledgers
                                                .filter(m => m.wt) // Ensure `wt` exists before mapping
                                                .map((m, index) => (
                                                    <tr key={`wt-${index}`}> 
                                                        <td>{m.wt.taxType} ({m.wt.taxRate}% x {numberToCurrencyString(m.wt.taxBase)})</td>
                                                        <td className="end b">{numberToCurrencyString(m.wt.taxTotal)}</td>
                                                    </tr>
                                                ))
                                        }
                                        {
                                            dv.ledgers
                                                .filter(m => m.od) // Ensure `od` exists before mapping
                                                .map((m, index) => (
                                                    <tr key={`od-${index}`}>
                                                        <td>{m.od.description || ''}</td>
                                                        <td className="end b">{numberToCurrencyString(m.od.amount || 0)}</td>
                                                    </tr>
                                                ))
                                        }

                                        <tr>
                                            <td className='b'>AMOUNT DUE</td>
                                            <td className='end b bt bb'>
                                            {
                                                numberToCurrencyString(
                                                    totalDebitLedger - (
                                                        dv.ledgers
                                                            .filter(m => m.wt) // Ensure m.wt exists
                                                            .reduce((pre, cur) => pre + (cur.wt?.taxTotal || 0), 0) + 
                                                        dv.ledgers
                                                            .filter(m => m.od) // Ensure m.od exists
                                                            .reduce((pre, cur) => pre + (cur.od?.amount || 0), 0)
                                                    )
                                                )
                                            }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table className='ledgers'>
                    <thead>
                        <tr>
                            <th colSpan={2} className='br bl bb p5'>ACCOUNT DISTRIBUTION</th>
                            <th colSpan={2} className='br bl bb p5'>GENERAL LEDGER</th>
                            <th colSpan={2} className='br bl bb p5'>SUBSIDIARY LEDGER</th>
                        </tr>
                        <tr>
                            <th className='p5 bb br bl'>CODE</th>
                            <th className='p5 bb br'>ACCOUNT TITLE</th>
                            <th className='p5 bb br'>DEBIT</th>
                            <th className='p5 bb br'>CREDIT</th>
                            <th className='p5 bb br'>DEBIT</th>
                            <th className='p5 bb br'>CREDIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            formatLedgers(dv.ledgers).map((item, index)=>
                                <tr key={index}>
                                    <td className=' end bl'>{item.accountCode}</td>
                                    <td className=''>{item.accountTitle}</td>
                                    <td className=' end'>{item.d1}</td>
                                    <td className=' end'>{item.c1}</td>
                                    <td className=' end'>{item.d2}</td>
                                    <td className=' end br'>{item.c2}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                <table>
                    <tbody>
                        <tr>
                            <td className='bl br'>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className='vt b p5'>CERTIFIED:</td>
                                            <td>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td><input type="checkbox" /> Supporting documents complete</td>
                                                        </tr>
                                                        <tr>
                                                            <td><input type="checkbox" /> Account codes proper</td>
                                                        </tr>
                                                        <tr>
                                                            <td><input type="checkbox" /> Previous cash advance liquidated</td>
                                                        </tr>
                                                        <tr>
                                                            <td><input type="checkbox" /> Fund available</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className='br c b'>
                                APPROVED FOR PAYMENT
                            </td>
                        </tr>
                        <tr>
                            <td className='bl br bb p5'>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Signature:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                        <tr>
                                            <td>Printed name:</td>
                                            <td><span className='line'>{dv?.CertifiedBy?.name || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Position:</td>
                                            <td><span className='line'>{dv?.CertifiedBy?.position || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Date:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td className='br bb pt'>
                                <table className='mb-2'>
                                    <tbody>
                                        <tr>
                                            <td>Signature:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                        <tr>
                                            <td>Printed name:</td>
                                            <td><span className='line'>{dv?.ApprovedBy1?.name || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Position:</td>
                                            <td><span className='line'>{dv?.ApprovedBy1?.position || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Date:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                        <tr><td><div className='space'></div></td></tr>
                                        <tr>
                                            <td>Signature:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                        <tr>
                                            <td>Printed name:</td>
                                            <td><span className='line'>{dv?.ApprovedBy2?.name || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Position:</td>
                                            <td><span className='line'>{dv?.ApprovedBy2?.position || ''}</span></td>
                                        </tr>
                                        <tr>
                                            <td>Date:</td>
                                            <td><span className='line'></span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th colSpan={4} className='bb bl br p5'>RECEIVED PAYMENT</th>
                            <th colSpan={2} className='bb br p5' >FOR ACCOUNTING USE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='b p5 bl'>Signature:</td>
                            <td className='p5 mw'></td>
                            <td className='p5 b'>Payment Reference No:</td>
                            <td className='br p5 mw'></td>
                            <td className='p5 b'>Prepared By:</td>
                            <td className='br p5'>{dv?.PreparedBy?.name || ''}</td>
                        </tr>
                        <tr>
                            <td className='p5 bl bb b'>Printed Name:</td>
                            <td className='bb p5 mw'></td>
                            <td className='bb p5 b'>Date Issued:</td>
                            <td className='br p5 bb mw'></td>
                            <td className='bb p5 b'>Date:</td>
                            <td className='bb br p5'>{dv.DVDate ? formatFullReadableDate(new Date(dv.DVDate)) : ''}</td>
                        </tr>
                    </tbody>
                </table>












                
                {/* <div className='row1'>
                    <span>DISBURSMENT VOUCHER</span>
                </div>
                <div className='row2'>
                    <div className='row2d1'>
                        <span className='row2sp'>MODE OF PAYMENT</span>
                        <div>
                            <input type="checkbox" />
                            <span>Check</span>
                            <input type="checkbox" />
                            <span>Draft</span>
                            <input type="checkbox" />
                            <span>Memo</span>
                            <input type="checkbox" />
                            <span>Others</span>
                        </div> 
                    </div>
                    <div className='row2d2'>
                        <span><span className='b'>DV No:</span> {dv?.DVNo || ""}</span>
                        <span><span className='b'>Check No:</span> {dv?.CheckNo || ""}</span>
                        <span><span className='b'>Date:</span> {dv.DVDate ? formatReadableDate(new Date(dv.DVDate)) : ''}</span>
                    </div>
                </div>
                <div className='row3'>
                    <div className='row3d1'>
                        <div className='row3d1d1'>
                            <span className='row3d1d1sp'>Payee/Office:</span>
                            <span>{dv?.PaymentEntity?.name || ''}</span>
                        </div>
                        <div className='row3d1d2'>
                            <span className='row3d1d2sp'>TIN / Employee No.</span>
                            <span>{dv?.PaymentEntity?.tin || ''}</span>
                        </div>
                    </div>
                    <div className='row3d2'>
                        <span>Reference No.</span>
                        <span>Date:</span>
                    </div>
                </div>
                <div className='row4'>
                    <div className='row4d1'>
                        <span className='b'>Address:</span>
                        <span>{dv?.PaymentEntity?.address || 'test'}</span>
                    </div>
                    <div className='row4d2'>
                        <div className='row4d2d1'>
                            <span>Responsibility Center</span>
                        </div>
                        <div className='row4d2d2'>
                            <span>Group:</span>
                            <span>Code:</span>
                        </div>
                    </div>
                </div>
                <div className='row5'>
                    <div className='row5d1'>
                        <div>
                            <span>PARTICULARS</span>
                        </div>
                        <div>

                        </div>
                    </div>
                    <div className='row5d2'>

                    </div>
                </div> */}
            </div>
        </>
    );
}

export default PrintDV;