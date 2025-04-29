import React, { useRef } from 'react';
import { numberToCurrencyString } from '../helper/helper';

function PrintCards({ items }) {
   const printRef = useRef();

   function formatDate(inputDate) {
    const date = new Date(inputDate);
    if (isNaN(date)) return "Invalid Date";

    const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
    const month = date.toLocaleString('en-US', { month: 'short' }); // Abbreviated month
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year

    return `${day}-${month}-${year}`;
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
                  <title>Print Cards</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-wrap: wrap;
                        }
                        .card {
                            page-break-inside: avoid; /* Prevent breaking inside the card */
                            break-inside: avoid; /* For modern browsers */
                            border: 1px solid #ccc;
                            border-radius: 8px;
                            margin: 8px;
                            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
                            width: 45vw;
                        }
                        .header {
                            background-color: #2f855a;
                            color: white;
                            text-align: center;
                            padding: 8px;
                            font-weight: bold;
                        }
                        .section {
                            padding: 8px;
                            margin-bottom: 8px;
                        }
                        .section-title {
                            font-style: italic;
                            font-weight: bold;
                            margin-bottom: 8px;
                        }
                        .row {
                            display: flex;
                            margin-bottom: 8px;
                        }
                        .row span:nth-child(1){
                            flex: 1;
                        }
                        .label {
                            font-weight: bold;
                            flex: 1;
                            margin-right: 10px;
                        }
                        .cn{
                            width: 70px
                        }
                        .remarks {
                            display: flex;
                            align-items: center;
                            padding: 8px;
                            font-weight: bold;
                        }
                        .client {
                            text-align: end;
                        }
                        .date {
                            text-align: end;
                        }
                        .amount {
                            width: 150px;
                            text-align: end;
                        }
                        .account {
                            font-size: 0.8em;
                        }
                        .reml {
                            margin-right: 10px;
                        }
                        .remt {
                            margin-right: 10px;
                        }
                        .signature {
                            display: flex;
                            padding: 5px;
                            font-weight: bold;
                            margin-top: 15px;
                            margin-bottom: 15px;
                            width: 100%
                        }
                        .signature span:nth-child(1) {
                            width: 100px;
                        }
                        .signature span:nth-child(2) {
                            width: 100%;
                            margin-right: 20px;
                            border-bottom: 1px solid black;
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
              <button onClick={printClick} style={{ backgroundColor: '#4299e1', color: 'white', padding: '4px 16px', borderRadius: '4px', border: 'none' }}>
                  Print
              </button>
              <div ref={printRef} className='hidden'>
                  {items.map((item, index) => (
                      <div key={index} className="card">
                          <div className="header">
                              <div>NATIONAL DEVELOPMENT COMPANY</div>
                              <div>ORDER OF PAYMENT</div>
                          </div>
                          <div className="section">
                              <div className="section-title">To be filled by Treasury</div>
                              <div className="row">
                                  <span className="label">Order of Payment No.</span>
                                  <span className="value amount">{item.orderOfPaymentNo}</span>
                              </div>
                              <div className="row">
                                  <span className="label">Date</span>
                                  <span className="value date">{item.date ? formatDate(new Date(item.date)) : ''}</span>
                              </div>
                              <div className="row">
                                  <span className="label cn">Client</span>
                                  <span className="value client">{item.client.slCode} {item.client.name}</span>
                              </div>
                              <div className="row">
                                  <span className="label">Amount</span>
                                  <span className="value amount">{numberToCurrencyString(item.amount)}</span>
                              </div>
                          </div>
                          <div className="section">
                              <div className="section-title">To be filled by Accounting</div>
                              {item.gl.map((glItem, glIndex) => (
                                  <div key={glIndex} className="row">
                                      <span className="value account">{glItem.code} - {glItem.name}</span>
                                      <span className="value amount">{numberToCurrencyString(glItem.amount)}</span>
                                  </div>
                              ))}
                              <div className="row" style={{ fontWeight: 'bold' }}>
                                  <span className="label account">Net Amount</span>
                                  <span className="value amount">
                                      {numberToCurrencyString(item.gl
                                          .filter(f => f.amount ? parseFloat(f.amount) : 0)
                                          .map(m => parseFloat(m.amount))
                                          .reduce((pre, cur) => pre + cur, 0))}
                                  </span>
                              </div>
                          </div>
                          <div className="remarks">
                              <span className='reml'>Remarks: </span>
                              <span className='remt'>{item.remarks}</span>
                          </div>
                          <div className='signature'>
                              <span>Signature</span>
                              <span></span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
}

export default PrintCards
