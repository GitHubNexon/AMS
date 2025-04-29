import React from 'react';
import { LedgerSheetContextProvider } from './LedgerSheetContext';

function ContextBootstrap({children}) {
    return (
        <LedgerSheetContextProvider>
            { children }
        </LedgerSheetContextProvider>
    );
}

export default ContextBootstrap;