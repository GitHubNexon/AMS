import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

const DataPreloaderContext = createContext();

export const DataPreloadProvider = ({ children }) => {

    // pre loads data to prevent multiple requests on some input with filtering
    // ledgers
    const [accounts, setAccounts] = useState([]);
    // subledgers
    const [subledgers, setSubledgers] = useState([]);
    // last closing
    const [lastClosing, setLastClosing] = useState(null);

    useEffect(()=>{
        populateAccounts();
        getLastClosing();
    }, []);

    async function populateAccounts() {
        if(accounts.length === 0){
            const response = await axios.get(`/account`, {withCredentials: true});
            const sls = await axios.get(`/subledgers`, { withCredentials: true });
            setSubledgers(sls.data.data);
            setAccounts(response.data);
        }
    }

    async function refreshAccounts(){
        const response = await axios.get(`/account`, {withCredentials: true});
        const sls = await axios.get(`/subledgers`, { withCredentials: true });
        setSubledgers(sls.data.data);
        setAccounts(response.data);
    }

    async function getLastClosing(){
        const response = await axios.get(`/closing?closed=true`, {withCredentials: true});
        if(response.data.list.length > 0){
            setLastClosing(response.data.list[0].closingDate);
        }
    }

    return (
        <DataPreloaderContext.Provider value={{
            accounts, setAccounts,
            subledgers, setSubledgers,
            lastClosing, setLastClosing,
            getLastClosing,
            refreshAccounts
        }}>
            {children}
        </DataPreloaderContext.Provider>
    );
}

export const useDataPreloader = () => useContext(DataPreloaderContext);;