import React, { useEffect, useRef, useState } from 'react';
import Modal from '../Components/Modal';
import { useContext } from 'react';
import { LedgerSheetContext } from '../context/LedgerSheetContext';
import AccountPicker from '../Components/AccountPicker';
import SubledgerPicker from '../Components/SubledgerPicker';
import ReactDataSheet from 'react-datasheet';
import { showToast } from '../utils/toastNotifications';
import axios from 'axios';

function DateInput({ index }) {
    const { inputTax, setInputTax } = useContext(LedgerSheetContext);
    const value = inputTax[index]?.[1]?.value || ''; // Safeguard against undefined indices

    function dateChange(e) {
        const newGrid = inputTax.map((row) => [...row]);
        if (newGrid[index] && newGrid[index][1]) {
            newGrid[index][1].value = e.target.value;
            newGrid[index][1].isInternalChange = true; // Mark as an internal change
            setInputTax(newGrid);
        }
    }

    return (
        <input
            type="date"
            value={value}
            onChange={dateChange}
            min="1900-01-01"
            max="2100-12-31"
            autoFocus
        />
    );
}

function InputTaxModal({ show=false, close=()=>{} }) {
    const { pushInputTaxToSelectedRow, selectedRow, grid, inputTax, setInputTax, inputTaxHeader } = useContext(LedgerSheetContext);
    const [account, setAccount] = useState(null);
    const [slCode, setSLCode] = useState('');
    const [name, setName] = useState(''); // refers to subledger name
    const [id, setId] = useState('');
    const [type, setType] = useState('dr');
    const [addRows, setAddRows] = useState(20);
    const table = useRef();

    // useEffect(()=>{
    //     if(inputTax.length === 1){
    //         pushNewRows();
    //     }
    // }, []);

    useEffect(()=>{
        // on open modal
        if(show){
            // check if there is input tax data on this row
            const rowdata = grid[selectedRow - 1];
            if(rowdata[9].value.length > 0){
                // render input tax data
                setAccount({ code: rowdata[9].value[0].ledger.code, name: rowdata[9].value[0].ledger.name });
                setSLCode(rowdata[9].value[0].subledger.slCode);
                setName(rowdata[9].value[0].subledger.name);
                setId(rowdata[9].value[0].subledger._id);
                setType(rowdata[5].value ? 'dr': 'cr');
                const displayrows = rowdata[9].value.map((m, index)=>([
                    { value: index + 1, width: '50px', readOnly: true },
                    { value: m.date, component: <DateInput index={index + 1} /> },
                    { value: m.tin },
                    { value: m.registeredName },
                    { value: m.supplierName },
                    { value: m.supplierAddress },
                    { value: m.grossPurchase },
                    { value: m.exemptPurchase },
                    { value: m.zeroRatePurchase },
                    { value: m.amountOfTaxablePurchase },
                    { value: m.servicesPurchase },
                    { value: m.capitalGoods },
                    { value: m.goodsOtherThanCapital },
                    { value: m.inputTaxAmount },
                    { value: m.grossTaxablePurchase }
                ]));
                setInputTax([inputTaxHeader, ...displayrows]);
            }else{
                // set default values
                setAccount({ code: '19902060', name: 'INPUT TAX'});
                setSLCode('5052');
                setName('BIR- INPUT VAT RECEIVABLE');
            }
        }else{
            // clear modal
            setAccount(null);
            setSLCode('');
            setName('');
            setSLCode('');

            // need to wait for header to be inserted before pushing new rows
            // setInputTax([inputTaxHeader]);
            // pushNewRows();
            inputTaxRowsReset();
            // console.log(inputTax)
        }
    }, [show]);

    function saveClick(){
        let rows = inputTax.slice(1);
        // remove empty
        rows = rows.filter(f=> !!f[1].value && !!f[2].value && !!f[3].value && !!f[6].value);
        console.log(rows)
        // input check
        if(!account || !slCode || rows.length <= 0){
            showToast("Please enter tax information");
            return;
        }
        // parse to alphalist
        const inputTaxList = rows.map(m=>({ 
            ledger: { code: account.code, name: account.name },
            subledger: { slCode: slCode, name: name, _id: id },
            date: m[1].value,
            tin: m[2].value,
            registeredName: m[3].value,
            supplierName: m[4].value,
            supplierAddress: m[5].value,
            grossPurchase: toFloat(m[6].value ? m[6].value.toFixed(2) : 0),
            exemptPurchase: toFloat(m[7].value ? m[7].value.toFixed(2) : 0),
            zeroRatePurchase: toFloat(m[8].value ? m[8].value.toFixed(2) : 0),
            amountOfTaxablePurchase: toFloat(m[9].value ? m[9].value.toFixed(2) : 0),
            servicesPurchase: toFloat(m[10].value ? m[10].value.toFixed(2) : 0),
            capitalGoods: toFloat(m[11].value ? m[11].value.toFixed(2) : 0),
            goodsOtherThanCapital: toFloat(m[12].value ? m[12].value.toFixed(2) : 0),
            inputTaxAmount: toFloat(m[13].value ? m[13].value.toFixed(2) : 0),
            grossTaxablePurchase: toFloat(m[14].value ? m[14].value.toFixed(2) : 0)
        }))
        const inputTaxData = {
            ledger: account,
            subledger: { _id: id, slCode: slCode, name: name },
            alphaList: inputTaxList,
            type: type
        };
        // parse to ledger row
        pushInputTaxToSelectedRow(inputTaxData);
        // reset
        setAccount(null);
        setSLCode('');
        setName('');
        setSLCode('');
        setInputTax([inputTaxHeader]);
        close();
    }

    const toFloat = (value) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed; // return 0 if NaN
    };

    function inputTaxRowsReset(){
        const newRows = [inputTaxHeader];
        for(let i = 0; i < addRows; i++){
            newRows.push([
                { value: i + 1, width: '50px', readOnly: true },
                { value: '', component: <DateInput index={i + 1} /> },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' }
            ]);
        }
        setInputTax(newRows);
    }

    function pushNewRows() {
        const newRows = [];
        for(let i = 0; i < addRows; i++){
            newRows.push([
                { value: inputTax.length + i, width: '50px', readOnly: true },
                { value: '', component: <DateInput index={inputTax.length + i} /> },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' }
            ]);
        }
        setInputTax((prev)=>[...prev, ...newRows]);
    }

    
    /**
     * this feature is added for deleting date functionality, since date is seperate component embedded inside cells
     * this is not affected by deleting contents date field, nor clearing date on component itself,
     * in case of performance issues due to handleSelect function tracking cells selection:
     * remove the section on handleSelect that normalized and tracks selected cells
    */
    const [selectedCells, setSelectedCells] = useState([]);
    // Handle Delete Key
    useEffect(() => {
    const handleKeyDown = (event) => {
        // to handle delete on some fields with component as value
        if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedCells.length > 0) {
            for(let i = 0; i < selectedCells.length; i++){
            // specifically clears column 1 (date) since its a seperate component embeded in ledger sheet
            if(selectedCells[i].col === 1 && selectedCells[i].row != 0){
                const newGrid = [...inputTax];
                newGrid[selectedCells[i].row][selectedCells[i].col] = { ...newGrid[selectedCells[i].row][selectedCells[i].col], value: "" };
                setInputTax(newGrid);
            }
            }
        }
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
    };
    }, [selectedCells]);

    const handleCellsChanged = async (changes) => {
        // check if tin is updated
        for(let i = 0; i < changes.length; i++){
            // console.log(changes);
            if(changes[i].col === 2){
                if(changes[i].value){
                    // search for tin
                    const response = await axios.get(`/entries/tin/${changes[i].value}`);
                    if(response.data.length > 0){
                        changes[i].value = response.data[0].tin;
                        changes.push({ row: changes[i].row, col: 3, value: response.data[0].registeredName });
                        changes.push({ row: changes[i].row, col: 4, value: response.data[0].name });
                        changes.push({ row: changes[i].row, col: 5, value: response.data[0].address });
                    }
                }

            }
        }
        const newGrid = inputTax.map((row) => [...row]); // Clone the grid to avoid direct state mutation
        changes.forEach(({ row, col, value }) => {
            if (col === 1) {
                if (!value) return; // Skip empty date values
                newGrid[row][col] = { ...newGrid[row][col], value };
                return;
            }
        
            if (col >= 2 && col <= 5) {
                newGrid[row][col] = { ...newGrid[row][col], value };
                return;
            }
        
            if (value === "") {
                newGrid[row][col] = { ...newGrid[row][col], value };
                return;
            }
        
            const numericValue = parseFloat(value) || 0;
            newGrid[row][col] = { ...newGrid[row][col], value: numericValue };
        
            // Get current row values with defaulting empty strings to zero
            const exemptPurchase = parseFloat(newGrid[row][7]?.value || 0);
            const zeroRatePurchase = parseFloat(newGrid[row][8]?.value || 0);
            const amountOfTaxablePurchase = parseFloat(newGrid[row][9]?.value || 0);
            const servicesPurchase = parseFloat(newGrid[row][10]?.value || 0);
            const capitalGoods = parseFloat(newGrid[row][11]?.value || 0);
            const goodsOtherThanCapital = parseFloat(newGrid[row][12]?.value || 0);
        
            // Calculate and round to 2 decimal places
            const grossTaxablePurchase = parseFloat((servicesPurchase + capitalGoods + goodsOtherThanCapital).toFixed(2));
            const calculatedInputTaxAmount = parseFloat((0.12 * grossTaxablePurchase).toFixed(2));
            const grossPurchase = parseFloat((exemptPurchase + zeroRatePurchase + amountOfTaxablePurchase + calculatedInputTaxAmount).toFixed(2));
        
            // Update dependent cells
            newGrid[row][6] = { ...newGrid[row][6], value: grossPurchase }; // Gross Purchase
            newGrid[row][13] = { ...newGrid[row][13], value: calculatedInputTaxAmount }; // Input Tax Amount
            newGrid[row][14] = { ...newGrid[row][14], value: grossTaxablePurchase }; // Gross Taxable Purchase
        });
        
        // Update the grid state
        setInputTax(newGrid);
    };

    const handleSelect = ({ start, end }) => {
        // tracks selected cells with normalization
        const minRow = Math.min(start.i, end.i);
        const maxRow = Math.max(start.i, end.i);
        const minCol = Math.min(start.j, end.j);
        const maxCol = Math.max(start.j, end.j);

        let selected = [];
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                selected.push({ row, col });
            }
        }
        setSelectedCells(selected);
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
    
    return (
        <Modal show={show} closeCallback={close}>
            <div className='flex-1 flex-col p-4 border-t border-b text-[0.8em]'>
                <div className='flex mb-4'>
                    <div className='mr-4'>
                        <span>Ledger</span>
                        <AccountPicker selectedAccount={account} setSelectedAccount={setAccount} className={'py-2'} />
                    </div>
                    <div className='mr-4 min-w-[200px] z-[20]'>
                        <span>Subledger</span>
                        <SubledgerPicker slCode={slCode} setSLCode={setSLCode} name={name} setName={setName} id={id} setId={setId} />
                    </div>
                    <div className='mr-4 flex items-center'>
                        <label className='flex items-center mr-4'>
                        <input type="radio" className='mr-1' checked={type==='dr'} onChange={()=>setType('dr')} />Debit</label>
                        <label className='flex items-center mr-4'>
                        <input type="radio" className='mr-1' checked={type==='cr'} onChange={()=>setType('cr')} />Credit</label>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div className='flex justify-end mb-2'>
                        <div>
                            <input type="number" className='w-[100px] border p-1 rounded mr-2' value={addRows} onChange={(e)=>setAddRows(e.target.value)} />
                            <button type='button' className='bg-green-500 text-white p-1 rounded'onClick={pushNewRows}>Add rows</button>
                        </div>
                    </div>
                    <div className='overflow-x-scroll'>
                        <div className='w-[1455px]'>
                            <div className='h-[50vh] overflow-y-scroll' ref={table}>
                                <ReactDataSheet 
                                    className='relative z-[9]' 
                                    onSelect={handleSelect}
                                    data={inputTax.map(row => row.filter(cell => cell.visible !== false))} 
                                    valueRenderer={(cell) => cell.value} 
                                    onCellsChanged={handleCellsChanged} />
                            </div>
                            <div className='flex text-center border-t bg-[#008000] text-white mb-1'>
                                <div className='border-r p-1 max-w-[50px]  min-w-[50px] text-center border-l'></div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'></div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'></div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'></div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'></div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>TOTAL</div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[6].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[7].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}  
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[8].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[9].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[10].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[11].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[12].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[13].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                                <div className='border-r p-1 max-w-[100px] min-w-[100px]'>
                                    {inputTax.map(m=>m[14].value).slice(1).filter(f=>!isNaN(parseFloat(f))).map(m=>parseFloat(m.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='p-4 flex items-center justify-center'>
                <button type='button' className='bg-green-500 text-white px-2 py-1 rounded' onClick={saveClick}>Save</button>
            </div>
        </Modal>
    );
}

export default InputTaxModal;