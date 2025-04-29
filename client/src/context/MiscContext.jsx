import { createContext, useEffect, useState } from "react";

export const MiscContext = createContext();

export function MiscContextProvider({ children }) {
  const [expandSidebar, setExpandSidebar] = useState(false);
  const [isEntriesOpen, setIsEntriesOpen] = useState(false); // State for dropdown
  const [isAccountingEntriesOpen, setAccountingIsEntriesOpen] = useState(false); // State for dropdown
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false);

  return (
    <MiscContext.Provider
      value={{
        isEntriesOpen,
        setIsEntriesOpen,
        isAccountingEntriesOpen,
        setAccountingIsEntriesOpen,
        isSalesOpen,
        setIsSalesOpen,
        expandSidebar,
        setExpandSidebar,
        isExpensesOpen, setIsExpensesOpen
      }}
    >
      {children}
    </MiscContext.Provider>
  );
}
