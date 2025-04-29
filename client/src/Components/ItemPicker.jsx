import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import ProductsModal from '../Pop-Up-Pages/ProductsModal';
import ServicesModal from '../Pop-Up-Pages/ServicesModal';
import ProductsAndServicesApi from '../api/ProductsAndServicesApi';
import noimage from '../assets/images/noimage.jpg';

// pass a state setter in here for item object
function ItemPicker({selectedItem, setSelectedItem = ()=>{}}) {

    const [showModal, setShowModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [category, setCategory] = useState('products');
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [showInfo, setShowInfo] = useState(false);
    const [tableData, setTableData] = useState([]);

    useEffect(()=>{
        renderTable();
    }, [category, search]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch(query);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    async function renderTable(){
        let data = [];
        switch(category){
            case 'products':
                data = await ProductsAndServicesApi.getProducts(1, 1000, search);
                setTableData(data.products)
            break;
            case 'services':
                data = await ProductsAndServicesApi.getServices(1, 1000, search);
                setTableData(data.services)
            break;
        }
    }
    
    const handleSearch = (searchQuery) => {
        setSearch(searchQuery);
    };
    
    function onProductSave(i){
        setSelectedItem(i);
        setShowModal(false);
    }

    function onServiceSave(i){
        setSelectedItem(i);
        setShowModal(false);
    }

    function selectClick(item){
        setSelectedItem(item);        
        setShowModal(false);
        setShowInfo({show: false});
    }

    function itemInfo(item){
        setShowInfo({...item, show: true});
    }

    return (
        <>
        <input 
            type="text" 
            className='border rounded flex-1 w-[100%] p-1'
            readOnly
            placeholder='Select a product/service'
            value={!selectedItem ? '' : selectedItem.name}
            onClick={()=>setShowModal(true)} />
        <Modal title='Select a product / service' show={showModal} closeCallback={()=>setShowModal(false)} >
            <div className='p-4 flex flex-col'>
                <div className='flex justify-end mb-4'>
                    <div className='ml-5 flex border-2 rounded-lg text-xs'>
                        <span className='flex items-center py-1 px-2'>Add new</span>
                        <button className='py-1 px-2 bg-blue-500 text-white transition duration-500 hover:bg-blue-400' onClick={()=>setShowProductModal(true)} >Product</button>
                        <div className='p-[3px] bg-green-400' />
                        <button className='py-1 px-2 bg-yellow-500 text-white rounded-r-lg transition duration-500 hover:bg-yellow-400' onClick={()=>setShowServiceModal(true)}>Service</button>
                    </div>
                </div>
                <div className='flex flex-wrap mb-2 items-center'>
                    <select className='border p-1 rounded mr-2 mb-2' onChange={(e)=>setCategory(e.target.value)}>
                        <option value="products">Products</option>
                        <option value="services">Services</option>
                    </select>
                    <input className='p-1 flex-1 rounded border mb-2' type="text" placeholder='Search' onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className='h-[50vh] max-w-[80vw] relative overflow-y-scroll text-[0.7em] text-center'>
                    <table className='w-[100%]'>
                        <thead>
                            <tr className='sticky top-0 bg-gray-300'>
                                <th></th>
                                <th className='p-2'>{category}</th>
                                <th>price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                tableData.map((item, index)=>
                                    <tr key={index} className='border-b hover:bg-gray-100'>
                                        <td>
                                            <button className='p-1 bg-blue-200 rounded' onClick={()=>itemInfo(item)} >?</button>
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.price}</td>
                                        <td>
                                            <button className='p1 bg-green-600 text-white p-1 rounded m-1 transition duration-500 hover:bg-green-500' onClick={()=>selectClick(item)} >select</button>
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
        <Modal show={showInfo.show} closeCallback={()=>setShowInfo({show: false})} >
            <div className='flex-1 text-sm p-4'>
                <div className='flex items-center justify-center mb-4'>
                    <img className='h-[120px]' src={showInfo.productImage || noimage} />
                </div>
                <div className='flex mb-1'>
                    <span className='w-[95px] font-bold'>Name:</span>
                    <span>{showInfo.name}</span>
                </div>
                <div className='flex mb-1'>
                    <span className='w-[95px] font-bold'>Description:</span>
                    <span>{showInfo.description}</span>
                </div>
                <div className='flex mb-1'>
                    <span className='w-[95px] font-bold'>Price:</span>
                    <span>{showInfo.price}</span>
                </div>
                <div className='flex flex-col text-[0.7em] mt-3 mb-1'>
                    <span className='font-bold'>Income Account:</span>
                    <span>{showInfo.account && showInfo.account.category}</span>
                    <div className='flex'>
                        <span className='w-[50px]'>Code: </span>
                        <span>{showInfo.account && showInfo.account.code}</span>
                    </div>
                    <div className='flex'>
                        <span className='w-[50px]'>Account:</span>
                        <span>{showInfo.account && showInfo.account.name}</span>
                    </div>
                </div>
            </div>
            <div className='flex justify-center p-4'>
                <button className='py-1 px-2 bg-green-500 hover:bg-green-400 transition duration-500 rounded text-white text-sm' onClick={()=>selectClick(showInfo)}>
                    Select this {category.substring(0, category.length - 1)}
                </button>
            </div>
        </Modal>
        <ProductsModal isOpen={showProductModal} onClose={()=>setShowProductModal(false)} mode={'add'} onSaveProduct={onProductSave} />
        <ServicesModal isOpen={showServiceModal} onClose={()=>setShowServiceModal(false)} mode={'add'} onSaveService={onServiceSave} />
        </>
    );
}

export default ItemPicker;