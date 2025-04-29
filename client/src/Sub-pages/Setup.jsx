import React, { useEffect, useRef, useState } from 'react';
import useBase from '../context/useBase';
import { FaPlusCircle } from 'react-icons/fa';
import { BsXCircle, } from 'react-icons/bs';
import Modal from '../Components/Modal';
import { redBorderMarker } from '../helper/helper';
import { useLoader } from '../context/useLoader';
import axios from 'axios';
import { showToast } from '../utils/toastNotifications';

function Setup() {
    
    const {base, fetchBase} = useBase();
    const {loading} = useLoader();
    
    const [messageBox, setMessageBox] = useState({show: false, message: '', callback: ()=>{}});
    const [taxModal, setTaxModal] = useState({show: false, mode: 'add', _id: ''});
    const [companyModal, setCompanyModal] = useState({show: false, mode: 'add', _id: '', item: {}});
    const [userTypeModal, setUserTypeModal] = useState({show: false, mode: 'add', _id: '', item: {}, accessTypes: []});

    const taxCodeRef = useRef();
    const taxDescriptionRef = useRef();
    const taxRateRef = useRef();
    const companyTypeRef = useRef();
    const userTypeRef = useRef();

    useEffect(()=>{
        console.log(base);
    }, [base]);

    // tax
    function addNewTaxClick(){
        setTaxModal({...taxModal, show: true, mode: 'add'});
    }

    function taxSelect(item){
        setTaxModal({...taxModal, show: true, mode: 'edit', _id: item._id});
        taxCodeRef.current.value = item.taxCode;
        taxDescriptionRef.current.value = item.tax;
        taxRateRef.current.value = item.percentage;
    }

    async function saveTaxModalClick(){
        const code = taxCodeRef.current.value;
        const description = taxDescriptionRef.current.value;
        const rate = parseFloat(taxRateRef.current.value);
        let flag = false;
        if(!code || code.includes(' ') || code.length > 10){
            redBorderMarker(taxCodeRef.current);
            flag = true;
        }
        if(!description){
            redBorderMarker(taxDescriptionRef.current);
            flag = true;
        }
        if(rate < 0){
            redBorderMarker(taxRateRef.current);
            flag = true;
        }
        if(flag) return;
        loading(true);
        let response;
        switch(taxModal.mode){
            case 'add':
                if(base.taxTypes.map(item=>item.taxCode).includes(taxCodeRef.current.value)){
                    showToast('Tax code must be unique', 'warning');
                    redBorderMarker(taxCodeRef.current);                    
                }else{
                    response = await axios.post('/base/tax', {taxCode: code, tax: description, percentage: rate}, { withCredentials: true });
                }
            break;
            case 'edit':
                if(base.taxTypes.filter(item=>item.taxCode === taxCodeRef.current.value).length >= 1){
                    showToast('Tax code must be unique', 'warning');
                    redBorderMarker(taxCodeRef.current);
                }else{
                    response = await axios.patch(`/base/tax/${taxModal._id}`, {taxCode: code, tax: description, percentage: rate}, { withCredentials: true });
                }
            break;
        }
        if(response){
            if(response.status === 200){
                setTaxModal({...taxModal, show: false});
                taxCodeRef.current.value = '';
                taxDescriptionRef.current.value = '';
                taxRateRef.current.value = '';
                showToast('Tax saved!', 'success');
                fetchBase();
            }else{
                showToast('Unable to save tax', 'danger');
            }
        }
        loading(false);
    }

    function taxDelete(item){
        setMessageBox({...messageBox, show: true, message: `Are you sure you want to delete tax: ${item.tax}?`, callback: async ()=>{
            loading(true);
            const response = await axios.delete(`/base/tax/${item._id}`, {withCredentials: true});
            if(response.status === 200){
                setMessageBox({...messageBox, show: false});
                showToast('Tax deleted!', 'success');
                fetchBase();
            }else{
                showToast('Unable to delete tax', 'danger');
            }
            loading(false);
        }});
    }

    // company type
    function addCompanyTypeClick(){
        setCompanyModal({...companyModal, show: true, mode: 'add'});
    }

    function companyTypeSelect(item){
        setCompanyModal({...companyModal, show: true, mode: 'edit', _id: item._id, selected: item});
        companyTypeRef.current.value = item.company;
    }

    async function companyTypeSaveClick(){
        if(companyTypeRef.current.value === ''){
            redBorderMarker(companyTypeRef.current);
            return;
        }
        loading(true);
        let response;
        switch(companyModal.mode){
            case 'add':
                if(base.companyTypes.map(item=>item.company).includes(companyTypeRef.current.value)){
                    showToast('Company type must be unique', 'warning');
                    redBorderMarker(companyTypeRef.current);
                }else{
                    response = await axios.post('/base/company', {company: companyTypeRef.current.value}, {withCredentials: true});
                }
            break;
            case 'edit':
                if(base.companyTypes.filter(item=>item.company === companyTypeRef.current.value).length >= 1){
                    showToast('Company type must be unique', 'warning');
                    redBorderMarker(companyTypeRef.current);
                }else{
                    response = await axios.patch(`/base/company/${companyModal._id}`, {company: companyTypeRef.current.value}, {withCredentials: true});
                }
            break;
        }   
        if(response){
            if(response.status === 200){
                setCompanyModal({...companyModal, show: false});
                showToast('Company type saved!', 'success');
                fetchBase();
            }else{
                showToast('Unable to save company type', 'danger');
            }
        }
        loading(false);
    }
    
    function companyTypeDelete(item){
        setMessageBox({...messageBox, show: true, message: `Are you sure you want to delete company type: ${item.company}?`, callback: async ()=>{
            loading(true);
            const response = await axios.delete(`/base/company/${item._id}`, {withCredentials: true});
            if(response.status === 200){
                setMessageBox({...messageBox, show: false})
                showToast('Company type deleted!', 'success');
                fetchBase();
            }else{
                showToast('Unable to delete company type', 'danger');
            }

            loading(false);
        }});
    }

    // user types
    function addNewUserTypeClick(){
        setUserTypeModal({...userTypeModal, show: true, mode: 'add'});
        userTypeRef.current.value = '';
    }
    
    function userTypeSelect(item){
        if(item.user === 'Administrator') return;
        setUserTypeModal({
            ...userTypeModal, 
            show: true, 
            mode: 'edit', 
            _id: item._id,
            accessTypes: item.access
        });
        userTypeRef.current.value = item.user;
    }

    function accessTypeCheck(e){
        if(userTypeModal.accessTypes.includes(e.target.id)){
            setUserTypeModal({
                ...userTypeModal,
                accessTypes: userTypeModal.accessTypes.filter(i=>i!=e.target.id)
            });
        }else{
            setUserTypeModal({
                ...userTypeModal,
                accessTypes: [...userTypeModal.accessTypes, e.target.id]
            });
        }
    }

    async function saveNewUserTypeClick(){
        if(userTypeRef.current.value === ''){
            redBorderMarker(userTypeRef.current);
            return;
        }
        loading(true);
        let response;
        switch(userTypeModal.mode){
            case 'add':
                if(base.userTypes.map(item=>item.user).includes(userTypeRef.current.value)){
                    showToast('User type must be unique', 'warning');
                    redBorderMarker(userTypeRef.current);
                }else{
                    response = await axios.post('/base/user', {user: userTypeRef.current.value, access: userTypeModal.accessTypes}, {withCredentials: true});
                }
            break;
            case 'edit':
                response = await axios.patch(`/base/user/${userTypeModal._id}`, {user: userTypeRef.current.value, access: userTypeModal.accessTypes}, {withCredentials: true});
            break;
        }
        if(response){
            if(response.status === 200){
                setUserTypeModal({...userTypeModal, show: false});
                showToast('User type saved!', 'success');
                fetchBase();
            }else{
                showToast('Unable to save user type', 'danger');
            }
        }
        loading(false);
    }

    function userTypeDelete(item){
        if(item.user === 'Administrator') return;
        setMessageBox({...messageBox, show: true, message: `Are you sure you want to delete user type: ${item.user}?`, callback: async ()=>{
            loading(true);
            const response = await axios.delete(`/base/user/${item._id}`, {withCredentials: true});
            if(response.status === 200){
                setMessageBox({...messageBox, show: false})
                showToast('User type deleted!', 'success');
                fetchBase();
            }else{
                showToast('Unable to delete user type', 'danger');
            }
            loading(false);
        }});
    }

    return (
        <>
        <Modal show={taxModal.show} title='Add New Tax' closeCallback={()=>setTaxModal({...taxModal, show: false})} >
            <div className='flex flex-col flex-1 text-[0.9em] mx-5 pb-5'>
                <label>Code</label>
                <input type="text" className='border p-1 rounded mb-3' ref={taxCodeRef} placeholder='Type here' />
                <label>Description</label>
                <input type="text" className='border p-1 rounded mb-3' ref={taxDescriptionRef} placeholder='Type here' />
                <label>Tax Rate</label>
                <div>
                    <input type="number" className='border p-1 rounded mb-3 w-[100px]' ref={taxRateRef} placeholder='Type here' />
                    <span className='ml-1'>%</span>
                </div>
            </div>
            <div className='flex items-center justify-center p-2 mb-2'>
                <button className='bg-green-600 py-1 px-4 rounded text-white' onClick={saveTaxModalClick}>Save</button>
            </div>
        </Modal>
        <Modal show={companyModal.show} title='' closeCallback={()=>setCompanyModal({...companyModal, show: false})} >
            <div className='flex flex-col flex-1 p-4 text-[0.9em]'>
                <label className='mb-2'>Company Type</label>
                <input type="text" className='border p-1 mb-3 rounded' ref={companyTypeRef} placeholder='Type here' />
            </div>
            <div className='p-2 flex items-center justify-center mb-2'>
                <button className='bg-green-600 py-1 px-4 rounded text-white' onClick={companyTypeSaveClick} >
                    Save
                </button>
            </div>
        </Modal>
        <Modal show={userTypeModal.show} title='' closeCallback={()=>setUserTypeModal({...userTypeModal, show: false})}>
            <div className='flex flex-col flex-1 p-4 text-[0.9em]'>
                <label className='mb-2'>User Type</label>
                <input type="text" className='border p-1 mb-3 rounded' ref={userTypeRef} placeholder='Type here' />
                <div className='max-w-[300px] max-h-[300px] overflow-y-scroll'>
                    <span className='mb-2 inline-block'>Access</span>
                    <ul className='text-[0.8em] flex flex-wrap'>
                        {
                            base.accessTypes.map((item, index)=>
                                <li key={index} className='mr-5 flex items-start mb-2'>
                                    <input type="checkbox" className='mr-1' id={item.code} onChange={accessTypeCheck} checked={userTypeModal.accessTypes.includes(item.code) ? true : false} />
                                    <label htmlFor={item.code} className='w-[100px]' >{item.access}</label>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
            <div className='p-2 flex items-center justify-center mb-2'>
                <button className='bg-green-600 py-1 px-4 rounded text-white' onClick={saveNewUserTypeClick} >
                    Save
                </button>
            </div>
        </Modal>
        {/* message box */}
        <Modal title='' show={messageBox.show} closeCallback={()=>setMessageBox({...messageBox, show: false})}>
            <div className='flex flex-1 items-center justify-center p-5'>
                <p className='text-[0.9em]'>{messageBox.message}</p>
            </div>
            <div className='p-4 flex items-center justify-center'>
                <button className='bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 transition duration-500' onClick={messageBox.callback}>Confirm</button>
            </div>
        </Modal>
        <div className='flex flex-col'>
            {/* tax setup */}
            <div className='p-4 m-1 border-b rounded text-[0.9em]'>
                <h6 className='font-bold mb-5'>Tax</h6>
                <ul className='list-disc pl-2 text-[0.8em] mb-10'> 
                    {
                        base.taxTypes.length > 0 ? base.taxTypes.map((item, index)=>{
                            return (
                                <li className='flex items-center mb-3' key={index}>
                                    <span className='mr-2'>{index + 1}. </span>
                                    <button className='flex items-center border-b border-black' onClick={()=>taxSelect(item)}>
                                        <span className='mr-2'>{item.taxCode}</span>
                                        -
                                        <span className='mx-2 inline-block max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis'>
                                            { item.tax }
                                        </span>
                                        - 
                                        <span className='ml-2'>{item.percentage}%</span>
                                    </button>
                                    <button className='text-red-500 ml-1 text-bold rounded p-1 text-[1.5em]' onClick={()=>taxDelete(item)} >
                                        <BsXCircle />
                                    </button>
                                </li>
                            )
                        }) : <li>No setup found</li>
                    }
                </ul>
                <button className="
                        flex items-center bg-green-600 text-white p-1 px-4 w-[250px] rounded m-3
                        before:content-[''] before:absolute before:left-[-20px] before:top-[50%] 
                        before:h-0.5 before:w-[20px] before:border-t before:border-gray-400 hover:bg-green-500 transition duration-500
                    " onClick={addNewTaxClick} >
                    <FaPlusCircle className="mr-2" />
                    <span>Add new Tax</span>
                </button>
            </div>
                {/* user types */}
                <div className='p-4 m-1 border-b rounded text-[0.9em]'>
                <h6 className='font-bold mb-5'>User Types</h6>
                <ul>
                    {
                        base.userTypes.length > 0 ? base.userTypes.map((item, index)=>{
                            return (
                                <li key={index}>
                                    <span>{index + 1}. </span>
                                    <button onClick={()=>userTypeSelect(item)}>
                                        <span className='underline'>{item.user}</span>
                                    </button>
                                    <button className='text-red-500 ml-1 text-bold rounded p-1 text-[0.9em]' onClick={()=>userTypeDelete(item)} >
                                        <BsXCircle />
                                    </button>
                                </li>
                            )
                        }) : <li>No setup found</li>
                    }
                </ul>
                <button className="
                        flex items-center bg-green-600 text-white p-1 px-4 rounded m-3 w-[250px]
                        before:content-[''] before:absolute before:left-[-20px] before:top-[50%] 
                        before:h-0.5 before:w-[20px] before:border-t before:border-gray-400 hover:bg-green-500 transition duration-500
                    " onClick={addNewUserTypeClick} >
                    <FaPlusCircle className="mr-2" />
                    <span>Add new User Type</span>
                </button>
            </div>
            {/* company types */}
            <div className='p-4 m-1 rounded text-[0.9em]'>
                <h6 className='font-bold mb-5'>Company Types</h6>
                <ul>
                    {
                        base.companyTypes.length > 0 ? base.companyTypes.map((item, index)=>{
                            return (
                                <li key={index}>
                                    <span>{index + 1}. </span>
                                    <button onClick={()=>companyTypeSelect(item)}>
                                        <span className='underline'>
                                            {item.company}
                                        </span>
                                    </button>
                                    <button className='text-red-500 ml-1 text-bold rounded p-1 text-[0.9em]' onClick={()=>companyTypeDelete(item)} >
                                        <BsXCircle />
                                    </button>
                                </li>
                            )
                        }) : <li>No setup found</li>
                    }
                </ul>
                <button className="
                        flex items-center bg-green-600 text-white p-1 px-4 rounded m-3 w-[250px]
                        before:content-[''] before:absolute before:left-[-20px] before:top-[50%] 
                        before:h-0.5 before:w-[20px] before:border-t before:border-gray-400 hover:bg-green-500 transition duration-500
                    " onClick={addCompanyTypeClick} >
                    <FaPlusCircle className="mr-2" />
                    <span>Add new Company Type</span>
                </button>
            </div>
        </div>
        </>
    );
}

export default Setup;