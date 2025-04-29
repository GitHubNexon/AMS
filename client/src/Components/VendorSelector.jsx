import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from "react-select";
import { API_BASE_URL } from '../api/config';
import VendorModal from '../Pop-Up-Pages/VendorModal';

function VendorSelector({selectedVendor=null, onVendorSelect=()=>{}}) {

    const [vendors, setVendors] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

    useState(()=>{
        getVendorList();
    }, []);

    useEffect(()=>{
        if(!selectedVendor){
            setVendor(null);
        }else{
            setVendor({
                value: selectedVendor.value || selectedVendor.vendorId,
                label: selectedVendor.label || selectedVendor.vendorName
            });
        }
    }, [selectedVendor]);

    // useEffect(()=>{
    //     if(selectedVendor){
    //         setVendor({ value: selectedVendor._id || selectedVendor.vendorId, label: selectedVendor.VendorDisplayName || selectedVendor.vendorName });
    //     }else{
    //         setVendor(null);
    //     }
    // }, [selectedVendor]);

    // useEffect(()=>{
    //     onVendorSelect(vendor);
    // }, [vendor]);

    async function getVendorList(){
        const response = await axios.get(`${API_BASE_URL}/vendors`, {withCredentials: true});
        setVendors(response.data.vendors);
    }

    function vendorSelect(v){
        if(v.value === 'addnew'){
            setIsVendorModalOpen(true);
            return;
        }
        console.log(v);
        // setVendor(v);
        // onVendorSelect(v);
        onVendorSelect(v);
    }
    
    async function newVendorAdded(v){
        await getVendorList();
        // setVendor({ value: v._id, label: v.VendorDisplayName });
        onVendorSelect(v);
    }

    return (
        <>
        <Select 
            options={[
                { value: 'addnew', label: '- Add new vendor -' },
                ...vendors.map(v=>({ value: v._id, label: v.VendorDisplayName}))
            ]}
            onChange={vendorSelect}
            value={vendor} />
        {isVendorModalOpen && (
            <VendorModal
                isOpen={isVendorModalOpen}
                mode={"add"}
                onClose={()=>setIsVendorModalOpen(false)}
                onSaveVendor={(nv)=>{newVendorAdded(nv)}}
            />
        )}
        </>
    );
}

export default VendorSelector;