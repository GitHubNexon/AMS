import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from "react-select";

function CASLPicker({ selectedSL = { slCode: '', name: '' }, setSelectedSL = () => {}, disabled=false }) {

    const [list, setList] = useState([]);

    useEffect(() => {
        getSLList();
    }, []);

    async function getSLList() {
        const response = await axios.get(`/ca/FileMaintenance/sl`, { withCredentials: true });
        if (response.data.length > 0) {
            setList(response.data.map(m => ({
                value: m,
                label: m.name
            })));
        }
    }

    return (
        <Select
            className='bbb min-w-[200px]'
            options={list}
            value={list.find(opt => opt.value.slCode === selectedSL.slCode) || null}
            onChange={(option) => setSelectedSL(option ? option.value : { slCode: '', name: '' })}
            isClearable
            isDisabled={disabled}
        />
    );
}

export default CASLPicker;
