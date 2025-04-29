import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import AccountRangePicker from './AccountRangePicker';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { showToast } from '../../utils/toastNotifications';
import { numberToCurrencyString } from '../../helper/helper';
import { useLoader } from '../../context/useLoader';

function GeneralLedger({ open = false, close = () => {} }) {

    const {loading} = useLoader();

    const [accounts, setAccounts] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [rows, setRows] = useState([]);
    const [accountPagination, setAccountPagination] = useState(0); // Track current index

    useEffect(()=>{
        if(accounts.length > 0 && from && to){
            // console.log(accounts[accountPagination]);
            fetchData();
        }
    }, [accountPagination, accounts]);

    async function fetchData(){
        try {
            const response = await axios.post(`/reports/other/generalLedger`, {
                from,
                to,
                account: accounts[accountPagination].code, // Fetch only the selected account
                name: accounts[accountPagination].name
            }, { withCredentials: true });
            setRows(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("Error fetching data", "error");
        }
    }

    function handlePrev() {
        setAccountPagination((prev) => Math.max(prev - 1, 0)); // Prevent going below 0
    }

    function handleNext() {
        setAccountPagination((prev) => Math.min(prev + 1, accounts.length - 1)); // Prevent going beyond length
    }

    async function submitClick() {
        if (accounts.length === 0) {
            showToast("Please select accounts", "warning");
            return;
        }
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        fetchData();
    }

    async function exportClick() {
        if (accounts.length === 0) {
            showToast("Please select accounts", "warning");
            return;
        }
        if (!from || !to) {
            showToast("Please select date", "warning");
            return;
        }
        try {
            loading(true);
            const response = await axios.post(`/reports/other/generalLedger/export`, {
                from,
                to,
                accounts: accounts
            }, { withCredentials: true, responseType: 'blob' });
            loading(false);
            // Create a blob URL for the response data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'GENERAL LEDGER.xlsx'); // Set filename
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
        <Modal show={open} closeCallback={close} title="General Ledger">
            <div className="flex-1 border-t">
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
                    <button className="btn-primary mb-2 mr-2" onClick={submitClick}>
                        Submit
                    </button>
                    <button className="btn-secondary mb-2 mr-2" onClick={exportClick}>
                        Export
                    </button>
                </div>
                <div className="flex-1 p-2 text-[0.7em]">
                    <div className="overflow-y-scroll relative overflow-x-scroll h-[60vh]">
                        <table className='w-[100%]'>
                            <thead>
                                <tr className="border-b sticky top-0 bg-gray-100">
                                    <th className='border-r p-1'>ACCOUNT NUMBER</th>
                                    <th className='border-r p-1'>DATE</th>
                                    <th className='border-r p-1'>PARTICULARS</th>
                                    <th className='border-r p-1'>DOC TYPE</th>
                                    <th className='border-r p-1'>DEBIT</th>
                                    <th className='border-r p-1'>CREDIT</th>
                                    <th className='p-1'>BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                rows.map((item, index)=>
                                    <tr key={index} className='border-b hover:bg-gray-100'>
                                        <td className='p-1'><div className='min-h-[15px]'>{item.accountNumber}</div></td>
                                        <td className='p-1'>{item.date.substr(0, 10).replaceAll('-', '/')}</td>
                                        <td className='p-1'>{item.particulars}</td>
                                        <td className='p-1'>{item.docType}</td>
                                        <td className='p-1'>{item.debit ? numberToCurrencyString(item.debit) : ''}</td>
                                        <td className='p-1'>{item.credit ? numberToCurrencyString(item.credit) : ''}</td>
                                        <td className='p-1'>{item.balance ? numberToCurrencyString(item.balance) : ''}</td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Buttons */}
                    <div className="p-2 flex items-center justify-end">
                        {(accounts.length > 0 && from && to) && (
                            <>
                                {/* Prev Button (Shows Previous Account) */}
                                <button
                                    className="flex items-center mr-4 border border-black rounded px-2 py-1 disabled:opacity-50"
                                    onClick={handlePrev}
                                    disabled={accountPagination === 0}
                                >
                                    <FaChevronLeft className="mr-2 text-[1.5em]" />
                                    {accountPagination > 0
                                        ? `${accounts[accountPagination - 1].code} - ${accounts[accountPagination - 1].name}`
                                        : ""}
                                </button>

                                {/* Current Account Display */}
                                {/* <span className="px-4 py-2 border rounded bg-gray-200">
                                    {accounts[accountPagination].code} - {accounts[accountPagination].name}
                                </span> */}

                                {/* Next Button (Shows Next Account) */}
                                <button
                                    className="flex items-center mr-4 border border-black rounded px-2 py-1 disabled:opacity-50"
                                    onClick={handleNext}
                                    disabled={accountPagination === accounts.length - 1}
                                >
                                    {accountPagination < accounts.length - 1
                                        ? `${accounts[accountPagination + 1].code} - ${accounts[accountPagination + 1].name}`
                                        : ""}
                                    <FaChevronRight className="ml-2 text-[1.5em]" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default GeneralLedger;
