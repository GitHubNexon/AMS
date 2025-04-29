import React, { createContext, useEffect, useRef, useState } from 'react';
import LedgerInput from '../Components/LedgerInput';
import SubledgerInput from '../Components/SubledgerInput';
import { showToast } from '../utils/toastNotifications';
import CurrencyInput from '../Components/CurrencyInput';
import { currencyStringToNumber, numberToCurrencyString } from '../helper/helper';
import { set } from 'date-fns';

/**
 * context mainly for LedgerSheet component with shared logic on
 * LedgerInput, SubledgerInput, JournalModal, ReceiptModal, and PaymentModal component
 * controls rendering of items in ledgers sheet
 */
export const LedgerSheetContext = createContext();

const header =  [
    { value: "#", width: "40px", readOnly: true },
    { value: "LEDGER CODE", width: '120px', readOnly: true },
    { value: "LEDGER", width: '300px', readOnly: true },
    { value: "SL CODE", width: '120px', readOnly: true },
    { value: "SUBLEDGER", width: '300px', readOnly: true },
    { value: "DEBIT", width: '120px', readOnly: true },
    { value: "CREDIT", width: '120px', readOnly: true },
    { value: "DESCRIPTION", width: '300px', readOnly: true },
    { value: "", visible: false},
    { value: "", visible: false},
    { value: "", visible: false},
    { value: "", visible: false},
];

const inputTaxHeader = [
    { value: 'No', readOnly: true, type: "header", width: '50px' },
    { value: 'Date', readOnly: true, type: "header", width: '100px' },
    { value: 'TIN', readOnly: true, type: "header", width: '100px' },
    { value: 'Registered Name', readOnly: true, type: "header", width: '100px' },
    { value: 'Supplier Name', readOnly: true, type: "header", width: '100px' },
    { value: 'Supplier Address', readOnly: true, type: "header", width: '100px' },
    { value: 'Gross Purchase', readOnly: true, type: "header", width: '100px' },
    { value: 'Exempt Purchase', readOnly: true, type: "header", width: '100px' },
    { value: 'Zero Rate Purchase', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Taxable Purchase', readOnly: true, type: "header", width: '100px' },
    { value: 'Services Purchase', readOnly: true, type: "header", width: '100px' },
    { value: 'Capital Goods', readOnly: true, type: "header", width: '100px' },
    { value: 'Goods other than Capital', readOnly: true, type: "header", width: '100px' },
    { value: 'Input Tax Amount', readOnly: true, type: "header", width: '100px' },
    { value: 'Gross Taxable Purchase', readOnly: true, type: "header", width: '100px' }            
];

const outputTaxHeader = [
    { value: 'No', readOnly: true, type: "header", width: '50px' },
    { value: 'Date', readOnly: true, type: "header", width: '100px' },
    { value: 'TIN', readOnly: true, type: "header", width: '100px' },
    { value: 'Registered Name', readOnly: true, type: "header", width: '100px' },
    { value: 'Customer Name', readOnly: true, type: "header", width: '100px' },
    { value: 'Customer Address', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Gross Sales', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Exempt Sales', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Zero Rate Sales', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Taxable Sales', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Output Tax', readOnly: true, type: "header", width: '100px' },
    { value: 'Amount of Gross Taxable Sales', readOnly: true, type: "header", width: '100px' }            
];

export function LedgerSheetContextProvider({ children }){

    // reference for table (can be used in dynamic styling but not implemented yet)
    const table = useRef();

    // holds numer of row per add
    const [addRows, setAddRows] = useState(20);
    
    // grid is displayed on ui
    const [grid, setGrid] = useState([header]);

    const [totalDebit, setTotalDebit] = useState(0.00);
    const [totalCredit, setTotalCredit] = useState(0.00); 

    const [inputTax, setInputTax] = useState([inputTaxHeader]);
    const [outputTax, setOutputTax] = useState([outputTaxHeader]);

    /**
     * Major issue on moving rows, will not include data on taxes and will be cleared on database on clear
     */
    useEffect(() => {
        if (grid.length <= 1) return;

        // Calculate the total debit
        const totalDebit = grid
        .filter((f) => {
            let n = 0;
            if(typeof f[5].value === "string"){
                n = currencyStringToNumber(f[5].value);
            }else{
                n = f[5].value;
            }
            return n > 0;
        })
        .map((m) => {
            return typeof m[5].value === "string" ? currencyStringToNumber(m[5].value) : m[5].value;
        })
        .reduce((pre, cur) => pre + cur, 0)
        .toFixed(2); // Ensure 2 decimal places
    
        // Calculate the total credit
        const totalCredit = grid
        .filter((f) => {
            let n = 0;
            if(typeof f[6].value === "string"){
                n = currencyStringToNumber(f[6].value);
            }else{
                n = f[6].value;
            }
            return n > 0;
        })
        .map((m) => {
            return typeof m[6].value === "string" ? currencyStringToNumber(m[6].value) : m[6].value;
        })
        .reduce((pre, cur) => pre + cur, 0)
        .toFixed(2); // Ensure 2 decimal places
    
        // Update state
        setTotalDebit(parseFloat(totalDebit)); // Convert back to number if needed
        setTotalCredit(parseFloat(totalCredit)); // Convert back to number if needed
    }, [grid, inputTax, outputTax]);
    
    // on read mode pre load existing data
    function preload(data){
        const rows = data.map((item, index) => [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {index + 1}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, index + 1)} >+</button> 
                    </span>,
                width: '35px', readOnly: true
            },
            { value: item.ledger.code, width: "100px", component: <LedgerInput value={item.ledger.code} index={index + 1} /> },
            { value: item.ledger.name, width: '250px', component: <LedgerInput value={item.ledger.name} index={index + 1} /> },
            { value: item.subledger.slCode, width: '100px', component: <SubledgerInput value={item.subledger.slCode} index={index + 1} /> },
            { value: item.subledger.name, width: '250px', component: <SubledgerInput value={item.subledger.name} index={index + 1} /> },
            { value: typeof item.dr === "number" ? numberToCurrencyString(item.dr) : item.dr, width: '100px' },
            { value: typeof item.cr === "number" ? numberToCurrencyString(item.cr) : item.cr, width: '100px' },
            { value: item.description, width: '200px' },
            { value: item.wt, visible: false},
            { value: item.it, visible: false},
            { value: item.od, visible: false},
            { value: item.ot, visible: false},

        ]);
        setGrid([header, ...rows]);
    }

    // function to push new rows to grid
    function pushToGrid(data){
        console.log("push", data);
        // seperate upper portion with values
        const upper = grid.filter(f=>!!f[1].value);        
        // generate new rows
        const rows = data.map((item, index) => [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {upper.length + index}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, upper.length + index)} >+</button> 
                    </span>, 
                width: '35px', readOnly: true
            },
            { value: item.ledger.code, width: "100px", component: <LedgerInput value={item.ledger.code} index={upper.length + index} /> },
            { value: item.ledger.name, width: '250px', component: <LedgerInput value={item.ledger.name} index={upper.length + index} /> },
            { value: item.subledger.slCode, width: '100px', component: <SubledgerInput value={item.subledger.slCode} index={upper.length + index} /> },
            { value: item.subledger.name, width: '250px', component: <SubledgerInput value={item.subledger.name} index={upper.length + index} /> },
            { value: item.dr, width: '100px' },
            { value: item.cr, width: '100px' },
            { value: item.description, width: '200px' },
            { value: item.wt, visible: false},
            { value: item.it, visible: false},
            { value: item.od, visible: false},
            { value: item.ot, visible: false},

        ]);
        // maintain bottom empty rows
        const lastindex = upper.length + rows.length + 1;
        const remainingEmpty = grid.length - upper.length;
        const bottom = [];
        for(let i = 0; i < remainingEmpty; i++){
            bottom.push([
                { 
                    value: 
                        <span className='flex relative text-left'>
                            {lastindex + i}.
                            <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, lastindex + i)} >+</button> 
                        </span>, 
                    width: '35px', readOnly: true
                },
                { value: "", width: '100px', component: <LedgerInput index={lastindex + i - 1} /> },
                { value: "", width: '250px', component: <LedgerInput index={lastindex + i - 1} /> },
                { value: "", width: '100px', component: <SubledgerInput index={lastindex + i - 1} /> },
                { value: "", width: '250px', component: <SubledgerInput index={lastindex + i - 1} /> },
                { value: "", width: '100px' },
                { value: "", width: '100px' },
                { value: "", width: '200px' },
                { value: "", visible: false },
                { value: "", visible: false },
                { value: "", visible: false },
                { value: "", visible: false },
            ]);
        }
        // build grid with new rows appended on next available row
        setGrid([...upper, ...rows, ...bottom]);
    }

    // function to edit all description on grid
    function setDescriptionAll(desc){
        // console.log(grid);
        // Create a new copy of the data array to avoid mutating the state directly
        const updatedData = grid.map(innerArray => {
            // Check if this inner array is not the header by looking at the first element's `value`
            if (innerArray[1].value !== "LEDGER CODE") {
                const newArray = [...innerArray]; // Make a shallow copy of the inner array
                if (newArray[6]) { // Check if the 7th object exists
                    // only edit rows with ledgers filled out
                    if(newArray[1].value != '' && newArray[2].value != '' && newArray[3].value != '' && newArray[4].value != ''){
                        newArray[7] = { ...newArray[7], value: desc }; // Update the value
                    }
                }
                return newArray;
            }
            return innerArray; // Return the original array if it's the header
        });
        setGrid(updatedData);
    }

    // formats current grid to ledgers
    function getLedgers() {
        // Remove headers
        const data = grid.slice(1);
        // console.log(data);
        let returnData = [];
        // Remove first column and filter out empty rows
        const filteredData = data.map(m => m.slice(1)).filter(f => f.some(c => c.value));
        for (let index = 0; index < filteredData.length; index++) {
            const row = filteredData[index];
            // Check if there is incomplete data
            const isIncomplete = !row[0].value || !row[1].value || !row[2].value || !row[3].value || (!row[4].value && !row[5].value);
            if (isIncomplete) {
                showToast(`Incomplete data on row ${index + 1}`, 'warning');
                returnData = false;
                break; // Exit the loop if incomplete data is found
            }
            let l = {
                type: row[4].value ? 'DR' : 'CR',
                ledger: { code: row[0].value, name: row[1].value },
                subledger: { slCode: row[2].value, name: row[3].value },
                dr: typeof row[4].value === "string" ? currencyStringToNumber(row[4].value) : row[4].value,
                cr: typeof row[5].value === "string" ? currencyStringToNumber(row[5].value) : row[5].value,
                description: row[6].value,
                wt: row[7] && row[7].value ? row[7].value : '',
                it: row[8] && row[8].value ? row[8].value : '',
                od: row[9] && row[9].value ? row[9].value : '',
                ot: row[10] && row[10].value ? row[10].value : '',
            };
            returnData.push(l);
        }
        console.log('to save', returnData);
        return returnData;
    }    
    
    // gets ledgers without checking
    function getRawLedgers() {
        // Remove headers
        const data = grid.slice(1);
        // console.log(data);
        let returnData = [];
        // Remove first column and filter out empty rows
        const filteredData = data.map(m => m.slice(1)).filter(f => f.some(c => c.value));
        for (let index = 0; index < filteredData.length; index++) {
            const row = filteredData[index];
            // Check if there is incomplete data
            // const isIncomplete = !row[0].value || !row[1].value || !row[2].value || !row[3].value || (!row[4].value && !row[5].value);
            // if (isIncomplete) {
            //     showToast(`Incomplete data on row ${index + 1}`, 'warning');
            //     returnData = false;
            //     break; // Exit the loop if incomplete data is found
            // }
            let l = {
                type: row[4].value ? 'DR' : 'CR',
                ledger: { code: row[0].value, name: row[1].value },
                subledger: { slCode: row[2].value, name: row[3].value },
                dr: typeof row[4].value === "string" ? currencyStringToNumber(row[4].value) : row[4].value,
                cr: typeof row[5].value === "string" ? currencyStringToNumber(row[5].value) : row[5].value,
                description: row[6].value,
                wt: row[7] && row[7].value ? row[7].value : '',
                it: row[8] && row[8].value ? row[8].value : '',
                od: row[9] && row[9].value ? row[9].value : '',
                ot: row[10] && row[10].value ? row[10].value : '',
            };
            returnData.push(l);
        }
        console.log('to save', returnData);
        return returnData;
    }   

    // inserts empty rows on grid
    function insertEmptyRow() {
        const newGridRows = [];
        // const newLedgers = [];
        for (let i = 0; i < addRows; i++) {
            newGridRows.push([
                { 
                    value: 
                        <span className='flex relative text-left'>
                            {grid.length + i}.
                            <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, grid.length + i)} >+</button> 
                        </span>, 
                    width: '35px', readOnly: true
                },
                { value: "", width: '100px', component: <LedgerInput index={grid.length + i} /> },
                { value: "", width: '250px', component: <LedgerInput index={grid.length + i} /> },
                { value: "", width: '100px', component: <SubledgerInput index={grid.length + i} /> },
                { value: "", width: '250px', component: <SubledgerInput index={grid.length + i} /> },
                { value: "", width: '100px' },
                { value: "", width: '100px' },
                { value: "", width: '200px' },
                { value: "", visible: false},
                { value: "", visible: false},
                { value: "", visible: false},
                { value: "", visible: false},
            ]);
        }
        setGrid((prevGrid) => [...prevGrid, ...newGridRows]);
    }

    // re align indexes with grid
    useEffect(() => {
        if (grid.length > 1) {
            const updatedGrid = grid.map((row, i) => {
                return row.map((cell, j) => {
                    // Skip the first row for numbering
                    if (j === 0 && i > 0) {
                        return {
                            ...cell, // Spread other properties of the cell
                            value: (
                                <span className='flex relative text-left'>
                                    {i}. {/* Start numbering from 1 for the second row */}
                                    <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e) => plusClick(e, i)}>+</button>
                                </span>
                            )
                        };
                    } else if (j === 0 && i === 0) {
                        // The first row does not show any number
                        return {
                            ...cell, // Spread other properties of the cell
                            value: (
                                <span className='flex relative text-left'>
                                    {/* Empty value for the first row */}
                                    <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e) => plusClick(e, i)}>+</button>
                                </span>
                            )
                        };
                    }
                    // Update `index` in the components dynamically
                    if (cell.component && (cell.component.type === LedgerInput || cell.component.type === SubledgerInput)) {
                        return {
                            ...cell,
                            component: React.cloneElement(cell.component, { index: i })  // Dynamically pass the row index to the component
                        };
                    }
                    return cell; // Return the other cells as is
                });
            });
            // Compare the old grid with the updated grid to check if there's a real change
            const gridsAreEqual = JSON.stringify(grid) === JSON.stringify(updatedGrid);
            // Only update the grid if the new grid is different from the current grid
            if (!gridsAreEqual) {
                setGrid(updatedGrid);  // Update the grid only if it's changed
            }
        }
    }, [grid]); // Depend on grid to track changes
    
    // insert empty row on passed index
    function insertEmptyRowAfter(index) {
        const newGridRow = [
            { 
                value: (
                    <span className='flex relative text-left'>
                        {index + 1}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e) => plusClick(e, index)}>+</button> 
                    </span>
                ), 
                width: '35px', 
                readOnly: true
            },
            { value: "", width: '100px', component: <LedgerInput index={index} /> },
            { value: "", width: '250px', component: <LedgerInput index={index} /> },
            { value: "", width: '100px', component: <SubledgerInput index={index} /> },
            { value: "", width: '250px', component: <SubledgerInput index={index} /> },
            { value: "", width: '100px' },
            { value: "", width: '100px' },
            { value: "", width: '200px' },
            { value: "", visible: false},
            { value: "", visible: false},
            { value: "", visible: false},
            { value: "", visible: false},
        ];
        // Insert the new row at the specified index
        setGrid((prevGrid) => {
            const updatedGrid = [...prevGrid];
            updatedGrid.splice(index, 0, newGridRow);  // Insert the single row at the given index
            return updatedGrid;
        });
    }
    

    const [selectedRow, setSelectedRow] = useState(1);
    const [topPos, setTopPos] = useState(0); // captures mouse position on plus icon click to set row options position

    // adds empty row
    function plusClick(e, index){
        e.preventDefault();
        setSelectedRow(index === 0 ? 2 : index + 1);
        setTopPos(e.pageY);
    }

    function newRowBelow(){
        insertEmptyRowAfter(selectedRow);
    }


    // untested
    function removeRow(){
        const updatedGrid = grid.filter((row, i) => i !== selectedRow - 1);
        setGrid(updatedGrid);
    }

    // back to header + 20 empty rows
    function reset(){
        const newGridRows = [];
        for (let i = 0; i < addRows; i++) {
            newGridRows.push([
                { 
                    value: 
                        <span className='flex relative text-left'>
                            {1 + i}.
                            <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, 1 + i)} >+</button> 
                        </span>, 
                    width: '35px', readOnly: true
                },
                { value: "", width: '100px', component: <LedgerInput index={1 + i} /> },
                { value: "", width: '250px', component: <LedgerInput index={1 + i} /> },
                { value: "", width: '100px', component: <SubledgerInput index={1 + i} /> },
                { value: "", width: '250px', component: <SubledgerInput index={1 + i} /> },
                { value: "", width: '100px' },
                { value: "", width: '100px' },
                { value: "", width: '200px' },
                { value: "", visible: false},
                { value: "", visible: false},
                { value: "", visible: false},
                { value: "", visible: false},
            ]);
        }
        setGrid([header, ...newGridRows]);
    }

    function pushWithHoldingTaxSelectedRow(dataToPush, calculatedTax) {
        const obj = dataToPush[0];
        const index = selectedRow - 1;
        if (index < 0 || index >= grid.length) {
            console.error("Invalid selected row index:", selectedRow);
            return;
        }    
        const newData = [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {index}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e) => plusClick(e, index)}>+</button> 
                    </span>, 
                width: '35px', readOnly: true
            },
            { value: obj.ledger.code, width: "100px", component: <LedgerInput value={obj.ledger.code} index={index} /> },
            { value: obj.ledger.name, width: '250px', component: <LedgerInput value={obj.ledger.name} index={index} /> },
            { value: obj.subledger.slCode, width: '100px', component: <SubledgerInput value={obj.subledger.slCode} index={index} /> },
            { value: obj.subledger.name, width: '250px', component: <SubledgerInput value={obj.subledger.name} index={index} /> },
            { value: obj.dr ? numberToCurrencyString(calculatedTax) : null, width: '100px' },
            { value: obj.cr ? numberToCurrencyString(calculatedTax) : null, width: '100px' },
            { value: "", width: '250px' },
            { value: obj.wt, visible: false }, // wt
            { value: "", visible: false}, // it
            { value: "", visible: false}, // od
            { value: "", visible: false}, // ot
           
        ];
        // Update grid
        const updatingGrid = [...grid];
        updatingGrid[index] = newData; 
        setGrid(updatingGrid);
        console.log("Updated grid:", updatingGrid);
    }

    function pushOtherDeductionToSelectedRow(obj){
        const index = selectedRow - 1;
        if (index < 0 || index >= grid.length) {
            console.error("Invalid selected row index:", selectedRow);
            return;
        }    
        const newData = [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {index}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e) => plusClick(e, index)}>+</button> 
                    </span>, 
                width: '35px', readOnly: true
            },
            { value: obj.ledger.code, width: "100px", component: <LedgerInput value={obj.ledger.code} index={index} /> },
            { value: obj.ledger.name, width: '250px', component: <LedgerInput value={obj.ledger.name} index={index} /> },
            { value: obj.subledger.slCode, width: '100px', component: <SubledgerInput value={obj.subledger.slCode} index={index} /> },
            { value: obj.subledger.name, width: '250px', component: <SubledgerInput value={obj.subledger.name} index={index} /> },
            { value: obj.type === 'dr' ? numberToCurrencyString(obj.amount) : null, width: '100px' },
            { value: obj.type === 'cr' ? numberToCurrencyString(obj.amount) : null, width: '100px' },
            { value: "", width: '250px' },
            { value: "", visible: false }, // wt
            { value: "", visible: false }, // it
            { value: obj, visible: false }, // od
            { value: "", visible: false}, // ot

        ];
        // Update grid
        const updatingGrid = [...grid];
        updatingGrid[index] = newData; 
        setGrid(updatingGrid);
    }

    function pushInputTaxToSelectedRow(obj){
        const index = selectedRow - 1;
        const inputTaxTotal = obj.alphaList.map(m=>m.inputTaxAmount).reduce((pre,cur)=>pre+cur,0);

        const newData = [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {index}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, index)} >+</button> 
                    </span>, 
                width: '35px', readOnly: true
            },
            { value: obj.ledger.code, width: "100px", component: <LedgerInput value={obj.ledger.code} index={index} /> },
            { value: obj.ledger.name, width: '250px', component: <LedgerInput value={obj.ledger.name} index={index} /> },
            { value: obj.subledger.slCode, width: '100px', component: <SubledgerInput value={obj.subledger.slCode} index={index} /> },
            { value: obj.subledger.name, width: '250px', component: <SubledgerInput value={obj.subledger.name} index={index} /> },
            { value: obj.type === "dr" ? numberToCurrencyString(inputTaxTotal) : null, width: '100px' },
            { value: obj.type === "cr" ? numberToCurrencyString(inputTaxTotal) : null, width: '100px' },
            { value: "", width: '250px' },
            { value: "", visible: false}, // wt
            { value: obj.alphaList, visible: false}, // it
            { value: "", visible: false}, // od
            { value: "", visible: false}, // ot
        ];

        let updatingGrid = grid;
        updatingGrid[index] = newData;

        setGrid(updatingGrid);
    }

    function pushOutputTaxToSelectedRow(obj){
        console.log(obj.alphaList);
        const index = selectedRow - 1;

        const outputTaxTotal = obj.alphaList.map(m=>m.outputTaxAmount).reduce((pre,cur)=>pre+cur,0);
        // const grandTotal = obj.alphaList.map(m=>m.grossTaxablePurchase).reduce((pre,cur)=>pre+cur,0);
        const newData = [
            { 
                value: 
                    <span className='flex relative text-left'>
                        {index}.
                        <button className='absolute left-[-20px] text-[1em] font-bold' onClick={(e)=>plusClick(e, index)} >+</button> 
                    </span>, 
                width: '35px', readOnly: true
            },
            { value: obj.ledger.code, width: "100px", component: <LedgerInput value={obj.ledger.code} index={index} /> },
            { value: obj.ledger.name, width: '250px', component: <LedgerInput value={obj.ledger.name} index={index} /> },
            { value: obj.subledger.slCode, width: '100px', component: <SubledgerInput value={obj.subledger.slCode} index={index} /> },
            { value: obj.subledger.name, width: '250px', component: <SubledgerInput value={obj.subledger.name} index={index} /> },
            { value: obj.type === "dr" ? numberToCurrencyString(outputTaxTotal) : null, width: '100px' },
            { value: obj.type === "cr" ? numberToCurrencyString(outputTaxTotal) : null, width: '100px' },
            { value: "", width: '250px' }, //description
            { value: "", visible: false}, //wt
            { value: "", visible: false},//it
            { value: "", visible: false},//od
            { value: obj.alphaList, visible: false}//ot
        ];
        let updatingGrid = grid;
        updatingGrid[index] = newData;
        setGrid(updatingGrid);
    }

   

    // update specific data on given coordinates
    function updateValueAt(row, col, value){
        console.log("trying to directly update this", row, col, value);
        // console.log(grid)
    }

    return (
        <LedgerSheetContext.Provider value={{
            addRows, setAddRows,
            grid, setGrid,
            insertEmptyRow,
            reset,
            preload,
            getLedgers,
            table,
            setDescriptionAll,
            pushToGrid,
            totalCredit,
            totalDebit,
            topPos, setTopPos, newRowBelow, pushInputTaxToSelectedRow, selectedRow,
            inputTax, setInputTax, inputTaxHeader,
            pushWithHoldingTaxSelectedRow,
            updateValueAt,
            pushOtherDeductionToSelectedRow,

            outputTax, setOutputTax, outputTaxHeader,
            pushOutputTaxToSelectedRow,

            removeRow,
            getRawLedgers
        }} >
            { children }
        </LedgerSheetContext.Provider>
    );
}