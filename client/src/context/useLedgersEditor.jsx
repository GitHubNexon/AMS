import React from 'react';

// shared logic with LedgersEditor (not including data)
function useLedgersEditor(ledgers, setLedgers) {

    function updateRow(index, field, value) {
        if (field === "delete") {
            value.preventDefault();
            if (ledgers.length === 1) return;
            // Remove the item at the specified index
            setLedgers(ledgers.filter((_, i)=> i !== index));
        } else if (field === "moveup" || field === "movedown") {
            value.preventDefault();
            const _ledgers = [...ledgers]; // Create a copy to avoid mutating the state directly
            if (field === "moveup" && index > 0) {
                // Swap the current item with the previous item
                [_ledgers[index - 1], _ledgers[index]] = [_ledgers[index], _ledgers[index - 1]];
                setLedgers(_ledgers);
            } else if (field === "movedown" && index < _ledgers.length - 1) {
                // Swap the current item with the next item
                [_ledgers[index], _ledgers[index + 1]] = [_ledgers[index + 1], _ledgers[index]];
                setLedgers(_ledgers); // Make sure to update the state
            }
        } else {
            // Existing logic for updating rows
            const _ledgers = ledgers;
            let updatedRow = {..._ledgers[index]};
            if(field.includes('.')){
                const [nestedField, subField] = field.split('.');
                updatedRow[nestedField] = {
                    ...updatedRow[nestedField],
                    [subField]: value
                };
            }else{
                
                updatedRow[field] = value;
                if(field === 'type'){
                if(value === 'DR'){
                    updatedRow.cr = '';
                }else if(value === 'CR'){
                    updatedRow.dr = '';
                }
                }
            }
            _ledgers[index] = updatedRow;
            setLedgers(_ledgers);
        }
    }

    return {
        updateRow,
        ledgers,
        setLedgers
    };
}

export default useLedgersEditor;
