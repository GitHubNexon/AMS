import React, { useState } from 'react';
import ReportNavigation from './ReportNavigation';
import CustomizedReports from '../Components/CustomizableReport/CustomizedReports';
import SubReports from '../Components/CustomizableReport/SubReports';
import axios from 'axios';
import { numberToCurrencyString, getFirstAndLastDayOfMonth } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";
import { useLoader } from "../context/useLoader";

function FinancialStatements() {

    const [rows, setRows] = useState([]);
    // const [lastYearRows, setLastYearRows] = useState([]);
    // const [lastMonthRows, setLastMonthRows] = useState([]);
    const [range, setRange] = useState(null);
    // const [rangeLastYear, setRangeLastYear] = useState(null);
    // const [rangeLastMonth, setRangeLastMonth] = useState(null);
    const [rangeCompare, setRangeCompare] = useState(null);
    const [compareRows, setComparRows] = useState([]);
    const [cm, setCm] = useState('');
    const [compareH, setCompareH] = useState('');
    // const [ly, setLy] = useState('');
    // const [lm, setLm] = useState('');

    const { loading } = useLoader();

    // process selected month
    function monthSelect(e){
        // current month interval
        // const prev = getPreviousDates(e.target.value);
        // const lastM = getFirstAndLastDayOfMonth(prev.lastMonth);
        // const lastY = getFirstAndLastDayOfMonth(prev.sameMonthLastYear);
        const current = getFirstAndLastDayOfMonth(e.target.value);
        setRange(current);
        // setRangeLastMonth(lastM);
        // setRangeLastYear(lastY);
    }

    function compareSelect(e){
        const compare = getFirstAndLastDayOfMonth(e.target.value)
        setRangeCompare(compare);
    }

    function getPreviousDates(dateString) {
        const [year, month] = dateString.split('-').map(Number);
        // Get last month
        const lastMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
        // Get same month last year
        const sameMonthLastYear = { year: year - 1, month };
        return {
            lastMonth: `${lastMonth.year}-${String(lastMonth.month).padStart(2, '0')}`,
            sameMonthLastYear: `${sameMonthLastYear.year}-${String(sameMonthLastYear.month).padStart(2, '0')}`
        };
    }

    function getMonthAndYear(dateString) {
        const date = new Date(dateString);
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const year = date.getFullYear();
        return `${month} ${year}`;
    }

    async function fetchReportClick() {
        if (!range || !rangeCompare) {
            showToast("Please select month.", "warning");
            return;
        }
        loading(true);
        try {
            const [response, compare] = await Promise.all([
                axios.get(`/reports/fullTrialBalance/${range.firstDay}/${range.lastDay}`, { withCredentials: true }),
                axios.get(`/reports/fullTrialBalance/${rangeCompare.firstDay}/${rangeCompare.lastDay}`, { withCredentials: true }),
                // axios.get(`/reports/fullTrialBalance/${rangeLastMonth.firstDay}/${rangeLastMonth.lastDay}`, { withCredentials: true })
            ]);
            setCm(range.lastDay);
            setCompareH(rangeCompare.lastDay);
            // setLy(rangeLastYear.lastDay);
            // setLm(rangeLastMonth.lastDay);
            setComparRows(compare.data);
            setRows(response.data);
            // setLastMonthRows(lastMonth.data);
            // setLastYearRows(lastYear.data);
            loading(false);
        } catch (error) {
            loading(false);
            console.error("Error fetching report:", error);
            showToast("Failed to fetch report. Please try again", "warning");
        }
    }

    return (
        <>
            <ReportNavigation />
            <div className="mx-auto p-4 overflow-auto">
                <div className="flex items-center">
                    <div className="flex items-center text-[0.9em] p-2 flex-1">
                        <span className="mr-2">Date</span>
                        <input type="month" className="border px-2 rounded mr-2" onChange={monthSelect} />
                        <span className='mr-2'>compare with</span>
                        <input type="month" className='mr-2 border px-2 rounded' onChange={compareSelect} />
                        <button className="bg-blue-500 py-1 px-2 rounded text-white" onClick={fetchReportClick}>Fetch Report</button>
                    </div>
                </div>
                {/* <CustomizedReports /> */}
                <SubReports 
                    report={rows} 
                    headerCm={cm}
                    // lastYear={lastYearRows}
                    compare={compareRows}
                    headerCompare={compareH}
                    // headerLy={ly}
                    // headerLm={lm} 
                    // lastMonth={lastMonthRows} 
                    filter={['STATEMENTS OF FINANCIAL POSITION', 'STATEMENTS OF COMPREHENSIVE INCOME']} 
                    addOption={false} />
            </div>
        </>
    );
}

export default FinancialStatements;