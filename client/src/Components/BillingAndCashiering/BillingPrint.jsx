import React, { useRef, useState, useEffect } from 'react';
import blank from "../../assets/images/BlankBilling.png";
import { useDataPreloader } from '../../context/DataPreloader';
import { numberToCurrencyString } from '../../helper/helper';

function BillingPrint({ data={} }) {

    const printRef = useRef();
    const [base64Image, setBase64Image] = useState("");
    const {subledgers} = useDataPreloader();
    const [sl, setSl] = useState(null);

    // Convert image to Base64 on component mount
    useEffect(() => {
        const toBase64 = (imgSrc, callback) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Prevent CORS issues
            img.src = imgSrc;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                callback(canvas.toDataURL("image/png")); // Convert to Base64
            };
        };

        toBase64(blank, (base64) => {
            setBase64Image(base64);
        });
        getFullSLInfo();
    }, []);

    // this is advanced fix when we need to refactor billing print, we should record values in states so there is no calculations on print
    useEffect(()=>{
        if(sl){
            const test = calculateBillingDetails(data, sl.vat);
            // console.log(test);
        }
    }, [sl]);

    // experimental function to ease out bill info
    function calculateBillingDetails(bill, vatRate) {
        let billingAmount = bill.row1.billingAmount;
        let penalty = bill.row1.penalty;
        let recordedEscalation = bill.recordedEscalation;
        let arrears = bill.arrears;
        let assessmentBalance = bill.assessmentBalance;
        let assessmentBilling = bill.assessmentBilling;
        // const { billingAmount, penalty, recordedEscalation, arrears, assessmentBalance, assessmentBilling } = bill;
    
        // Calculate total sales components
        const totalSales = Number(arrears || 0) + 
                           Number(billingAmount || 0) +
                           Number(penalty || 0) +
                           Number(recordedEscalation || 0);
    
        let totalVatableSales = 0;
        let zeroRatedSales = 0;
        let vatExemptSales = 0;
        let vatAmount = 0;
        
        if (vatRate > 0) {
            totalVatableSales = totalSales;
            vatAmount = totalVatableSales / (1 + vatRate / 100) * (vatRate / 100); // Extract VAT amount
        } else {
            zeroRatedSales = totalSales; // Treat as zero-rated
        }
    
        const totalSalesVatInclusive = totalSales;
        const lessVat = totalSalesVatInclusive - vatAmount;
        const amountNetOfVat = lessVat;
        const amountDue = Number(assessmentBalance || 0) + Number(assessmentBilling || 0) + amountNetOfVat;
        const totalAmountDue = amountDue + vatAmount;
    
        return {
            totalVatableSales,
            zeroRatedSales,
            vatExemptSales,
            vatAmount,
            totalSalesVatInclusive,
            lessVat,
            amountNetOfVat,
            amountDue,
            addVat: vatAmount,
            totalAmountDue
        };
    }    

    async function getFullSLInfo(){
        if(!data) return;
        const sl = subledgers.filter(f=>f.slCode === data.subledger.slCode)[0];
        setSl(sl);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
        });
    }
    
    function printClick(){
        console.log(data);
        if (!base64Image) {
            alert("Image not loaded yet!");
            return;
        }
 
        const printContents = printRef.current.innerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
        iframeDoc.document.open();
        iframeDoc.document.write(` <!DOCTYPE html>
            <html>
            <head>
                <title>STATEMENT OF ACCOUNT</title>
                <style>
                    @page {
                        size: A4; /* Ensure it fits an A4 page */
                        margin: 0; /* Remove margins */
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh; /* Full viewport height */
                        width: 100vw; /* Full viewport width */
                        overflow: hidden;
                    }
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover; /* Ensures the image covers the full page */
                        page-break-before: always;
                    }
                    .overlay{
                        position: fixed;
                        top: 0;
                        botton: 0;
                        left: 0;
                        right: 0;
                    }
                    .date {
                        position: absolute;
                        right: 10vw;
                        top: 20vh;
                    
                    }
                    .customerName {
                        position: absolute;
                        height: 35px;
                        width: 300px;
                        top: 26vh;
                        left: 14vw;
                    }
                    .customerAddress {
                        position: absolute;
                        height: 35px;
                        width: 300px;
                        top: 29vh;
                        left: 14vw;
                    }
                    .customerTin {
                        position: absolute;
                        height: 18px;
                        width: 300px;
                        top: 32vh;
                        left: 14vw;
                    }
                    .particulars {
                        position: absolute;
                        height: 265px;
                        width: 705px;
                        top: 40vh;
                        left: 5vw;
                        display: flex;
                        flex-direction: column;
                    }
                    .particulars > div{
                        display: flex;
                    }
                    .particulars div div:nth-child(1){
                        flex: 2.5;
                    }
                    .particulars div div:nth-child(2){
                        flex: 1;
                        text-align: end;
                    }

                    .vatableSales {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 200px;
                        top: 65vh;
                        left: 20vw;
                    }
                    .totalSales {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 65vh;
                        right: 6vw;
                    }   

                    .vatExcemptSales {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 200px;
                        top: 68vh;
                        left: 20vw;
                    }
                    .lessVat {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 68vh;
                        right: 6vw;
                    }  

                    .zeroRatedSales {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 200px;
                        top: 71vh;
                        left: 20vw;
                    }
                    .amountNetOfVat {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 71vh;
                        right: 6vw;
                    }  

                    .vatAmount {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 200px;
                        top: 74vh;
                        left: 20vw;
                    }
                    .amountDue {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 73.9vh;
                        right: 6vw;
                    }  

                    .addVat {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 76.5vh;
                        right: 6vw;
                    }  

                    .totalAmountDue {
                        text-align: end;
                        position: absolute;
                        height: 20px;
                        width: 150px;
                        top: 79vh;
                        right: 6vw;
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
        //      <img src="${base64Image}" alt="Billing Template" /> add this before print content
        iframeDoc.document.close();
        iframe.contentWindow.focus();
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
        <button className='btn-primary' onClick={printClick} >Billing</button>
        {
            data &&
            <div ref={printRef} className='hidden'>
                <div className='overlay'>
                    <span className='date'>{formatDate(data.asof)}</span>
                    <div className='customerName'>
                        {data.subledger.name}
                    </div>
                    <div className='customerAddress'>
                        { sl ? sl.address : "" }
                    </div>
                    <div className='customerTin'>
                        { sl ? sl.tin : "" }
                    </div>
                    <div className='particulars'>

                        {
                            data.client ? data.client.vat <= 0 ? (
                            <div>
                                <div>
                                    ZERO RATED
                                </div>
                                <div></div>
                            </div>
                            ) : <></> : <></>
                        }
                        <br />

                        {
                            data.row1.outstandingBalance - data.row1.billingAmount - data.row1.penalty + data.assessmentBalance > 0 ? (
                                <>
                                <div>
                                    <div>
                                        Balance as of {formatDate(data.asof)}
                                    </div>
                                    <div>
                                        { numberify(data.row1.outstandingBalance - data.row1.billingAmount - data.row1.penalty + data.assessmentBalance) }
                                    </div>
                                </div>
                                <br />
                                </>
                            ) : <></>
                        }

                        {
                            data.recordedEscalation > 0 ? (
                                <>
                                <div>
                                    <div>
                                        { data.escalationRecordedDescription }
                                    </div>
                                    <div>
                                        { numberify(data.recordedEscalation) }
                                    </div>
                                </div>
                                <br />
                                </>
                            ) : <></>
                        }
                       
                        
                        <div>
                            <div>
                                Rental for {data.row1.particular}
                            </div>
                            <div>
                                { numberify(data.row1.billingAmount + data.assessmentBilling) }
                            </div>
                        </div>
                        <br />

                        <div>
                            <div>
                                Due date: {formatDate(new Date(data.row1.dueDate))}
                            </div>
                            <div></div>
                        </div>
                        {
                            sl ? sl.penalty > 0 ? (
                                <div>
                                    <div>
                                        In case of failure or delay in the monthly payment of rental, lessee shall pay interest thereon at {sl.penalty}% per month until full payment thereof
                                    </div>
                                    <div></div>
                                </div>
                            ):<></>:<></>
                        }
                  

                    </div>

                    <div className='vatableSales'>
                        {/* done */}
                    </div>
                    <div className='totalSales'>
                        { numberify(data.totalSales) }
                    </div>

                    <div className='vatExcemptSales'>
                        {/* done */}
                    </div>
                    <div className='lessVat'>
                        { numberify(data.lessOfVat) }
                    </div>

                    <div className='zeroRatedSales'>
                        {/* done */}
                    </div>
                    <div className='amountNetOfVat'>
                        { numberify(data.amountNetVat) }
                    </div>

                    <div className='vatAmount'>
                        { numberify(data.lessOfVat) }
                    </div>
                    <div className='amountDue'>
                        { numberify(data.amountNetVat) }
                    </div>

                    <div className='addVat'>
                        { numberify(data.lessOfVat) }
                    </div>

                    
                    <div className='totalAmountDue'>
                        { numberify(data.totalAmountDue) }
                    </div>

                </div>
            </div>
        }
        </>
    );
}

export default BillingPrint;