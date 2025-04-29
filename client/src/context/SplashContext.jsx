import { createContext, useContext, useState } from "react";

export const SplashContext = createContext();

export const SplashProvider = ({children}) => {
    const [showSplash, setShowSplash] = useState(true);
    return (
        <SplashContext.Provider value={{showSplash, setShowSplash}}>
            <div className={`
                fixed top-0 left-0 h-screen w-screen z-20 bg-gray-200 fade
                ${showSplash ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}>
            </div>
            {children}
        </SplashContext.Provider>
    );
};

export const useSplash = () => useContext(SplashContext);