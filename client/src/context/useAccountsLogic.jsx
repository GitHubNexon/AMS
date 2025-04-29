import { useState, useEffect } from "react";
import {useLoader} from './useLoader';
import axios from 'axios';
import { showToast } from "../utils/toastNotifications";
import { API_BASE_URL } from "../api/config";

export const useAccountsLogic = () => {

    const {loading} = useLoader();
    const [accounts, setAccounts] = useState([]);

    useEffect(()=>{
        fetchAccounts();
    }, []);

    async function addNewAccount(acc){
        try{
            loading(true);
            const response = await axios.post(`${API_BASE_URL}/account`, acc, {withCredentials: true});
            showToast('Account saved', 'success');
            return response;
        }catch(error){
            console.log(error);
            if(error.status === 409){
                showToast('Account code must be unique', 'warning');
                return error;
            }else{
                showToast('Unable to save account');
            }
        }finally{
            loading(false);
        }
    }    

    async function updateAccount(acc, id){
        try{
            loading(true);
            const response = await axios.patch(`${API_BASE_URL}/account/${id}`, acc, {withCredentials: true});
            showToast('Account saved', 'success')
            return response;
        }catch(error){
            console.log(error);
            if(error.status === 409){
                showToast('Account code must be unique', 'warning');
                return error;
            }else{
                showToast('Unable to save account');
            }
        }finally{
            loading(false);
        }
    }

    async function archiveAccount(id){
        try{
            loading(true);
            let response = await axios.delete(`${API_BASE_URL}/account/${id}`, {withCredentials: true});
            showToast('Account archived', 'success');
            return response;
        }catch(error){
            console.error(error);
            showToast('Unable to archive account');
        }finally{
            loading(false);
        }
    }

    async function fetchAccounts(){
        try{
            const response = await axios.get(`${API_BASE_URL}/account`, {withCredentials: true});
            setAccounts(response.data);
        }catch(error){
            console.error(error);
        }finally{
           
        };
    }
        
    return {
        accounts, setAccounts,
        addNewAccount,
        fetchAccounts,
        updateAccount,
        archiveAccount
    };
};

export default useAccountsLogic;