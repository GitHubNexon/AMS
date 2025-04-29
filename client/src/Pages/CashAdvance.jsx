import React, { useState, useEffect, useContext } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CashAdvanceEntry from "../Components/CashAdvance/CashAdvanceEntry";
import FileMaintenance from "../Components/CashAdvance/FileMaintenance";
import { IoDocumentTextSharp } from "react-icons/io5";
import axios from "axios";
import PaymentModal from "../Pop-Up-Pages/PaymentModal";
import JournalModal from "../Pop-Up-Pages/JournalModal";
import { useDataPreloader } from "../context/DataPreloader";
import { LedgerSheetContext } from "../context/LedgerSheetContext";
import JournalModalTemp from "../Pop-Up-Pages/JournalModalTemp";
import { numberToCurrencyString } from "../helper/helper";

function CashAdvance() {
    
    const { pushToGrid, reset } = useContext(LedgerSheetContext);

    const [cashAdvanceEntryModal, setCashAdvanceEntryModal] = useState({ show: false, data: null, mode: "add" });
    const [fileMaintenanceModal, setFileMaintenanceModal] = useState({ show: false });

    const {subledgers} = useDataPreloader();

    // State for cash advances, pagination, and search
    const [cashAdvances, setCashAdvances] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchDebounce, setSearchDebounce] = useState("");

    // Debounce search input (wait 1 sec before triggering search)
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            setSearch(searchDebounce);
            setPage(1); // Reset to first page on new search
        }, 1000);

        return () => clearTimeout(delaySearch);
    }, [searchDebounce]);

    // Fetch cash advances from the API
    useEffect(() => {

        fetchCashAdvances();
    }, [page, search]);

    async function fetchCashAdvances() {
        try {
            const { data } = await axios.get(`/ca/CashAdvance?page=${page}&search=${search}`);
            setCashAdvances(data.data);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching cash advances:", error);
        }
    }

    function requestClick() {
        setCashAdvanceEntryModal({ show: true, data: null, mode: "add" });
    }

    function fileMaintenanceClick() {
        setFileMaintenanceModal({ show: true });
    }

    const [paymentModal, setPaymentModal] = useState({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
    const [journalModal, setJournalModal] = useState({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
    const [journalModalTemp, setJournalModalTemp] = useState({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
    const [selectedId, setSelectedId] = useState('');

    function createDVClick(ca){
        console.log(ca);
        // find client full info first
        const client = subledgers.filter(f=>f.slCode === ca.file.subledger.slCode)[0];
        console.log(client);
        setSelectedId(ca._id);
        setPaymentModal({ 
            show: true, 
            entryData: {
                DVNo: "",
                Particulars: `CASH ADVANCE RE: ${ca.particulars}`,
                PaymentEntity: { slCode: client.slCode, name: client.name, tin: client.tin, address: client.address, zip: client.tin},
            },
            mode: "ca"
        });
        pushToGrid([
            {
                ledger: {
                    code: "19901040A",
                    name: "CASH ADVANCE RECEIVABLES - EMPLOYEES AND OFFICERS"
                },
                subledger: {
                    slCode: client.slCode,
                    name: client.name
                },
                cr: null,
                dr: ca.amount 
            },
            {
                ledger: {
                    code: "10102020",
                    name: "CASH IN BANK- LOCAL CURRENCY, CURRENT ACCOUNT"
                },
                subledger: {
                    slCode: "19901040A",
                    name: "CASH ADVANCE RECEIVABLES - EMPLOYEES AND OFFICERS"
                },
                cr: numberToCurrencyString(ca.amount),
                dr: null
            }
        ]);
    }

    function createJVClick(ca){
        console.log(ca.linkedDV);
        const client = subledgers.filter(f=>f.slCode === ca.file.subledger.slCode)[0];
        setSelectedId(ca._id);
        setJournalModal({ 
            show: true, 
            entryData: {
                Particulars: `LIQUIDATION OF DV ${ca.linkedDV.DVNo} CASH ADVANCE RE: ${ca.particulars}`,
                // ReceiptEntryType: "Cash Receipt",
                // paymentMethods: item.paymentMethod,
                // orId: item._id
                JVNo: ""
            },
            mode: "ca"
        });
        pushToGrid([
            {
                ledger: {
                    code: "",
                    name: ""
                },
                subledger: {
                    slCode: "",
                    name: ""
                },
                cr: null,
                dr: null 
            },
            {
                ledger: {
                    code: "19901040A",
                    name: "CASH ADVANCE RECEIVABLES - EMPLOYEES AND OFFICERS"
                },
                subledger: {
                    slCode: client.slCode,
                    name: client.name
                },
                cr: numberToCurrencyString(ca.amount),
                dr: null
            }
        ]);
    }



    function createTempJVClick(ca){
        console.log(ca);
        // if we dont have DV yet set this to temp else set to entry
        setTempJVMode('temp');
        const client = subledgers.filter(f=>f.slCode === ca.file.subledger.slCode)[0];
        console.log(client);
        console.log(ca);
        setSelectedId(ca._id);
        setJournalModalTemp({ 
            show: true, 
            entryData: {
                Particulars: `LIQUIDATION OF DV CASH ADVANCE RE: ${ca.particulars}`,
                // ReceiptEntryType: "Cash Receipt",
                // paymentMethods: item.paymentMethod,
                // orId: item._id
                JVNo: "",

            },
            mode: "ca"
        });
        pushToGrid([
            {
                ledger: {
                    code: "",
                    name: ""
                },
                subledger: {
                    slCode: "",
                    name: ""
                },
                cr: null,
                dr: null
            },
            {
                ledger: {
                    code: "19901040A",
                    name: "CASH ADVANCE RECEIVABLES - EMPLOYEES AND OFFICERS"
                },
                subledger: {
                    slCode: client.slCode,
                    name: client.name
                },
                cr: numberToCurrencyString(ca.amount),
                dr: null
            }
        ]);
        
    }

    function close(){
        setPaymentModal({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
        setJournalModal({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
        setJournalModalTemp({ show: false, entryData: {}, onSave: ()=>{}, mode: "CA" });
        fetchCashAdvances();
        reset();
    }

    function openClick(ca){
        console.log(ca);
        setCashAdvanceEntryModal({ show: true, data: ca, mode: "edit" });
    }

    async function PaymentSaved(f){
        // link
        await axios.post(`/ca/CashAdvance/link`, {
            id1: selectedId,
            id2: f.entry._id,
            updateType: "dv"
        }, { withCredentials: true });
        close();
    }

    async function JournalSaved(f){
        await axios.post(`/ca/CashAdvance/link`, {
            id1: selectedId,
            id2: f.entry._id,
            updateType: "jv"
        }, { withCredentials: true });
        // link
        close();
    }

    async function TempJournalSaved(f){
        console.log(selectedId, f.entry._id);
        await axios.post(`/ca/CashAdvance/link`, {
            id1: selectedId,
            id2: f.entry._id,
            updateType: "temp"
        }, { withCredentials: true });
        // link
        close();
    }

    function openDV(item){
        setPaymentModal({ 
            show: true, 
            entryData: {
                ...item
            },
            mode: "edit"
        });
    }

    function openJV(item){
        setJournalModal({ 
            show: true, 
            entryData: {
              ...item
            },
            mode: "edit"
        });
    }

    const [tempJVMode, setTempJVMode] = useState(false);

    function openTempJV(item, ca){
        setSelectedId(ca._id);
        const dvno = ca?.linkedDV?.DVNo || '';
        if(ca.linkedDV){
            setTempJVMode(true);
        }else{
            setTempJVMode(false);
        }
        setJournalModalTemp({ 
            show: true, 
            entryData: {
              ...item,
              Particulars: `LIQUIDATION OF DV ${dvno} CASH ADVANCE RE: ${ca.particulars}`
            },
            mode: "edit",
        });
    }

    return (
        <>
            <div className="flex flex-col text-[0.9em]">
                <div className="flex p-4">
                    <span className="flex-1 font-bold">Cash Advance</span>
                    <button className="btn-primary mr-4" onClick={requestClick}>
                        Request for Cash Advance
                    </button>
                    <button className="btn-primary mr-4" onClick={fileMaintenanceClick}>
                        File Maintenance
                    </button>
                </div>
                <div className="p-2">
                    <input
                        type="text"
                        className="border p-1 rounded"
                        placeholder="Search"
                        value={searchDebounce}
                        onChange={(e) => setSearchDebounce(e.target.value)}
                    />
                </div>
                <div className="p-2">
                    <table className="w-[100%]">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="border-r p-1"></th>
                                <th className="border-r p-1">Date</th>
                                <th className="border-r p-1">RCA#</th>
                                <th className="border-r p-1">Name</th>
                                <th className="border-r p-1">Amount</th>
                                <th className="border-r p-1">CA</th>
                                <th className="border-r p-1">DV No.</th>
                                <th className="border-r p-1">JV No.</th>
                                <th className="border-r p-1">JV Date</th>
                                <th className="border-r p-1">Status</th>
                                <th className="p-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cashAdvances.length > 0 ? (
                                cashAdvances.map((ca, index) => (
                                    <tr key={ca._id} className="text-center border-b">
                                        <td className="border-r p-1">{index + 1}</td>
                                        <td className="border-r p-1">{new Date(ca.date).toLocaleDateString()}</td>
                                        <td className="border-r p-1">{ca.caNo}</td>
                                        <td className="border-r p-1">{ca.file?.subledger?.name || ""}</td>
                                        <td className="border-r p-1">{ca.amount.toLocaleString()}</td>
                                        <td className="border-r p-1">{ca.particulars}</td>
                                        <td className="border-r p-1">
                                            {
                                                !ca.linkedDV ? (
                                                    <button className="btn-primary" onClick={()=>createDVClick(ca)} >Create</button>
                                                ) : <button className="underline" onClick={()=>openDV(ca.linkedDV)}>{ca.linkedDV.DVNo}</button>
                                            }
                                        </td>
                                        <td className="border-r p-1">
                                            {
                                                ca.linkedForEntry ? (
                                                    <button className="btn-secondary" onClick={()=>openTempJV(ca.linkedForEntry, ca)}>{ca.linkedDV ? "Liquidate" : "Open Entry"}</button>
                                                ) : (
                                                    ca.linkedJV ? (
                                                        <button className="underline" onClick={()=>openJV(ca.linkedJV)}>{ca.linkedJV.JVNo}</button>
                                                    ) : (
                                                        ca.linkedDV ? (
                                                            <button className="btn-primary" onClick={()=>createJVClick(ca)} >Create</button>
                                                        ) : (
                                                            <button className="btn-secondary" onClick={()=>createTempJVClick(ca)}>For Entry</button>
                                                        )
                                                    )
                                                
                                                )
                                            }
                                        </td>
                                        <td className="border-r p-1">
                                            {
                                                !ca.linkedJV ? (
                                                    <></>
                                                ) : <span>{ca.linkedJV.JVDate.substr(0, 10)}</span>
                                            }
                                        </td>
                                        <td className="border-r p-1">
                                            { ca.status }
                                        </td>
                                        <td className="p-1">
                                            <button className="text-green-600 text-[1.3em]" onClick={()=>openClick(ca)} ><IoDocumentTextSharp /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center p-4">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center p-4 justify-center">
                    <button
                        className="border p-2 rounded mr-2"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        <FaChevronLeft />
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        className="border p-2 rounded ml-2"
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
            <CashAdvanceEntry 
                show={cashAdvanceEntryModal.show} 
                close={() => setCashAdvanceEntryModal({ show: false, data: null, mode: "add" })} 
                refresh={fetchCashAdvances} 
                data={cashAdvanceEntryModal.data}
                mode={cashAdvanceEntryModal.mode} />
            <FileMaintenance show={fileMaintenanceModal.show} close={() => setFileMaintenanceModal({ show: false })} />
            <PaymentModal
                isOpen={paymentModal.show} 
                onClose={close}
                entryData={paymentModal.entryData}
                onSavePayment={PaymentSaved}
                mode={paymentModal.mode} />
            <JournalModal
                isOpen={journalModal.show} 
                onClose={close}
                entryData={journalModal.entryData}
                onSaveJournal={JournalSaved}
                mode={journalModal.mode} />
            <JournalModalTemp
                isOpen={journalModalTemp.show} 
                onClose={close}
                entryData={journalModalTemp.entryData}
                onSaveJournal={TempJournalSaved}
                mode={journalModalTemp.mode}
                canLiquidate={tempJVMode} />
        </>
    );
}

export default CashAdvance;