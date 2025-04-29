import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../api/profileApi"; // Import getProfile to fetch user data
import Sidebar from "../Components/Sidebar";
import BudgetChart from "../Charts/BudgetChart";
import FinancialChart from "../Charts/FinancialChart";
// import InvoicesChart from "../Charts/InvoicesChart";
// import ExpenseChart from "../Charts/ExpenseChart";
import AccountsReceivableChart from "../Charts/AccountsReceivableChart";
import AccountsPayableChart from "../Charts/AccountsPayableChart";
import Shortcuts from "../Components/Shortcuts";
import Task from "../Sub-pages/Task";
import { FaUser, FaAddressCard, FaBell, FaChevronDown } from "react-icons/fa";
import SignatoriesTable from "../Components/SignatoriesTable";
import Sales from './Sales';
import TaskNotifications from "../Sub-pages/TaskNotification"

const Dropdown = ({ buttonData, toggleChartVisibility }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (value) => {
    toggleChartVisibility(value);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between cursor-pointer p-2 hover:bg-green-700 hover:text-white rounded-lg"
        onClick={handleToggle}
      >
        <span className="font-semibold0">Select Chart to Show</span>
        <FaChevronDown
          className={`ml-auto transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div className="mt-2 space-y-2">
          {buttonData.map((button) => (
            <div
              key={button.value}
              onClick={() => handleOptionClick(button.value)}
              className="flex items-center p-2 pl-6 text-sm text-gray-600 hover:bg-green-700 hover:text-white cursor-pointer rounded-lg"
            >
              {button.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [lastLoginTime, setLastLoginTime] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [name, setName] = useState("");
  const [showCharts, setShowCharts] = useState({
    invoices: false,
    expenses: false,
    receivable: false,
    payable: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name || "");
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const storedLastLogin = localStorage.getItem("lastLoginTime");
    const currentLogin = new Date();

    if (storedLastLogin) {
      setLastLoginTime(new Date(storedLastLogin));
    }
    setLoginTime(currentLogin);
    localStorage.setItem("lastLoginTime", currentLogin);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  const toggleChartVisibility = (chart) => {
    setShowCharts((prev) => ({ ...prev, [chart]: !prev[chart] }));
  };

  const [isSignatoriesTableVisible, setIsSignatoriesTableVisible] =
    useState(true);
    
  const toggleVisibility = () => {
    setIsSignatoriesTableVisible(!isSignatoriesTableVisible);
  };

  const buttonData = [
    { label: "Show Invoices Chart", value: "invoices" },
    { label: "Show Expense Chart", value: "expenses" },
    { label: "Show Accounts Receivable Chart", value: "receivable" },
    { label: "Show Accounts Payable Chart", value: "payable" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <main className="flex-1 sm:p-6" data-aos="fade-down">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-green-600 text-base sm:text-lg lg:text-xl xl:text-2xl">
            👋 Nice of you to join us again. Current Time:{" "}
            {currentTime.toLocaleTimeString()}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <InfoCard
            icon={
              <FaAddressCard className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-green-600 mb-2" />
            }
            title="Account Details"
            message={`Welcome Back! ${
              name ? `Hello, ${name}` : "Welcome"
            } Account Summary as of ${formatDateTime(loginTime)}`}
          />
          <InfoCard
            icon={
              <FaBell className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-green-600 mb-2" />
            }
            title="Notifications"
            message="No notifications."
          />
          {/* <Task /> */}
          <TaskNotifications />
        </div>

        <div>
      <label className="flex items-center cursor-pointer">
        <span className="mr-2">Show Entries and Signatories</span>
        <div className="relative">
          <input
            type="checkbox"
            checked={isSignatoriesTableVisible}
            onChange={toggleVisibility}
            className="sr-only"
          />
          <div
            className={`w-10 h-5 bg-gray-300 rounded-full ${isSignatoriesTableVisible ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div
              className={`w-5 h-5 bg-white border-2 border-gray-500 rounded-full shadow-md transition-all duration-300 transform ${isSignatoriesTableVisible ? 'translate-x-6' : 'translate-x-0'}`}
            ></div>
          </div>
        </div>
      </label>
      {isSignatoriesTableVisible && <SignatoriesTable />}
    </div>

        {/* Shortcuts */}
        <Shortcuts />
        {/* Dropdown to toggle chart visibility */}
        <div className="mb-4 sticky top-0 z-10 glass w-full mt-10 p-3 max-sm:mx-5">
          <Dropdown
            buttonData={buttonData}
            toggleChartVisibility={toggleChartVisibility}
          />
        </div>
        {/* GRAPHS */}
        <section>
          <h1 className="text-green-600 text-base sm:text-lg lg:text-xl xl:text-2xl mb-4">
            ACCOUNTING SYSTEM
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-8 ">
            {/* <ChartCard component={<BudgetChart />} />
            <ChartCard component={<FinancialChart />} /> */}
          </div>

          {/* Conditional Charts Rendering */}
          {/* <div className="mt-14">
            <ConditionalChart isVisible={showCharts.invoices} component={<InvoicesChart />} />
          </div>
          <div className="mt-14">
            <ConditionalChart isVisible={showCharts.expenses} component={<ExpenseChart />} />
          </div> */}

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <ConditionalChart
              isVisible={showCharts.receivable}
              component={<AccountsReceivableChart />}
            />
            <ConditionalChart
              isVisible={showCharts.payable}
              component={<AccountsPayableChart />}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

// InfoCard Component
const InfoCard = ({ icon, title, message }) => (
  <div className="bg-gray-200 p-4 rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex flex-col items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400">
    {icon}
    <h3 className="text-xs sm:text-sm md:text-base font-light">{title}</h3>
    <p className="text-xs sm:text-sm md:text-base">{message}</p>
  </div>
);

// ChartCard Component
const ChartCard = ({ component }) => (
  <div className="flex-col bg-gray-200 rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400 p-4">
    {component}
  </div>
);

// ConditionalChart Component
const ConditionalChart = ({ isVisible, component }) =>
  isVisible && (
    <div className="flex-col bg-gray-200 p-4 rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400">
      {component}
    </div>
  );

export default Dashboard;
