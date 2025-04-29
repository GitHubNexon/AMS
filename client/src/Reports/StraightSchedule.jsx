import React, { useState, useEffect } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, getFirstAndLastDayOfMonth, formatDateToYYYMMdd, formatReadableDate, currencyStringToNumber } from "../helper/helper";
import ReportNavigation from "../Reports/ReportNavigation";
import axios from "axios";
import { useLoader } from "../context/useLoader";
import * as XLSX from 'xlsx';
import AccountRangePicker from "../Components/AccountRangePicker";

const StraightSchedule = () => {

  const {loading} = useLoader();
  const [excelExport, setExcelExport] = useState([]);
  const [prevM, setPrevM] = useState(null);
  const [cur, setCur] = useState(null);
  const [prevY, setPrevY] = useState(null);
  const [rows, setRows] = useState([]);
  const [begBal, setBegBal] = useState('');
  const [asof, setAsof] = useState('');
  const [compare, setCompare] = useState('');

  const [accountRange, setAccountRange] = useState([]);

  function getPreviousYearDate(dateString) {
    const date = new Date(dateString); // Convert string to Date object
    date.setFullYear(date.getFullYear() - 1); // Subtract 1 year
    return date.toISOString().split('T')[0]; // Format back to "YYYY-MM-DD"
  }

  async function fetchReportClick(){

    // if(!prevM && !cur && !prevY){
    if(!asof || !compare){
      showToast('Please select month', 'warning');
    }else{
      let ranges = [];      
      // if begBal is not filled get asof month and last month as default
      if(!begBal){

        // last month interval
        let ltemp = new Date(asof);
        ltemp = new Date(ltemp.setMonth(ltemp.getMonth() - 1));
        const prevMonth = getFirstAndLastDayOfMonth(formatDateToYYYMMdd(ltemp));
        const current = getFirstAndLastDayOfMonth(asof); 
        ranges = [
          [null, prevMonth.lastDay],
          [current.firstDay, asof],
          [getPreviousYearDate(current.firstDay), getPreviousYearDate(asof)] // forgotten feature (shows data at same month last year)
        ]; 

        // console.log(getPreviousYearDate(current.firstDay), getPreviousYearDate(asof));

      }else{
        // begBal - 1 day
        const nd = new Date(begBal);
        nd.setDate(nd.getDate() + 1);
        // altering ranges
        ranges = [
          [null, begBal],
          [formatDateToYYYMMdd(nd), asof],
          [null, compare]
        ];

        console.log(nd, asof)

      }

      // const response = await axios.post(`/reports/fullStraightSchedule`, {
      //   ranges: [
      //     [prevM.firstDay, prevM.lastDay],
      //     [cur.firstDay, cur.lastDay],
      //     [prevY.firstDay, prevY.lastDay]
      //   ]
      // }, {withCredentials: true});
      loading(true);
      const response = await axios.post(
        `/reports/fullStraightSchedule`, 
        {
          ranges: ranges
        },
        {withCredentials: true}
      );
      const marked = markParentNodes(response.data);
      // // finalize it
      const tableRows = [];
      for (let i = 0; i < marked.length; i++) {
        // Skip accounts with levels < 2
        // if (marked[i].level < 2) continue;
        const account = marked[i];
        const accRow = processAccountRow(account);
        if (account.isParent) {
          // If parent, render totals in the same row
          tableRows.push(accRow);
          // Render transactions
          account.transactions.forEach(transaction => {
            tableRows.push(generateTransactionRow(account.level, transaction));
          });
        } else {
          // For non-parent accounts
          // tableRows.push(generateEmptyRow()); // Add empty row
          // Render account row
          tableRows.push(accRow);
          // Render transactions
          if (account.transactions.length > 0) {
            account.transactions.forEach(transaction => {
              tableRows.push(...generateTransactionRow(account.level, transaction, account.code));
            });
            // Render total row
            // tableRows.push(generateTotalRow(3, account.total));
            // Add another empty row
            // tableRows.push(generateEmptyRow());
          }
        }
      }
      setRows(tableRows);
    }
    loading(false);
  }

  function generateEmptyRow() {
    return { level: 0, col1: "", col2: "", col3: "", col4: "", col5: "", col6: "", col7: "" };
  }
  
  function generateTransactionRow(level, transaction, code) {
    if(transaction.name === "TOTAL"){
      return [
        {
          level: 3,
          col1: transaction.name,
          col2: "",
          col3: transaction.asOf ? numberToCurrencyString(transaction.asOf) : 0,
          col4: transaction.currentDr ? numberToCurrencyString(transaction.currentDr) : 0,
          col5: transaction.currentCr ? numberToCurrencyString(transaction.currentCr) : 0,
          col6: transaction.endingBalance ? numberToCurrencyString(transaction.endingBalance) : 0,
          col7: transaction.compareBalance ? numberToCurrencyString(transaction.compareBalance) : 0,
          filter: code
        },
        { level: 0, col1: "", col2: "", col3: "", col4: "", col5: "", col6: "", col7: "", filter: code }
      ];
    }
    return [{
      level,
      col1: "",
      col2: `${transaction.slCode} ${transaction.name}`,
      col3: transaction.asOf ? numberToCurrencyString(transaction.asOf) : 0,
      col4: transaction.currentDr ? numberToCurrencyString(transaction.currentDr) : 0,
      col5: transaction.currentCr ? numberToCurrencyString(transaction.currentCr) : 0,
      col6: transaction.endingBalance ? numberToCurrencyString(transaction.endingBalance) : 0,
      col7: transaction.compareBalance ? numberToCurrencyString(transaction.compareBalance) : 0,
      filter: code
    }];
  }
  
  // totals already in api
  function generateTotalRow(level, total) {
    return {
      level,
      col1: "TOTAL",
      col2: "",
      col3: numberToCurrencyString(total.asof),
      col4: numberToCurrencyString(transaction.currentDr),
      col5: numberToCurrencyString(transaction.currentCr),
      col6: numberToCurrencyString(transaction.endingBalance),
      col7: "test",
    };
  }
  
  // already returning empty values (clean)
  function processAccountRow(account) {
    const accRow = {
      isParent: account.isParent,
      level: account.level,
      col1: account.code,
      col2: account.name,
      col3: account.total ? numberToCurrencyString(account.total.asOf) : "",
      col4: account.total ? numberToCurrencyString(account.total.currentDr) : "",
      col5: account.total ? numberToCurrencyString(account.total.currentCr) : "",
      col6: account.total ? numberToCurrencyString(account.total.endingBalance) : "",
      col7: account.total ? numberToCurrencyString(account.total.compareBalance) : "",
      filter: account.code
    };
    return accRow;
  }

  function markParentNodes(flatTree) {
    // Create a Set of all parentAccount codes
    const parentCodes = new Set(flatTree.map(node => node.parentAccount).filter(Boolean));
    // Mark each node with whether it is a parent
    return flatTree.map(node => ({
      ...node,
      isParent: parentCodes.has(node.code) // Check if the node's code is in the parentAccount list
    }));
  }

  // do not touch
  function exportExcelClick() {
    // Convert rows into a 2D array (no headers)
    const excelExport = rows.map(item => [
        item.col1, 
        item.col2, 
        item.col3, 
        item.col4, 
        item.col5, 
        item.col6
    ]);

    excelExport.unshift(
      ['NATIONAL DEVELOPMENT COMPANY', '', '', '', '', '',],
      ['STRAIGHT SCHEDULE', '', '', '', '', ''],
      [`${begBal ? formatReadableDate(begBal) + ' - ' : ''}${asof ? formatReadableDate(asof) : ''}`, '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['ACCT CODE', 'ACCOUNT TITLE', 'BEG BAL', 'DEBIT', 'CREDIT', 'AS OF']
    );

    // Convert array to a worksheet (no headers)
    const ws = XLSX.utils.aoa_to_sheet(excelExport);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Merge A1 to F1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Merge A2 to F2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }  // Merge A3 to F3
    ];

    ws['!cols'] = [
      { wch: 15 }, // ACCT CODE
      { wch: 30 }, // ACCOUNT TITLE
      { wch: 15 }, // BEG BAL
      { wch: 15 }, // DEBIT
      { wch: 15 }, // CREDIT
      { wch: 15 }  // AS OF
    ];

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Export file
  XLSX.writeFile(wb, 'STRAIGHT SCHEDULE.xlsx');
}


  // process selected month
  function monthSelect(e){

    /**
     * rework will be
     * if only as of is filled then use this current auto last month pre fill
     * else if beg bal is filled
     */

    // current month interval
    const current = getFirstAndLastDayOfMonth(e.target.value); 
    setCur({ firstDay: current.firstDay, lastDay: e.target.value });

    // auto find last month based on current input
    // last month interval
    let ltemp = new Date(current.firstDay);
    ltemp = new Date(ltemp.setMonth(ltemp.getMonth() - 1));
    const prevMonth = getFirstAndLastDayOfMonth(formatDateToYYYMMdd(ltemp));
    setPrevM(prevMonth);

    // for previous year (forgotten feature but api requires it)
    let ytemp = new Date(current.firstDay);
    ytemp = new Date(ytemp.setFullYear(ytemp.getFullYear() - 1));
    const prevYear = getFirstAndLastDayOfMonth(formatDateToYYYMMdd(ytemp));
    setPrevY(prevYear);
  }

  return (
    <>
      <ReportNavigation />
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Straight Schedule</h1>
        <div className="text-[0.9em] flex items-center mb-4">
          <div className="flex-1 flex items-end flex-wrap">
            <div className="flex flex-col mb-2">
              <span className="mr-2">Beg bal:</span>
              <input type="date" className="border px-2 py-1.5 rounded mr-2" value={begBal} onChange={(e)=>setBegBal(e.target.value)} />
            </div>
            <div className="flex flex-col mb-2">
              <span className="mr-2">as of</span>
              <input type="date" className="border px-2 py-1.5 rounded mr-2" value={asof} onChange={(e)=>setAsof(e.target.value)} />
            </div>
            <div className="flex flex-col mb-2">
              <span className="mr-2">compare with</span>
              <input type="date" className="border px-2 py-1.5 rounder mr-2" value={compare} onChange={(e)=>setCompare(e.target.value)} />
            </div>
            {/* <input type="month" className="border px-2 rounded mr-2" onChange={monthSelect} /> */}
            <AccountRangePicker className={'mr-2 mb-2'} range={accountRange} setRange={setAccountRange} />
            <button className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-400 transition duration-500" onClick={fetchReportClick}>Submit</button>
          </div>
          <button className="bg-gray-500 text-white px-2 rounded hover:bg-gray-400 transition duration-500 mr-2" onClick={()=>exportExcelClick()}>Export XLSX</button>
        </div>
        <div className="h-[50vh] overflow-y-scroll relative">
          <table className="text-[0.7em] w-[100%]">
            <thead>
              <tr className="border-b bg-gray-100 sticky top-0">
                <th className="px-2 py-1 border-r w-[100px]">ACCT CODE</th>
                <th className="px-2 py-1 border-r">ACCOUNT TITLE</th>
                <th className="px-2 py-1 border-r"><span>Beg bal as of</span><br />{
                  begBal ? begBal 
                  : 
                  asof ? getFirstAndLastDayOfMonth(formatDateToYYYMMdd(new Date(new Date(asof).setMonth(new Date(asof).getMonth() - 1)))).lastDay : ''
                }</th>
                <th className="px-2 py-1 border-r">Debits</th>
                <th className="px-2 py-1 border-r">Credits</th>
                <th className="px-2 py-1 border-r"><span>As Of</span><br />{cur ? cur.lastDay : asof}</th>
                <th className="px-2 py-1 border-r">{compare}</th>
                <th className="px-2 py-1">INC/DEC</th>
                {/* <th className="px-2 py-1"><span>Prev Year</span><br />{prevY ? prevY.lastDay : ''}</th> */}
              </tr>
            </thead>
            <tbody>
              {
                rows.filter(item => accountRange.length === 0 || accountRange.includes(item.filter))
                .map((item, index) => (
                  <tr key={index} className="border-b min-h-[15px]">
                    <td className={`${item.level < 3 ? 'text-end' : ''} px-2 border-r`}>{item.col1}</td>
                    <td className="px-2 border-r">{item.col2 ? item.col2 : <div className="min-h-[15px]"></div>}</td>
                    <td className="px-2 border-r">{item.col3}</td>
                    <td className="px-2 border-r">{item.col4}</td>
                    <td className="px-2 border-r">{item.col5}</td>
                    <td className="px-2 border-r">{item.col6}</td>
                    <td className="px-2 border-r">{item.col7}</td>
                    <td className="px-2">{(item.col6 && item.col7) ? numberToCurrencyString(currencyStringToNumber(item.col6) - currencyStringToNumber(item.col7)) : ''}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StraightSchedule;