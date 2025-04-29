import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import { FaPlus, FaX } from 'react-icons/fa6';
import TrialBalanceAccountPicker from './TrialBalanceAccountPicker';
import axios from 'axios';
import { FaCirclePlus } from 'react-icons/fa6';
import { formatReadableDate, numberToCurrencyString } from '../../helper/helper';
import { showToast } from '../../utils/toastNotifications';
import * as XLSX from "xlsx";

/**
 * will create a custom report based on trial balance result 
 * filter is set in here
 * filter = [only these titles will be displayed]
 * reverseFilter = [display all except these titles]
 * with special cases on some pre added reports
 */
function SubReports({ headerCm, report=[], compare=[], headerCompare='', filter=[], reverseFilter=[], addOption=true, showCompare=true }) {

    const [editorModal, setEditorModal] = useState(false);
    const [mode, setMode] = useState('add');
    const [title, setTitle] = useState('');
    const [pickerModal, setPickerModal] = useState(false);
    const [accountsPicker, setAccountsPicker] = useState([]);
    const [selectedRowTitle, setSelectedRowTitle] = useState("");
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [rows, setRows] = useState([{ description: '', value: [] }]);
    const [reports, setReports] = useState([]);
    const [selectedRowFormula, setSelectedRowFormula] = useState('');

    useEffect(()=>{
        getReports();
    }, [report, compare]);

    async function getReports(){
        // console.log("last year", lastYear);
        // console.log("last month", lastMonth);
        // get raw layout
        const response = await axios.get(`/reports/sub`, { withCredentials: true });
        const reps = response.data;
        // if report has value populate it
        if(report.length){
            // issues here: values are calculated in front end after loading trial balance report
            // may not be efficient on client side but faster report fetching
            // hashmap
            const valuesMap = new Map();
            for(let i = 0; i < report.length; i++){
                valuesMap.set(report[i].code, Math.abs(report[i].totalCr - report[i].totalDr));
            }
            const compareMap = new Map();
            for(let i = 0; i < compare.length; i++){
                compareMap.set(compare[i].code, Math.abs(compare[i].totalCr - compare[i].totalDr));
            }
            // const valuesMapLastMonth = new Map();
            // for(let i = 0; i < lastMonth.length; i++){
            //     valuesMapLastMonth.set(lastMonth[i].code, Math.abs(lastMonth[i].totalCr - lastMonth[i].totalDr));
            // }

            // bind to subreport (breakdown manually created)
            // loop to all repord cards
            for(let i = 0; i < reps.length; i++){

                // loop to each report fields
                for(let j = 0; j < reps[i].rows.length; j++){

                    // holds actual amount to display in UI
                    let toCalc = 0; 
                    let com = 0;
                    // let lastY = 0;
                    // let lastM = 0;
                    // if has formula set it as default value else compute from selected accounts on table
                    if(!reps[i].rows[j].customCalc){
                        // loop to all field accounts value and calculate
                        for(let k = 0; k < reps[i].rows[j].value.length; k++){
                            let v = valuesMap.get(reps[i].rows[j].value[k].code);
                            let c = compareMap.get(reps[i].rows[j].value[k].code);
                            // let ly = valuesMapLastYear.get(reps[i].rows[j].value[k].code);
                            // let lm = valuesMapLastMonth.get(reps[i].rows[j].value[k].code);
                            if(!v) v = 0;
                            if(!c) c = 0;
                            // if(!ly) ly = 0;
                            // if(!lm) lm = 0;
                            switch(reps[i].rows[j].value[k].operateNext){
                                case "add":
                                    toCalc += v;
                                    com += c;
                                    // lastY += ly;
                                    // lastM += lm;
                                break;
                                case "sub":
                                    toCalc -= v;
                                    com -= c;
                                    // lastY -= ly;
                                    // lastM -= lm;
                                break;
                                case "prod":
                                    toCalc *= v;
                                    com *= c;
                                    // lastY *= ly;
                                    // lastM *= lm;
                                break;
                                case "diff":
                                    toCalc /= v;       
                                    com /= c;
                                    // lastY /= ly;
                                    // lastM /= lm;
                                break;
                            }
                        }
                        toCalc = toCalc === 0 ? '' : toCalc;
                        com = com === 0 ? '' : com;
                        // lastY = lastY === 0 ? '' : numberToCurrencyString(lastY);
                        // lastM = lastM === 0 ? '' : numberToCurrencyString(lastM);
                    }else{
                        // compute for formula
                        let cv = compute(reps[i].rows[j].customCalc, valuesMap);
                        let comv = compute(reps[i].rows[j].customCalc, compareMap);
                        // let lyv = compute(reps[i].rows[j].customCalc, valuesMapLastYear);
                        // let lmv = compute(reps[i].rows[j].customCalc, valuesMapLastMonth);
                        // special fields where we show net loss instead of negative(-)
                        if(['STATEMENTS OF COMPREHENSIVE INCOME', 'TOTAL COMPREHENSIVE INCOME'].includes(reps[i].rows[j].description)){
                            toCalc = cv < 0 ? `net loss ${Math.abs(cv)}` : cv;
                            com =  comv < 0 ? `net loss ${Math.abs(comv)}` : comv;
                            // lastY = lyv < 0 ? `net loss ${numberToCurrencyString(Math.abs(lyv))}` : numberToCurrencyString(lyv);
                            // lastM = lmv < 0 ? `net loss ${numberToCurrencyString(Math.abs(lmv))}` : numberToCurrencyString(lmv);
                        }else{
                            // console.log("last year", lyv);
                            // console.log("last month", lmv);
                            toCalc = cv === 0 ? "" : cv;
                            com = comv === 0 ? "" : comv;
                            // lastY = lyv === 0 ? "" : numberToCurrencyString(lyv);
                            // lastM = lmv === 0 ? "" : numberToCurrencyString(lmv);
                        }
                    }
                    reps[i].rows[j].amount = toCalc;
                    reps[i].rows[j].compare = com;
                    // reps[i].rows[j].lastYear = lastY;
                    // reps[i].rows[j].lastMonth = lastM;
                }
            }

            setReports(reps);
        }else{
            setReports(reps);
        }
    }

    function compute(expression, map) {
        try {

            if(expression.replace(/\s+/g, "") === ""){
                return 0;
            }
        
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
            return "Invalid expression";
        }
    }
    
    // Safe evaluator (prevents unwanted code execution)
    function evalSafe(expression) {
        const allowed = /^[0-9+\-*/().,\s]+$/;
        if (!allowed.test(expression)) return "Invalid expression"; // Prevents unsafe inputs
        return Function(`"use strict"; return (${expression})`)();
    }
    
    function addNewClick(){
        setEditorModal(true);
        setTitle('');
        setMode('add');
        setAccountsPicker([]);
        setRows([{description: '', value: []}]);
    }

    function editRow(index, what, value) {
        // Update the specific row at the given index
        setRows(prevRows => {
            const updatedRows = [...prevRows];
            updatedRows[index][what] = value;
            return updatedRows;
        });
    }
    
    function removeRow(index) {
        // Remove the row at the given index
        setRows(prevRows => prevRows.filter((_, i) => i !== index));
    }
    
    function addRow(index) {
        setRows(prevRows => {
            const newRow = { description: '', value: [] }; // New row structure
            const updatedRows = [...prevRows]; // Copy previous rows
    
            updatedRows.splice(index + 1, 0, newRow); // Insert new row after the given index
    
            return updatedRows;
        });
    }
    

    function selectValueClick(index){
        setAccountsPicker(rows[index].value)
        setSelectedRowIndex(index);
        setPickerModal(true);
        setSelectedRowTitle(rows[index].description);
        setSelectedRowFormula(rows[index].customCalc);
        console.log(rows[index].customCalc)
    }

    function pickerModalConfirm(v, f){
        const rowCopy = rows;
        rowCopy[selectedRowIndex].value = v;
        rowCopy[selectedRowIndex].customCalc = f;
        setRows(rowCopy);
        setAccountsPicker([]);
        setPickerModal(false);
    }

    const [selectedId, setSelectedId] = useState('');

    async function saveClick(){
        if(mode === 'add'){
            await axios.post(`/reports/sub`, {
                title: title,
                rows: rows
            }, { withCredentials: true }); 

            setTitle('');
            setRows([]);
            setEditorModal(false);
        }else if(mode === 'edit'){
            await axios.patch(`/reports/sub/${selectedId}`, {
                title: title,
                rows: rows
            }, { withCredentials: true });
        }
        getReports();
        showToast("Saved", "success");
    }

    function editClick(item){
        setSelectedId(item._id);
        setTitle(item.title);
        setRows(item.rows);
        setMode('edit');
        setEditorModal(true);
    }

    function exportClick(item) {
        // Convert rows into a 2D array without headers
        const toExport = item.rows.map(m => [
            m.description,
            m.amount,
            m.compare,
            m.amount - m.compare
        ]);
        
        toExport.unshift(
            [ 'NATIONAL DEVELOPMENT COMPANY', '','', '' ],
            [ item.title, '', '', '' ],
            [ headerCm ? formatReadableDate(new Date(headerCm)) : '', '', '', '' ],
            [ '', '', '', '' ],
            [ '', '', '', '' ],
            [ '', '', headerCompare, 'INC/DEC' ],
        );

        // Convert array to a worksheet (without headers)
        const worksheet = XLSX.utils.aoa_to_sheet(toExport);

        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Merge A1 to F1
            { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Merge A2 to F2
            { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }  // Merge A3 to F3
        ];

        worksheet['!cols'] = [
            { wch: 40 }, // ACCT CODE
            { wch: 20 }, // ACCOUNT TITLE
            { wch: 20 }, // BEG BAL
            { wch: 20 }, // DEBIT
        ];
    
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        // Trigger file download
        XLSX.writeFile(workbook, `${item.title}.xlsx`);
    }
    

    // these special fields are non editable and does not display negative values
    function validateSomething(title, description){
        const customFields = ['NET INCOME', 'TOTAL COMPREHENSIVE INCOME'];
        return customFields.includes(description) && title === 'STATEMENTS OF COMPREHENSIVE INCOME';
    }

    return (
        <>
        <div className='flex flex-col'>
            <div className='flex'>
                <div className='flex-1'>

                </div>
                { addOption && <button className='text-green-500 text-[1.5em]' onClick={addNewClick} ><FaCirclePlus /></button> }
            </div>
            <div className='flex flex-wrap items-start text-[0.8em]'>
            {
                reports
                .filter(f=>reverseFilter.length > 0 ? !reverseFilter.includes(f.title) : f)
                .filter(f=>filter.length > 0 ? filter.includes(f.title) : f)
                .map((item, index)=>
                    <div key={index} className='flex flex-col border rounded shadow-lg m-2' >
                        <div className='flex mb-2 border-b p-2'>
                            <span className='flex-1 font-bold mr-4' >{item.title}</span>
                            <button className='text-[0.8em] bg-gray-500 text-white px-2 mr-2 rounded' onClick={()=>editClick(item)} >Edit</button>
                            <button className='text-[0.8em] bg-gray-500 text-white px-2 mr-2 rounded' onClick={()=>exportClick(item)} >Export</button>
                        </div>
                        <table key={index}>
                            <thead>
                                <tr className='border-b'>
                                    <th></th>
                                    <th></th>
                                    {
                                        showCompare &&
                                        <>
                                            <th>
                                                <div className='flex flex-col'>
                                                    <span className="text-[0.8em] p-1">{headerCompare}</span>
                                                </div>
                                            </th>
                                            <th>
                                                <div className='flex flex-col p-1'>
                                                    <span>INC/DEC</span>
                                                </div>
                                            </th>
                                        </>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                            {
                                item.rows.map((vitem, vindex) => {
                                    return (
                                        <tr key={vindex} className="border-b">
                                            <td className="border-r px-2 py-1"><div className='min-h-[15px]'>{vitem.description}</div></td>
                                            <td className="border-r px-2 py-1">{vitem.amount > 0 ? numberToCurrencyString(vitem.amount) : ''}</td>
                                            {
                                                showCompare &&
                                                <>
                                                    <td className='border-r px-2 py-1'>{vitem.compare > 0 ? numberToCurrencyString(vitem.compare) : ''}</td>
                                                    <td className={`border-r px-2 py-1 ${
                                                        (Number(vitem.amount ?? 0) - Number(vitem.compare ?? 0)) > 0 
                                                            ? 'text-green-500' 
                                                            : (Number(vitem.amount ?? 0) - Number(vitem.compare ?? 0)) < 0 
                                                            ? 'text-red-500' 
                                                            : ''
                                                        }`}>
                                                        {(!isNaN(Number(vitem.amount)) && !isNaN(Number(vitem.compare)) && vitem.amount - vitem.compare !== 0) 
                                                            ? numberToCurrencyString(Number(vitem.amount) - Number(vitem.compare)) : ''
                                                        }
                                                    </td>
                                                </>
                                            }
                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                )
            }
            </div>
        </div>
        <Modal show={editorModal} closeCallback={()=>setEditorModal(false)}>
            <div className='flex-1 border-t border-b'>
                <div className='text-[0.8em] h-[60vh] overflow-y-scroll'>
                    <div className='px-2 py-1 mb-4 flex items-center'>
                        <span className='mr-2' >Title</span>
                        <input type="text" className='border p-1 flex-1' value={title} onChange={(e)=>setTitle(e.target.value)} readOnly={!addOption} />
                    </div>
                    <table className='w-[100%]'>
                        <thead>
                            <tr className='border-b'>
                                <th className='p-1'></th>
                                <th className='border-r p-1'>Description</th>
                                <th className='p-1'>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={3}>
                                    <div className='flex items-center justify-center py-2'>
                                        <button onClick={()=>addRow(-1)} ><FaPlus /></button>    
                                    </div>
                                </td>
                            </tr>
                            {
                                rows.map((item, index)=>
                                    <React.Fragment key={index}>
                                    <tr className='border-r'>
                                        <td className='pl-4'>
                                            <button className='text-[0.8em] mr-2 text-red-500' onClick={()=>removeRow(index)} ><FaX /></button>
                                            {index + 1}.
                                        </td>
                                        <td className='px-1 py-1'>
                                            <textarea value={item.description} 
                                                onChange={(e)=>editRow(index, 'description', e.target.value)}
                                                placeholder='Type here'
                                                className={`border rounded p-1 min-w-[250px]`} readOnly={validateSomething(title, item.description)}></textarea>
                                            {/* <input 
                                                type="text" 
                                                value={item.description} 
                                                onChange={(e)=>editRow(index, 'description', e.target.value)}
                                                placeholder='Type here'
                                                className={`border rounded p-1`} readOnly={validateSomething(title, item.description)} /> */}
                                        </td>
                                        <td className='px-2 py-1'>
                                            <div>
                                                <span className='text-[0.7em]'>{item.value.length < 1 && 'no accounts selected!'}</span>
                                                <div>
                                                    <button className='border rounded px-2 bg-gray-500 text-white' onClick={()=>selectValueClick(index)} >Set value</button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>
                                            <div className='flex items-center justify-center py-2'>
                                                <button onClick={()=>addRow(index)} ><FaPlus /></button>    
                                            </div>
                                        </td>
                                    </tr>
                                    </React.Fragment>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='p-2 flex justify-end'>
                <button className='btn-primary' onClick={saveClick} >Save</button>
            </div>
        </Modal>
        <TrialBalanceAccountPicker 
            title={title}
            rowTitle={selectedRowTitle}
            open={pickerModal} 
            close={()=>setPickerModal(false)} 
            accounts={accountsPicker} 
            setAccounts={setAccountsPicker} 
            confirm={pickerModalConfirm}
            reports={reports}
            selectedFormula={selectedRowFormula} />
        </>
    );
}

export default SubReports;