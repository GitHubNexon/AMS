import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatFullReadableDate } from "../helper/helper";
import ReportNavigation from "../Reports/ReportNavigation";
import EquityChangesSetup from "../Components/CustomizableReport/EquityChangesSetup";
import axios from "axios";
import { useLoader } from "../context/useLoader";
import * as XLSX from "xlsx";

const EquityChanges = () => {

  const {loading} = useLoader();

  const [showSettings, setShowSettings] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("");

  const [tr1, setTr1] = useState(null);
  const [tr2, setTr2] = useState(null);
  const [template, setTemplate] = useState(null)
  
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    getTemplate();
  }, []);

  useEffect(()=>{
    if(!tr1 || !tr2 || !template) return; 
    buildReport();
  }, [tr1, tr2, template]);

  function buildReport(){
    const prev = getPreviousYear(getLastDayOfMonth(selectedMonth));
    const curr = getLastDayOfMonth(selectedMonth);

    // build maps
    const tr1Map = new Map(); // last year
    const tr2Map = new Map(); // current year
    for(let i = 0; i < tr1.length; i++){
      tr1Map.set(tr1[i].code, Math.abs(tr1[i].totalCr - tr1[i].totalDr));
    }
    for(let i = 0; i < tr2.length; i++){
      tr2Map.set(tr2[i].code, Math.abs(tr2[i].totalCr - tr2[i].totalDr));
    }

    // actual template
    const actualTemp = [
      [ `Balances, ${prev}`, '', '', '', '', '' ],
      [ `Correction of prior years' error`, '', '', '', '', '' ],
      [ ``, '', '', '', '', '' ], // total
      [ ``, '', '', '', '', '' ], // blank
      [ `Changes in Equity for ${curr}`, '', '', '', '', '' ], // no val
      [ `Net income for the year, as restated`, '', '', '', '', '' ],
      [ `Dividends`, '', '', '', '', '' ],
      [ `Other comprehensive income for the year`, '', '', '', '', '' ], // no val
      [ `Unrealized gain on financial assets at FVOCI`, '', '', '', '', '' ],
      [ `Balances, ${curr} as restated`, '', '', '', '', '' ], // total
    ];

    // loop through template, check location, find value, populate actualTemp
    for(let i = 0; i < template.length; i++){
      switch(template[i].position){
        case "c1r1": 
          actualTemp[0][1] = findVal(template[i], tr1Map);
        break;
        case "c2r1": 
          actualTemp[0][2] = findVal(template[i], tr1Map);
        break;
        case "c3r1": 
          actualTemp[0][3] = findVal(template[i], tr1Map);
        break;
        case "c4r1": 
          actualTemp[0][4] = findVal(template[i], tr1Map);
        break;
        
        // [0][5] total here

        case "c1r2": 
          actualTemp[1][1] = findVal(template[i], tr1Map);
        break;
        case "c2r2": 
          actualTemp[1][2] = findVal(template[i], tr1Map);
        break;
        case "c3r2": 
          actualTemp[1][3] = findVal(template[i], tr1Map);
        break;
        case "c4r2": 
          actualTemp[1][4] = findVal(template[i], tr1Map);
        break;
        // [1][5] total here
        
        // [2][1] - [2][5] total here

        // [3][1] - [3][5] is blank
        // [4][1] - [4][5] is blank

        case "c1r3": 
          actualTemp[5][1] = findVal(template[i], tr2Map);
        break;
        case "c2r3": 
          actualTemp[5][2] = findVal(template[i], tr2Map);
        break;
        case "c3r3": 
          actualTemp[5][3] = findVal(template[i], tr2Map);
        break;
        case "c4r3": 
          actualTemp[5][4] = findVal(template[i], tr2Map);
        break;

        case "c1r4": 
          actualTemp[6][1] = findVal(template[i], tr2Map);
        break;
        case "c2r4": 
          actualTemp[6][2] = findVal(template[i], tr2Map);
        break;
        case "c3r4": 
          actualTemp[6][3] = findVal(template[i], tr2Map);
        break;
        case "c4r4": 
          actualTemp[6][4] = findVal(template[i], tr2Map);
        break;

        // [6][5] total here
        // [7][1] - [7][5] is blank

        case "c1r5": 
          actualTemp[8][1] = findVal(template[i], tr2Map);
        break;
        case "c2r5": 
          actualTemp[8][2] = findVal(template[i], tr2Map);
        break;
        case "c3r5": 
          actualTemp[8][3] = findVal(template[i], tr2Map);
        break;
        case "c4r5": 
          actualTemp[8][4] = findVal(template[i], tr2Map);
        break;
       
        // [8][5] total here
        // [9][1] - [9][5] total here

      }
    }

    // calculate totals
    actualTemp[0][5] = [actualTemp[0][1], actualTemp[0][2], actualTemp[0][3], actualTemp[0][4]]
    .map(Number) // Convert all values to numbers
    .reduce((sum, val) => sum + val, 0); // Sum them up

    // [1][5] total here
    actualTemp[1][5] = [actualTemp[1][1], actualTemp[1][2], actualTemp[1][3], actualTemp[1][4]]
    .map(v => Number(v) || 0) // Convert to number, treat empty strings as 0
    .reduce((sum, val) => sum + val, 0); // Sum all values


    // [2][1] - [2][5] total here
    [1, 2, 3, 4, 5].forEach(index => {
      actualTemp[2][index] = [actualTemp[0][index], actualTemp[1][index]]
      .map(v => Number(v) || 0) // Convert to number, treat empty strings as 0
      .reduce((sum, val) => sum + val, 0); // Sum the values
    });
  
    // [5][5] total here
    actualTemp[5][5] = [actualTemp[5][1], actualTemp[5][2], actualTemp[5][3], actualTemp[5][4]]
    .map(v => Number(v) || 0) // Convert values to numbers, treating empty strings as 0
    .reduce((sum, val) => sum + val, 0); // Sum up the values

    [6, 8].forEach(row => {
      actualTemp[row][5] = [actualTemp[row][1], actualTemp[row][2], actualTemp[row][3], actualTemp[row][4]]
      .map(v => Number(v) || 0) // Convert values to numbers, treating empty strings as 0
      .reduce((sum, val) => sum + val, 0); // Sum up the values
    });
  

    [1, 2, 3, 4, 5].forEach(col => {
      actualTemp[9][col] = [actualTemp[2][col], actualTemp[5][col], actualTemp[6][col], actualTemp[8][col]]
      .map(v => Number(v) || 0) // Convert to numbers, treating empty strings as 0
      .reduce((sum, val) => sum + val, 0); // Sum up the values
    });
  

    // set renderer state
    setRows(actualTemp);
  }

  function findVal(temp, map){
    // holds actual ammount
    let toCalc = 0;
    // get values from formula first else use accounts
    if(!temp.customCalc){
      for(let k = 0; k < temp.value.length; k++){
        let v = map.get(temp.value[k].code);
        if(!v) v = 0;
        switch(temp.value[k].operateNext){
          case "add":
            toCalc += v;
          break;
          case "sub":
            toCalc -= v;
          break;
          case "prod":
            toCalc *= v;
          break;
          case "diff":
            toCalc /= v;
          break;
        }
      }
      toCalc = toCalc === 0 ? '' : toCalc;
    }else{
      toCalc = compute(temp.customCalc, map);
    }
    return toCalc;
  }

  function compute(expression, map) {
    try {
    
      // Remove comments enclosed in #
      expression = expression.replace(/#.*?#/g, "");
    
      // Normalize whitespace: Remove newlines and extra spaces around commas
      expression = expression.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",");
    
      // Replace placeholders {n} with values from map
      expression = expression.replace(/\{([A-Za-z0-9]+)\}/g, (match, key) => {
          return map.has(key) ? Number(map.get(key)) || 0 : 0;
      });
              
      // Remove extra commas before closing parentheses in functions
      expression = expression.replace(/,\)/g, ")");
      // Remove trailing commas at the **end of the expression** only
      expression = expression.replace(/,\s*$/, "");

  
      // Handle SUM()
      expression = expression.replace(/SUM\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/g, (_, values) => {
          const parsedValues = values.split(",").map(v => evalSafe(v.trim())).filter(v => !isNaN(v));
          return parsedValues.length > 0 ? parsedValues.reduce((acc, num) => acc + num, 0) : "NaN";
      });

  
      // Handle AVG()
      expression = expression.replace(/AVG\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/g, (_, values) => {
          const parsedValues = values.split(",").map(v => evalSafe(v.trim())).filter(v => !isNaN(v));
          return parsedValues.length > 0 ? (parsedValues.reduce((acc, num) => acc + num, 0) / parsedValues.length) : "NaN";
      });

  
      // Handle MIN()
      expression = expression.replace(/MIN\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/g, (_, values) => {
          const parsedValues = values.split(",").map(v => evalSafe(v.trim())).filter(v => !isNaN(v));
          return parsedValues.length > 0 ? Math.min(...parsedValues) : "NaN";
      });

  
      // Handle MAX()
      expression = expression.replace(/MAX\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/g, (_, values) => {
          const parsedValues = values.split(",").map(v => evalSafe(v.trim())).filter(v => !isNaN(v));
          return parsedValues.length > 0 ? Math.max(...parsedValues) : "NaN";
      });

      // Handle ROUND(x, d)
      expression = expression.replace(/ROUND\(([^,]+),\s*([^,]+)\)/g, (_, num, decimals) => {
          const parsedNum = evalSafe(num.trim());
          const parsedDecimals = parseInt(evalSafe(decimals.trim()));
          return !isNaN(parsedNum) && !isNaN(parsedDecimals) ? parsedNum.toFixed(parsedDecimals) : "NaN";
      });

      // Handle ABS()
      expression = expression.replace(/ABS\(([^()]+)\)/g, (_, value) => {
          const parsedValue = evalSafe(value.trim());
          return !isNaN(parsedValue) ? Math.abs(parsedValue) : "NaN";
      });

      // Handle IF(condition, trueVal, falseVal)
      expression = expression.replace(/IF\(([^,]+),\s*([^,]+),\s*([^,]+)\)/g, (_, condition, trueVal, falseVal) => {
          return evalSafe(condition.trim()) ? evalSafe(trueVal.trim()) : evalSafe(falseVal.trim());
      });

      return evalSafe(expression);
    } catch (error) {
      console.log('FORMULA ERROR: ', expression);
      console.error(error);
      return "Invalid expression";
    }
  }

  // Safe evaluator (prevents unwanted code execution)
  function evalSafe(expression) {
    const allowed = /^[0-9+\-*/().,\s]+$/;
    if (!allowed.test(expression)) return "Invalid expression"; // Prevents unsafe inputs
    return Function(`"use strict"; return (${expression})`)();
  }

  async function getTemplate(){
    const response = await axios.get('/reports/sub/EC', { withCredentials: true });
    const temp = response.data;
    setTemplate(temp)
  }

  function getLastDayOfMonth(yyyyMm) {
    const [year, month] = yyyyMm.split("-").map(Number);
  
    // Get last day of the month
    const lastDay = new Date(year, month, 0).getDate(); 
  
    // Return formatted string
    return `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  }

  function getPreviousYear(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const previousYear = year - 1;
  
    // Handle leap year case (e.g., 2024-02-29 → 2023-02-28)
    const lastDayOfMonth = new Date(previousYear, month, 0).getDate();
    const adjustedDay = Math.min(day, lastDayOfMonth);
  
    return `${previousYear}-${String(month).padStart(2, "0")}-${String(adjustedDay).padStart(2, "0")}`;
  }
  
  async function submitClick(){
    if(!selectedMonth) return;
    
    // get 2 trial balances
    const prev = getPreviousYear(getLastDayOfMonth(selectedMonth));
    const curr = getLastDayOfMonth(selectedMonth);
    loading(true);
    const [tr1, tr2] = await Promise.all([
      axios.get(`/reports/fullTrialBalance/${prev}/${prev}`, { withCredentials: true }),
      axios.get(`/reports/fullTrialBalance/${curr}/${curr}`, { withCredentials: true }),
    ]);
    
    loading(false);

    setTr1(tr1.data);
    setTr2(tr2.data);
  }

  function exportClick() {

    const prev = getPreviousYear(getLastDayOfMonth(selectedMonth));
    const curr = getLastDayOfMonth(selectedMonth);

    // Convert rows into a 2D array without headers
    const toExport = rows.map(m => 
        m.map((m2, index) => index === 0 ? m2 : m2 ? numberToCurrencyString(m2) : '')
    );

    toExport.unshift(
      ['NATIONAL DEVELOPMENT COMPANY', '', '', '', '', ''],
      ['STATEMENTS OF CHANGES IN EQUITY', '', '', '', '', ''],
      [`For the Years Ended ${formatFullReadableDate(new Date(curr))} and ${formatFullReadableDate(new Date(prev))}`, '', '', '', '', ''],
      ['(In Philippine Peso)', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['', 'Share Capital', 'Share in Revaluation Increments of Associates', 'Accumulated Other Comprehensive Income', 'Retained Earnings', 'Total']
    );

    // Convert array to a worksheet (without headers)
    const worksheet = XLSX.utils.aoa_to_sheet(toExport);

    // Merge header cells (A1:F1, A2:F2, A3:F3)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Merge A1 to F1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Merge A2 to F2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }  // Merge A3 to F3
    ];

    // Adjust column widths (ensure enough space for long text)
    worksheet['!cols'] = [
      { wch: 40 }, // Column A
      { wch: 25 }, // Column B
      { wch: 25 }, // Column C
      { wch: 25 }, // Column D
      { wch: 25 }, // Column E
      { wch: 25 }  // Column F
    ];

    // Adjust row height (set row 6 height larger for better readability)
    worksheet['!rows'] = [];
    // NOT WORKING on xlsx library
    worksheet['!rows'][5] = { hpt: 40 }; // Row 6 height

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export file
    XLSX.writeFile(workbook, `CHANGES IN EQUITY.xlsx`);
  }

  return (
    <>
      <ReportNavigation />
      <div className="mx-auto p-4 overflow-auto">
        <div className="flex items-start mb-2">
          <h1 className="flex-1 font-bold">STATEMENTS OF CHANGES IN EQUITY</h1>
          <button className="btn-secondary text-[0.8em]" onClick={()=>setShowSettings(true)} >Settings</button>
        </div>
        <div className="flex items-center mb-4">
          <span className="mr-2">Select date</span>
          <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-1 border rounded mr-2"
            />
          <button className="btn-primary mr-4" onClick={submitClick} >Submit</button>
          {
            rows.length > 0 &&
            <button className="btn-secondary" onClick={exportClick} >Export</button>
          }
        </div>
        <div className="text-[0.8em]">
          <table className="w-[100%]">
            <thead>
              <tr className="border-b">
                <th className="border-r p-1"></th>
                <th className="border-r p-1">Share Capital</th>
                <th className="border-r p-1">Share in Revaluation Increments of Associates</th>
                <th className="border-r p-1">Accumulated Other Comprehensive Income</th>
                <th className="border-r p-1">Retained Earnings</th>
                <th className="border-r p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {
                rows.map((item, index)=>
                  <tr key={index} className="border-b" >
                    <td className="p-1 border-r">{item[0]}</td>
                    <td className=" text-center p-1 border-r">{item[1] ? numberToCurrencyString(item[1]) : ''}</td>
                    <td className=" text-center p-1 border-r">{item[2] ? numberToCurrencyString(item[2]) : ''}</td>
                    <td className=" text-center p-1 border-r">{item[3] ? numberToCurrencyString(item[3]) : ''}</td>
                    <td className=" text-center p-1 border-r">{item[4] ? numberToCurrencyString(item[4]) : ''}</td>
                    <td className=" text-center p-1 border-r">{item[5] ? numberToCurrencyString(item[5]) : ''}</td>
                    <td className=" text-center p-1">{item[6] ? numberToCurrencyString(item[6]) : ''}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
      <EquityChangesSetup show={showSettings} close={()=>setShowSettings(false)} refresh={getTemplate} />
    </>
  );
};

export default EquityChanges;
