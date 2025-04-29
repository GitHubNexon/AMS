import axios from "axios";
import React, { useState } from "react";
import { useLoader } from "../context/useLoader";
import { numberToCurrencyString, getFirstAndLastDayOfMonth, formatReadableDate } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import * as XLSX from 'xlsx';
import SubReports from "../Components/CustomizableReport/SubReports";

function TrialBalance() {
  const { loading } = useLoader();

  // get only neccessary data
  const [range, setRange] = useState(null);
  const [rows, setRows] = useState([]);
  const [date, setDate] = useState('');

  const [lastYearRows, setLastYearRows] = useState([]);
  const [lastMonthRows, setLastMonthRows] = useState([]);
  const [cm, setCm] = useState('');
  const [ly, setLy] = useState('');
  const [lm, setLm] = useState('');

  async function fetchReportClick() {
    if (!date) {
      showToast("Please select month.", "warning");
      return;
    }
    loading(true);
    try {
      const prev = getPreviousDates(date);
      // first date parameters in here is not really used
      const [response, lastYear, lastMonth] = await Promise.all([
        axios.get(`/reports/fullTrialBalance/${date}/${date}`, { withCredentials: true }),
        axios.get(`/reports/fullTrialBalance/${prev.lastYearDate}/${prev.lastYearDate}`, { withCredentials: true }),
        axios.get(`/reports/fullTrialBalance/${prev.previousMonthDate}/${prev.previousMonthDate}`, { withCredentials: true })
      ]);
      setCm(date);
      setLy(prev.lastYearDate);
      setLm(prev.previousMonthDate);
      setRows(response.data);
      setLastMonthRows(lastMonth.data);
      setLastYearRows(lastYear.data);
      loading(false);
    } catch (error) {
      loading(false);
      console.error("Error fetching report:", error);
      showToast("Failed to fetch report. Please try again", "warning");
    }
  }

  function getPreviousDates(dateString) {
    const inputDate = new Date(dateString);

    // Get last year's date
    const lastYear = new Date(inputDate);
    lastYear.setFullYear(inputDate.getFullYear() - 1);

    // Get the first day of the previous month
    const previousMonth = new Date(inputDate);
    previousMonth.setMonth(inputDate.getMonth() - 1);
    previousMonth.setDate(1);

    // Format the dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    return {
        lastYearDate: formatDate(lastYear),
        previousMonthDate: formatDate(previousMonth)
    };
  }

  // process selected month
  function monthSelect(e){
    // current month interval
    const current = getFirstAndLastDayOfMonth(e.target.value);
    setRange(current);
  }

  function exportExcelClick() {
    // Convert rows into a 2D array (no headers)
    const excelExport = rows.map(item => [
        item.name, 
        item.totalDr === 0 ? '' : item.totalDr, 
        item.totalCr === 0 ? '' : item.totalCr
    ]);

    excelExport.unshift(
      ['NATIONAL DEVELOPMENT COMPANY', '', ''],
      ['TRIAL BALANCE', '', ''],
      [cm ? formatReadableDate(new Date(cm)) : '', '', ''],
      ['', '', ''],
      ['Account Title', 'DEBIT', 'CREDIT']
    );

    // Convert array to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelExport); // No headers added

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge A1 to F1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Merge A2 to F2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }  // Merge A3 to F3
    ];

    ws['!cols'] = [
      { wch: 60 }, // ACCT CODE
      { wch: 15 }, // ACCOUNT TITLE
      { wch: 15 }, // BEG BAL
    ];


    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Export file
    XLSX.writeFile(wb, 'TRIAL BALANCE.xlsx');
  }

  return (
    <div className="flex flex-col p-2">
      <div className="flex items-center">
        <div className="flex items-center text-[0.9em] p-2 flex-1">
          <span className="mr-2">Date</span>
          <input type="date" className="border px-2 rounded mr-2" value={date} onChange={(e)=>setDate(e.target.value)} />
          {/* <input type="month" className="border px-2 rounded mr-2" onChange={monthSelect} /> */}
          <button className="bg-blue-500 py-1 px-2 rounded text-white" onClick={fetchReportClick}>Fetch Report</button>
        </div>
        <button className="bg-gray-500 text-white px-2 rounded hover:bg-gray-400 transition duration-500 mr-2" onClick={()=>exportExcelClick()}>Export XLSX</button>
      </div>
      <div className="flex mb-10">
        <div className="w-[100%] h-[55vh] overflow-y-scroll relative">
          <table className="text-[0.8em] w-[100%] p-2 bottomstick">
            <thead>
              <tr className="border-b bg-gray-100  sticky top-0">
                <th className='px-2 py-1 border-r'>Account Code</th>
                <th className="px-2 py-1 border-r">Account Title</th>
                <th className="px-2 py-1 border-r">DEBIT</th>
                <th className="px-2 py-1 border-r">CREDIT</th>
              </tr>
            </thead>
            <tbody>
            {
              rows.map((item, index)=>(
                <tr key={index} className="hover:bg-green-100">
                  <td>{item.code}</td>
                  <td className={`border-r px-2 ${item.level === 0 || item.level === 1 ? '' : ''}`}>{item.name}</td>
                  <td className="border-r px-2">{item.totalDr > 0 ? numberToCurrencyString(item.totalDr) : ''}</td>
                  <td className="border-r px-2">{item.totalCr > 0 ? numberToCurrencyString(item.totalCr) : ''}</td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <SubReports 
          report={rows} 
          headerCm={cm}
          lastYear={lastYearRows}
          headerLy={ly}
          headerLm={lm} 
          lastMonth={lastMonthRows} 
          reverseFilter={['STATEMENTS OF FINANCIAL POSITION', 'STATEMENTS OF COMPREHENSIVE INCOME']}
          showCompare={false} />
      </div>
    </div>
  );
}

export default TrialBalance;