import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import {
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
  FaList
} from "react-icons/fa";
import { FaMoneyBillWheat, FaBookSkull } from "react-icons/fa6";
import { BsBank, BsCashStack } from "react-icons/bs";
import { GiPayMoney } from "react-icons/gi";
import { RiBillFill } from "react-icons/ri";
import { MdAccountBalanceWallet } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MiscContext } from "../context/MiscContext";
import { showToast } from "../utils/toastNotifications";
import { SiExpensify } from "react-icons/si";
import Depreciation from './../Pages/Depreciation';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const {
    isAccountingEntriesOpen,
    setAccountingIsEntriesOpen,
    isEntriesOpen,
    setIsEntriesOpen,
    isSalesOpen, setIsSalesOpen,
    isExpensesOpen, setIsExpensesOpen,
    expandSidebar, setExpandSidebar
  } = useContext(MiscContext);
  const [companyLogo, setCompanyLogo] = useState("");
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const savedlogo = localStorage.getItem('logo');

  useEffect(() => {
    
      const fetchCompanySettings = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/company-settings`);
          const settings = response.data;
          if(settings.companyLogo != savedlogo){
            setCompanyLogo(settings.companyLogo || "");
            localStorage.setItem('logo', settings.companyLogo);
          }
        } catch (error) {
          console.error("Error fetching company settings:", error);
        }
      };

      fetchCompanySettings();
    
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleEntries = () => setIsEntriesOpen(!isEntriesOpen);
  const toggleAccountingEntries = () => setAccountingIsEntriesOpen(!isAccountingEntriesOpen);
  const toggleSales = () => setIsSalesOpen(!isSalesOpen);
  const toggleExpenses = () => setIsExpensesOpen(!isExpensesOpen);

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logout successful!", "success");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <nav className={`w-[240px] bg-white border-r-[1px]text-green-800 transition duration-300 transform translate-x-[${expandSidebar ? '0px' : '-300px'}]`}>

      {/* <div className="flex items-center justify-between p-4 lg:hidden">
        <Link to="/">
          <img
            src={"data:image/png;base64," + companyLogo}
            alt="Company Logo"
            className="h-8 cursor-pointer object-cover"
          />
        </Link>
        <button onClick={toggleMenu} className="text-green-600 focus:outline-none z-10">
          {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div> */}

      <ul className={`flex flex-col h-full p-2 text-[0.75em] overflow-y-scroll`} >
        <h1 className={`text-center border-b mb-2 border-green-600 pb-4 flex justify-center`}>
          <Link to="/">
            <img
              src={"data:image/png;base64," + savedlogo}
              alt="Company Logo"
              className="cursor-pointer max-h-[50px]" />
          </Link>
        </h1>

        {/* Accounting System Dropdown */}
        {user && ['ca', 'cs', 'us', 'ss'].some(v=>user.access.includes(v)) && (
          <li>
            <div className="flex items-center my-2 py-1 px-2 cursor-pointer hover:bg-green-700 hover:text-white rounded-lg" onClick={toggleAccountingEntries} >
              <FaBook className="mr-2" /> Accounting System
              <FaChevronDown className={`ml-auto transition-transform ${ isAccountingEntriesOpen ? "rotate-180" : "" }`} />
            </div>
            {
              isAccountingEntriesOpen && (
                <ul className={`ml-6 mt-2 space-y-2 transition-all duration-200 overflow-y-auto"}`} >
                  {user && user.access.includes('ca') && (
                    <li>
                      <Link to="/ChartOfAccounts" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/ChartOfAccounts' ? 'text-white bg-green-700' : ''}`}>
                        <MdAccountBalanceWallet className="mr-2 ml-1" /> Chart of Accounts
                      </Link>
                    </li>
                  )}
                  {user && user.access.includes('cs') && (
                    <li>
                      <Link to="/company-settings" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/company-settings' ? 'text-white bg-green-700' : ''}`}>
                        <FaBuilding className="mr-2 ml-1" /> Company Settings
                      </Link>
                    </li>
                  )}
                  {user && user.access.includes('us') && (
                    <li>
                      <Link to="/users" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/users' ? 'text-white bg-green-700' : ''}`}>
                        <FaUser className="mr-2 ml-1" /> Users
                      </Link>
                    </li>
                  )}
                  {user && user.access.includes('ss') && (
                    <li>
                      <Link to="/setup" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/setup' ? 'text-white bg-green-700' : ''}`}>
                        <FaWrench className="mr-2 ml-1" /> Setup
                      </Link>
                    </li>
                  )}
                </ul>
              )
            }
          </li>
        )}
        
        {/* Entries Dropdown */}
        {user && ['pe', 'je', 's', 're', 's', 'as', 'c', 'cf', 'i', 'e', 'ps', 'en'].some(v=>user.access.includes(v)) && (
          <li>
            <div className="flex items-center py-1 px-2 mt-2 cursor-pointer hover:bg-green-700 hover:text-white rounded-lg" onClick={toggleEntries} >
              <FaFileAlt className="mr-2" /> Entries
              <FaChevronDown className={`ml-auto transition-transform ${isEntriesOpen ? "rotate-180" : ""}`} />
            </div>
            <ul className={`ml-6 mt-2 space-y-2 transition-all duration-200 overflow-y-auto`}>
              {
                isEntriesOpen && (
                  <>
                  {user && user.access.includes('en') && (
                      <li>
                       <Link to="/entries" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/entries' ? 'text-white bg-green-700' : ''}`}>
                          <FaList className="mr-2 ml-1" /> All Entries
                       </Link>
                     </li>
                    )}
                    {user && user.access.includes('pn') && (
                      <li>
                       <Link to="/paymentEntries" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/paymentEntries' ? 'text-white bg-green-700' : ''}`}>
                          <GiPayMoney className="mr-2 ml-1" /> Payment Entries
                       </Link>
                     </li>
                    )}
                    {user && user.access.includes('rn') && (
                      <li>
                       <Link to="/receiptEntries" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/receiptEntries' ? 'text-white bg-green-700' : ''}`}>
                          <FaReceipt className="mr-2 ml-1" /> Receipt Entries
                       </Link>
                     </li>
                    )}
                    {user && user.access.includes('jn') && (
                      <li>
                       <Link to="/journalEntries" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/journalEntries' || location.pathname === '/lessee' ? 'text-white bg-green-700' : ''}`}>
                          <FaBook className="mr-2 ml-1" /> Journal Entries
                       </Link>
                     </li>
                    )}

                    
                    {/* DO NOT DELETE v */}
                    {/* Sales Dropdown */}
                    {/* {user && ['s', 'as', 'c', 'cf', 'i', 'ps'].some(v=>user.access.includes(v)) && (
                      <li>
                        <div className="flex items-center p-1 cursor-pointer hover:bg-green-700 hover:text-white rounded-lg" onClick={toggleSales} >
                          <FaChartBar className="mr-2" /> Sales
                          <FaChevronDown className={`ml-auto transition-transform ${isSalesOpen ? "rotate-180" : ""}`} />
                        </div>
                        <ul className={`ml-6 mt-1 space-y-2 transition-all duration-200 overflow-y-auto`} >
                          {
                            isSalesOpen && (
                              <>
                                {user && user.access.includes('as') && (
                                  <li>
                                    <Link to="/allSales" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/allSales' ? 'text-white bg-green-700' : ''}`}>
                                      <FaChartLine className="mr-2 ml-1" /> All Sales
                                    </Link>
                                  </li>
                                )}
                                {user && user.access.includes('i') && (
                                  <li>
                                    <Link to="/invoicestable" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${['/invoices', '/invoicestable', '/invoices_form'].includes(location.pathname) ? 'text-white bg-green-700' : ''}`}>
                                      <FaReceipt className="mr-2 ml-1" /> Invoices
                                    </Link>
                                  </li>
                                )}
                                {user && user.access.includes('c') && (
                                  <li>
                                    <Link to="/customers" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/customers' || location.pathname === '/customerForm' ? 'text-white bg-green-700' : ''}`}>
                                      <FaUser className="mr-2 ml-1" /> Customers
                                    </Link>
                                  </li>
                                )}
                                {user && user.access.includes('ps') && (
                                  <li>
                                    <Link to="/productsandservices" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/productsandservices' ? 'text-white bg-green-700' : ''}`}>
                                      <FaBoxes className="mr-2 ml-1" /> Products & Services
                                    </Link>
                                  </li>
                                )}
                              </>
                            )
                          }
                        </ul>
                      </li>
                    )} */}
                    {/* {user && user.access.includes('e') &&
                      <li>
                        <div className="flex items-center p-1 cursor-pointer hover:bg-green-700 hover:text-white rounded-lg" onClick={toggleExpenses} >
                          <FaMoneyBill className="mr-2" />Expenses
                          <FaChevronDown className={`ml-auto transition-transform ${isExpensesOpen ? "rotate-180" : ""}`} />
                        </div>
                        <ul className={`ml-6 mt-1 space-y-2 transition-all duration-200 overflow-y-auto`} >
                        {
                          isExpensesOpen &&
                          <>
                            <li>
                              <Link to="/AllExpenses" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/AllExpenses' ? 'text-white bg-green-700' : ''}`}>
                                <SiExpensify className="mr-2 ml-1" /> All Expenses
                              </Link>
                            </li>
                             {user && user.access.includes('b') &&
                              <li>
                                <Link to="/Bills" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Bills' ? 'text-white bg-green-700' : ''}`}>
                                  <RiBillFill className="mr-2 ml-1" /> Bills
                                </Link>
                              </li>
                            }
                            {user && user.access.includes('v') &&
                              <li>
                                <Link to="/Vendors" className={`flex items-center p-1 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Vendors' ? 'text-white bg-green-700' : ''}`}>
                                  <FaUser className="mr-2 ml-1" /> Vendors
                                </Link>
                              </li>
                            }
                          </>
                        }
                        </ul>
                      </li>
                    } */}
                    {/* DO NOT DELET ^ */}
                    

                  </>
                )
              }
            </ul>
          </li>
        )}
        {user && user.access.includes('rp') && (
          <li>
            <Link to="/report" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/report' ? 'text-white bg-green-700' : ''}`}>
              <FaChartLine className="mr-2" /> Reports
            </Link>
          </li>
        )}
        {user && user.access.includes('bm') && (
          <li>
            <Link to="/BudgetMonitoring" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/BudgetMonitoring' ? 'text-white bg-green-700' : ''}`}>
              <FaMoneyBillWheat className="mr-2" /> Budget Monitoring
            </Link>
          </li>
        )}
        {user && user.access.includes('or') && (
          <li>
            <Link to="/OrderOfPayment" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/OrderOfPayment' ? 'text-white bg-green-700' : ''}`}>
              <RiBillFill className="mr-2" /> Order of Payment
            </Link>
          </li>
        )}
        {user && user.access.includes('br') && (
          <li>
            <Link to="/Bank-Reconciliation" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Bank-Reconciliation' ? 'text-white bg-green-700' : ''}`}>
              <BsBank className="mr-2" /> Bank Reconciliation
            </Link>
          </li>
        )}
        {user && user.access.includes('dp') && (
          <li>
            <Link to="/Depreciation" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Depreciation' ? 'text-white bg-green-700' : ''}`}>
              <FaBookSkull  className="mr-2" /> Depreciation Monitoring
            </Link>
          </li>
        )}
         {user && user.access.includes('dp') && (
          <li>
            <Link to="/AssetManagement" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/AssetManagement' ? 'text-white bg-green-700' : ''}`}>
              <FaBookSkull  className="mr-2" /> Asset Management
            </Link>
          </li>
        )}
        {user && user.access.includes('asm') && (
          <li>
            <Link to="/Depreciation" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Depreciation' ? 'text-white bg-green-700' : ''}`}>
              <FaBookSkull  className="mr-2" /> Depreciation Monitoring
            </Link>
          </li>
        )}
        {user && user.access.includes('adv') && (
          <li>
            <Link to="/CashAdvance" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/CashAdvance' ? 'text-white bg-green-700' : ''}`}>
              <FaMoneyBill  className="mr-2" /> Cash Advance
            </Link>
          </li>
        )}
        {user && user.access.includes('pr') && (
          <li>
            <Link to="/Payroll" className={`flex items-center my-1 py-1 p-2 hover:bg-green-700 hover:text-white rounded-lg ${location.pathname === '/Payroll' ? 'text-white bg-green-700' : ''}`}>
              <BsCashStack  className="mr-2" /> Payroll
            </Link>
          </li>
        )}
        <li className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center p-2 text-red-600 hover:bg-red-700 hover:text-white rounded-lg"
          >
            <FaSignOutAlt className="mr-2" /> Log out
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
