import React, { useEffect, useState } from 'react';
import useBase from '../context/useBase';
import Modal from './Modal';

function TaxPicker({ toTax=0, selectedTax, setSelectedTax }) {

    const {base} = useBase();
    const [showDropdown, setShowDropdown] = useState(false);

    function taxFocus(){
        setShowDropdown(!showDropdown);
    }

    function taxSelect(tax){
        if(selectedTax.map(i=>i._id).includes(tax._id)){
            setSelectedTax(selectedTax.filter(i=>i._id != tax._id));
        }else{ 
            setSelectedTax([...selectedTax, tax]);
        }
    }

    function closeClick(){
        setShowDropdown(false);
    }

    return (
        <>
        <div className='relative'>
            <input 
                type="text" 
                className='border w-[100%] p-1 rounded' 
                onClick={taxFocus} 
                value={selectedTax.map(item=>item.taxCode).join(', ')}
                placeholder='-- Select Tax --' readOnly />
            <div className={`absolute px-1 right-[1px] bg-gray-300 w-[300px] h-[200px] ${showDropdown ? '' : 'hidden'} w-[100%] overflow-y-scroll`}>
                <div className='flex items-end justify-end sticky top-0'>
                    <button className='bg-black text-white px-1 rounded m-1' onClick={closeClick} >X</button>
                </div>
                {
                    base.taxTypes.map((item, index)=>
                        <button 
                            className={`
                                transition duration-300 text-[0.9em] m-2 p-1 rounded 
                                ${selectedTax.map(t => t._id).includes(item._id) ? 'bg-green-600 text-white' : 'bg-white'}
                                hover:bg-green-600 hover:text-white
                            `}
                            key={index}
                            onClick={()=>taxSelect(item)} >
                            {item.taxCode} {item.percentage}%
                        </button>
                    )
                }
            </div>
        </div>
        <Modal show={false} >
            <div className='flex flex-col flex-1 border-t border-b p-4'>
                <span className='text-start p-1 text-[1.3em] border-b'>Select tax</span>
                <div className='w-[250px] flex flex-wrap'>
                {
                    base.taxTypes.map((item, index)=>
                        <button 
                            className={`
                                transition duration-300 m-2 p-1 rounded 
                                ${selectedTax.map(t => t._id).includes(item._id) ? 'bg-green-600 text-white' : 'bg-gray-300'}
                                hover:bg-green-600 hover:text-white
                            `}
                            key={index}
                            onClick={()=>taxSelect(item)} >
                            {item.taxCode} {item.percentage}%
                        </button>
                    )
                }
                </div>
            </div>
            <div className='p-2'>
                <button className='p-2 bg-green-500 text-white rounded hover:bg-green-400 transition duration-500'>Confirm</button>
            </div>
        </Modal>
        </>
    );
}

export default TaxPicker;