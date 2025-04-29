import React, { useState, useEffect } from 'react';
import SubledgerModal from '../Pop-Up-Pages/SubledgerModal';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa';
import BatchAccrualModal from '../Pop-Up-Pages/BatchAccrualModal';
import StatementOfAccount from './BillingAndCashiering/StatementOfAccount';
import Modal from './Modal';

const _maxRows = 10;

function SubledgerTable({ lesseeOnly=false, data={} }) {

    const [page, setPage] = useState(1);
    const [docsCount, setDocsCount] = useState(0);
    const [list, setList] = useState([]);
    const [subledgerModal, setSubledgerModal] = useState({show: false, selected: {}, mode: 'add'});

    const [search, setSearch] = useState('');
    const [debounce, setDebounce] = useState('');

    const [batchAccrualModal, setBatchAccrualModal] = useState({show: false});

    useEffect(()=>{
        const timer = setTimeout(()=>{
            setSearch(debounce);
        }, 500);
        return ()=> clearTimeout(timer);
    }, [debounce]);

    useEffect(()=>{
        getLesseeList();
    }, [search]);


    useEffect(()=>{
        getLesseeList();
    }, [page]);

    // get lessee list
    async function getLesseeList(){
        const response = await axios.get(`/subledgers/paginated?lesseeOnly=${lesseeOnly}&page=${page}&search=${search}`, {withCredentials: true});
        setDocsCount(response.data.count);
        setList(response.data.docs);
    }

    function prevClick(){
        if(page <= 1) return;
        setPage(page - 1);
    }

    function nextClick(){
        if(page * _maxRows >= docsCount) return;
        setPage(page + 1);
    }

    function addNewClick(){
        setSubledgerModal({show: true, mode: 'add'});
    }

    function editClick(data){
        setSubledgerModal({show: true, selected: data, mode: 'edit'});
    }

    function batchJVCreateClick(){
        setBatchAccrualModal({show: true});
    }

    const [soaModal, setSoaModal] = useState({ show: false, slCode: null, name: '', data: {} });

    return (
        <>
        <BatchAccrualModal show={batchAccrualModal.show} close={()=>setBatchAccrualModal({show: false})} />
        <SubledgerModal 
            show={subledgerModal.show} 
            selectedSubledger={subledgerModal.selected} 
            isLessee={lesseeOnly} 
            mode={subledgerModal.mode} 
            setShow={(v)=>setSubledgerModal({...subledgerModal, show: v})} 
            refresh={getLesseeList} />  
        <div className='mx-auto p-8'>
            <div className='flex mb-4 items-end'>
                <h1 className='flex-1 font-bold'>{lesseeOnly ? 'Lessee' : 'Subledgers'}</h1>
                { lesseeOnly && <button className="mr-4 text-[0.7em] underline" onClick={batchJVCreateClick} >Create Rental Accrual/Order of Payment</button> }
                <input type="text" className='border p-1 mr-2 rounded' value={debounce} onChange={(e)=>setDebounce(e.target.value)} placeholder='search' />
                <button className='bg-blue-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300' onClick={addNewClick} >Add New</button>
            </div>
            <div className='text-[0.8em]'>
                <table className='w-[100%] text-center'>
                    <thead>
                        <tr className='border-b bg-green-500 text-white'>
                            <th className='border-r p-1'>SL</th>
                            <th className='border-r p-1'>NAME</th>
                            <th className='w-[150px] p-1'>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        list.map((item, index)=>
                            <tr key={index} className='border-b' >
                                <td className='p-1 border-r'>{item.slCode}</td>
                                <td className='p-1 border-r'>{item.name}</td>
                                <td className='p-1 flex items-center justify-center'>
                                    <button className='bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition duration-500 mr-2' onClick={()=>editClick(item)} >
                                        <FaEdit />
                                    </button>
                                    {
                                        lesseeOnly &&
                                        <button 
                                            className='bg-green-500 px-2 py-[1px] text-white rounded hover:bg-green-400 transition duration-500'
                                            onClick={()=>setSoaModal({ show: true, slCode: item.slCode, name: item.name, data: item })} >
                                            SOA
                                        </button>
                                    }
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
                <div className='flex items-center justify-center mt-4 relative'>
                    <span className='absolute left-[15px] text-[0.8em]'>{docsCount} subledgers</span>
                    <button className='border rounded p-2 mr-2' onClick={prevClick} >
                        <FaChevronLeft />
                    </button>
                    <button className='border rounded p-2 ml-2' onClick={nextClick} >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
        <Modal title={"Statement of Account"} show={soaModal.show} closeCallback={()=>setSoaModal({ show: false, slCode: null, name: '' })} >
            <div className='border-t flex-1 overflow-y-scroll'>
                <StatementOfAccount slCode={soaModal.slCode} name={soaModal.name} data={soaModal.data} />
            </div>
        </Modal>
        </>
    );
}

export default SubledgerTable;