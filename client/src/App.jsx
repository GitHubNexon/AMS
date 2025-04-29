// src/App.jsx
import React, { useEffect, useState } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Admin/Login";
import Register from "./Admin/Register";
import Dashboard from "./Pages/Dashboard";
import Profile from "./Components/Profile";
import Header from "./Components/Header";
// import Sales from "./Pages/Sales";
import PrivateRoute from "./Components/PrivateRoute";
import Users from "./Pages/Users";
import Reports from "./Pages/Reports";
import CompanySettings from "./Sub-pages/CompanySettings";
import ChartOfAccounts from "./Sub-pages/ChartOfAccounts";
import ProtectedRoute from "./Components/ProtectedRoute";
import NotFound from "./Components/NotFound";
import Setup from "./Sub-pages/Setup";
// import AllSales from "./Sub-pages/AllSales";
// import Customers from "./Sub-pages/Customers";
// import ProductsAndServices from "./Pages/ProductsAndServices";
// import InvoiceTable from "./Pages/InvoiceTable";
import Layout from "./Components/Layout";
// import AllExpenses from "./Sub-pages/AllExpenses";
// import Bills from "./Sub-pages/Bills";
// import Vendors from "./Sub-pages/Vendors";
import Entries from "./Pages/Entries";
import PaymentEntries from "./Pages/PaymentEntries";
import ReceiptEntries from "./Pages/ReceiptEntries";
import JournalEntries from "./Pages/JournalEntries";
import AlphaListTaxReport from "./Reports/AlphaListTaxReport";
import TrialBalanceReport from "./Reports/TrialBalanceReport";
import BalanceSheet from "./Reports/BalanceSheet";
import ScheduleofAccounts from "./Reports/ScheduleofAccounts";
import IncomeStatement from "./Reports/IncomeStatement";
import EquityChanges from "./Reports/EquityChanges";
import StraightSchedule from "./Reports/StraightSchedule";
import BudgetAnalytics from "./Pages/BudgetAnalytics";
import FundsDataEntry from "./Sub-pages/FundsDataEntry";
import BudgetMonitoring from "./Sub-pages/BudgetMonitoring";
import Lessee from "./Sub-pages/Lessee";
import OrderOfPayment from "./Pages/OrderOfPayment";
import FinancialStatements from "./Reports/FinancialStatements";
import BankRecon from "./Pages/BankRecon";
import Depreciation from "./Pages/Depreciation";
import CashAdvance from "./Pages/CashAdvance";
import Payroll from "./Pages/Payroll";

function App() {
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <>
      <PrivateRoute
        element={
          <Router basename="/AMS/">
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/entries"
                element={
                  <ProtectedRoute requiredRole="en">
                    <Layout>
                      <Entries />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paymentEntries"
                element={
                  <ProtectedRoute requiredRole="pn">
                    <Layout>
                      <PaymentEntries />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receiptEntries"
                element={
                  <ProtectedRoute requiredRole="rn">
                    <Layout>
                      <ReceiptEntries />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journalEntries"
                element={
                  <ProtectedRoute requiredRole="jn">
                    <Layout>
                      <JournalEntries />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessee"
                element={
                  <ProtectedRoute requiredRole="jn">
                    <Layout>
                      <Lessee />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* <Route
                path="/sales"
                element={
                  <ProtectedRoute requiredRole="s">
                    <Header title="Sales" />
                    <Sales />
                  </ProtectedRoute>
                }
              /> */}
              {/* Sales DropDown menu */}
              {/* <Route
                path="/allSales"
                element={
                  <ProtectedRoute requiredRole="as">
                    <Layout>
                      <AllSales />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute requiredRole="c">
                    <Layout>
                      <Customers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute requiredRole="s">
                    <Header title="Sales" />
                    <Sales />
                  </ProtectedRoute>
                }
              /> */}
              {/* Sales DropDown menu */}
              {/* <Route
                path="/allSales"
                element={
                  <ProtectedRoute requiredRole="as">
                    <Header title="All Sales" />
                    <AllSales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute requiredRole="c">
                    <Header title="Customers" />
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoicestable"
                element={
                  <ProtectedRoute requiredRole="i">
                    <Layout>
                      <InvoiceTable />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productsandservices"
                element={
                  <ProtectedRoute requiredRole="ps">
                    <Layout>
                      <ProductsAndServices />
                    </Layout>
                  </ProtectedRoute>
                }
              /> */}
              {/* EXPENSES ROUTES */}
              {/* <Route
                path="/AllExpenses"
                element={
                  <ProtectedRoute requiredRole={"e"}>
                    <Layout>
                      <AllExpenses />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Bills"
                element={
                  <ProtectedRoute requiredRole={"b"}>
                    <Layout>
                      <Bills />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="Vendors"
                element={
                  <ProtectedRoute requiredRole={"v"}>
                    <Layout>
                      <Vendors />
                    </Layout>
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/ChartOfAccounts"
                element={
                  <ProtectedRoute requiredRole="ca">
                    <Layout>
                      <ChartOfAccounts />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setup"
                element={
                  <ProtectedRoute requiredRole="ss">
                    <Layout>
                      <Setup />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/BudgetAnalytics"
                element={
                  <ProtectedRoute requiredRole="bm">
                    <Layout>
                      <BudgetAnalytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/FundsDataEntry"
                element={
                  <ProtectedRoute requiredRole="fd">
                    <Layout>
                      <FundsDataEntry />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/BudgetMonitoring"
                element={
                  <ProtectedRoute requiredRole="be">
                    <Layout>
                      <BudgetMonitoring />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/OrderOfPayment"
                element={
                  <ProtectedRoute requiredRole="or">
                    <Layout>
                      <OrderOfPayment />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/report"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/AlphalistTax"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <AlphaListTaxReport />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/TrialBalanceReport"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <TrialBalanceReport />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/FinancialStatements"
                element={
                  <ProtectedRoute requiredRole="fs">
                    <Layout>
                      <FinancialStatements />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/BalanceSheet"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <BalanceSheet />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ScheduleofAccounts"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <ScheduleofAccounts />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/IncomeStatement"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <IncomeStatement />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/EquityChanges"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <EquityChanges />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/StraightSchedule"
                element={
                  <ProtectedRoute requiredRole="rp">
                    <Layout>
                      <StraightSchedule />
                    </Layout>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/Bank-Reconciliation"
                element={
                  <ProtectedRoute requiredRole="br">
                    <Layout>
                      <BankRecon />
                    </Layout>
                  </ProtectedRoute>
                }
              />
               <Route
                path="/Depreciation"
                element={
                  <ProtectedRoute requiredRole="dp">
                    <Layout>
                      <Depreciation />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/CashAdvance"
                element={
                  <ProtectedRoute requiredRole={"adv"}>
                    <Layout>
                      <CashAdvance />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Payroll"
                element={
                  <ProtectedRoute requiredRole={"pr"}>
                    <Layout>
                      <Payroll />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              
              {/* Sub-Pages */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole="us">
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <PrivateRoute
                    element={
                      <Layout>
                        <Profile />
                      </Layout>
                    }
                  />
                }
              />
              <Route
                path="/company-settings"
                element={
                  <ProtectedRoute requiredRole="cs">
                    <Layout>
                      <CompanySettings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              {/* Redirect to home for undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        }
      />
      {/* ToastContainer for displaying toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
