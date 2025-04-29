import React, { useState } from 'react';
import Modal from '../Modal';
import { showToast } from '../../utils/toastNotifications';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { numberToCurrencyString } from '../../helper/helper';
import { useLoader } from '../../context/useLoader';

function SummaryJournalVoucher({ show=false, close=()=>{} }) {

    const {loading} = useLoader();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    async function fetchData(page = 1){
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        try {
            const response = await axios.get(`/reports/other/journalVoucher?from=${from}&to=${to}&page=${page}`, { withCredentials: true });
            setRows(response.data.entries);
            console.log(response.data);
            setCurrentPage(page);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("Error fetching data", "error");
        }
    }

    async function submitClick(){
        fetchData();
    }

    async function exportClick(){
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        try {
            loading(true);
            const response = await axios.get(`/reports/other/journalVoucher/export?from=${from}&to=${to}`, { withCredentials: true, responseType: 'blob' });
            loading(false);
            // Create a blob URL for the response data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'JOURNAL VOUCHER.xlsx'); // Set filename
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

    return (
        <Modal show={show} closeCallback={close} title='Journal Voucher'>
            <div className='flex-1 border-t'>
                <div className="p-2 flex items-end flex-wrap text-[0.9em]">
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
                    <div className='h-[60vh] relative overflow-y-scroll'>
                        <table className='w-[100%]'>
                            <thead>
                                <tr className='border-b sticky top-0 bg-gray-100'>
                                    <th className='border-r p-1'>ACCOUNT CODE</th>
                                    <th className='border-r p-1'>REFERENCE TYPE NO.</th>
                                    <th className='border-r p-1'>CHECK #</th>
                                    <th className='border-r p-1'>DATE</th>
                                    <th className='border-r p-1'>PARTICULARS</th>
                                    <th className='border-r p-1'>DEBIT</th>
                                    <th className='border-r p-1'>CREDIT</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                rows.map((item, index)=>
                                    item.special ? 
                                    <tr key={index} className='border-b hover:bg-gray-100'>
                                        <td className='py-1 px-2'>{item.accountCode}</td>
                                        <td className='py-1 px-2' colSpan={8}>ACCOUNT TITLE: {item.referenceTypeNo}</td>
                                    </tr>
                                    :
                                    <tr key={index} className='border-b hover:bg-gray-100'>
                                        <td className='py-1 px-2'>{item.accountCode}</td>
                                        <td className='py-1 px-2'>{item.referenceTypeNo}</td>
                                        <td className='py-1 px-2'>{item.CheckNo}</td>
                                        <td className='py-1 px-2'>{item.date?.substr(0, 10).replaceAll("-", "/")}</td>
                                        <td className='py-1 px-2'><div className='min-h-[15px]'>{item.particulars}</div></td>
                                        <td className='py-1 px-2'>{item.debit ? numberToCurrencyString(item.debit) : ''}</td>
                                        <td className='py-1 px-2'>{item.credit ? numberToCurrencyString(item.credit) : ''}</td>
                                    </tr>
                                )
                            }
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

export default SummaryJournalVoucher;