import React, { useState, useRef, useEffect } from 'react';
import AccountPicker from './AccountPicker';
import SubledgerPicker from './SubledgerPicker';
import CurrencyInput from './CurrencyInput';
import { numberToCurrencyString } from '../helper/helper';
import { FaPlus, FaTrash, FaAngleUp, FaAngleDown } from 'react-icons/fa';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

/**
 * OLD LEDGERS EDITOR COMPONENT: replaced with spreadsheet library
 */
function LedgersEditor({ ledgers=[], setLedgers, updateRow, accountFilter=[['ASSETS', 'LIABILITIES', 'CAPITAL', 'REVENUES/INCOME', 'EXPENSES']], particulars='' }) {

    const scrollContainerRef = useRef(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(()=>{
        if(ledgers.length === 0){
            setLedgers([{
                type: 'DR',
                ledger: '',
                subledger: {
                    slCode: '',
                    name: ''
                },
                dr: '',
                cr: '',
                description: ''
            }])
        }
    }, [ledgers]);

    useEffect(()=>{
        setLedgers(ledgers.map(item=>({...item, description: particulars})));
    }, [particulars]);

    function maximize(e){
        e.preventDefault();
        setIsMaximized(!isMaximized);
    }

    function test(e){
        console.log(ledgers);
        e.preventDefault();
    }
  
    function pushEmptyRow(e, index) {
        e.preventDefault();
        // Create a new row object to be inserted
        const newRow = {
            type: 'CR',
            ledger: '',
            subledger: {
                slCode: '',
                name: ''
            },
            dr: '',
            cr: '',
            description: particulars
        };
        // Insert the new row at the next index after the passed index
        const updatedRows = [
            ...ledgers.slice(0, index + 1), // Copy rows up to the passed index
            newRow, // Insert new row
            ...ledgers.slice(index + 1) // Copy remaining rows after the passed index
        ];
        // Update state with the new rows array
        setLedgers(updatedRows);
        // Scroll to the bottom if the index is the last one
        if (index === ledgers.length - 1) {
            // Delay to ensure the DOM updates first, then scroll
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
            }, 0);
        }
    }

    return (
        <div className={`transition duration-500 ${isMaximized && 'absolute h-[100vh] w-[100vw] top-0 left-0 glass'}`}>
            <div className={`transition duration-500 w-[100%] text-[0.7em] bg-white  ${isMaximized && 'absolute h-[90vh] w-[94vw] top-[5vh] left-[3vw] rounded p-5'}`}>
                <div className='flex items-center px-1 mb-2'>
                    <div className='flex-1'>
                        <span className='text-[1.2em] font-bold'>LEDGERS ({ledgers.length})</span>
                    </div>
                    <button className='p-1 bg-gray-500 text-white border rounded mr-4' onClick={(e)=>test(e)} >import</button>
                    <button className='text-[2em] mr-2' onClick={maximize} >{ isMaximized ? <MdFullscreenExit /> : <MdFullscreen /> }</button>
                </div>
                <div className={`${isMaximized ? 'max-h-[75vh]' : 'h-[35vh]'} overflow-y-scroll relative`} ref={scrollContainerRef}  >
                    <table className='w-[100%]'>
                        <thead>
                            <tr className='sticky top-0 bg-green-200 z-[1]'>
                                <th className='p-1'></th>
                                <th className='p-1'>TYPE</th>
                                <th className='p-1'>LEDGER</th>
                                <th className='p-1'>SUB LEDGER</th>
                                <th className='p-1'>DR AMOUNT</th>
                                <th className='p-1'>CR AMOUNT</th>
                                <th className='p-1'>DESCRIPTION</th>
                                <th className='p-1'>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgers.map((item, index)=>
                                <tr key={index} className='text-[1em] text-center'>
                                    <td className='flex flex-col items-center justify-center'>
                                        {/* modify this so i can drag and drop this row and change its position in array */}
                                        <button className='p-1' onClick={(e)=>updateRow(index, 'moveup', e)}>
                                            <FaAngleUp />
                                        </button>
                                        <button className='p-1' onClick={(e)=>updateRow(index, 'movedown', e)}>
                                            <FaAngleDown />
                                        </button>
                                    </td>
                                    <td className='w-[50px]'>
                                        <select 
                                            className='border border-gray-300 rounded w-[60px] p-2 m-[2px]' 
                                            value={item.type} 
                                            onChange={(e)=>updateRow(index, 'type', e.target.value)} >
                                            <option value="DR">DR</option>
                                            <option value="CR">CR</option>
                                        </select>
                                    </td>
                                    <td className='px-1 flex'>
                                        <AccountPicker 
                                            className={'p-2 m-[2px] border-gray-300 min-w-[200px]'} 
                                            filter={accountFilter}
                                            selectedAccount={item.ledger}
                                            setSelectedAccount={(v)=>updateRow(index, 'ledger', v)} />
                                    </td>
                                    <td className='px-1 text-left min-w-[200px]'>
                                        <SubledgerPicker
                                            slCode={item.subledger.slCode}
                                            setSLCode={(v)=>updateRow(index, 'subledger.slCode', v)}
                                            name={item.subledger.name}
                                            setName={(v)=>updateRow(index, 'subledger.name', v)}
                                            callback={(v)=>{
                                                updateRow(index, 'subledger.slCode', v.slCode);
                                                updateRow(index, 'subledger.name', v.name);
                                            }} />
                                    </td>
                                    <td className='w-[110px]'>
                                        <CurrencyInput 
                                            className={`border p-2 w-[100px] rounded border-gray-300 ${!(item.type === 'DR') && 'bg-gray-200'}`}
                                            val={item.dr}
                                            setVal={(v)=>updateRow(index, 'dr', v)}
                                            disabled={!(item.type === 'DR') ? true : false} />
                                    </td>
                                    <td className='w-[110px]'>
                                        <CurrencyInput 
                                            className={`border p-2 w-[100px] rounded border-gray-300 ${!(item.type === 'CR') && 'bg-gray-200'}`}
                                            val={item.cr}
                                            setVal={(v)=>updateRow(index, 'cr', v)}
                                            disabled={!(item.type === 'CR') ? true : false} />
                                    </td>
                                    <td className='w-[110px]'>
                                        <input 
                                            type="text" 
                                            className='border py-2 px-1 rounded' 
                                            value={item.description} 
                                            onChange={(e)=>updateRow(index, 'description', e.target.value)} />
                                    </td>
                                    <td className='flex'>
                                        <button className='mx-2' onClick={(e)=>pushEmptyRow(e, index)} >
                                            <FaPlus />
                                        </button>
                                        <button className='mx-2' onClick={(e)=>updateRow(index, 'delete', e)} >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            )}
                            <tr className='bg-green-200 sticky bottom-0'>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className='p-1 font-bold text-end'>TOTAL:</td>
                                <td className='text-center'>
                                { numberToCurrencyString(
                                    ledgers.reduce((total, row) => {
                                        const drValue = parseFloat(row.dr) || 0; // Convert to number or use 0 if invalid
                                        return total + drValue;
                                    }, 0)
                                ) }
                                </td>
                                <td className='text-center'>
                                { numberToCurrencyString(
                                    ledgers.reduce((total, row) => {
                                        const drValue = parseFloat(row.cr) || 0; // Convert to number or use 0 if invalid
                                        return total + drValue;
                                    }, 0)
                                ) }
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default LedgersEditor;