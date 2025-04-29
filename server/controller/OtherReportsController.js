const EntriesModel = require("../models/EntriesModel");
const XLSX = require('xlsx');
const { findBookBalance, findBookBalanceSLFiltered } = require("./reportController");

// DRY is shit, we ball
const OtherReports = {

    getTransactionList: async (req, res) => {
        try {
            const { from, to, accounts, page = 1 } = req.body; // Default page is 1
            const pageSize = 10; // Number of entries per page
            const skip = (page - 1) * pageSize; // Calculate how many records to skip
            const entries = await EntriesModel.aggregate([
                {
                    $addFields: {
                        date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                        no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
                    }
                },
                {
                    $unwind: {
                        path: "$ledgers",
                    }
                },
                {
                    $match: {
                        "ledgers.ledger.code": { $in: accounts },
                        date: {
                            $gte: new Date(from),
                            $lte: new Date(to)
                        }
                    }
                },
                {
                    $project: {
                        SLCODE: "$ledgers.subledger.slCode",
                        ACCTCODE: "$ledgers.ledger.code",
                        ["ACCOUNT NAME"]: "$ledgers.ledger.name",
                        SLDATE: "$date",
                        SLDOCCODE: "$EntryType",
                        SLDOCNO: "$no",
                        SLDESC: {$ifNull: ["$ledgers.description", "$Particulars"]},
                        ["Check No,"]: "$CheckNo",
                        SLDEBIT: "$ledgers.dr",
                        SLCREDIT: "$ledgers.cr"
                    }
                },
                { $sort: { date: 1 } }, // Sort by date (ascending)
                { $skip: skip }, // Skip records based on page number
                { $limit: pageSize } // Limit to 10 records per page
            ]);
            // Count total records for pagination info
            const totalRecords = await EntriesModel.aggregate([
                {
                    $addFields: {
                        date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] }
                    }
                },
                { $unwind: "$ledgers" },
                {
                    $match: {
                        "ledgers.ledger.code": { $in: accounts },
                        date: {
                            $gte: new Date(from),
                            $lte: new Date(to)
                        }
                    }
                },
                { $count: "total" }
            ]);
            const totalPages = Math.ceil((totalRecords[0]?.total || 0) / pageSize);
            res.json({
                entries,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalRecords: totalRecords[0]?.total || 0,
                    pageSize
                }
            });
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getTransactionListExport: async (req, res) => {
        try {
            const { from, to, accounts } = req.body;
            const entries = await EntriesModel.aggregate([
                {
                    $addFields: {
                        date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                        no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
                    }
                },
                {
                    $unwind: {
                        path: "$ledgers",
                    }
                },
                {
                    $match: {
                        "ledgers.ledger.code": { $in: accounts },
                        date: {
                            $gte: new Date(from),
                            $lte: new Date(to)
                        }
                    }
                },
                {
                    $project: {
                        SLCODE: "$ledgers.subledger.slCode",
                        ACCTCODE: "$ledgers.ledger.code",
                        ["ACCOUNT NAME"]: "$ledgers.ledger.name",
                        SLDATE: "$date",
                        SLDOCCODE: "$EntryType",
                        SLDOCNO: "$no",
                        SLDESC: {$ifNull: ["$ledgers.description", "$Particulars"]},
                        ["Check No,"]: "$CheckNo",
                        SLDEBIT: "$ledgers.dr",
                        SLCREDIT: "$ledgers.cr"
                    }
                },
                { $sort: { date: 1 } }, // Sort by date (ascending)
            ]);
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]); // Empty worksheet
            // Define headers
            const headers1 = [["NATIONAL DEVELOPMENT COMPANY"]]; // Title row
            const headers2 = [["TRANSACTION LIST"]];
            const headers3 = [[`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`]];
            const blankRow = [[]]; // Empty row for spacing
            // Insert headers at the top
            XLSX.utils.sheet_add_aoa(worksheet, headers1, { origin: "A1" });
            XLSX.utils.sheet_add_aoa(worksheet, headers2, { origin: "A2" });
            XLSX.utils.sheet_add_aoa(worksheet, headers3, { origin: "A3" });
            XLSX.utils.sheet_add_aoa(worksheet, blankRow, { origin: "A4" });
            const columnHeaders = [
                [
                    "SLCODE", "ACCTCODE", "ACCOUNT NAME", "SLDATE", "SLDOCCODE",
                    "SLDOCNO", "SLDESC", "Check No,","SLDEBIT", "SLCREDIT"
                ]
            ];
            XLSX.utils.sheet_add_aoa(worksheet, columnHeaders, { origin: "A5" });
            // Add JSON data starting at A3 (to preserve headers)
            XLSX.utils.sheet_add_json(worksheet, entries, { origin: "A6", skipHeader: true, header: columnHeaders[0] });
            // Create a workbook and add the worksheet
            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Merge A1 to F1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Merge A2 to F2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }  // Merge A3 to F3
            ];
          
            worksheet['!cols'] = [
                { wch: 8 },
                { wch: 10 },
                { wch: 45 },
                { wch: 10 },
                { wch: 10 },
                { wch: 15 },
                { wch: 30 },
                { wch: 10 },
                { wch: 15 },
                { wch: 15 }
            ];
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "TRANSACTION LIST");
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            // Set headers and send the Excel file
            res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    
    getGeneralLedger: async (req, res)=>{
        try{
            const { from, to, account, name='' } = req.body;
            const data = await generalLedgerReport(from, to, account, name);
            res.json(data);
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getGeneralLedgerExport: async (req, res) => {
        try {
            const { from, to, accounts } = req.body;
    
            // Process all reports concurrently
            const reports = await Promise.all(
                accounts.map(acc => generalLedgerReport(from, to, acc.code, acc.name))
            );
    
            // Flatten the reports array & ensure proper structure
            const data = reports.flat().map(entry => [
                String(entry.accountNumber || ""),  // A: Account Number (as string to prevent Excel formatting)
                entry.date || "",                   // B: Date
                entry.particulars || "",            // C: Particulars
                entry.docType || "",                // D: Document Type
                entry.debit || "",                   // E: Debit
                entry.credit || "",                  // F: Credit
                entry.balance || ""                  // G: Balance
            ]);
    
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
    
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["GENERAL LEDGER"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT NUMBER", "DATE", "PARTICULARS", "DOC TYPE", "DEBIT", "CREDIT", "BALANCE"] // A5
            ];
    
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
    
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
    
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }  // Merge A3:G3
            ];
    
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 20 }, // ACCOUNT NUMBER
                { wch: 12 }, // DATE
                { wch: 40 }, // PARTICULARS
                { wch: 12 }, // DOC TYPE
                { wch: 15 }, // DEBIT
                { wch: 15 }, // CREDIT
                { wch: 15 }  // BALANCE
            ];
    
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "GENERAL LEDGER");
    
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
    
        } catch (error) {
            console.error("Error generating general ledger export:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getSubsidiary: async (req, res)=>{
        try{
            const { from, to, account, name='', subledgers=[] } = req.body;
            console.log(subledgers);
            const data = await subsidiaryReport(from, to, account, name, subledgers);
            res.json(data);
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getSubsidiaryExport: async (req, res) => {
        try {
            const { from, to, accounts, subledgers } = req.body;
    
            // Process all reports concurrently
            const reports = await Promise.all(
                accounts.map(acc => subsidiaryReport(from, to, acc.code, acc.name, subledgers))
            );
    
            // Flatten the reports array & ensure proper structure
            const data = reports.flat().map(entry => [
                String(entry.accountNumber || ""),  // A: Account Number (as string to prevent Excel formatting)
                entry.date || "",                   // B: Date
                entry.particulars || "",            // C: Particulars
                entry.docType || "",                // D: Document Type
                entry.debit || "",                   // E: Debit
                entry.credit || "",                  // F: Credit
                entry.balance || ""                  // G: Balance
            ]);
    
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
    
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["SUBSIDIARY REPORT"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT NUMBER", "DATE", "PARTICULARS", "DOC TYPE", "DEBIT", "CREDIT", "BALANCE"] // A5
            ];
    
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
    
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
    
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }  // Merge A3:G3
            ];
    
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 20 }, // ACCOUNT NUMBER
                { wch: 12 }, // DATE
                { wch: 40 }, // PARTICULARS
                { wch: 12 }, // DOC TYPE
                { wch: 15 }, // DEBIT
                { wch: 15 }, // CREDIT
                { wch: 15 }  // BALANCE
            ];
    
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SUBSIDIARY REPORT");
    
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
    
        } catch (error) {
            console.error("Error generating general ledger export:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getDepostSlip: async (req, res) => {
        try{

            const {from, to, page=1} = req.query;

            // this bases on particulars: not sure for now if we need to filder by account
            const data = await regexSearchPaginated(from, to, "DEPOSIT OF COLLECTION RE:", page);

            // grouping
            const groupedEntries = data.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
            
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
            
                group.entries.push(entry);
                return acc;
            }, []);

            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: '',
                    details: groupedEntries[i].name,
                    date: '',
                    particulars: '',
                    debit: '',
                    credit: '',
                    total: ''
                });
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        accountCode: '',
                        referenceTypeNo: groupedEntries[i].entries[j].CRNo,
                        details: '',
                        date: groupedEntries[i].entries[j].CRDate,
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            res.json({...data, entries: formattedEntries});
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getDepostSlipExport: async (req, res) => {
        try{
            const {from, to} = req.query;
            // this bases on particulars: not sure for now if we need to filder by account
            const dataf = await regexSearch(from, to, "DEPOSIT OF COLLECTION RE:");
            // grouping
            const groupedEntries = dataf.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
            
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
            
                group.entries.push(entry);
                return acc;
            }, []);
            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: '',
                    details: groupedEntries[i].name,
                    date: '',
                    particulars: '',
                    debit: '',
                    credit: '',
                    total: ''
                });
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        accountCode: '',
                        referenceTypeNo: groupedEntries[i].entries[j].CRNo,
                        details: '',
                        date: groupedEntries[i].entries[j].CRDate,
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            // Flatten the reports array & ensure proper structure
            const data = formattedEntries.flat().map(entry => [
                String(entry.accountCode || ""),
                entry.referenceTypeNo || "",
                entry.details || "",
                entry.date || "",
                entry.particulars || "",
                entry.debit || "",
                entry.credit || "",
                entry.total || ""
            ]);
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["DEPOSIT SLIPS"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT CODE", "REFERENCE TYPE NO.", "DETAILS", "DATE", "PARTICULARS", "DEBIT", "CREDIT", "TOTAL"] // A5
            ];
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }  // Merge A3:G3
            ];
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 15 },
                { wch: 20 },
                { wch: 40 },
                { wch: 10 },
                { wch: 40 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 }
            ];
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "GENERAL LEDGER");
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getCashReceipt: async (req, res)=>{
        try{

            const {from, to, page=1} = req.query;

            // this bases on particulars: not sure for now if we need to filder by account
            const data = await receiptEntryTypeSearchPaginated(from, to, "Cash Receipt", page);

            // grouping
            const groupedEntries = data.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
            
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
            
                group.entries.push(entry);
                return acc;
            }, []);

            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    payor: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        payor: groupedEntries[i].entries[j].PaymentEntity?.name || '',
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            res.json({...data, entries: formattedEntries});
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getCashReceiptExport: async (req, res)=>{
        try{
            const {from, to} = req.query;
            const dataf = await receiptEntryTypeSearch(from, to, "Cash Receipt");
            // grouping
            const groupedEntries = dataf.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
                group.entries.push(entry);
                return acc;
            }, []);
            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    payor: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        payor: groupedEntries[i].entries[j].PaymentEntity?.name || '',
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            // Flatten the reports array & ensure proper structure
            const data = formattedEntries.flat().map(entry => [
                String(entry.accountCode || ""),
                entry.referenceTypeNo || "",
                entry.check || "",
                entry.date || "",
                entry.payor || "",
                entry.particulars || "",
                entry.debit || "",
                entry.credit || "",
                entry.total || ""
            ]);
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["CASH RECEIPT"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT CODE", "REFERENCE TYPE NO.", "CHECK #", "DATE", "PAYOR", "PARTICULARS", "DEBIT", "CREDIT", "TOTAL"] // A5
            ];
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }  // Merge A3:G3
            ];
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 15 },
                { wch: 40 },
                { wch: 15 },
                { wch: 15 },
                { wch: 20 },
                { wch: 40 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 }
            ];
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "CASH RECEIPT");
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    
    getDisbursementVoucher: async (req, res)=>{
        try{
            const {from, to, page=1} = req.query;

            // this bases on particulars: not sure for now if we need to filder by account
            const data = await entryTypeSearchPaginated(from, to, "Payment", page);

            // grouping
            const groupedEntries = data.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
            
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
            
                group.entries.push(entry);
                return acc;
            }, []);

            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            res.json({...data, entries: formattedEntries});
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getDisbursementVoucherExport: async (req, res)=>{
        try{
            const {from, to} = req.query;
            const dataf = await entryTypeSearch(from, to, "Payment");
            // grouping
            const groupedEntries = dataf.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
                group.entries.push(entry);
                return acc;
            }, []);
            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    payor: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        payor: groupedEntries[i].entries[j].PaymentEntity?.name || '',
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            // Flatten the reports array & ensure proper structure
            const data = formattedEntries.flat().map(entry => [
                String(entry.accountCode || ""),
                entry.referenceTypeNo || "",
                entry.check || "",
                entry.date || "",
                entry.particulars || "",
                entry.debit || "",
                entry.credit || "",
                entry.total || ""
            ]);
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["DISBURSEMENT VOUCHER"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT CODE", "REFERENCE TYPE NO.", "CHECK #", "DATE", "PARTICULARS", "DEBIT", "CREDIT", "TOTAL"] // A5
            ];
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }  // Merge A3:G3
            ];
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 15 },
                { wch: 40 },
                { wch: 10 },
                { wch: 10 },
                { wch: 40 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 }
            ];
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "DISBURSEMENT VOUCHER");
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getJournalVoucher: async (req, res)=>{
        try{
            const {from, to, page=1} = req.query;

            // this bases on particulars: not sure for now if we need to filder by account
            const data = await entryTypeSearchPaginated(from, to, "Journal", page);

            // grouping
            const groupedEntries = data.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
            
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
            
                group.entries.push(entry);
                return acc;
            }, []);

            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            res.json({...data, entries: formattedEntries});
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getJournalVoucherExport: async (req, res)=>{
        try{
            const {from, to} = req.query;
            const dataf = await entryTypeSearch(from, to, "Journal");
            // grouping
            const groupedEntries = dataf.entries.reduce((acc, entry) => {
                const ledger = entry.ledgers.ledger;
                const code = ledger.code;
                let group = acc.find(g => g.code === code);
                if (!group) {
                    group = { code, name: ledger.name, entries: [] };
                    acc.push(group);
                }
                group.entries.push(entry);
                return acc;
            }, []);
            // formatting
            const formattedEntries = [];
            for(let i = 0; i < groupedEntries.length; i++){
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                formattedEntries.push({
                    special: true,
                    accountCode: groupedEntries[i].code,
                    referenceTypeNo: groupedEntries[i].name,
                    check: "",
                    date: "",
                    payor: "",
                    particulars: "",
                    debit: "",
                    credit: "",
                    total: ""
                });
                formattedEntries.push({special: false, accountCode: "", referenceTypeNo: "", check: "", date: "", payor: "", particulars: "", debit: "", credit: "", total: ""});
                for(let j = 0; j < groupedEntries[i].entries.length; j++){
                    formattedEntries.push({
                        special: false,
                        accountCode: "",
                        referenceTypeNo: groupedEntries[i].entries[j].no,
                        check: groupedEntries[i].entries[j].CheckNo,
                        date: groupedEntries[i].entries[j].date,
                        payor: groupedEntries[i].entries[j].PaymentEntity?.name || '',
                        particulars: groupedEntries[i].entries[j].Particulars ? groupedEntries[i].entries[j].Particulars : groupedEntries[i].entries[j].ledgers.description,
                        debit: groupedEntries[i].entries[j].ledgers.dr,
                        credit: groupedEntries[i].entries[j].ledgers.cr,
                        total: ''
                    }); 
                }
            } 
            // Flatten the reports array & ensure proper structure
            const data = formattedEntries.flat().map(entry => [
                String(entry.accountCode || ""),
                entry.referenceTypeNo || "",
                entry.check || "",
                entry.date || "",
                entry.particulars || "",
                entry.debit || "",
                entry.credit || "",
                entry.total || ""
            ]);
            // Create an empty worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([]);
            // Define headers (aligned properly)
            const headers = [
                ["NATIONAL DEVELOPMENT COMPANY"],      // A1
                ["JOURNAL VOUCHER"],                    // A2
                [`${from.replaceAll("-", "/")} - ${to.replaceAll("-", "/")}`], // A3
                [], // Blank row A4
                ["ACCOUNT CODE", "REFERENCE TYPE NO.", "CHECK #", "DATE", "PARTICULARS", "DEBIT", "CREDIT", "TOTAL"] // A5
            ];
            // Insert headers
            XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });
            // Insert data at A6 (making sure it starts correctly)
            XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A6" });
            // Merge headers only up to column G
            worksheet["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Merge A1:G1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Merge A2:G2
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }  // Merge A3:G3
            ];
            // Set column widths for better readability
            worksheet["!cols"] = [
                { wch: 15 },
                { wch: 40 },
                { wch: 10 },
                { wch: 10 },
                { wch: 40 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 }
            ];
            // Create a workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "JOURNAL VOUCHER");
            // Write workbook to a buffer
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            // Set headers and send the Excel file
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.send(buffer);
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },



};



// searchs from entries by its entry type
async function entryTypeSearchPaginated(from, to, type, page){
    const pageSize = 10; // Number of entries per page
    const skip = (page - 1) * pageSize; // Calculate how many records to skip

    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                EntryType: type,
                // ReceiptEntryType: type
            }
        },
        { $sort: { "ledgers.ledger.code": 1, date: 1 } }, // Sort by date (ascending)
        { $skip: skip }, // Skip records based on page number
        { $limit: pageSize } // Limit to 10 records per page
    ]);
    // Count total records for pagination info
    const totalRecords = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
            date: {
                $gte: new Date(from),
                $lte: new Date(to)
            },
            EntryType: type,
            // ReceiptEntryType: type
          }
        },
        { $count: "total" }
    ]);
    const totalPages = Math.ceil((totalRecords[0]?.total || 0) / pageSize);
    return {
        entries,
        pagination: {
            currentPage: page,
            totalPages,
            totalRecords: totalRecords[0]?.total || 0,
            pageSize
        }
    };
}
// same function above non paginated
async function entryTypeSearch(from, to, type){
    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                EntryType: type,
                // ReceiptEntryType: type
            }
        },
        { $sort: { "ledgers.ledger.code": 1, date: 1 } }, // Sort by date (ascending)
    ]);
    return { entries: entries };
}

// searchs from entries by its receipt entry type
async function receiptEntryTypeSearchPaginated(from, to, type, page){
    const pageSize = 10; // Number of entries per page
    const skip = (page - 1) * pageSize; // Calculate how many records to skip

    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                ReceiptEntryType: type
            }
        },
        { $sort: { date: 1, "ledgers.ledger.code": 1 } }, // Sort by date (ascending)
        { $skip: skip }, // Skip records based on page number
        { $limit: pageSize } // Limit to 10 records per page
    ]);
    // Count total records for pagination info
    const totalRecords = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
            date: {
                $gte: new Date(from),
                $lte: new Date(to)
            },
            ReceiptEntryType: type
          }
        },
        { $count: "total" }
    ]);
    const totalPages = Math.ceil((totalRecords[0]?.total || 0) / pageSize);
    return {
        entries,
        pagination: {
            currentPage: page,
            totalPages,
            totalRecords: totalRecords[0]?.total || 0,
            pageSize
        }
    };
}
// same function above non paginated
async function receiptEntryTypeSearch(from, to, type){
    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                // EntryType: type,
                ReceiptEntryType: type
            }
        },
        { $sort: { date: 1, "ledgers.ledger.code": 1 } }, // Sort by date (ascending)
    ]);
    return { entries: entries };
}

// search entries by particular as regex
async function regexSearchPaginated(from, to, regex, page){
    const pageSize = 10; // Number of entries per page
    const skip = (page - 1) * pageSize; // Calculate how many records to skip

    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                Particulars: { $regex: regex, $options: "i"}
            }
        },
        { $sort: { "ledgers.ledger.code": 1, date: 1  } }, // Sort by date (ascending)
        { $skip: skip }, // Skip records based on page number
        { $limit: pageSize } // Limit to 10 records per page
    ]);
    // Count total records for pagination info
    const totalRecords = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
          $match: {
            date: {
                $gte: new Date(from),
                $lte: new Date(to)
            },
            Particulars: { $regex: regex, $options: "i"}
          }
        },
        { $count: "total" }
    ]);
    const totalPages = Math.ceil((totalRecords[0]?.total || 0) / pageSize);
    return {
        entries,
        pagination: {
            currentPage: page,
            totalPages,
            totalRecords: totalRecords[0]?.total || 0,
            pageSize
        }
    };
}
// safe function above, no pagination
async function regexSearch(from, to, regex){
    const entries = await EntriesModel.aggregate([
        {
            $addFields: {
                date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
            }
        },
        {
            $unwind: {
                path: "$ledgers",
            }
        },
        {
            $match: {
                date: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                },
                Particulars: { $regex: regex, $options: "i"}
            }
        },
        { $sort: { "ledgers.ledger.code": 1, date: 1 } }, // Sort by date (ascending)
    ]);
    return {entries: entries};
}

// dont worry about this
async function generalLedgerReport(from, to, account, name=''){
    try{
        // get account current balance on (from date - 1)
        const bbalDate = new Date(from);
        bbalDate.setDate(bbalDate.getDate() - 1);
        const bbal = await findBookBalance(account, '', '', bbalDate.toISOString().split("T")[0]);
        const accType = account.charAt(0);
        let accBal = 0;

        // Ensure bbal has valid numeric values
        const debit = bbal?.debit || 0;
        const credit = bbal?.credit || 0;
        if (['1', '5'].includes(accType)) {
            accBal = debit - credit;  // Assets & Expenses → Debit Normal Balance
        } else if (['2', '3', '4'].includes(accType)) {
            // may have discrepancy for account 202010103
            accBal = credit - debit;  // Liabilities, Equity & Income → Credit Normal Balance
        }

        // append account balance to top of result
        const rows = [];
        rows.push({
            accountNumber: account,
            date: '',
            particulars: name,
            docType: '',
            debit: '',
            credit: '',
            balance: accBal
        });

        // list all transactions for this account
        const entries = await EntriesModel.aggregate([
            {
                $addFields: {
                    date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                    no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
                }
            },
            {
                $unwind: {
                    path: "$ledgers",
                }
            },
            {
                $match: {
                    "ledgers.ledger.code": account,
                    date: {
                        $gte: new Date(from),
                        $lte: new Date(to)
                    }
                }
            },
            {
                $project: {
                    accountNumber: '',
                    date: "$date",
                    particulars: {$ifNull: ["$ledgers.description", "$Particulars"]},
                    docType: "$EntryType",
                    debit: "$ledgers.dr",
                    credit: "$ledgers.cr"
                }
            },
            { $sort: { date: 1 } }, // Sort by date (ascending)
        ]);

        // for each transaction find the balance of this account on that moment
        // but that will be super complicated
        // instead we deduct/add debit and credit to current balance and pass it down to all transactions
        // since entry date (different from timestamp) do not have time on it, we are unable to see the balance of an account from a given time
        for (let i = 0; i < entries.length; i++) {
            const debit = entries[i].debit || 0; // Default to 0 if undefined
            const credit = entries[i].credit || 0; // Default to 0 if undefined
            if (['1', '5'].includes(accType)) {
                accBal += debit - credit;  // Assets & Expenses → Debit Increases
            } else if (['2', '3', '4'].includes(accType)) {
                accBal += credit - debit;  // Liabilities, Equity, Revenue → Credit Increases
            }
            entries[i].balance = accBal;
        }

        return [
            { accountNumber: '', date: '', particulars: '', docType: '', debit: '', credit: '', balance: '' }, // blank row
            ...rows, 
            { accountNumber: '', date: '', particulars: '', docType: '', debit: '', credit: '', balance: '' },
            ...entries
        ];
    }catch (error) {
        console.error(error);
    }
}

// dont worry about this
async function subsidiaryReport(from, to, account, name='', subledgers=[]){
    try{
        // get account current balance on (from date - 1)
        const bbalDate = new Date(from);
        bbalDate.setDate(bbalDate.getDate() - 1);

        const bbal = await findBookBalanceSLFiltered(account, subledgers, '', bbalDate.toISOString().split("T")[0]);

        const accType = account.charAt(0);
        let accBal = 0;

        // Ensure bbal has valid numeric values
        const debit = bbal?.debit || 0;
        const credit = bbal?.credit || 0;
        if (['1', '5'].includes(accType)) {
            accBal = debit - credit;  // Assets & Expenses → Debit Normal Balance
        } else if (['2', '3', '4'].includes(accType)) {
            // may have discrepancy for account 202010103
            accBal = credit - debit;  // Liabilities, Equity & Income → Credit Normal Balance
        }

        // append account balance to top of result
        const rows = [];
        rows.push({
            accountNumber: account,
            date: '',
            particulars: name,
            docType: '',
            debit: '',
            credit: '',
            balance: accBal
        });

        // list all transactions for this account
        const entries = await EntriesModel.aggregate([
            {
                $addFields: {
                    date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
                    no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
                }
            },
            {
                $unwind: {
                    path: "$ledgers",
                }
            },
            {
                $match: {
                    "ledgers.ledger.code": account,
                    "ledgers.subledger.slCode": { $in: subledgers },
                    date: {
                        $gte: new Date(from),
                        $lte: new Date(to)
                    }
                }
            },
            {
                $project: {
                    accountNumber: '',
                    date: "$date",
                    particulars: {$ifNull: ["$ledgers.description", "$Particulars"]},
                    docType: "$EntryType",
                    debit: "$ledgers.dr",
                    credit: "$ledgers.cr"
                }
            },
            { $sort: { date: 1 } }, // Sort by date (ascending)
        ]);

        // for each transaction find the balance of this account on that moment
        // but that will be super complicated
        // instead we deduct/add debit and credit to current balance and pass it down to all transactions
        // since entry date (different from timestamp) do not have time on it, we are unable to see the balance of an account from a given time
        for (let i = 0; i < entries.length; i++) {
            const debit = entries[i].debit || 0; // Default to 0 if undefined
            const credit = entries[i].credit || 0; // Default to 0 if undefined
            if (['1', '5'].includes(accType)) {
                accBal += debit - credit;  // Assets & Expenses → Debit Increases
            } else if (['2', '3', '4'].includes(accType)) {
                accBal += credit - debit;  // Liabilities, Equity, Revenue → Credit Increases
            }
            entries[i].balance = accBal;
        }

        return [
            { accountNumber: '', date: '', particulars: '', docType: '', debit: '', credit: '', balance: '' }, // blank row
            ...rows, 
            { accountNumber: '', date: '', particulars: '', docType: '', debit: '', credit: '', balance: '' },
            ...entries
        ];
    }catch (error) {
        console.error(error);
    }
}


module.exports = OtherReports;