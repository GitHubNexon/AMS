import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ReportNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="border-b overflow-auto">
      {/* <h1 className='font-bold py-2 px-4'>Reports</h1> */}
      <ul className="flex text-[0.9em] pt-4 mb-2">
        <li
          className={`py-1 px-4 border-b-[5px] border-${
            location.pathname === "/report" ? "green-500" : "transparent"
          }`}
        >
          <button onClick={() => navigate("/report")}>Reports</button>
        </li>
        <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/StraightSchedule"
              ? "green-500"
              : "transparent"
          }`}
        >
          <button onClick={() => navigate("/StraightSchedule")}>
            Straight Schedule
          </button>
        </li>
        <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/TrialBalanceReport"
              ? "green-500"
              : "transparent"
          }`}
        >
          <button onClick={() => navigate("/TrialBalanceReport")}>
            Trial Balance
          </button>
        </li>
        <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/FinancialStatements"
              ? "green-500"
              : "transparent"
          }`}
        >
          <button onClick={() => navigate("/FinancialStatements")}>
            Financial Statements
          </button>
        </li>
        {/* <li className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${location.pathname === '/BalanceSheet' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/BalanceSheet')}>Balance Sheet</button>
                </li>
                <li className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${location.pathname === '/IncomeStatement' ? 'green-500' : 'transparent'}`}>
                    <button onClick={() => navigate('/IncomeStatement')}>Income Statement</button>
                </li> */}
        {/* <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/ScheduleofAccounts"
              ? "green-500"
              : "transparent"
          }`}
        >
          <button onClick={() => navigate("/ScheduleofAccounts")}>
            Schedule Of Accounts
          </button>
        </li> */}
        <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/EquityChanges" ? "green-500" : "transparent"
          }`}
        >
          <button onClick={() => navigate("/EquityChanges")}>
            Equity Changes
          </button>
        </li>
        <li
          className={`py-1 px-4 border-b-[5px] whitespace-nowrap border-${
            location.pathname === "/AlphalistTax"
              ? "green-500"
              : "transparent"
          }`}
        >
          <button onClick={() => navigate("/AlphalistTax")}>
            Alpha List Report
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ReportNavigation;
