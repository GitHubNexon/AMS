export function redBorderMarker(elem){
    elem.classList.add('animated-border');
    elem.classList.add('red-border');
    setTimeout(()=>{
        elem.classList.remove('red-border');
    }, 3000)
}

export function formatFullReadableDate(date) {
    if(!date) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}


export function formatDateToMonthYear(date) {
    if (!(date instanceof Date)) {
        date = new Date(date); // Convert input to Date object if not already
    }
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("en-US", options).toUpperCase();
}

export function formatDateToYYYMMdd(date){
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatMMMDDYYYY(dateString) {
    const date = new Date(dateString);
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function numberToCurrencyString(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function currencyStringToNumber(str) {
    const num = parseFloat(str.replace(/,/g, ''));
    return Math.round(num * 100) / 100;
}

export function formatReadableDate(dateString){
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[date.getUTCMonth()]; // getUTCMonth() returns 0-indexed month
    const day = date.getUTCDate(); // getUTCDate() returns the day of the month
    const year = date.getUTCFullYear(); // getUTCFullYear() returns the year
    return `${monthName} ${day}, ${year}`;
}

export function formatDateToDays(dateString) {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    
    const timeDifference = currentDate - inputDate;

    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    const dayLabel = daysDifference === 1 ? 'day' : 'days';

    return `${daysDifference} ${dayLabel} ago`;
}


// New function to get status color class
export function getStatusColor(statusType) {
    switch (statusType) {
        case "Paid":
            return "text-green-500"; 
        case "Partially Paid":
            return "text-yellow-500"; 
        case "Pending":
            return "text-gray-500"; 
        case "Past Due":
            return "text-red-500"; 
        default:
            return "text-gray-500"; 
    }
}

export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

export function removeFileByName(input, fileName) {
    const dt = new DataTransfer(); // Create a new DataTransfer object

    // Loop through the current files
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        // Add all files to the DataTransfer object except the one that matches fileName
        if (file.name !== fileName) {
            dt.items.add(file); // Add the file to DataTransfer if it doesn't match
        }
    }

    // Update the input with the new FileList
    input.files = dt.files;
}

export function monthName(m){
    const monthNames = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return monthNames[m];
}

export function formatStringDateToDDMMMYY(dateString) {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = date.getDate(); // Get the day (e.g., 20)
    const month = date.toLocaleString('default', { month: 'short' }); // Get the short month name (e.g., Nov)
    const year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year (e.g., 24)
    return `${day}-${month}-${year}`;
}

export function isTodayInRange(startDate, endDate) {
    const today = new Date();
    // Remove time component from dates for accurate comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return todayStart >= start && todayStart <= end;
}

export function getFirstAndLastDayOfMonth(yearMonth) {
    // Split the input into year and month
    const [year, month] = yearMonth.split('-').map(Number);
    // Create a Date object for the first day of the month
    const firstDay = new Date(year, month - 1, 1);
    // Create a Date object for the last day of the month
    const lastDay = new Date(year, month, 0); // month is 1-based for the next month
    return {
        firstDay: formatDateToYYYMMdd(firstDay),
        lastDay: formatDateToYYYMMdd(lastDay)
    };
}

export function extractAccounts(structure) {
    const accountPattern = /:(\w+)/g;  // Matches : followed by alphanumeric characters (account names)
    const accounts = new Set();  // Using a Set to avoid duplicates
    structure.forEach(row => {
        const matches = row.calc.match(accountPattern);  // Get all matches for account names
        if (matches) {
            matches.forEach(match => {
                accounts.add(match);  // Add each account name to the Set
            });
        }
    });
    return Array.from(accounts).map(m=>m.slice(1));  // Convert the Set to an array and return it
}

export function evaluateExpression(data, expression) {
    // Define supported functions
    const functions = {
        SUM: (...args) => args.reduce((a, b) => a + b, 0),
        AVG: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
        MIN: (...args) => Math.min(...args),
        MAX: (...args) => Math.max(...args),
        PRODUCT: (...args) => args.reduce((a, b) => a * b, 1),
        ABS: (x) => Math.abs(x),
        POWER: (base, exp) => Math.pow(base, exp),
    };

    try {
        // Normalize the expression by removing extra spaces and newlines
        expression = expression.replace(/\s+/g, ' ').trim();  // Replace multiple spaces with a single space
        expression = expression.replace(/\n/g, ' ');           // Replace newlines with spaces

        // Replace variables in the expression with their values from the data object
        expression = expression.replace(/:(\w+)/g, (_, key) => {
            // If the account is found in data, return its value; otherwise, return 0
            return key in data ? data[key] : 0;
        });

        // Replace functions like SUM(), AVG(), etc. with their evaluations
        expression = expression.replace(/(\bSUM|\bAVG|\bMIN|\bMAX|\bPRODUCT|\bABS|\bPOWER)\(([^)]*)\)/g, (_, funcName, args) => {
            const func = functions[funcName];
            if (!func) throw new Error(`Unknown function '${funcName}'`);

            // Parse arguments (split by commas and convert to numbers)
            const values = args.split(',').map(arg => {
                // Replace variables within the function arguments
                if (arg.trim().startsWith(':')) {
                    const varName = arg.trim().slice(1); // Remove the colon
                    return varName in data ? data[varName] : 0; // Use 0 if variable is not in data
                }
                return Number(arg.trim());
            });

            return func(...values);
        });

        // Evaluate the arithmetic expression safely
        // return eval(expression);  // This is where the expression is evaluated
        return null;

    } catch (error) {
        // If an error occurs during evaluation, return the custom error message
        // console.error("Error evaluating expression:", error.message);
        return "Formula Error";  // Return a user-friendly error message
    }
}











export function formatLedgers(ledgers) {
    const ledgerMap = {};
    const orderedLedgerCodes = []; // Array to track the order of ledger codes

    // Group transactions by ledger but keep separate entries for debits and credits
    ledgers.forEach((entry) => {
        const ledgerCode = entry.ledger.code;

        if (!ledgerMap[ledgerCode]) {
            ledgerMap[ledgerCode] = {
                debit: { accountCode: ledgerCode, accountTitle: entry.ledger.name, total: 0, breakdown: [] },
                credit: { accountCode: ledgerCode, accountTitle: entry.ledger.name, total: 0, breakdown: [] },
            };
            orderedLedgerCodes.push(ledgerCode); // Track the order of ledger codes
        }

        // Separate debits and credits under different objects
        if (entry.dr) {
            ledgerMap[ledgerCode].debit.total += entry.dr;
            ledgerMap[ledgerCode].debit.breakdown.push({
                accountCode: entry.subledger ? entry.subledger.slCode : ledgerCode,
                accountTitle: entry.subledger ? entry.subledger.name : entry.ledger.name,
                d2: numberToCurrencyString(entry.dr),
                c2: "",
            });
        }

        if (entry.cr) {
            ledgerMap[ledgerCode].credit.total += entry.cr;
            ledgerMap[ledgerCode].credit.breakdown.push({
                accountCode: entry.subledger ? entry.subledger.slCode : ledgerCode,
                accountTitle: entry.subledger ? entry.subledger.name : entry.ledger.name,
                d2: "",
                c2: numberToCurrencyString(entry.cr),
            });
        }
    });

    const formatted = [];

    // **Step 1: Process all debit-ledgers in the same order as they were encountered**
    orderedLedgerCodes.forEach((ledgerCode) => {
        const ledger = ledgerMap[ledgerCode];

        if (ledger.debit.total > 0) {
            formatted.push({
                accountCode: ledger.debit.accountCode,
                accountTitle: ledger.debit.accountTitle,
                d1: numberToCurrencyString(ledger.debit.total),
                c1: "",
                d2: "",
                c2: "",
            });

            ledger.debit.breakdown.forEach((subledger) => {
                formatted.push({
                    accountCode: subledger.accountCode,
                    accountTitle: subledger.accountTitle,
                    d1: "",
                    c1: "",
                    d2: subledger.d2,
                    c2: subledger.c2,
                });
            });
        }
    });

    // **Step 2: Process all credit-ledgers in the same order as they were encountered**
    orderedLedgerCodes.forEach((ledgerCode) => {
        const ledger = ledgerMap[ledgerCode];

        if (ledger.credit.total > 0) {
            formatted.push({
                accountCode: ledger.credit.accountCode,
                accountTitle: ledger.credit.accountTitle,
                d1: "",
                c1: numberToCurrencyString(ledger.credit.total),
                d2: "",
                c2: "",
            });

            ledger.credit.breakdown.forEach((subledger) => {
                formatted.push({
                    accountCode: subledger.accountCode,
                    accountTitle: subledger.accountTitle,
                    d1: "",
                    c1: "",
                    d2: subledger.d2,
                    c2: subledger.c2,
                });
            });
        }
    });

    // **Calculate totals for the last row**
    const totals = formatted.reduce(
        (sum, row) => {
            sum.d1 += parseFloat(currencyStringToNumber(row.d1) || 0);
            sum.c1 += parseFloat(currencyStringToNumber(row.c1) || 0);
            sum.d2 += parseFloat(currencyStringToNumber(row.d2) || 0);
            sum.c2 += parseFloat(currencyStringToNumber(row.c2) || 0);
            return sum;
        },
        { d1: 0, c1: 0, d2: 0, c2: 0 }
    );

    // **Add totals row**
    formatted.push({
        accountCode: "",
        accountTitle: "TOTAL",
        d1: numberToCurrencyString(totals.d1),
        c1: numberToCurrencyString(totals.c1),
        d2: numberToCurrencyString(totals.d2),
        c2: numberToCurrencyString(totals.c2),
    });

    return formatted;
}









// export function formatLedgers(ledgers) {
//     const ledgerMap = {};

//     // Group transactions by ledger but keep separate entries for debits and credits
//     ledgers.forEach((entry) => {
//         const ledgerCode = entry.ledger.code;

//         if (!ledgerMap[ledgerCode]) {
//             ledgerMap[ledgerCode] = {
//                 debit: { accountCode: ledgerCode, accountTitle: entry.ledger.name, total: 0, breakdown: [] },
//                 credit: { accountCode: ledgerCode, accountTitle: entry.ledger.name, total: 0, breakdown: [] },
//             };
//         }

//         // Separate debits and credits under different objects
//         if (entry.dr) {
//             ledgerMap[ledgerCode].debit.total += entry.dr;
//             ledgerMap[ledgerCode].debit.breakdown.push({
//                 accountCode: entry.subledger ? entry.subledger.slCode : ledgerCode,
//                 accountTitle: entry.subledger ? entry.subledger.name : entry.ledger.name,
//                 d2: numberToCurrencyString(entry.dr),
//                 c2: "",
//             });
//         }

//         if (entry.cr) {
//             ledgerMap[ledgerCode].credit.total += entry.cr;
//             ledgerMap[ledgerCode].credit.breakdown.push({
//                 accountCode: entry.subledger ? entry.subledger.slCode : ledgerCode,
//                 accountTitle: entry.subledger ? entry.subledger.name : entry.ledger.name,
//                 d2: "",
//                 c2: numberToCurrencyString(entry.cr),
//             });
//         }
//     });

//     const formatted = [];

//     // **Step 1: Process all debit-ledgers first**
//     Object.values(ledgerMap).forEach((ledger) => {
//         if (ledger.debit.total > 0) {
//             formatted.push({
//                 accountCode: ledger.debit.accountCode,
//                 accountTitle: ledger.debit.accountTitle,
//                 d1: numberToCurrencyString(ledger.debit.total),
//                 c1: "",
//                 d2: "",
//                 c2: "",
//             });

//             ledger.debit.breakdown.forEach((subledger) => {
//                 formatted.push({
//                     accountCode: subledger.accountCode,
//                     accountTitle: subledger.accountTitle,
//                     d1: "",
//                     c1: "",
//                     d2: subledger.d2,
//                     c2: subledger.c2,
//                 });
//             });
//         }
//     });

//     // **Step 2: Process all credit-ledgers after**
//     Object.values(ledgerMap).forEach((ledger) => {
//         if (ledger.credit.total > 0) {
//             formatted.push({
//                 accountCode: ledger.credit.accountCode,
//                 accountTitle: ledger.credit.accountTitle,
//                 d1: "",
//                 c1: numberToCurrencyString(ledger.credit.total),
//                 d2: "",
//                 c2: "",
//             });

//             ledger.credit.breakdown.forEach((subledger) => {
//                 formatted.push({
//                     accountCode: subledger.accountCode,
//                     accountTitle: subledger.accountTitle,
//                     d1: "",
//                     c1: "",
//                     d2: subledger.d2,
//                     c2: subledger.c2,
//                 });
//             });
//         }
//     });

//     // **Calculate totals for the last row**
//     const totals = formatted.reduce(
//         (sum, row) => {
//             sum.d1 += parseFloat(currencyStringToNumber(row.d1) || 0);
//             sum.c1 += parseFloat(currencyStringToNumber(row.c1) || 0);
//             sum.d2 += parseFloat(currencyStringToNumber(row.d2) || 0);
//             sum.c2 += parseFloat(currencyStringToNumber(row.c2) || 0);
//             return sum;
//         },
//         { d1: 0, c1: 0, d2: 0, c2: 0 }
//     );

//     // **Add totals row**
//     formatted.push({
//         accountCode: "",
//         accountTitle: "TOTAL",
//         d1: numberToCurrencyString(totals.d1),
//         c1: numberToCurrencyString(totals.c1),
//         d2: numberToCurrencyString(totals.d2),
//         c2: numberToCurrencyString(totals.c2),
//     });

//     return formatted;
// }