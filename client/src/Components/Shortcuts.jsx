import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdAccountBalanceWallet } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import {
  FaUser,
  FaReceipt,
  FaCogs,
  FaBook,
  FaBuilding,
  FaChartBar,
} from "react-icons/fa";
import {
  FaMoneyBillTrendUp,
  FaPeopleCarryBox,
  FaMoneyBillTransfer,
} from "react-icons/fa6";
import { GiPayMoney } from "react-icons/gi";

const Shortcuts = () => {
  const [selectedShortcuts, setSelectedShortcuts] = useState(() => {
    const savedShortcuts = localStorage.getItem("selectedShortcuts");
    return savedShortcuts
      ? JSON.parse(savedShortcuts)
      : {
          chartOfAccounts: true,
          users: true,
          paymentEntries: true,
          receiptEntries: true,
          journalEntries: true,
          lessee: false,
          trialBalanceReport: false,
          balanceSheet: false,
          scheduleOfAccounts: false,
          equityChanges: false,
          straightSchedule: false,
        };
  });

  const [showConfig, setShowConfig] = useState(false);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedShortcuts((prev) => {
      const updatedShortcuts = { ...prev, [name]: checked };

      // Save the updated state to localStorage whenever it changes
      localStorage.setItem(
        "selectedShortcuts",
        JSON.stringify(updatedShortcuts)
      );

      return updatedShortcuts;
    });
  };

  const toggleConfig = () => {
    setShowConfig(!showConfig);
  };

  // Count the number of selected shortcuts
  const selectedCount = Object.values(selectedShortcuts).filter(Boolean).length;

  return (
    <div
      className="overflow-y-auto  flex-col bg-gray-200 p-4 rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400"
      style={{
        width: "100%",
        height: "300px",
        minHeight: "300px",
      }}
    >
      <h2 className="text-2xl text-gray-800 pb-10 font-bold pt-20">
        SHORTCUTS
      </h2>
      {/* Settings Icon */}
      <FaCogs
        size={30}
        className="cursor-pointer text-gray-700 absolute top-4 right-4"
        onClick={toggleConfig}
        aria-label="Open Settings"
      />

      {/* Config Modal */}
      {showConfig && (
        <div
          className="fixed inset-0 flex items-start justify-center z-10"
          data-aos="zoom-in"
          data-aos-duration="300"
        >
          <div className="relative bg-white w-72 p-4 rounded-md shadow-xl z-20">
            <h3 className="text-lg font-semibold mb-2 mt-10">
              Customize Shortcuts
            </h3>
            <div className="overflow-auto">
              <ul className="space-y-3">
                {[
                  { name: "chartOfAccounts", label: "Chart of Accounts" },
                  { name: "users", label: "Users" },
                  { name: "paymentEntries", label: "Payment Entries" },
                  { name: "receiptEntries", label: "Receipt Entries" },
                  { name: "journalEntries", label: "Journal Entries" },
                  { name: "lessee", label: "lessee" },
                  { name: "trialBalanceReport", label: "Trial Balance Report" },
                  { name: "balanceSheet", label: "Balance Sheet" },
                  { name: "scheduleOfAccounts", label: "Schedule Of Accounts" },
                  { name: "equityChanges", label: "Equity Changes" },
                  { name: "straightSchedule", label: "Straight Schedule" },
                ].map((shortcut) => (
                  <li key={shortcut.name}>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name={shortcut.name}
                        checked={selectedShortcuts[shortcut.name]}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      {shortcut.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={toggleConfig}
              className="mt-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Shortcuts */}
      <div
        className={`flex flex-wrap justify-center gap-4 mb-10 overflow-y-auto${
          selectedCount === 0 ? "hidden" : "visible"
        }`}
      >
        {selectedShortcuts.chartOfAccounts && (
          <Link
            to="/ChartOfAccounts"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="Chart of Accounts"
          >
            <MdAccountBalanceWallet size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Chart of Accounts
            </p>
          </Link>
        )}
        {selectedShortcuts.users && (
          <Link
            to="/users"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="Users"
          >
            <FaUser size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Users
            </p>
          </Link>
        )}
        {selectedShortcuts.paymentEntries && (
          <Link
            to="/paymentEntries"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="PaymentEntries"
          >
            <FaMoneyBillTransfer size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Payment Entries
            </p>
          </Link>
        )}
        {selectedShortcuts.receiptEntries && (
          <Link
            to="/receiptEntries"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="ReceiptEntries"
          >
            <FaReceipt size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Receipt Entries
            </p>
          </Link>
        )}
        {selectedShortcuts.journalEntries && (
          <Link
            to="/journalEntries"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="JournalEntries"
          >
            <FaBook size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Journal Entries
            </p>
          </Link>
        )}
        {selectedShortcuts.lessee && (
          <Link
            to="/lessee"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="Lessee"
          >
            <FaBuilding size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              lessee
            </p>
          </Link>
        )}

        {selectedShortcuts.trialBalanceReport && (
          <Link
            to="/TrialBalanceReport"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="TrialBalanceReport"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Trial Balance Report
            </p>
          </Link>
        )}
        {selectedShortcuts.balanceSheet && (
          <Link
            to="/BalanceSheet"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="TrialBalanceReport"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Balance Sheet
            </p>
          </Link>
        )}
        {selectedShortcuts.incomeStatement && (
          <Link
            to="/IncomeStatement"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="IncomeStatement"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Income Statement
            </p>
          </Link>
        )}
        {selectedShortcuts.scheduleOfAccounts && (
          <Link
            to="/ScheduleofAccounts"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="ScheduleOfAccounts"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Schedule of Accounts
            </p>
          </Link>
        )}
        {selectedShortcuts.equityChanges && (
          <Link
            to="/EquityChanges"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="EquityChanges"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Equity Changes
            </p>
          </Link>
        )}
        {selectedShortcuts.straightSchedule && (
          <Link
            to="/StraightSchedule"
            className="flex flex-col items-center justify-center bg-green-700 text-white p-3 rounded-md hover:bg-green-800 transition duration-300 h-24 w-32" // Fixed height and width
            aria-label="StraightSchedule"
          >
            <FaChartBar size={30} />
            <p className="text-sm md:text-base font-medium mt-2 text-center">
              Straight Schedule
            </p>
          </Link>
        )}
      </div>

      {/* Placeholder for when all shortcuts are unchecked */}
      {!Object.values(selectedShortcuts).some((value) => value) && (
        <p className="text-gray-500 text-center">No shortcuts selected.</p>
      )}
    </div>
  );
};

export default Shortcuts;
