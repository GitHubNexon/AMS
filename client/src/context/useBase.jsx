import axios from "axios";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";

/**
 * default system constants
 * saved on database for customization
 */

const useBase = () => {

    const [base, setBase] = useState({  
        accountCategories: [], 
        taxTypes: [], 
        companyTypes: [], 
        userTypes: [], 
        accessTypes: [], 
        paymentTerms: [], 
        paymentMethods: [],
        workGroups: [],
        ReceiptEntryType: [],
    });

    useEffect(()=>{  
        fetchBase();
    }, []);

    const fetchBase = async () => {
        try{
            const response = await axios.get(`${API_BASE_URL}/base/`);
            const base = response.data;
            setBase(base);
        }catch(error){
            console.error('Error fetching base data: ', error);
        }
    };

    return {
        base, setBase, fetchBase
    };
};

export default useBase;