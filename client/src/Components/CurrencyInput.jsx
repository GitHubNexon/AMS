import React, { useEffect, useState } from 'react';
import { numberToCurrencyString, currencyStringToNumber } from '../helper/helper';

/**
 * pass state val and setter setVal props
 * this component will convert float values to currency format as string while keeping original the state val float.
 * vise versa set state val to any float this will be displayed as currency
 * pass tailwind css in className
 * set acceptZero to false to force no zero display
 */
function CurrencyInput({ val, setVal, className, acceptZero = true, disabled = false, onFocus=()=>{} }) {
    const [displayVal, setDisplayVal] = useState('');

    useEffect(() => {
        if (val || val === 0) {
            if (typeof val === 'number') {
                setDisplayVal(
                    val === 0 ? (acceptZero ? '0.00' : '') : numberToCurrencyString(val)
                );
            } else {
                setDisplayVal(
                    val === 0 ? (acceptZero ? '0.00' : '') : currencyStringToNumber(val)
                );
            }
        } else {
            setDisplayVal('');
        }
    }, [val]);

    function inputChange(e) {
        setDisplayVal(e.target.value);
    }

    const handleKeyPress = (e) => {
        const char = String.fromCharCode(e.which);
        const currentValue = e.target.value;

        // Allow digits, '.', ',', and a single leading '-'
        if (!/[\d.,-]/.test(char) || (char === '-' && currentValue.includes('-') && currentValue.length > 0)) {
            e.preventDefault();
        }
    };

    const handleBlur = (e) => {
        if (e.target.value) {
            const numericValue = currencyStringToNumber(e.target.value);

            if (typeof numericValue === 'number') {
                setDisplayVal(
                    numericValue === 0 ? (acceptZero ? '0.00' : '') : numberToCurrencyString(numericValue)
                );
                setVal(numericValue);
            } else {
                setDisplayVal('');
                setVal('');
            }
        } else {
            setDisplayVal('');
            setVal('');
        }
    };

    return (
        <input
            type="text"
            className={className}
            value={displayVal === '0.00' ? (acceptZero ? '0.00' : '') : displayVal}
            onChange={inputChange}
            onFocus={onFocus}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            disabled={disabled}
        />
    );
}

export default CurrencyInput;
