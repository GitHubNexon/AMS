import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import SubledgerModal from '../Pop-Up-Pages/SubledgerModal';

function SubledgerPicker({ 
    slCode = '', 
    setSLCode = () => {}, 
    name = '', 
    setName = () => {}, 
    callback = () => {}, 
    id = '', 
    setId = () => {}, 
    tin = '', 
    setTin = () => {}, 
    address = '', 
    setAddress = () => {},
    zip = '',
    setZip = () => {},
    subledgers = [],
    canAdd = true,
    setAll = ()=>{}
}) {
    const [subledgerModal, setSubledgerModal] = useState({ show: false });

    const [defaultOptions, setDefaultOptions] = useState([
        { value: 'addnew', label: ' -- Add New -- ' },
        ...subledgers.map(item => ({
            value: { 
                slCode: item.slCode, 
                name: item.name, 
                id: item._id, 
                tin: item.tin, 
                address: item.address, 
                zip: item.zip 
            },
            label: `${item.slCode} - ${item.name}`
        }))
    ]);

    useEffect(()=>{
        if(!canAdd){
            setDefaultOptions([
                ...subledgers.map(item => ({
                    value: { 
                        slCode: item.slCode, 
                        name: item.name, 
                        id: item._id, 
                        tin: item.tin, 
                        address: item.address, 
                        zip: item.zip 
                    },
                    label: `${item.slCode} - ${item.name}`
                }))
            ]);
        }
    }, [canAdd]);

    const loadOptions = async (inputValue, callback) => {
        try {
            const response = await axios.get(`/subledgers?search=${inputValue}`, { withCredentials: true });
            const options = response.data.data.map(item => ({
                value: { 
                    slCode: item.slCode, 
                    name: item.name, 
                    id: item._id, 
                    tin: item.tin, 
                    address: item.address, 
                    zip: item.zip 
                },
                label: `${item.slCode} - ${item.name}`
            }));
            callback(options);
        } catch (error) {
            console.error(error);
            callback([]);
        }
    };

    const defaultValue = slCode && name 
        ? { value: { slCode, name, id: '', tin: '', address: '', zip: '' }, label: `${slCode} ${name}` } 
        : null;

    const customStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (provided) => ({
            ...provided,
            maxHeight: '150px',
            overflowY: 'auto'
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '150px',
        }),
        control: (provided) => ({
            ...provided,
            paddingTop: '0',
            paddingBottom: '0',
        }),
    };

    function subledgerChange(values) {
        if (!values) {
            // Handle clearing the selection
            setSLCode('');
            setName('');
            setId('');
            setTin('');
            setAddress('');
            setZip('');
            return;
        }

        if (values.value === 'addnew') {
            setSubledgerModal({ show: true });
            setSLCode('');
            setName('');
            setId('');
            setTin('');
            setAddress('');
            setZip('');
            return;
        }

        setSLCode(values.value.slCode);
        setName(values.value.name);
        setId(values.value.id);
        setTin(values.value.tin);
        setAddress(values.value.address);
        setZip(values.value.zip);

        setAll({
            _id: values.value.id,
            slCode: values.value.slCode,
            name: values.value.name,
            tin: values.value.tin,
            address: values.value.address,
            zip: values.value.zip
        });
    }

    return (
        <>
            <SubledgerModal 
                className='text-[1.2em] z-50' 
                show={subledgerModal.show} 
                setShow={(v) => setSubledgerModal({ ...subledgerModal, show: v })} 
                refresh={callback} 
            />
            <AsyncSelect
                loadOptions={loadOptions}
                styles={customStyles}
                menuPortalTarget={document.body} 
                defaultOptions={defaultOptions}
                cacheOptions
                isClearable
                value={
                    slCode && name 
                        ? { value: { slCode, name, id }, label: `${slCode} - ${name}` } 
                        : null // Ensures input is blank when cleared
                }
                defaultValue={defaultValue}
                onChange={(selectedOption) => subledgerChange(selectedOption)}
                placeholder="Type name or SL code..."
            />
        </>
    );
}

export default SubledgerPicker;
