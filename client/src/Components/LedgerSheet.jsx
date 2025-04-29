import React, { useState, useEffect, useContext } from 'react';
import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import { LedgerSheetContext } from '../context/LedgerSheetContext';
import { RiFullscreenFill, RiFullscreenExitFill } from 'react-icons/ri';
import { numberToCurrencyString, currencyStringToNumber } from '../helper/helper';
import { showToast } from '../utils/toastNotifications';
import InputTaxModal from '../Pop-Up-Pages/InputTaxModal';
import InputTaxPicker from "./InputTaxPicker";
import OtherDeductionModal from './OtherDeductionModal';
import OutputTaxModal from "../Pop-Up-Pages/OutputTaxModal";

function LedgerSheet({fixW=null}) {

    const {
        addRows, setAddRows, 
        grid, setGrid, 
        insertEmptyRow, 
        reset, 
        totalCredit, totalDebit, 
        table, 
        topPos, setTopPos, 
        newRowBelow, 
        setInputTax,
        updateValueAt,
        removeRow,
    } = useContext(LedgerSheetContext); 

    // useEffect(()=>{
    //     // reset sheet
    //     return ()=>{
    //         console.log('reset');
    //         reset();
    //     };
    // }, []);

    const handleCellsChanged = (changes) => {

        // console.log(changes);
        // changes.forEach((row, col, value, oldValue)=>{
        //     console.log(row, col, value, oldValue)
        // });
        // ledger code, ledger, subledger code, subledger has seperate change handler on its component (LedgerInput, ) and must be ignored in here
        if(changes.length === 1 && [1, 2, 3, 4].includes(changes[0].col)){

            // console.log("deleting?", changes);

            changes.forEach((cell, col, row, value)=>{
                console.log(cell, col, row, value)
                if(!value && !cell.value){
                    console.log("updating", cell.value, 'to', value)
                    console.log(grid[cell.row][cell.col]);
                    updateValueAt(cell.row, cell.col, '')
                }
            });
            return;
        };
        // // on ledger code change populate ledger
        // if(changes.length > 1 && changes[0].col === 1){
        //     console.log('detected pasted values on ledgers code, must validate then populate ledger', changes);
        //     // 
        // }
        // // on ledger change populate ledger code
        // if(changes.length > 1 && changes[0].col === 2){
        //     console.log('detected pasted values on ledgers, must validate then populate ledger code');
        //     // 
        // }
        // // on subledger code change populate ledger
        // if(changes.length > 1 && changes[0].col === 3){
        //     console.log('detected pasted values on subledgers code, must validate then populate subledger');
        //     // 
        // }
        // // on subledger change populate ledger code
        // if(changes.length > 1 && changes[0].col === 4){
        //     console.log('detected pasted values on subledgers, must validate then populate subledger code');
        //     // 
        // }
        // detect changes on debit and credit make it number 
        for(let i = 0; i < changes.length; i++){
            if(changes[i].col === 5 || changes[i].col === 6){
                const converted = currencyStringToNumber(changes[i].value);
                if(isNaN(converted)){
                    changes[i].value = '';
                }else{
                    changes[i].value = numberToCurrencyString(converted);
                }
            }
        }
        const newGrid = grid.map((row) => [...row]);
            changes.forEach(({ row, col, value }) => {
            newGrid[row][col] = { ...newGrid[row][col], value };
        });
        setGrid(newGrid);
    };

    function addRowsClick(e) {
        e.preventDefault();
        insertEmptyRow();
    }

    const [isMinimized, setIsMinimized] = useState(false);

    function minmax(e){
        e.preventDefault();
        setIsMinimized(!isMinimized);
    }

    const [showRowOption, setShowRowOption] = useState(false);
    const [inputTaxModal, setInputTaxModal] = useState(false);
    const [outputTaxModal, setOutputTaxModal] = useState(false);
    const [inputTaxPickerModal, setInputTaxPickerModal] = useState(false);

    function closeInputTaxModalPicker(){
        setInputTaxPickerModal(false);
    }
    function closeOutputTaxModal(){
        setOutputTaxModal(false);
    }


    useEffect(()=>{
        if(topPos != 0){
            setShowRowOption(true);
        }
    }, [topPos]);

    function closeInputTaxModal(){
        setInputTaxModal(false);
        // clear input tax modal
        // setInputTax([]);
    }

    const handleSelect = ({ start, end }) => {
        // References to the containers
        const overflowYContainer = table.current; // Div with overflow-y-scroll
        const overflowXContainer = table.current?.parentElement?.parentElement; // Grandparent div with overflow-x-scroll
        if (!overflowXContainer || !overflowYContainer) return;
        // Get the table element
        const tableElement = overflowYContainer.querySelector("table"); // Find the actual table inside the container
        const selectedCell = tableElement?.rows[end.i]?.cells[end.j];
        if (!selectedCell) return;
        // Scroll to top if in the first row
        if (end.i === 0) return overflowYContainer.scrollTo({ top: 0, behavior: "smooth" });
        if (end.j === 0) return overflowXContainer.scrollTo({ left: 0, behavior: "smooth" });
        // Get the bounding rectangles
        const cellRect = selectedCell.getBoundingClientRect();
        const overflowXRect = overflowXContainer.getBoundingClientRect();
        const overflowYRect = overflowYContainer.getBoundingClientRect();
        // Scroll vertically if the cell is not visible in the y-container
        const verticalScrollRequired = cellRect.top < overflowYRect.top || cellRect.bottom > overflowYRect.bottom;
        if (verticalScrollRequired) {
            const scrollTopAdjustment = cellRect.top < overflowYRect.top
                ? overflowYContainer.scrollTop + (cellRect.top - overflowYRect.top)
                : overflowYContainer.scrollTop + (cellRect.bottom - overflowYRect.bottom);
            overflowYContainer.scrollTo({ top: scrollTopAdjustment, behavior: "smooth" });
        }
        // Scroll horizontally if the cell is not visible in the x-container
        const horizontalScrollRequired = cellRect.left < overflowXRect.left || cellRect.right > overflowXRect.right;
        if (horizontalScrollRequired) {
            const scrollLeftAdjustment = cellRect.left < overflowXRect.left
                ? overflowXContainer.scrollLeft + (cellRect.left - overflowXRect.left)
                : overflowXContainer.scrollLeft + (cellRect.right - overflowXRect.right);
            overflowXContainer.scrollTo({ left: scrollLeftAdjustment, behavior: "smooth" });
        }
    };

    const [otherDeductionModal, setOtherDeductionModal] = useState(false);

    function valueRender(cell){
        return cell.value;
    }

    return (
        <>
        <div className={`${isMinimized && 'absolute transparent h-[100%] w-[100%] top-0 left-0 p-5 z-50'}`}>
            <div className={`transition duration-500 flex flex-col ${isMinimized && 'bg-white h-[95%] p-5 rounded shadow-xl'}`}>
                <div className='flex items-center text-[0.8em]'>
                    <div className='mb-2 flex-1 flex justify-end mr-2'>
                        <div className='mr-2'>
                            <input type="number" className='border rounded w-[100px] mr-1 px-1' value={addRows} onChange={(e) => setAddRows(Number(e.target.value))} />
                            <button className='bg-green-600 px-1 rounded text-white' onClick={addRowsClick}>Add Rows</button>
                        </div>
                    </div>
                    <button className='p-1 text-[1.5em] mr-2' onClick={minmax} >{isMinimized ? <RiFullscreenFill /> : <RiFullscreenExitFill />}</button>
                </div>
                <div className='text-[0.8em] relative overflow-x-scroll'>
                    <div className='flex flex-col'>
                        <div className={`transition min-w-[1452px] duration-500 pl-[25px] ${isMinimized ? 'h-[60vh]' : 'h-[20vh]'} overflow-y-scroll`} ref={table}>
                            <div>
                                <div className='absolute top-0 left-0 z-[40] flex'>
                                    <div className='h-[27px] w-[25px] bg-white'></div>
                                    <div className='bg-[#008000] w-[35px] h-[27px]'></div>
                                </div>
                                <ReactDataSheet 
                                    className='w-[100%] min-w-[1420px] relative z-[9]' 
                                    data={grid.map(row => row.filter(cell => cell.visible !== false))} 
                                    onSelect={handleSelect}
                                    valueRenderer={valueRender} 
                                    onCellsChanged={handleCellsChanged} />                            
                            </div>
                        </div>
 
                        <div className='flex ml-[25px] text-center min-w-[1420px] overflow-x-hidden  text-white mb-1'>
                            <div className='min-w-[40px] border-r p-1  bg-[#008000]'></div>
                            <div className='w-[120px] border-r p-1 bg-[#008000]'></div>
                            <div className='w-[300px] border-r p-1 bg-[#008000]'></div>
                            <div className='w-[120px] border-r p-1 bg-[#008000]'></div>
                            <div className='w-[300px] border-r p-1 flex flex-col bg-[#008000]'>
                                <span className='text-end mr-2'>TOTAL:</span>
                                <span className='text-end mr-2'>DIFFERENCE:</span>
                            </div>
                            <div className={`w-[120px] border-r p-1 flex flex-col ${(totalDebit) - (totalCredit) != 0 && 'text-red-900'} bg-[#008000]`}>
                                <span className='w-[150px] text-start'>{ numberToCurrencyString(totalDebit) || 0.00 }</span>
                                <span className='w-[150px] text-start'>{ numberToCurrencyString((totalDebit) - (totalCredit)) }</span>
                            </div>
                            <div className={`w-[120px] border-r p-1 flex flex-col ${(totalCredit) - (totalDebit) != 0 && 'text-red-900'} bg-[#008000]`}>
                                <span className='w-[150px] text-start'>{ numberToCurrencyString(totalCredit) || 0.00 }</span>
                                <span className='w-[150px] text-start'>{ numberToCurrencyString((totalCredit) - (totalDebit)) }</span>
                            </div>
                            <div className='w-[300px] p-1 bg-[#008000]'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div 
            className={`
                p-2 bg-gray-100 absolute z-50 left-[35px] rounded shadow-lg border text-[0.8em] flex flex-col
                ${ showRowOption ? 'visible' : 'hidden' }
            `} 
            style={{top: topPos - 10}} 
            onMouseLeave={()=>{setShowRowOption(false); setTopPos(0)}} >
            <button type='button' className='bg-green-500 text-white px-2 py-1 rounded mb-2' onClick={()=>{setShowRowOption(false); setInputTaxPickerModal(true)}}>WithHolding tax</button>
            <button type='button' className='bg-green-500 text-white px-2 py-1 rounded mb-2' onClick={()=>{setShowRowOption(false); setInputTaxModal(true)}}>Input tax</button>
            <button type='button' className='bg-green-500 text-white px-2 py-1 rounded mb-2' onClick={()=>{setShowRowOption(false); setOutputTaxModal(true)}}>Output tax</button>
            <button type='button' className='bg-green-500 text-white px-2 py-1 rounded mb-2' onClick={()=>{setShowRowOption(false); setOtherDeductionModal(true)}} >Other deduction</button>
            <button type='button' className='bg-green-500 text-white px-2 py-1 rounded mb-2' onClick={newRowBelow}>Add row below</button>
            <button type='button' className='bg-gray-500 text-white px-2 py-1 rounded mb-2' onClick={removeRow}>Delete row</button>
        </div>
        <InputTaxModal show={inputTaxModal} close={closeInputTaxModal} />
        <InputTaxPicker show={inputTaxPickerModal} close={closeInputTaxModalPicker} />
        <OtherDeductionModal show={otherDeductionModal} close={()=>setOtherDeductionModal(false)} />
        <OutputTaxModal show={outputTaxModal} close={closeOutputTaxModal} />
        </>
    );
}

export default LedgerSheet;