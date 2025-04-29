import React, { useEffect, useState, useRef } from 'react';
import Modal from './Modal';
import OrCards from './OrCards';
import { showToast } from '../utils/toastNotifications';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PrintCards from './PrintCards';

function OrderOfPaymentModal({ toCreate=[], toEdit=[], show=false, close=()=>{}, refresh=()=>{}, selected=[], setSelected=()=>{}, tableRefresh=()=>{} }) {

    const { user } = useAuth();

    const [cards, setCards] = useState([]);

    useEffect(()=>{
        if(toCreate.length > 0){
            renderToCreate();
        }
    }, [toCreate])
    
    async function renderToCreate(){
        // get ids from backend
        const response = await axios.post('/or/autonumber/' + toCreate.length, {except: []}, {withCredentials: true});
        const autonumbers = response.data;
        const cardsToCreate = [];
        for(let i = 0; i < toCreate.length; i++){
            cardsToCreate.push({
                orderOfPaymentNo: autonumbers[i],
                date: toCreate[i].date,
                client: {
                    slCode: toCreate[i].slCode,
                    name: toCreate[i].name
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
            });
        }
        setCards(cardsToCreate);
    }

    useEffect(()=>{
        if(toEdit.length > 0){
            setCards(toEdit);
        }
    }, [toEdit]);

    async function saveClick(){
        // check inputs
        // if non accounting check for treasury fields
        const valid = cards.every(e=>e.amount > 0 && e.orderOfPaymentNo !== '' && e.date !== '');
        if(valid){
            // not sure to check gl entries on accountant side
            // if(user.access.includes('orx')){
            //     // check gl entries
            //     const gl = cards.map(m=>m.gl).flat();
            //     const glvalid = gl.every(e=>e.amount > 0);
            //     if(!glvalid){
            //         showToast('Please complete the general ledgers', 'warning');
            //         return;
            //     }
            // }
            await saveCards(cards);
            refresh(cards);
        }else{
            showToast('Please complete the forms', 'warning');
        }
    }

    async function saveCards(cards){
        try{
            // change save cards here to edit of card already exist and insert if not
            const sanitizedCards = cards.map(({ __v, ...rest }) => rest);
            const response = await axios.post('/or', sanitizedCards, {withCredentials: true});
            showToast('Order of payment saved', 'success');
            setCards([]);
            close();
        }catch(error){
            if(error.response.status === 409){
                showToast(error.response.data.message, 'warning');
            }else{
                showToast('Error saving order of payment', 'error');
            }
        }
    }

    function tbRef(){
        tableRefresh();
    }

    return (
        <Modal show={show} closeCallback={close} title='Order of Payment' >
            <div className='flex-1 border-t border-b min-w-[90vw] max-h-[75vh] overflow-y-scroll'>
                <OrCards cards={cards} setCards={setCards} refresh={refresh} selected={selected} setSelected={setSelected} tableRefresh={tbRef} />
            </div>
            <div className='p-3 flex'>
                <div className='flex-1'>
                    <PrintCards items={cards} />
                    {/* <button className='mx-4 bg-gray-400 text-white px-2 py-1 rounded' onClick={()=>printClick(cards)}>Print</button> */}
                </div>
                <button className='px-2 py-1 bg-green-600 text-white rounded mx-4' onClick={saveClick}>Save all</button>
            </div>
        </Modal>
    );
}

export default OrderOfPaymentModal;