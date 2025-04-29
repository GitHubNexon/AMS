import React, { useEffect, useState, useRef, useContext } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import ReportNavigation from "../Reports/ReportNavigation";
import axios from "axios";
import { formatDateToYYYMMdd, getFirstAndLastDayOfMonth } from "../helper/helper";
import {FaGear} from "react-icons/fa6";
import Modal from "../Components/Modal";
import AccountPicker from "../Components/AccountPicker";
import { Page, Text, View, Document, StyleSheet, BlobProvider } from '@react-pdf/renderer';
import useAccountsLogic from "../context/useAccountsLogic";
import * as XLSX from 'xlsx';
import CustomReport from "../Components/CustomReport";
import CustomizedReports from "../Components/CustomizableReport/CustomizedReports";

const _reportName = "Balance Sheet";

const BalanceSheet = () => {

  const monthPickerRef = useRef();
  const [settings, setSettings] = useState(false);
  const [prevM, setPrevM] = useState(null);
  const [ range, setRange ] = useState(null);
  const [rows, setRows] = useState([]);

  async function fetchReportClick(){
    if(!range && !prevM){
      showToast("Please select month", "warning");
    }
    const response = await axios.post(`/reports/custom/layout1/${_reportName}`, { prev: prevM, cur: range }, { withCredentials: true });
    console.log(response.data);
    setRows(response.data);
  }

  function monthSelect(e){
    // current month interval
    const current = getFirstAndLastDayOfMonth(e.target.value);
    // last month interval
    let ltemp = new Date(current.firstDay);
    ltemp = new Date(ltemp.setMonth(ltemp.getMonth() - 1));
    const prevMonth = getFirstAndLastDayOfMonth(formatDateToYYYMMdd(ltemp));
    setRange(current);
    setPrevM(prevMonth);
  }

  function exportExcelClick(){
    const excelExport = rows.map(item=>({
      [`${_reportName}`]: item.title,
      [`${prevM ? formatReadableDate(new Date(prevM.lastDay)) : "previous month"}`]: !item.title ? '' : numberToCurrencyString(item.prev),
      [`${range ? formatReadableDate(new Date(range.lastDay)) : "this month"}`]: !item.title ? '' : numberToCurrencyString(item.cur),
      "INC/DEC": !item.title ? '' : numberToCurrencyString(item.incdec)
    }))
    const ws = XLSX.utils.json_to_sheet(excelExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'exported_data.xlsx');
  }

  function settingsClick(){
    setSettings(true);
  }

  function refresh(){
    setRange(null);
    setPrevM(null);
    setRows([]);
    monthPickerRef.current.value = '';
  }

  return (
    <>
      <ReportNavigation />
      <CustomReport reportName={_reportName} refresh={refresh} open={settings} close={()=>setSettings(false)} />
      <div className="mx-auto p-4 overflow-auto">
        <CustomizedReports />
        <h1 className="text-xl font-bold mb-4">Balance Sheet</h1>
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <input type="month" className="border px-2 rounded mr-2" onChange={monthSelect} ref={monthPickerRef} />
              <button className="bg-green-600 px-2 rounded text-white" onClick={fetchReportClick}>Fetch Report</button>
            </div>
              <button className="bg-gray-500 text-white px-2 rounded hover:bg-gray-400 transition duration-500 mr-2" onClick={()=>exportExcelClick()}>Export XLSX</button>
            <button onClick={settingsClick}><FaGear /></button>
          </div>
          <div className="overflow-y-scroll h-[44vh] relative">
            <table className="w-[100%] text-[0.8em]">
              <thead>
                <tr className="bg-gray-100 sticky top-0">
                  <th className="p-1 border-r"></th>
                  <th className="p-1 border-r w-[200px]">{prevM ? formatReadableDate(new Date(prevM.lastDay)) : "previous month"}</th>
                  <th className="p-1 border-r w-[200px]">{range ? formatReadableDate(new Date(range.lastDay)) : "this month"}</th>
                  <th className="p-1 w-[200px]">INC/DEC</th>
                </tr>
              </thead>
              <tbody>
              {
                rows.map((item, index)=>
                  <tr key={index} className="border-b">
                    <td className="p-1 border-r">{item.title ? item.title : <div className="h-[15px]" />}</td>
                    <td className="p-1 border-r text-center" >{!item.title ? '' : numberToCurrencyString(item.prev)}</td>
                    <td className="p-1 border-r text-center" >{!item.title ? '' : numberToCurrencyString(item.cur)}</td>
                    <td className="p-1 text-center" >{!item.title ? '' : numberToCurrencyString(item.incdec)}</td>
                  </tr>
                )
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BalanceSheet;