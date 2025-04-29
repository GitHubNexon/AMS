import { createContext, useContext, useState } from "react";

export const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {

    const [show, setShow] = useState(false);

    function loading(state){
        setShow(state);
    }

    return (
        <LoaderContext.Provider value={{loading}}>
            <div className={`flex justify-center items-center h-screen loader transition duration-500 ${show ? 'opacity-1 visible' : 'opacity-0 invisible'}`}>
                <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
            </div>
            { children }
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);