import React, { useState, useEffect, useContext } from "react";
import Notification from "./Notification"; // Adjust the import path if needed
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../api/profileApi"; // Import getProfile to fetch user data
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { MiscContext } from "../context/MiscContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/custom.css";
import {
  FaChevronUp,
  FaBell,
  FaUser,
  FaBook,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaSignOutAlt,
  FaChevronDown,
  FaChartBar,
  FaMoneyBill,
  FaReceipt,
  FaBuilding,
  FaWrench,
  FaBoxes,
  FaList,
} from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import { SiExpensify } from "react-icons/si";
import { RiBillFill } from "react-icons/ri";
import { GiPayMoney } from "react-icons/gi";

// ww is window width from layout
const Header = ({ ww }) => {
  const location = useLocation();
  const {
    expandSidebar,
    setExpandSidebar,
    isSalesOpen,
    setIsSalesOpen,
    isExpensesOpen,
    setIsExpensesOpen,
  } = useContext(MiscContext);
  const { user } = useAuth();

  const [showNotification, setShowNotification] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userType, setUserType] = useState("");
  const [accountingSystemDropdown, setAccountingSystemDrowdown] =
    useState(false);
  const [entriesDropdown, setEntriesDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setFirstName(profile.firstName || "");
        setMiddleName(profile.middleName || "");
        setLastName(profile.lastName || "");
        setName(profile.name || "");
        setUserType(profile.userType || "");
        setProfileImage(profile.profileImage || "");
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };
    fetchProfile();
  }, []);

  const fullName = `${firstName} ${
    middleName ? middleName + " " : ""
  }${lastName}`;

  useEffect(() => {
    setAccountingSystemDrowdown(false);
    setEntriesDropdown(false);
  }, [location]);

  // prevents 2 dropdown from opening at the same time
  useEffect(() => {
    if (accountingSystemDropdown) setEntriesDropdown(false);
  }, [accountingSystemDropdown]);

  useEffect(() => {
    if (entriesDropdown) setAccountingSystemDrowdown(false);
  }, [entriesDropdown]);

  const handleBellClick = () => {
    setShowNotification(!showNotification);
  };

  function toggleSidebar() {
    setExpandSidebar(!expandSidebar);
  }

  return (
    <>
      <div className="relative flex justify-between items-center p-2 bg-green-600 text-white">
        {/* Title on the left */}
        <div className="flex flex-row space-x-4">
          <button className="text-[1.7em]" onClick={toggleSidebar}>
            <TbLayoutSidebarLeftCollapse
              className={`transition duration-300 rotate-${
                expandSidebar ? "0" : "180"
              }`}
            />
          </button>
        </div>
        {/* Icons on the right */}
        <div className="flex items-center space-x-5 mr-2">
          {/* Username and role container */}
          <button
            className="flex"
            onClick={() => navigate("/dashboard/profile")}
          >
            <div className="flex flex-col items-end mr-3">
              <span className="font-bold text-[0.9em] underline">
                {/* {name ? `Hello, ${name}` : "Welcome"}
                 */}
                {fullName ? `Hello, ${fullName.trim()}` : "Welcome"}
              </span>

              <span className="text-gray-50 text-[0.8em] font-medium">
                {userType || ""}
              </span>
            </div>
            <img
              src={
                !profileImage ? user : `data:image/jpeg;base64,${profileImage}`
              } // Display Base64 image
              alt="Profile"
              className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80"
            />
          </button>
          <div>
            <FaBell
              className={`text-2xl cursor-pointer  hover:text-gray-400 ${
                showNotification ? "bell-animation" : ""
              }`}
              onClick={handleBellClick}
            />
            {showNotification && <Notification />}
          </div>
        </div>
      </div>
      {!expandSidebar && ww > 700 && (
        <div className="bg-green-600 text-[0.7em]">
          <ul className="flex text-white relative">
            {user &&
              ["ca", "cs", "us", "ss"].some((v) => user.access.includes(v)) && (
                <li className="">
                  <button
                    className={`
                px-[15px] flex items-center border-b-[5px] 
                ${
                  [
                    "/ChartOfAccounts",
                    "/company-settings",
                    "/users",
                    "/setup",
                  ].includes(location.pathname)
                    ? "border-green-800"
                    : "border-green-600"
                }
                `}
                    onClick={() =>
                      setAccountingSystemDrowdown(!accountingSystemDropdown)
                    }
                  >
                    Accounting System
                    <FaChevronDown
                      className={`ml-[5px] transition duration-500 ${
                        accountingSystemDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`absolute left-0 w-[100%] bg-white text-gray-700 z-10 shadow-bottom fade ${
                      accountingSystemDropdown ? "fade-in" : "fade-out"
                    }`}
                  >
                    <ul>
                      {user && user.access.includes("ca") && (
                        <li className="flex">
                          <Link
                            to={"/ChartOfAccounts"}
                            className="flex-1 flex items-center text-start hover:bg-gray-100 p-2 border-b"
                          >
                            <MdAccountBalanceWallet className="mr-2 ml-1" />
                            Chart of Accounts
                          </Link>
                        </li>
                      )}
                      {user && user.access.includes("cs") && (
                        <li className="flex">
                          <Link
                            to={"/company-settings"}
                            className="flex-1 flex items-center text-start hover:bg-gray-100 p-2 border-b"
                          >
                            <FaBuilding className="mr-2 ml-1" />
                            Company Settings
                          </Link>
                        </li>
                      )}
                      {user && user.access.includes("us") && (
                        <li className="flex">
                          <Link
                            to={"/users"}
                            className="flex-1 text-start hover:bg-gray-100 p-2 border-b flex items-center"
                          >
                            <FaUser className="mr-2 ml-1" />
                            Users
                          </Link>
                        </li>
                      )}
                      {user && user.access.includes("ss") && (
                        <li className="flex">
                          <Link
                            to={"/setup"}
                            className="flex-1 text-start hover:bg-gray-100 p-2 border-b flex items-center"
                          >
                            <FaWrench className="mr-2 ml-1" />
                            Setup
                          </Link>
                        </li>
                      )}
                      <li className="flex mt-[15px]">
                        <button
                          className="flex-1 flex items-center justify-center hover:bg-gray-100"
                          onClick={() => {
                            setAccountingSystemDrowdown(false);
                          }}
                        >
                          <FaChevronUp className="m-[15px]" />
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              )}
            <li className="">
              <button
                className={` px-[15px] flex items-center border-b-[5px] 
                ${
                  [
                    "/allSales",
                    "/customers",
                    "/customerForm",
                    "/invoices",
                    "/invoicestable",
                    "/invoices_form",
                    "/productsandservices",
                    "/expenses",
                    "/AllExpenses",
                    "/Bills",
                    "/Vendors",
                    "/entries",
                    "paymentEntries",
                    "receiptEntries",
                    "journalEntries",
                  ].includes(location.pathname)
                    ? "border-green-800"
                    : "border-green-600"
                }
                `}
                onClick={() => setEntriesDropdown(!entriesDropdown)}
              >
                {user && ["en"].some((v) => user.access.includes(v)) && (
                  <>
                    Entries
                    <FaChevronDown
                      className={`ml-[5px] transition duration-500 ${
                        entriesDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              <div
                className={`absolute left-0 w-[100%] bg-white text-gray-700 z-10 shadow-bottom fade ${
                  entriesDropdown ? "fade-in" : "fade-out"
                }`}
              >
                <ul>
                  {user && ["en"].some((v) => user.access.includes(v)) && (
                    <li className="flex flex-col border-b">
                      <Link
                        to={"/entries"}
                        className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                      >
                        <FaList className="mr-2 ml-1" />
                        All Entries
                      </Link>
                    </li>
                  )}
                  {user && ["pn"].some((v) => user.access.includes(v)) && (
                    <li className="flex flex-col border-b">
                      <Link
                        to={"/paymentEntries"}
                        className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                      >
                        <GiPayMoney className="mr-2 ml-1" />
                        Payment Entries
                      </Link>
                    </li>
                  )}
                  {user && ["rn"].some((v) => user.access.includes(v)) && (
                    <li className="flex flex-col border-b">
                      <Link
                        to={"/receiptEntries"}
                        className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                      >
                        <FaReceipt className="mr-2 ml-1" />
                        Receipt Entries
                      </Link>
                    </li>
                  )}
                  {user && ["jn"].some((v) => user.access.includes(v)) && (
                    <li className="flex flex-col border-b">
                      <Link
                        to={"/journalEntries"}
                        className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                      >
                        <FaBook className="mr-2 ml-1" />
                        Journal Entries
                      </Link>
                    </li>
                  )}

                  {/* may be removed in this fork but do not delete */}
                  {/* {user &&
                    ["s", "as", "c", "cf", "i", "ps"].some((v) =>
                      user.access.includes(v)
                    ) && (
                      <li className="flex flex-col border-b">
                        <button
                          className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                          onClick={() => setIsSalesOpen(!isSalesOpen)}
                        >
                          <FaChartBar className="mr-2" />
                          Sales
                          <FaChevronDown
                            className={`ml-[5px] transition duration-500 ${
                              isSalesOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isSalesOpen && (
                          <div>
                            <ul>
                              {user && user.access.includes("as") && (
                                <li className="flex">
                                  <Link
                                    to={"/allSales"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <FaChartLine className="mr-2 ml-1" />
                                    All Sales
                                  </Link>
                                </li>
                              )}
                              {user && user.access.includes("i") && (
                                <li className="flex">
                                  <Link
                                    to={"/invoicestable"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <FaReceipt className="mr-2 ml-1" />
                                    Invoices
                                  </Link>
                                </li>
                              )}
                              {user && user.access.includes("c") && (
                                <li className="flex">
                                  <Link
                                    to={"/customers"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <FaUser className="mr-2 ml-1" />
                                    Customers
                                  </Link>
                                </li>
                              )}
                              {user && user.access.includes("ps") && (
                                <li className="flex">
                                  <Link
                                    to={"/productsandservices"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <FaBoxes className="mr-2 ml-1" />
                                    Products & Services
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </li>
                    )}

                    {user &&
                    ["e"].some((v) =>
                      user.access.includes(v)
                    ) && (
                      <li className="flex flex-col border-b">
                        <button
                          className="flex-1 flex items-center text-left p-[15px] hover:bg-gray-100"
                          onClick={() => setIsExpensesOpen(!isExpensesOpen)}
                        >
                          <FaMoneyBill className="mr-2" />
                          Expenses
                          <FaChevronDown
                            className={`ml-[5px] transition duration-500 ${
                              isExpensesOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isExpensesOpen && (
                          <div>
                            <ul>
                                <li className="flex">
                                  <Link
                                    to={"/AllExpenses"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <SiExpensify className="mr-2 ml-1" />
                                    All Expenses
                                  </Link>
                                </li>
                              {user && user.access.includes("b") && (
                                <li className="flex">
                                  <Link
                                    to={"/Bills"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <RiBillFill className="mr-2 ml-1" />
                                    Bills
                                  </Link>
                                </li>
                              )}
                              {user && user.access.includes("v") && (
                                <li className="flex">
                                  <Link
                                    to={"/Vendors"}
                                    className="flex-1 text-start hover:bg-gray-100 p-2 pl-10 border-b flex items-center"
                                  >
                                    <FaUser className="mr-2 ml-1" />
                                    Vendors
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </li>
                    )} */}
                  {/* above options may be removed in this fork but do not delete */}

                  <li className="flex mt-[15px]">
                    <button
                      className="flex-1 flex items-center justify-center hover:bg-gray-100"
                      onClick={() => {
                        setEntriesDropdown(false);
                      }}
                    >
                      <FaChevronUp className="m-[15px]" />
                    </button>
                  </li>
                </ul>
              </div>
            </li>
            {user && user.access.includes("rp") && (
              <li className="">
                <Link
                  to={"/report"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/report"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Reports
                </Link>
              </li>
            )}

            {user && user.access.includes("bm") && (
              <li className="">
                <Link
                  to={"/BudgetMonitoring"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/BudgetMonitoring"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Budget Monitoring
                </Link>
              </li>
            )}

            {user && user.access.includes("or") && (
              <li className="">
                <Link
                  to={"/OrderOfPayment"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/OrderOfPayment"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Order of Payment
                </Link>
              </li>
            )}

            {user && user.access.includes("br") && (
              <li className="">
                <Link
                  to={"/Bank-Reconciliation"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/Bank-Reconciliation"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Bank Reconciliation
                </Link>
              </li>
            )}
            {user && user.access.includes("dp") && (
              <li className="">
                <Link
                  to={"/Depreciation"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/Depreciation"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Depreciation Monitoring
                </Link>
              </li>
            )}
            {user && user.access.includes("asm") && (
              <li className="">
                <Link
                  to={"/AssetManagement"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/AssetManagement"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Asset Management
                </Link>
              </li>
            )}
            {user && user.access.includes("adv") && (
              <li className="">
                <Link
                  to={"/CashAdvance"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/CashAdvance"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Cash Advance
                </Link>
              </li>
            )}
            {user && user.access.includes("pr") && (
              <li className="">
                <Link
                  to={"/Payroll"}
                  className={`
                  px-[15px] flex items-center border-b-[5px] 
                  ${
                    ["/Payroll"].includes(location.pathname)
                      ? "border-green-800"
                      : "border-green-600"
                  }`}
                >
                  Payroll
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Header;
