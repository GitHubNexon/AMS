import React, { useEffect, useRef, useState } from 'react';
import Modal from '../Modal';
import { formatDateToYYYMMdd } from '../../helper/helper';
import axios from 'axios';
import { FaX } from 'react-icons/fa6';

function TrialBalanceAccountPicker({ title='', rowTitle='', open=false, close=()=>{}, accounts=[], setAccounts, confirm=()=>{}, reports=[], selectedFormula="" }) {

    const [rows, setRows] = useState([]);
    const [reportsOption, setReportsOption] = useState([]);
    const [selectedReportsOption, setSelectedReportsOption] = useState('');
    const [fieldOption, setFieldOption] = useState([]);
    const [selectedFieldOption, setSelectedFieldOption] = useState('');
    const [copyModal, setCopyModal] = useState(false);
    const [toCopy, setToCopy] = useState([]);
    const [vMode, setVMode] = useState("table");
    const [formula, setFormula] = useState("");
    const formulaInput = useRef();
    const [cursorPosition, setCursorPosition] = useState(null);

    // load current trial balance here
    useEffect(()=>{
        getTrialBalance();
    }, []);

    useEffect(()=>{
        // check if this is table of formula (formula is first)
        setFormula(selectedFormula);
        setVMode(selectedFormula ? "formula" : "table");
    }, [selectedFormula]);

    async function getTrialBalance(){
        try {
            const d = formatDateToYYYMMdd(new Date);
            const response = await axios.get(`/reports/fullTrialBalance/${d}/${d}`, { withCredentials: true });
            setRows(response.data);
        } catch (error) {
            // loading(false);
            console.error("Error fetching report:", error);
        }
    }

    function selectClick(item){
        if(vMode === "table"){
            const toAdd = {code: item.code, name: item.name, operateNext: 'add'}
            setAccounts([...accounts, toAdd]);
        }else if(vMode === "formula"){
            // setFormula(`${formula} {${item.code}},`);
            insertText(` {${item.code}}, `);
            formulaInput.current.focus();
        }
    }

    function operationChange(value, index) {
        // Update the `operateNext` property of the specific account
        setAccounts(prevAccounts => {
            const updatedAccounts = [...prevAccounts];
            updatedAccounts[index] = { ...updatedAccounts[index], operateNext: value };
            return updatedAccounts;
        });
    }

    function xClick(index) {
        // Remove the account at the specified index
        setAccounts(prevAccounts => prevAccounts.filter((_, i) => i !== index));
    }

    function confirmClick(){
        confirm(accounts, formula);
    }

    useEffect(()=>{
        if(selectedReportsOption){
            const sr = reports.filter((f)=>f._id === selectedReportsOption)[0];
            setFieldOption(sr.rows.map(m=>({description: m.description, id: m._id})));
        }else{
            setFieldOption([]);
        }
    }, [selectedReportsOption]);

    useEffect(()=>{
        if(selectedReportsOption){
            if(selectedFieldOption){
                const sr = reports.filter((f)=>f._id === selectedReportsOption)[0].rows;
                const sf = sr.filter((f)=>f._id === selectedFieldOption)[0];
                console.log(sf.value);
                setToCopy(sf.value);
            }else{
                setSelectedFieldOption([]);
            }
        }
    }, [selectedFieldOption]);

    function copyClick(){
        const rep = reports.map(m=>({title: m.title, id: m._id}));
        setReportsOption(rep);
        setCopyModal(true);
    }

    function confirmCopyClick(){
        if(vMode === "table"){
            setAccounts([...accounts, ...toCopy]);
        }else if(vMode === "formula"){
            const ro = reportsOption.filter(f=>f.id === selectedReportsOption)[0].title;
            const fo = fieldOption.filter(f=>f.id === selectedFieldOption)[0].description;
            const t = toCopy.map(m=>`${m.operateNext === "add" ? "+" : "-"} {${m.code}}`);
            const ft = 
`
# ${ro} - ${fo} #
(0 ${t.join(" ")})

`;
            // setFormula(`${formula} ${ft}`);
            insertText(` ${ft} `);
        }
        setReportsOption([]);
        setSelectedReportsOption('');
        setFieldOption([]);
        setSelectedFieldOption('');
        setCopyModal(false);
        setToCopy([]);
    }

    function switchToFormula(){
        setVMode("formula");
    }

    function switchToTable(){
        setVMode("table");
    }
    
    // Capture cursor position on input
    const handleInput = (event) => {
        setCursorPosition(event.target.selectionStart);
    };

    // Capture last cursor position when textarea loses focus
    const handleBlur = (event) => {
        setCursorPosition(event.target.selectionStart);
    };

    // Restore cursor position when textarea regains focus
    const handleFocus = () => {
        if (cursorPosition !== null) {
            setTimeout(() => {
                formulaInput.current.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        }
    };

    // Function to insert text at the last known cursor position
    const insertText = (insertText) => {
        if (formulaInput.current) {
            const start = formulaInput.current.selectionStart;
            const end = formulaInput.current.selectionEnd;

            // Insert text at the cursor position
            setFormula((prevFormula) => {
                const beforeCursor = prevFormula.slice(0, start);
                const afterCursor = prevFormula.slice(end);
                return beforeCursor + insertText + afterCursor;
            });

            // Update cursor position
            const newCursorPosition = start + insertText.length;
            setCursorPosition(newCursorPosition);

            // Restore focus & selection after insertion
            setTimeout(() => {
                formulaInput.current.focus();
                formulaInput.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
    };

    return (
        <>
        <Modal show={open} closeCallback={close} title={`${title} - ${rowTitle}`} >
            <div className='border-t border-b flex w-[96vw]'>
                <div className='flex-1 h-[75vh] overflow-y-scroll'>
                    <div className='text-[0.7em] relative'>
                        <table className='w-[100%]'>
                            <thead>
                                <tr className='border-b sticky top-0 bg-gray-100'>
                                    <th colSpan={3} className='p-2'>Select accounts from Trial Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    rows.map((item, index)=>
                                        <tr 
                                            key={index} 
                                            className={`
                                                    border-b hover:bg-gray-200 
                                                    ${
                                                        vMode === "table" && accounts.map(m=>m.code).includes(item.code) ? 
                                                        accounts.filter(f=>f.code === item.code)[0].operateNext === "add" ?
                                                        "bg-green-100" : "bg-orange-100"
                                                        : ""
                                                    }
                                                `} >
                                            <td className='border-r px-2 py-1' >
                                                <button className='bg-gray-500 text-white px-2' onClick={()=>selectClick(item)} >Select</button>
                                            </td>
                                            <td className='border-r px-2 py-1' >{item.code}</td>
                                            <td className='border-r px-2 py-1' >{item.name}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='flex-1 h-[75vh] overflow-y-scroll'>
                    {
                        vMode === "table" ? (
                            <div className='text-[0.7em] relative'>
                                <table className='w-[100%]'>
                                    <thead>
                                        <tr className='border-b sticky top-0 bg-gray-100'>
                                            <th colSpan={4} className='p-1'>
                                                <div className='flex p-1'>
                                                    <span className='flex-1 text-start'>accounts for {rowTitle}</span>
                                                    <button className='mr-2 underline text-green-500' onClick={copyClick} >Copy accounts from other field</button>
                                                    <button className='underline' onClick={switchToFormula} >switch to formula</button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            accounts.map((item, index)=>
                                                <tr key={index} className='border-b'>
                                                    <td className='p-1 border-r text-center'>
                                                        <button onClick={()=>xClick(index)}><FaX className='text-[0.7em] text-red-500' /></button>
                                                    </td>
                                                    <td className='p-1 border-r'>{item.code}</td>
                                                    <td className='p-1 border-r'>{item.name}</td>
                                                    <td className='p-1'>
                                                        <select className='border rounded' value={item.operateNext} onChange={(e)=>operationChange(e.target.value, index)} >
                                                            <option value=""></option>
                                                            <option value="add">+</option>
                                                            <option value="sub">-</option>
                                                            {/* <option value="prod">*</option>
                                                            <option value="diff">/</option> */}
                                                        </select>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className='text-[0.7em] relative'>
                                <div className='font-bold p-2 flex bg sticky top-0 bg-gray-100'>
                                    <span className='flex-1 text-start'>accounts for {rowTitle}</span>
                                    <button className='mr-2 underline text-green-500' onClick={copyClick} >Copy accounts from other field</button>
                                    <button className='underline' onClick={switchToTable} >switch to table</button>
                                </div>
                                <div className='m-1'>
                                    <span>formula</span>
                                    <textarea 
                                        className='border w-[100%] min-h-[50vh] p-1' 
                                        value={formula} 
                                        onInput={handleInput}
                                        onBlur={handleBlur}
                                        onFocus={handleFocus}
                                        onChange={(e)=>setFormula(e.target.value)} 
                                        ref={formulaInput} ></textarea>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='flex p-4 flex justify-end'>
                <button className='btn-primary' onClick={confirmClick} >Confirm</button>
            </div>
        </Modal>
        <Modal show={copyModal} closeCallback={()=>setCopyModal(false)} >
            <div className='flex-1 border-t border-b p-4'>
                <div className='flex mb-2 items-center'>
                    <span className='mr-2'>Report</span>
                    <select onChange={(e)=>setSelectedReportsOption(e.target.value)} className='border p-1 rounded mr-2' >
                        <option value="">- select report -</option>
                        {
                            reportsOption.map((item, index)=>
                                <option key={index} value={item.id}>{item.title}</option>
                            )
                        }
                    </select>
                    <select onChange={(e)=>setSelectedFieldOption(e.target.value)} className='border p-1 rounded mr-2' >
                        <option value="">- select field -</option>
                        {
                            fieldOption.map((item, index)=>
                                <option key={index} value={item.id}>{item.description}</option>
                            )
                        }
                    </select>
                </div>
                <span>{toCopy.length} accounts</span>
            </div>
            <div className='p-2 flex justify-end'>
                <button className='btn-primary' onClick={confirmCopyClick}>Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default TrialBalanceAccountPicker;