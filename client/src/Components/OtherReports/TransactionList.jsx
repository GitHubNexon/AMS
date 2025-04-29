import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import AccountRangePicker from "./AccountRangePicker";
import { showToast } from "../../utils/toastNotifications";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useLoader } from '../../context/useLoader';

function TransactionList({ open = false, close = () => {} }) {

    const {loading} = useLoader();

    const [accounts, setAccounts] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    async function fetchData(page = 1) {
        if (accounts.length === 0) {
            showToast("Please select accounts", "warning");
            return;
        }
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        const accs = accounts.map((m) => m.code);
        try {
            const response = await axios.post(`/reports/other/transactionList`, {
                from: from,
                to: to,
                accounts: accs,
                page: page,
            }, { withCredentials: true });
            setRows(response.data.entries);
            setCurrentPage(page);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("Error fetching data", "error");
        }
    }

    function submitClick() {
        fetchData(1); // Fetch first page
    }

    function nextPage() {
        if (currentPage < totalPages) {
            fetchData(currentPage + 1);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            fetchData(currentPage - 1);
        }
    }

    async function exportClick(){
        if (accounts.length === 0) {
            showToast("Please select accounts", "warning");
            return;
        }
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        const accs = accounts.map((m) => m.code);
        try {
            loading(true);
            const response = await axios.post(`/reports/other/transactionList/export`, {
                from: from,
                to: to,
                accounts: accs
            }, { withCredentials: true, responseType: 'blob' });
            loading(false);
            // Create a blob URL for the response data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'TRANSACTION LIST.xlsx'); // Set filename
            // Append to the DOM and trigger the download
            document.body.appendChild(link);
            link.click();
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("Error fetching data", "error");
        }
    }

    return (
        <Modal show={open} closeCallback={close} title="Transaction List">
            <div className="min-w-[96vw] border-t flex flex-col">
                <div className="p-2 flex items-end flex-wrap text-[0.9em]">
                    <div className="mb-2">
                        <AccountRangePicker selected={accounts} setSelected={setAccounts} />
                    </div>
                    <div className="mr-2 mb-2 flex flex-col">
                        <span className="text-[0.9em]">Date From</span>
                        <input
                        type="date"
                        className="border px-1 py-[6px]"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="mr-2 mb-2 flex flex-col">
                        <span className="text-[0.9em]">Date To</span>
                        <input
                        type="date"
                        className="border px-1 py-[6px]"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary mb-2 mr-2" onClick={submitClick}>Submit</button>
                    <button className="btn-secondary mb-2 mr-2" onClick={exportClick}>Export</button>
                </div>
                <div className="flex-1 p-2 text-[0.7em]">
                    <div className="overflow-y-scroll relative overflow-x-scroll h-[60vh]">
                        <table className="w-[100%]">
                        <thead>
                            <tr className="border-b sticky top-0 bg-gray-100">
                            <th className="border-r p-1">SLCODE</th>
                            <th className="border-r p-1">ACCTCODE</th>
                            <th className="border-r p-1">ACCOUNT NAME</th>
                            <th className="border-r p-1">SLDATE</th>
                            <th className="border-r p-1">SLDOCCODE</th>
                            <th className="border-r p-1">SLDOCNO</th>
                            <th className="border-r p-1">SLDESC</th>
                            <th className="border-r p-1">Check No.</th>
                            <th className="border-r p-1">SLDEBIT</th>
                            <th className="p-1">SLCREDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="border-r p-1">{item.SLCODE}</td>
                                <td className="border-r p-1">{item.ACCTCODE}</td>
                                <td className="border-r p-1">{item["ACCOUNT NAME"]}</td>
                                <td className="border-r p-1">{item.SLDATE?.substr(0, 10).replaceAll("-", "/")}</td>
                                <td className="border-r p-1">{item.SLDOCCODE}</td>
                                <td className="border-r p-1">{item.SLDOCNO}</td>
                                <td className="border-r p-1">{item.SLDESC}</td>
                                <td className="border-r p-1">{item["Check No,"]}</td>
                                <td className="border-r p-1">{item.SLDEBIT}</td>
                                <td className="p-1">{item.SLCREDIT}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    <div className="p-2 flex items-center justify-center">
                        <button 
                            className={`mr-2 border p-1 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={prevPage}
                            disabled={currentPage === 1} >
                            <FaChevronLeft />
                        </button>
                        <span className="text-sm mx-4">Page {currentPage} of {totalPages}</span>
                        <button
                            className={`ml-2 border p-1 rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={nextPage}
                            disabled={currentPage === totalPages} >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default TransactionList;
