import React, { useEffect, useState } from 'react';
import SubledgerPicker from './SubledgerPicker';
import Modal from './Modal';
import AccountPicker from './AccountPicker';
import { formatReadableDate, numberToCurrencyString } from '../helper/helper';
import CurrencyInput from './CurrencyInput';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaX, FaMinus, FaChevronRight } from 'react-icons/fa6';
import axios from 'axios';
import { showToast } from '../utils/toastNotifications';
import GLInput from './GLInput';
import { useLoader } from '../context/useLoader';

function PrevTransact({show=false, close=()=>{}, client={ slCode: "", name: "" }, data=[] }){

    const [selected, setSelected] = useState(null);

    useEffect(()=>{
        if(data.length > 0){ 
            setSelected(data[0])
        }else{
            setSelected(null);
        }
    }, [data]);

    return (
        // <Modal show={show} title={<span className='text-[0.9em] mr-8'>{client.slCode} {client.name}</span>} closeCallback={close} >
        <div className={`flex ${show ? "show" : "hidden"}`}>
            <div className='flex-1 border-t text-[0.8em] flex p-2'>
                <div className='flex flex-col'>
                <span className='mb-2 font-bold'><button className='text-[1.5em] mr-2' onClick={close} ><FaChevronRight /></button>Previous Transactions</span>
                    <div className='h-[100%] overflow-y-scroll p-1'>
                        <ul className='ml-2'>
                            {
                                data.length > 0 ?
                                data.map((item, index)=>
                                    <li className='mb-2' key={index}>
                                        ● <button className='ml-1 underline text-blue-500 mr-4' onClick={()=>setSelected(item)}>
                                            {item.orderOfPaymentNo} ({formatReadableDate(new Date(item.date))})
                                        </button>
                                    </li>
                                )
                                :
                                <li className='mb-2'>
                                    ● no transactions
                                </li>
                            }
                        </ul>            
                    </div>
                </div>
                <div className='min-w-[200px] p-2 flex flex-col flex-1 overflow-y-scroll'>
                    {
                        selected ?
                        <>
                        <div className='mb-1 flex'>
                            <span className='w-[80px] text-end mr-2 font-bold'>OR No:</span>
                            <span>{selected.orderOfPaymentNo}</span>
                        </div>
                        <div className='mb-1 flex'>
                            <span className='w-[80px] text-end mr-2 font-bold'>Date:</span>
                            <span>{formatReadableDate(new Date(selected.date))}</span>
                        </div> 
                        <div className='mb-1 flex max-w-[400px]'>
                            <span className='w-[80px] text-end mr-2 font-bold'>Client:</span>
                            <span>{selected.client.slCode} {selected.client.name}</span>
                        </div>
                        <div className='mb-2 flex'>
                            <span className='w-[80px] text-end mr-2 font-bold'>Amount:</span>
                            <span>{numberToCurrencyString(selected.amount)}</span>
                        </div>
                        <table className='mb-4'>
                            <thead>
                                <tr className='bg-green-500 text-white'>
                                    <th className='py-1 px-2 border-r'>GL</th>
                                    <th className='py-1 px-2'>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                selected.gl.map((gl, glIndex)=>
                                    <tr key={glIndex} className='border-b' >
                                        <td className='flex p-1 border-r'>
                                            <span>{gl.code} - </span>
                                            <span className='max-w-[300px]'>{gl.name}</span>
                                        </td>
                                        <td className='p-1 min-w-[100px] text-center'>{numberToCurrencyString(gl.amount)}</td>
                                    </tr>
                                )
                            }
                            {
                                <tr className='border-b' >
                                    <td className='p-1 border-r text-end font-bold'>Net Amount</td>
                                    <td className='p-1 min-w-[100px] text-center'>{numberToCurrencyString(selected.gl.map(m=>m.amount).reduce((pre,cur)=>pre+cur,0))}</td>
                                </tr>
                            }
                            </tbody>
                        </table>
                        <div className='mb-1 flex max-w-[400px]'>
                            <span className='w-[80px] text-end mr-2 font-bold'>Remarks:</span>
                            <span>{selected.remarks}</span>
                        </div>
                        </>
                        :
                        <div className='flex items-center justify-center flex-1 text-gray-500'>
                            <span>Select Transaction</span>
                        </div>
                    }
                </div>
            </div>
        </div>
        // </Modal>
    );
}

function OrCards({ cards=[], setCards=()=>{}, refresh=()=>{}, selected=[], tableRefresh=()=>{}, setSelected=()=>{} }) {

    const {loading} = useLoader();
    const { user } = useAuth();

    // const [subledgerModal, setSubledgerModal] = useState({ show: false, index: '', slCode: '', name: '' });
    // const [accountModal, setAccountModal] = useState({ show: false, card: '', index: '', account: null });
    const [blocker, setBlocker] = useState({index: '', show: false});

    // useEffect(()=>{
    //     console.log(cards);
    //     console.log(user.access)
    // }, [cards]);

    function updateAtIndex(index, what, value) {
        const updatedCards = [...cards]; // Copy the array
    
        // Ensure immutability
        updatedCards[index] = { ...updatedCards[index] };
    
        // Function to update nested properties
        const setNestedValue = (obj, path, value) => {
            const keys = path.split('.'); // Split key string (e.g., 'gl[0].code')
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                const match = key.match(/^([a-zA-Z0-9_]+)\[(\d+)]$/);
                if (match) {
                    const arrayKey = match[1];
                    const arrayIndex = parseInt(match[2], 10);
                    current[arrayKey] = current[arrayKey] || [];
                    current = current[arrayKey][arrayIndex] = current[arrayKey][arrayIndex] || {};
                } else {
                    current[key] = current[key] || {};
                    current = current[key];
                }
            }
            const lastKey = keys[keys.length - 1];
            const lastMatch = lastKey.match(/^([a-zA-Z0-9_]+)\[(\d+)]$/);
            if (lastMatch) {
                const arrayKey = lastMatch[1];
                const arrayIndex = parseInt(lastMatch[2], 10);
                current[arrayKey] = current[arrayKey] || [];
                current[arrayKey][arrayIndex] = value;
            } else {
                current[lastKey] = value;
            }
        };
    
        // Support multiple updates
        if (Array.isArray(what) && Array.isArray(value) && what.length === value.length) {
            for (let i = 0; i < what.length; i++) {
                setNestedValue(updatedCards[index], what[i], value[i]);
            }
        } else {
            // Single update case
            setNestedValue(updatedCards[index], what, value);
        }
    
        setCards(updatedCards); // Update state
    }
    
    
    // function clientFocus(index){
    //     setSubledgerModal({
    //         show: true,
    //         index: index,
    //         slCode: cards[index].client.slCode,
    //         name: cards[index].client.name
    //     });
    // }
    
    function clientChange(index, v, type){
        updateAtIndex(index, type, v);
        // setSubledgerModal({ show: false, index: '', slCode: '', name: '' });
    }

    // function accountFocus(card, index){
    //     if(!user.access.includes('orx')){
    //         window.getSelection().removeAllRanges();
    //         document.activeElement.blur();
    //         return;
    //     }
    //     setAccountModal({ show: true, card: card, index: index, account: cards[card].gl[index] });
    // }

    function accountChange(index, glIndex, v){
        // console.log(index, v);
        updateAtIndex(index, `gl.${glIndex}.code`, v.code);
        updateAtIndex(index, `gl.${glIndex}.name`, v.name);
        // setAccountModal({ show: false, card: '', index: '', account: null });
    }

    function removeCard(index){
        const updatedCards = cards.filter(f=>cards.indexOf(f) !== index);
        setSelected(updatedCards);
        setCards(updatedCards);
    }

    function checkAccess(state, index){
        if(state){
            if(!user.access.includes('orx')){
                setBlocker({index: index, show: true});
            }
        }else{
            setBlocker({index: '', show: false});
        }
    }

    function reval(){
        if(!user.access.includes('orx')){
            window.getSelection().removeAllRanges();
            document.activeElement.blur();
            return;
        }
    }

    async function addEmptyCard(){
        // get the last or no from cards and produce the next or no
        // validate the next or no before pushing this card
        const existings = cards.map(m=>m.orderOfPaymentNo);
        // console.log(existings);
        loading(true);
        const response = await axios.post('/or/autonumber/' + 1, {except: existings}, {withCredentials: true});
        loading(false);
        const emptyCard = {
            orderOfPaymentNo: response.data[0],
            date: '',
            client: {
                slCode: '',
                name: ''
            },
            amount: 0,
            gl: [
                {
                    code: "10301010B",
                    name: "RENTAL RECEIVABLE",
                    amount: 0
                },
                {
                    code: "19902080",
                    name: "Withholding Tax at Source",
                    amount: 0
                },
                {
                    code: "20501030",
                    name: "Output Tax",
                    amount: 0
                }
            ],
            remarks: '',
            paymentMethod: 'cash'
        };
        const updatedCards = [...cards, emptyCard];
        setCards(updatedCards);
    }

    function removeGL(index, glIndex){
        const newGL = cards[index].gl.filter(f=>cards[index].gl.indexOf(f) !== glIndex);
        updateAtIndex(index, 'gl', newGL);
    }

    function addGlRow(index, glIndex) {
        // Clone the existing GL array
        const newGL = [...cards[index].gl];
        // Insert new object at glIndex + 1 (after the specified index)
        newGL.splice(glIndex + 1, 0, { code: '', name: '', amount: 0 });
        // Update state
        updateAtIndex(index, 'gl', newGL);
    }
    
    const [prevOrModal, setPrevOrModal] = useState({ show: false, client: {slCode: "", name: ""}, key: "", ors: [] });

    async function showPreviousTransactions(client, orid, key){
        if(!client.slCode){
            showToast('Please select client', 'warning');
            return;
        }
        loading(true);
        const response = await axios.get(`/or/prev/${client.slCode}`, { withCredentials: true });
        loading(false);
        let data = response.data;
        if(orid){
            data = data.filter(f=>f._id != orid);
        }
        setPrevOrModal({show: true, client: client, ors: data, key: key});
    }

    function closePrevOrModal(){
        setPrevOrModal({ show: false, client: {slCode: "", name: ""}, ors: [] });
    }

    async function saveIndie(item){
        const cards = [item];
        const valid = cards.every(e=>e.amount > 0 && e.orderOfPaymentNo !== '' && e.date !== '');
        if(valid){
            try{
                // change save cards here to edit of card already exist and insert if not
                const sanitizedCards = cards.map(({ __v, ...rest }) => rest);
                loading(true);
                const response = await axios.post('/or', sanitizedCards, {withCredentials: true});
                loading(false);
                setSelected([...selected, response.data]);
                refresh([...cards, ...response.data]);
                showToast('Order of payment saved', 'success');
            }catch(error){
                if(error.response.status === 409){
                    showToast(error.response.data.message, 'warning');
                }else{
                    showToast('Error saving order of payment', 'error');
                }
            }
        }else{
            showToast("Enter OR info", 'info')
        }
    }

    function remarksChange(e, index, item){
        // updateAtIndex(index, 'remarkSelected', e);
        // captures changes here and modifies gl and remark
        // updateAtIndex(index, 'remarks', e);

        

        switch(e){
            case "MANAGEMENT FEE":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'],
                    [
                        e,
                        e,
                        [
                            {
                                code: "10301010C", name: "MANAGEMENT FEE RECEIVABLE",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "20501030", name: "OUTPUT TAX",
                                slCode: "5053", slName: "BUREAU OF INTERNAL REVENUE",
                                amount: 0
                            },
                            {
                                code: "19902080", name: "WITHOLDING TAX AT SOURCE",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                            {
                                code: "19902070", name: "CREDITABLE INPUT TAX",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            }
                        ]
                    ]
                );

            break;
            case "PAYMENT OF ACCOUNT-RENTAL":

                // TODO: automated computation for amount based on lessee monitoring
                // if lessee check thickmark for FVAT and EWT
                // on entry create populate it and wt field on ledger sheet

                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "10301010B", name: "RENTAL RECEIVABLE",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "20501030", name: "OUTPUT TAX",
                                slCode: "5053", slName: "BUREAU OF INTERNAL REVENUE",
                                amount: 0
                            },
                            {
                                code: "19902080", name: "WITHOLDING TAX AT SOURCE",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                            {
                                code: "19902070", name: "CREDITABLE INPUT TAX",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                        ]
                    ]
                );
            break;
            case "PAYMENT OF ACCOUNT-RENTAL AND ASSESSMENT":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "10301010B", name: "RENTAL RECEIVABLE",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "10301010F", name: "ASSESSMENT RECEIVABLE",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "20501030", name: "OUTPUT TAX",
                                slCode: "5053", slName: "BUREAU OF INTERNAL REVENUE",
                                amount: 0
                            },
                            {
                                code: "19902080", name: "WITHOLDING TAX AT SOURCE",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                            {
                                code: "19902070", name: "CREDITABLE INPUT TAX",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                        ]
                    ]
                );
            break;
            case "PAYMENT OF ACCOUNT- MISCELLANEOUS CHARGES (B#)":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "10301010E", name: "OTHER NON-INCOME REC.-CURRENT",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "20501030", name: "OUTPUT TAX",
                                slCode: "5053", slName: "BUREAU OF INTERNAL REVENUE",
                                amount: 0
                            },
                            {
                                code: "19902080", name: "WITHOLDING TAX AT SOURCE",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                            {
                                code: "19902070", name: "CREDITABLE INPUT TAX",
                                slCode: '5627', slName: 'BIR - CREDITABLE TAX W/HELD',
                                amount: 0
                            },
                        ]
                    ]
                );
            break;                                    
            case "RETURN OF EXCESS CASH ADVANCE RE:":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "19901040A", name: "CASH ADVANCE RECEIVABLES - EMPLOYEES AND OFFICERS",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            }
                        ]
                    ]
                );
            break;
            case "HOUSING LOAN":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "10301990C", name: "HOUSING LOANS RECEIVABLE - CURRENT",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "40202210D", name: "INTEREST INCOME ON RECEIVABLES",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            },
                            {
                                code: "20501030", name: "OUTPUT TAX",
                                slCode: "5053", slName: "BUREAU OF INTERNAL REVENUE",
                                amount: 0
                            }
                        ]
                    ]
                );
            break;
            case "PERFORMANCE SECURITY: PROJECT REFERENCE NO. MR":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "20401040A", name: "DEPOSITS FROM SUPPLIERS, BIDDERS, ETC.",
                                slCode: item.client.slCode, slName: item.client.name,
                                amount: 0
                            }
                        ]
                    ],
                );
            break;
            case "BID DOCUMENTS : PROJECT REFERENCE NO. MR":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "20401010A", name: "TRUST LIABILITIES - CURRENT",
                                slCode: "9282", slName: "BAC-BIDS & AWARDS COMMITTEE",
                                amount: 0
                            }
                        ]
                    ]
                );
            break;
            case "BID DEPOSIT FOR THE SALE OF":
                updateAtIndex(index, ['remarkSelected', 'remarks', 'gl'], 
                    [
                        e,
                        e,
                        [
                            {
                                code: "20401040A", name: "DEPOSITS FROM SUPPLIERS, BIDDERS, ETC.",
                                slCode: item.client.slCode, slName: item.client.Name,
                                amount: 0
                            }
                        ]
                    ]
                );
            break;
        }
    }

    const [messagebox, setMessagebox] = useState({ show: false, message: '', callback: ()=>{} });

    function deleteClick(or, index){
        setMessagebox({
            show: true,
            message: `Are you sure you want to delete this Order of Payment #${or.orderOfPaymentNo}?`,
            callback: async ()=>{
                removeCard(index);
                loading(true);
                await axios.delete(`/or/${or._id}`, { withCredentials: true });
                tableRefresh();
                loading(false);
                setMessagebox({ show: false, message: '', callback: ()=>{} });                
            }
        });
    }

    function cancelClick(or, index){
        setMessagebox({
            show: true,
            message: `Are you sure you want to cancel this Order of Payment #${or.orderOfPaymentNo}`,
            callback: async ()=>{
                removeCard(index);
                loading(true);
                await axios.post(`/or/cancel/${or._id}`, { withCredentials: true });
                tableRefresh();
                loading(false);
                setMessagebox({ show: false, message: '', callback: ()=>{} });
            }
        });
    }

    return (
        <>
        <div className='p-2 flex flex-wrap justify-center'>
            {
                cards.map((item, index)=>
                    <div key={index} className='text-[0.8em] m-2 flex border shadow-lg'>
                        <PrevTransact show={prevOrModal.show && prevOrModal.key === index} close={closePrevOrModal} client={prevOrModal.client} data={prevOrModal.ors} />
                        <div className='flex flex-col'>
                            <div className='bg-green-600 flex flex-col text-center px-2 py-1 text-white font-bold relative'>
                                <button 
                                    className='bg-gray-500 px-2 py-1 rounded mr-2 hover:bg-gray-400 transition duration-500 w-[80px] text-[0.8em] absolute'
                                    onClick={()=>showPreviousTransactions(item.client, item._id, index)} >
                                    Previous Transactions
                                </button>
                                <button className='absolute right-[10px] top-[1px]' onClick={()=>removeCard(index)}>x</button>
                                <span>NATIONAL DEVELOPMENT COMPANY</span>
                                <span>ORDER OF PAYMENT</span>
                            </div>
                            <div className='flex flex-col p-1 mb-2'>
                                <span className='italic font-bold mb-2'>To be filled by Treasury</span>
                                <div className='flex mb-1' >
                                    <span className='w-[150px]' >Order of Payment No.</span>
                                    <input 
                                        type="text" 
                                        className='border text-end flex-1 px-2 py-1 rounded' 
                                        value={item.orderOfPaymentNo} 
                                        onChange={(e)=>updateAtIndex(index, 'orderOfPaymentNo', e.target.value)} />
                                </div>
                                <div className='flex mb-1' >
                                    <span className='mr-2 w-[50px]' >Date</span>
                                    <input 
                                        type="date" 
                                        className='border text-end flex-1 px-2 py-1 rounded'
                                        value={item.date}
                                        onChange={(e)=>updateAtIndex(index, 'date', e.target.value)} />
                                </div>
                                <div className='flex mb-1' >
                                    <span className='mr-2 w-[50px]' >Client</span>
                                    <div className=' bbb flex-1'>
                                        <SubledgerPicker 
                                            slCode={item.client.slCode} 
                                            setSLCode={(v)=>clientChange(index, v, 'client.slCode')}
                                            name={item.client.name}
                                            setName={(v)=>clientChange(index, v, 'client.name')} 
                                            canAdd={false} />
                                    </div>
                                </div>
                                <div className='flex mb-1' >
                                    <span className='mr-2 w-[50px]' >Amount</span>
                                    <CurrencyInput
                                        className={'border text-end flex-1 px-2 py-1 rounded'}
                                        val={item.amount}
                                        setVal={(v)=>updateAtIndex(index, 'amount', v)} />
                                </div>
                            </div>
                            <div className='p-1 m-1 border rounded'>
                                <div className='flex mb-2'>
                                    <span className='mr-2'>Payment method:</span>
                                    <div>
                                        <label className='mr-2'>
                                            <input 
                                                type="radio" 
                                                className='mr-1'
                                                value={'Cash'} 
                                                checked={item.paymentMethod === 'Cash'} 
                                                onChange={(e)=>updateAtIndex(index, 'paymentMethod', e.target.value)} />
                                            Cash
                                        </label>
                                        <label className='mr-2'>
                                            <input 
                                                type="radio" 
                                                className='mr-1'
                                                value={'Cheque'} 
                                                checked={item.paymentMethod === 'Cheque'} 
                                                onChange={(e)=>updateAtIndex(index, 'paymentMethod', e.target.value)} />
                                            Cheque
                                        </label>
                                        <label className='mr-2'>
                                            <input 
                                                type="radio" 
                                                className='mr-1'
                                                value={'Others'} 
                                                checked={item.paymentMethod === 'Others'} 
                                                onChange={(e)=>updateAtIndex(index, 'paymentMethod', e.target.value)} />
                                            Others
                                        </label>
                                    </div>
                                </div>
                                {
                                    item.paymentMethod === 'Others' &&
                                    <div className='flex items-center mb-2'>
                                        <span className='mr-2'>Bank:</span>
                                        <div className='flex-1'>
                                            <SubledgerPicker 
                                                slCode={item.bank ? item.bank.slCode : ''} 
                                                setSLCode={(v)=>clientChange(index, v, 'bank.slCode')}
                                                name={item.bank ? item.bank.name : ''}
                                                setName={(v)=>clientChange(index, v, 'bank.name')} 
                                                subledgers={[
                                                    { slCode: '8941', name: 'CASH IN BANK - LBP COMBO', tin: '', address: '', zip: ''},
                                                    { slCode: '8943', name: 'CASH IN BANK - DBP COMBO', tin: '', address: '', zip: ''},
                                                    { slCode: '9488', name: 'LBP TORDESILLAS', tin: '', address: '', zip: ''},
                                                ]}
                                                canAdd={false}
                                            />
                                        </div>
                                    </div>
                                }
                                <div className='flex mb-2 items-center text-[0.8em]'>
                                    <span className='mr-2'>Remarks:</span>
                                    <select 
                                        className='border p-1 rounded' 
                                        value={item.remarkSelected? item.remarkSelected : ""} 
                                        onChange={(e)=>remarksChange(e.target.value, index, item)} >
                                        <option value="">-- select --</option>
                                        <option value="MANAGEMENT FEE">MANAGEMENT FEE</option>
                                        <option value="PAYMENT OF ACCOUNT-RENTAL">PAYMENT OF ACCOUNT-RENTAL</option>
                                        <option value="PAYMENT OF ACCOUNT-RENTAL AND ASSESSMENT">PAYMENT OF ACCOUNT-RENTAL AND ASSESSMENT</option>
                                        <option value="PAYMENT OF ACCOUNT- MISCELLANEOUS CHARGES (B#)">PAYMENT OF ACCOUNT- MISCELLANEOUS CHARGES (B#)                                    </option>
                                        <option value="RETURN OF EXCESS CASH ADVANCE RE:">RETURN OF EXCESS CASH ADVANCE RE:</option>
                                        <option value="HOUSING LOAN">HOUSING LOAN</option>
                                        <option value="PERFORMANCE SECURITY: PROJECT REFERENCE NO. MR">PERFORMANCE SECURITY: PROJECT REFERENCE NO. MR                                  </option>
                                        <option value="BID DOCUMENTS : PROJECT REFERENCE NO. MR">BID DOCUMENTS : PROJECT REFERENCE NO. MR</option>
                                        <option value="BID DEPOSIT FOR THE SALE OF">BID DEPOSIT FOR THE SALE OF</option>
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col p-1 mb-2 relative' onMouseEnter={()=>checkAccess(true, index)} onMouseLeave={()=>checkAccess(false, index)}>
                                {
                                    blocker.show && blocker.index === index && 
                                    <div className='absolute top-0 left-0 right-0 bottom-0 blocker p-1 w-full flex flex-col justify-center'>
                                        <span className='font-bold mx-auto'>To be filled by Accounting</span>
                                    </div>
                                }
                                <span className='italic font-bold mb-2'>To be filled by Accounting</span>
                                {
                                    item.gl.map((glItem, glIndex)=>
                                        <div key={glIndex} className='flex'>
                                            <div className='flex-1 flex'>
                                                <button className='text-green-500 text-[0.8em] mr-2' tabIndex="-1" onClick={()=>addGlRow(index, glIndex)}><FaPlus /></button>
                                                <button  className='text-red-500 text-[0.8em] mr-2' tabIndex="-1" onClick={()=>removeGL(index, glIndex)}><FaMinus /></button>
                                                <GLInput 
                                                    instanceId={glIndex} 
                                                    selectedAccount={{code: glItem.code, name: glItem.name}} 
                                                    setSelectedAccount={(v)=>accountChange(index, glIndex, v)}
                                                    datalistId={`accounts-${index}-${glIndex}`} />
                                            </div>
                                            <CurrencyInput 
                                                className={'w-[100px] border text-end'}
                                                onFocus={reval}
                                                val={glItem.amount}
                                                setVal={(v)=>updateAtIndex(index, `gl[${glIndex}].amount`, v)} />
                                        </div>
                                    )
                                }
                                <div className='flex items-center font-bold'>
                                    <span className='p-1 ml-3 w-[300px]'>Net Amount</span>
                                    <span className='text-end flex-1'>
                                        {
                                            numberToCurrencyString(
                                                item.gl
                                                .filter(f=>f.amount ? parseFloat(f.amount) : 0)
                                                .map(m=>parseFloat(m.amount))
                                                .reduce((pre,cur)=>pre+cur,0)
                                            )
                                        }
                                    </span>
                                </div>
                                {
                                    parseFloat(item.gl.filter(f=>f.amount ? parseFloat(f.amount.toFixed(2)) : 0).map(m=>parseFloat(m.amount.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)) > 0 &&
                                    parseFloat(item.gl.filter(f=>f.amount ? parseFloat(f.amount.toFixed(2)) : 0).map(m=>parseFloat(m.amount.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)) != item.amount &&
                                    <div className='flex items-center font-bold text-red-500'>
                                        <span className='p-1 ml-3 w-[300px]'>Discrepancy</span>                                        
                                        <span className='text-end flex-1'>
                                        {
                                            item.gl.filter(f=>f.amount ? parseFloat(f.amount.toFixed(2)) : 0).map(m=>parseFloat(m.amount.toFixed(2))).reduce((pre,cur)=>pre+cur,0) != item.amount ?
                                            numberToCurrencyString(
                                                parseFloat(item.gl.filter(f=>f.amount ? parseFloat(f.amount.toFixed(2)) : 0).map(m=>parseFloat(m.amount.toFixed(2))).reduce((pre,cur)=>pre+cur,0).toFixed(2)) - item.amount
                                            ) 
                                            : "test"
                                        }
                                        </span>
                                    </div>
                                }
                            </div>
                            <div className='p-1 flex items-center mt-auto mb-[20px]'>
                                <span className='mr-2 font-bold'>Remarks:</span>
                                <textarea 
                                    className='border resize-none flex-1 p-1' 
                                    value={item.remarks}
                                    onChange={(e)=>updateAtIndex(index, 'remarks', e.target.value)} ></textarea>
                            </div>
                            <div className='p-1 flex items-end mt-auto mb-[20px]'>
                                <span className='mr-2 font-bold'>Signature</span>
                                <span className='w-[300px] mx-5 border-b border-black'></span>
                            </div>
                            <div className='p-2 bg-green-500 text-white flex items-end justify-end'>
                                {/* <button className='bg-gray-500 px-2 py-1 rounded mr-2 hover:bg-gray-400 transition duration-500' >Print</button> */}
                                {
                                    (!item.deletedDate && !item.cancelledDate) ? (
                                        <>
                                        { item._id && <button className='mr-4 underline text-red-600' onClick={()=>deleteClick(item, index)} >delete</button> }
                                        { item._id && <button className='mr-4 underline text-gray-300' onClickCapture={()=>cancelClick(item, index)} >cancel</button> }
                                        <button className='bg-gray-500 px-2 py-1 rounded mr-2 hover:gb-gray-400 transition duration-500' onClick={()=>saveIndie(item)}>Save</button>
                                        </>
                                    ) : (
                                        <span className='mr-4'>({
                                            item.deletedDate ? `deleted ${item.deletedDate.substr(0, 10)}` : `cancelled ${item.cancelledDate.substr(0, 10)}`
                                        })</span>
                                    )
                                }
                                {/* <button 
                                    className='bg-gray-500 px-2 py-1 rounded mr-2 hover:bg-gray-400 transition duration-500'
                                    onClick={()=>showPreviousTransactions(item.client, item._id)} >
                                    Previous Transactions
                                </button> */}
                            </div>
                        </div>
                    </div>
                )
            }
            <div className='w-[300px] flex items-center justify-center'>
                <button className='bg-gray-200 rounded-lg p-[20px]' onClick={addEmptyCard} ><FaPlus /></button>
            </div>
        </div>
        <Modal show={messagebox.show} closeCallback={()=>setMessagebox({ show: false, message: '', callback: ()=>{} })} >
            <div className='flex-1 border-t flex items-center justify-center p-4'>
                <span className='text-center'>{messagebox.message}</span>
            </div>
            <div className='p-4 flex justify-center'>
                <button className='btn-primary' onClick={messagebox.callback} >Confirm</button>
            </div>
        </Modal>
        {/* <PrevTransact show={prevOrModal.show} close={closePrevOrModal} client={prevOrModal.client} data={prevOrModal.ors} /> */}
        {/* <Modal show={subledgerModal.show} closeCallback={()=>setSubledgerModal({ show: false, slCode: '', name: '' })}>
            <div className='px-4 flex-1 flex items-center justify-center min-w-[350px]'>
                <div className='flex-1'>
                <SubledgerPicker 
                    slCode={subledgerModal.slCode} 
                    setSLCode={(v)=>clientChange(v, 'client.slCode')}
                    name={subledgerModal.name}
                    setName={(v)=>clientChange(v, 'client.name')} 
                />
                </div>
            </div>
        </Modal> */}
        {/* <Modal show={accountModal.show} closeCallback={()=>setAccountModal({ show: false, account: null })}>
            <div className='px-4 flex-1 flex items-center justify-center min-w-[350px]'>
                <AccountPicker selectedAccount={accountModal.account} setSelectedAccount={accountChange} />
            </div>
        </Modal> */}
        </>
    );
}

export default OrCards;