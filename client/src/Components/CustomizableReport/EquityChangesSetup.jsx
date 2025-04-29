import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import TrialBalanceAccountPicker from './TrialBalanceAccountPicker';
import axios from 'axios';
import { showToast } from '../../utils/toastNotifications';

function EquityChangesSetup({ show=false, close=()=>{}, refresh=()=>{}}) {

    // modal controls
    const [accountPicker, setAccountPicker] = useState({ show: false, title: 'Statement of Equity Changes', rowTitle: '' });
    // to render existing
    const [accounts, setAccounts] = useState([]);
    const [formula, setFormula] = useState('');
    const [otherReports, setOtherReports] = useState([]);

    const [editingCell, setEditingCell] = useState('');

    const [c1r1, setc1r1] = useState({position: "c1r1", customCalc: '', value: []});
    const [c2r1, setc2r1] = useState({position: "c2r1", customCalc: '', value: []});
    const [c3r1, setc3r1] = useState({position: "c3r1", customCalc: '', value: []});
    const [c4r1, setc4r1] = useState({position: "c4r1", customCalc: '', value: []});

    const [c1r2, setc1r2] = useState({position: "c1r2", customCalc: '', value: []});
    const [c2r2, setc2r2] = useState({position: "c2r2", customCalc: '', value: []});
    const [c3r2, setc3r2] = useState({position: "c3r2", customCalc: '', value: []});
    const [c4r2, setc4r2] = useState({position: "c4r2", customCalc: '', value: []});

    const [c1r3, setc1r3] = useState({position: "c1r3", customCalc: '', value: []});
    const [c2r3, setc2r3] = useState({position: "c2r3", customCalc: '', value: []});
    const [c3r3, setc3r3] = useState({position: "c3r3", customCalc: '', value: []});
    const [c4r3, setc4r3] = useState({position: "c4r3", customCalc: '', value: []});

    const [c1r4, setc1r4] = useState({position: "c1r4", customCalc: '', value: []});
    const [c2r4, setc2r4] = useState({position: "c2r4", customCalc: '', value: []});
    const [c3r4, setc3r4] = useState({position: "c3r4", customCalc: '', value: []});
    const [c4r4, setc4r4] = useState({position: "c4r4", customCalc: '', value: []});

    const [c1r5, setc1r5] = useState({position: "c1r5", customCalc: '', value: []});
    const [c2r5, setc2r5] = useState({position: "c2r5", customCalc: '', value: []});
    const [c3r5, setc3r5] = useState({position: "c3r5", customCalc: '', value: []});
    const [c4r5, setc4r5] = useState({position: "c4r5", customCalc: '', value: []});

    useEffect(()=>{
        getTemplate();
        preloadOtherReports();
    }, [show]);

    // used in settings
    async function preloadOtherReports(){
        const response = await axios.get(`/reports/sub`, { withCredentials: true });
        setOtherReports(response.data);
    }

    async function getTemplate(){
        const response = await axios.get('/reports/sub/EC', { withCredentials: true });
        const template = response.data;
        if(template.length > 0){
            for(let i = 0; i < template.length; i++){
                switch(template[i].position){
                    case "c1r1": setc1r1(template[i]); break;
                    case "c2r1": setc2r1(template[i]); break;
                    case "c3r1": setc3r1(template[i]); break;
                    case "c4r1": setc4r1(template[i]); break;
        
                    case "c1r2": setc1r2(template[i]); break;
                    case "c2r2": setc2r2(template[i]); break;
                    case "c3r2": setc3r2(template[i]); break;
                    case "c4r2": setc4r2(template[i]); break;
        
                    case "c1r3": setc1r3(template[i]); break;
                    case "c2r3": setc2r3(template[i]); break;
                    case "c3r3": setc3r3(template[i]); break;
                    case "c4r3": setc4r3(template[i]); break;
        
                    case "c1r4": setc1r4(template[i]); break;
                    case "c2r4": setc2r4(template[i]); break;
                    case "c3r4": setc3r4(template[i]); break;
                    case "c4r4": setc4r4(template[i]); break;
        
                    case "c1r5": setc1r5(template[i]); break;
                    case "c2r5": setc2r5(template[i]); break;
                    case "c3r5": setc3r5(template[i]); break;
                    case "c4r5": setc4r5(template[i]); break;
                }
            }
        }
    }

    async function setupConfirm(acc, formula){
        const changeTo = {position: editingCell, customCalc: formula, value: acc};
        switch(editingCell){

            case "c1r1": setc1r1(changeTo); break;
            case "c2r1": setc2r1(changeTo); break;
            case "c3r1": setc3r1(changeTo); break;
            case "c4r1": setc4r1(changeTo); break;

            case "c1r2": setc1r2(changeTo); break;
            case "c2r2": setc2r2(changeTo); break;
            case "c3r2": setc3r2(changeTo); break;
            case "c4r2": setc4r2(changeTo); break;

            case "c1r3": setc1r3(changeTo); break;
            case "c2r3": setc2r3(changeTo); break;
            case "c3r3": setc3r3(changeTo); break;
            case "c4r3": setc4r3(changeTo); break;

            case "c1r4": setc1r4(changeTo); break;
            case "c2r4": setc2r4(changeTo); break;
            case "c3r4": setc3r4(changeTo); break;
            case "c4r4": setc4r4(changeTo); break;

            case "c1r5": setc1r5(changeTo); break;
            case "c2r5": setc2r5(changeTo); break;
            case "c3r5": setc3r5(changeTo); break;
            case "c4r5": setc4r5(changeTo); break;

        }
        closeAccountPicker();
    }

    async function saveClick(){
        const response = await axios.post('/reports/sub/EC', {
            template: [ 
                c1r1, 
                c2r1,
                c3r1, 
                c4r1,

                c1r2, 
                c2r2,
                c3r2, 
                c4r2,

                c1r3, 
                c2r3,
                c3r3, 
                c4r3,

                c1r4, 
                c2r4,
                c3r4, 
                c4r4,

                c1r5, 
                c2r5,
                c3r5, 
                c4r5,
        
            ]
        }, { withCredentials: true }); 
        showToast("Saved", "success");
        close();
        refresh();
    }

    function closeAccountPicker(){
        setAccountPicker({ show: false, title: 'Statement of Equity Changes', rowTitle: '' });
        setAccounts([]);
        setFormula('');
    };

    function openAccountPicker(obj, cell){
        // render accounts or formmula
        setEditingCell(cell);
        setAccountPicker({ show: true, ...obj });
        switch(cell){

            case 'c1r1':  
                setFormula(c1r1.customCalc);
                setAccounts(c1r1.value);
            break;
            case 'c2r1':  
                setFormula(c2r1.customCalc);
                setAccounts(c2r1.value);
            break;
            case 'c3r1':  
                setFormula(c3r1.customCalc);
                setAccounts(c3r1.value);
            break;
            case 'c4r1':  
                setFormula(c4r1.customCalc);
                setAccounts(c4r1.value);
            break;

            case 'c1r2':  
                setFormula(c1r2.customCalc);
                setAccounts(c1r2.value);
            break;
            case 'c2r2':  
                setFormula(c2r2.customCalc);
                setAccounts(c2r2.value);
            break;
            case 'c3r2':  
                setFormula(c3r2.customCalc);
                setAccounts(c3r2.value);
            break;
            case 'c4r2':  
                setFormula(c4r2.customCalc);
                setAccounts(c4r2.value);
            break;

            
            case 'c1r3':  
                setFormula(c1r3.customCalc);
                setAccounts(c1r3.value);
            break;
            case 'c2r3':  
                setFormula(c2r3.customCalc);
                setAccounts(c2r3.value);
            break;
            case 'c3r3':  
                setFormula(c3r3.customCalc);
                setAccounts(c3r3.value);
            break;
            case 'c4r3':  
                setFormula(c4r3.customCalc);
                setAccounts(c4r3.value);
            break;

            case 'c1r4':  
                setFormula(c1r4.customCalc);
                setAccounts(c1r4.value);
            break;
            case 'c2r4':  
                setFormula(c2r4.customCalc);
                setAccounts(c2r4.value);
            break;
            case 'c3r4':  
                setFormula(c3r4.customCalc);
                setAccounts(c3r4.value);
            break;
            case 'c4r4':  
                setFormula(c4r4.customCalc);
                setAccounts(c4r4.value);
            break;

            case 'c1r5':  
                setFormula(c1r5.customCalc);
                setAccounts(c1r5.value);
            break;
            case 'c2r5':  
                setFormula(c2r5.customCalc);
                setAccounts(c2r5.value);
            break;
            case 'c3r5':  
                setFormula(c3r5.customCalc);
                setAccounts(c3r5.value);
            break;
            case 'c4r5':  
                setFormula(c4r5.customCalc);
                setAccounts(c4r5.value);
            break;
        }
    }
    
    return (
        <>
        <Modal title='set accounts for EQUITY CHANGES report' show={show} closeCallback={close} >
            <div className='border-t border-b flex-1 text-[0.8em] p-4 overflow-x-scroll'>
                <table>
                    <thead>
                        <tr>
                            <th className='border-b border-r p-1 w-[250px]'></th>
                            <th className='border-b border-r p-1 w-[150px]'>Share Capital</th>
                            <th className='border-b border-r p-1 w-[150px]'>Share in Revaluation Increments of Associates</th>
                            <th className='border-b border-r p-1 w-[150px]'>Accumulated Other Comprehensive Income</th>
                            <th className='border-b border-r p-1 w-[150px]'>Retained Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border-r p-1'>Balances (previous year)</td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share Capital" }, "c1r1")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share in Revaluation Increments of Associates" }, "c2r1")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Accumulated Other Comprehensive Income" }, "c3r1")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Retained Earnings" }, "c4r1")} >Select accounts</button>
                            </td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Correction of prior years' error</td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share Capital" }, "c1r2")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share in Revaluation Increments of Associates" }, "c2r2")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Accumulated Other Comprehensive Income" }, "c3r2")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Retained Earnings" }, "c4r2")} >Select accounts</button>
                            </td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-4'></td><td className='border-r p-4'></td><td className='border-r p-4'></td><td className='border-r p-4'></td><td className='border-r p-4'></td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Changes in Equity for current year</td><td className='border-r p-1'></td><td className='border-r p-1'></td><td className='border-r p-1'></td><td className='border-r p-1'></td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Net income for the year</td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share Capital" }, "c1r3")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share in Revaluation Increments of Associates" }, "c2r3")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Accumulated Other Comprehensive Income" }, "c3r3")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Retained Earnings" }, "c4r3")} >Select accounts</button>
                            </td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Dividends</td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share Capital" }, "c1r4")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share in Revaluation Increments of Associates" }, "c2r4")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Accumulated Other Comprehensive Income" }, "c3r4")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Retained Earnings" }, "c4r4")} >Select accounts</button>
                            </td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Other comprehensive income for the year</td><td className='border-r p-1'></td><td className='border-r p-1'></td><td className='border-r p-1'></td><td className='border-r p-1'></td>
                        </tr>
                        <tr className='border-b'>
                            <td className='border-r p-1'>Unrealized gain on financial assets at FVOCI</td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share Capital" }, "c1r5")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Share in Revaluation Increments of Associates" }, "c2r5")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Accumulated Other Comprehensive Income" }, "c3r5")} >Select accounts</button>
                            </td>
                            <td className='border-r p-1'>
                                <button className='btn-primary' onClick={()=>openAccountPicker({ rowTitle: "Retained Earnings" }, "c4r5")} >Select accounts</button>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end p-2">
                <button className='btn-primary' onClick={saveClick} >Save</button>
            </div>
        </Modal>        
        <TrialBalanceAccountPicker
            reports={otherReports}
            title={accountPicker.title}
            rowTitle={accountPicker.rowTitle}
            open={accountPicker.show}
            close={closeAccountPicker}
            accounts={accounts}
            selectedFormula={formula}
            setAccounts={setAccounts}
            confirm={setupConfirm} />
        </>
    );
}

export default EquityChangesSetup;