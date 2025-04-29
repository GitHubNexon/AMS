import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  LineController
} from "chart.js";
import { Bar } from "react-chartjs-2";
// import InvoicesApi from "../api/InvoicesApi"; // Ensure this imports the correct API for invoices
// import billsApi from "../api/billsApi"; // Ensure this imports the correct API for bills
import { numberToCurrencyString } from "../helper/helper";
import { useLoader } from "../context/useLoader";
import { FaSync } from "react-icons/fa";
import "../styles/custom.css";
import NotesComponent from "../Components/NotesComponent";
import { showToast } from "../utils/toastNotifications";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  LineController
);

const FinancialChart = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentYear = new Date().getFullYear();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [timePeriod, setTimePeriod] = useState("year");
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isAnimating, setIsAnimating] = useState(false);
  const { loading, setLoading } = useLoader();
  const [isOverallView, setIsOverallView] = useState(false);

  // const fetchAllInvoices = async () => {
  //   loading(true);
  //   try {
  //     const response = await InvoicesApi.getAllInvoices();
  //     setAllInvoices(response.invoices || []);
  //   } catch (error) {
  //     console.error("Error fetching all invoices:", error);
  //   }
  //   loading(false);
  // };

  // const fetchAllBills = async () => {
  //   loading(true);
  //   try {
  //     const response = await billsApi.getAllBills();
  //     setAllBills(response.bills || []);
  //   } catch (error) {
  //     console.error("Error fetching all bills:", error);
  //   }
  //   loading(false);
  // };

  // useEffect(() => {
  //   fetchAllInvoices();
  //   fetchAllBills();
  // }, []);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(async () => {
      try {
        await Promise.all([fetchAllInvoices(), fetchAllBills()]);
        showToast("Data synced successfully.", "success");
      } catch (error) {
        showToast("Failed to sync latest data. Please try again.", "error");
      } finally {
        setIsAnimating(false);
      }
    }, 3000);
  };
  const financialNotes = [
    "• The Total Income from Sales is based on payment dates, representing actual cash flow received. This ensures the displayed income reflects real-time cash availability, enhancing cash flow management.",
    "• Total Expenses represent the cash outflow during the selected period, including all operational costs. Understanding these expenses is crucial for assessing overall profitability.",
    "• Note: The income and expense charts offer insights into your financial health. Regularly reviewing these metrics can help identify trends and adjust your financial strategy as needed.",
  ];
  
  

  const calculateMonthlyIncome = () => {
    const monthlyIncome = new Array(12).fill(0);
    allInvoices.forEach((invoice) => {
      if (invoice.payment && Array.isArray(invoice.payment)) {
        invoice.payment.forEach((payment) => {
          const paymentDate = new Date(payment.date?.$date || payment.date);
          const monthIndex = paymentDate.getMonth();

          if (paymentDate.getFullYear() !== selectedYear && !isOverallView)
            return;

          if (
            timePeriod === "month" &&
            monthIndex !== selectedMonth &&
            !isOverallView
          )
            return;

          if (
            timePeriod === "quarter" &&
            !isMonthInQuarter(monthIndex, selectedQuarter)
          )
            return;

          monthlyIncome[monthIndex] += payment.amount || 0;
        });
      }
    });
    return monthlyIncome;
  };

  const calculateMonthlyExpenses = () => {
    const monthlyExpenses = new Array(12).fill(0);
    allBills.forEach((bill) => {
      if (bill.payment && Array.isArray(bill.payment)) {
        bill.payment.forEach((payment) => {
          const paymentDate = new Date(payment.paymentDate?.$date || payment.paymentDate);
          const monthIndex = paymentDate.getMonth();

          if (paymentDate.getFullYear() !== selectedYear && !isOverallView)
            return;

          if (
            timePeriod === "month" &&
            monthIndex !== selectedMonth &&
            !isOverallView
          )
            return;

          if (
            timePeriod === "quarter" &&
            !isMonthInQuarter(monthIndex, selectedQuarter)
          )
            return;

          monthlyExpenses[monthIndex] += payment.amount || 0;
        });
      }
    });
    return monthlyExpenses;
  };

  const isMonthInQuarter = (monthIndex, quarter) => {
    const quarters = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [9, 10, 11],
    ];
    return quarters[quarter - 1].includes(monthIndex);
  };

  const monthlyIncome = isOverallView ? new Array(1).fill(calculateMonthlyIncome().reduce((a, b) => a + b, 0)) : calculateMonthlyIncome();
  const monthlyExpenses = isOverallView ? new Array(1).fill(calculateMonthlyExpenses().reduce((a, b) => a + b, 0)) : calculateMonthlyExpenses();

  const chartData = {
    labels: isOverallView ? ["Overall"] : months,
    datasets: [
      {
        type: "bar",
        label: "Total Expenses",
        data: monthlyExpenses,
        backgroundColor: "rgba(255, 0, 0, 0.6)",
        borderColor: "rgba(255, 0, 0, 1)",
        borderWidth: 1,
      },
      {
        type: "line",
        label: "Total Income",
        data: monthlyIncome,
        backgroundColor: "rgba(50, 205, 50, 0.6)",
        borderColor: "rgba(50, 205, 50, 1)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: PHP ${numberToCurrencyString(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: isOverallView ? "Overall" : "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount (PHP)",
        },
        ticks: {
          beginAtZero: true,
          callback: (value) => `PHP ${numberToCurrencyString(value)}`,
        },
      },
    },
  };

  return (
    <>
      <div className="p-4 w-full h-full flex items-center justify-center bg-white shadow-md rounded-lg flex-col">
        <h2 className="text-2xl font-semibold mb-4">Financial Overview</h2>

        <div className="flex items-center mb-4 justify-center">
          <button
            onClick={handleRefresh}
            className="flex items-center p-2 border rounded hover:bg-gray-200 mr-2"
          >
            <FaSync className={`mr-2 ${isAnimating ? "spin" : ""}`} />
            Sync Latest Data
          </button>

          <select
            onChange={(event) => {
              const value = event.target.value;
              setTimePeriod(value);
              setIsOverallView(value === "overall");
            }}
            value={isOverallView ? "overall" : timePeriod}
            className="p-2 border rounded"
          >
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
            <option value="overall">Overall</option>
          </select>

          {timePeriod === "quarter" && (
            <select
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              value={selectedQuarter}
              className="ml-4 p-2 border rounded"
            >
              {[1, 2, 3, 4].map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter} Quarter
                </option>
              ))}
            </select>
          )}

          {timePeriod === "month" && (
            <select
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              value={selectedMonth}
              className="ml-4 p-2 border rounded"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          )}

          {!isOverallView && (
            <select
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              value={selectedYear}
              className="ml-4 p-2 border rounded"
            >
              {[...Array(20)].map((_, index) => {
                const year = currentYear - index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="flex flex-col w-full items-center justify-center">
          {!isOverallView ? (
            <div className="w-full h-64 flex items-center justify-center">
              <Bar data={chartData} options={options} />
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 border rounded">
              <p>Chart is Disabled in Overall View</p>
            </div>
          )}
        </div>

        <div className="p-4 w-full bg-gray-50 rounded-md shadow-md mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Income and Expense Summary
          </h3>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Income:</span>
              <span className="text-xl font-bold text-green-600">
                PHP {numberToCurrencyString(monthlyIncome.reduce((a, b) => a + b, 0))}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Expenses:</span>
              <span className="text-xl font-bold text-green-600">
                PHP {numberToCurrencyString(monthlyExpenses.reduce((a, b) => a + b, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex item-start justify-start w-full mt-4">
          <NotesComponent notes={financialNotes} title="Chart Calculation Details and Key Sales Insights" />
        </div>
      </div>
    </>
  );
};

export default FinancialChart;
