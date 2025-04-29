import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  PointElement,
  LinearScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import InvoicesApi from "../api/InvoicesApi";
import { useLoader } from "../context/useLoader";
import { FaSync } from "react-icons/fa";
import "../styles/custom.css";
import NotesComponent from "../Components/NotesComponent";
import { showToast } from "../utils/toastNotifications";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale
);

const InvoiceStatusEnum = {
  PAID: "Paid",
  PENDING: "Pending",
  PAST_DUE: "Past Due",
};

const InvoicesChart = () => {
  const [invoiceData, setInvoiceData] = useState({
    labels: [],
    dueDates: [],
    pastDue: [],
    paid: [],
  });
  const [timePeriod, setTimePeriod] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { loading, setLoading } = useLoader(); // Loading state from context
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [selectedYear]); // Re-fetch invoices when the year changes

  const fetchInvoices = async () => {
    loading(true);
    try {
      const { invoices } = await InvoicesApi.getAllInvoices();
      const processedData = processInvoices(invoices);
      setInvoiceData(processedData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      loading(false);
    }
  };

  const processInvoices = (invoices) => {
    const labels = getMonthLabels();
    const dueDates = Array(12).fill(0);
    const pastDue = Array(12).fill(0);
    const paid = Array(12).fill(0);

    invoices.forEach((invoice) => {
      const invoiceYear = new Date(invoice.dueDate).getFullYear();
      if (invoiceYear !== selectedYear) return;

      const invoiceDueMonth = new Date(invoice.dueDate).getMonth();
      const invoicePaidMonth = new Date(invoice.invoiceDate).getMonth();

      // Aggregate counts based on invoice status
      switch (invoice.status.type) {
        case InvoiceStatusEnum.PENDING:
          dueDates[invoiceDueMonth] += 1;
          break;
        case InvoiceStatusEnum.PAST_DUE:
          pastDue[invoiceDueMonth] += 1;
          break;
        case InvoiceStatusEnum.PAID:
          paid[invoicePaidMonth] += 1;
          break;
        default:
          break;
      }
    });

    return { labels, dueDates, pastDue, paid };
  };

  const getMonthLabels = () => [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
    // Reset selection when time period changes
    if (event.target.value !== "year") {
      setSelectedQuarter(1);
      setSelectedMonth(new Date().getMonth());
    }
  };

  const filteredData = () => {
    const currentData = { ...invoiceData };

    switch (timePeriod) {
      case "quarter":
        const startMonth = (selectedQuarter - 1) * 3;
        return {
          labels: currentData.labels.slice(startMonth, startMonth + 3),
          dueDates: currentData.dueDates.slice(startMonth, startMonth + 3),
          pastDue: currentData.pastDue.slice(startMonth, startMonth + 3),
          paid: currentData.paid.slice(startMonth, startMonth + 3),
        };
      case "month":
        return {
          labels: [currentData.labels[selectedMonth]],
          dueDates: [currentData.dueDates[selectedMonth]],
          pastDue: [currentData.pastDue[selectedMonth]],
          paid: [currentData.paid[selectedMonth]],
        };
      case "year":
      default:
        return currentData;
    }
  };

  const currentData = filteredData();

  const createChartData = (label, data, color) => ({
    labels: currentData.labels,
    datasets: [
      {
        label,
        data: data.map(Math.floor),
        borderColor: color,
        backgroundColor: `${color}0.2`,
        tension: 0.1,
      },
    ],
  });

  const dueChartData = createChartData(
    "Pending Invoices",
    currentData.dueDates,
    "rgba(255, 159, 64, 1)"
  );
  const pastDueChartData = createChartData(
    "Past Due Invoices",
    currentData.pastDue,
    "rgba(227, 9, 16)"
  );
  const paidChartData = createChartData(
    "Fully Paid Invoices",
    currentData.paid,
    "rgba(54, 162, 235, 1)"
  );

  const options = {
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Months" },
      },
      y: {
        title: { display: true, text: "Number of Invoices" },
        ticks: {
          beginAtZero: true,
          callback: (value) => Math.floor(value),
        },
      },
    },
  };

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(async () => {
      try {
        await fetchInvoices();
        showToast("Data synced successfully.", "success");
      } catch (error) {
        showToast("Failed to sync latest data. Please try again.", "error");
      } finally {
        setIsAnimating(false);
      }
    }, 3000);
  };

  const InvoicesChartNotes = [
    "• Pending Invoices are those yet to be paid, based on due dates.",
    "• Past Due Invoices have missed their due dates, indicating cash flow concerns.",
    "• Fully Paid Invoices are tracked by their invoice Payment dates, reflecting successful payments.",
    "• The chart provides insights into the trends of invoice statuses over time, aiding in financial forecasting and decision-making.",
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full h-full flex items-center justify-center flex-col">
      <h2 className="text-2xl font-semibold mb-4">Invoices Overview</h2>
      <div className="flex items-center mb-4 justify-center">
        <button
          onClick={handleRefresh}
          className="flex items-center p-2 border rounded hover:bg-gray-200 mr-2"
        >
          <FaSync className={`mr-2 ${isAnimating ? "spin" : ""}`} />
          Sync Latest Data
        </button>

        <select
          onChange={handleTimePeriodChange}
          value={timePeriod}
          className="p-2 border border-gray-300 rounded mr-4"
        >
          <option value="year">This Year</option>
          <option value="quarter">This Quarter</option>
          <option value="month">This Month</option>
        </select>

        {/* Dropdown for quarters */}
        {timePeriod === "quarter" && (
          <select
            onChange={(e) => setSelectedQuarter(Number(e.target.value))}
            value={selectedQuarter}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            {[1, 2, 3, 4].map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter} Quarter
              </option>
            ))}
          </select>
        )}

        {/* Dropdown for months */}
        {timePeriod === "month" && (
          <select
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            value={selectedMonth}
            className="p-2 border border-gray-300 rounded mr-4"
          >
            {invoiceData.labels.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
        )}

        {/* Dropdown for years */}
        <select
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          value={selectedYear}
          className="p-2 border border-gray-300 rounded"
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4">
        <ChartCard
          title="Pending Invoices"
          chartData={dueChartData}
          options={options}
        />
        <ChartCard
          title="Past Due Invoices"
          chartData={pastDueChartData}
          options={options}
        />
        <ChartCard
          title="Fully Paid Invoices"
          chartData={paidChartData}
          options={options}
        />
      </div>

      {/* Financial Summary Section */}
      <div className="p-4 w-full bg-gray-50 rounded-md shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Financial Summary
        </h3>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              Total Pending Invoices:
            </span>
            <span className="text-xl font-bold text-green-600">
              {invoiceData.dueDates.reduce((acc, curr) => acc + curr, 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              Total Past Due Invoices:
            </span>
            <span className="text-xl font-bold text-green-600">
              {invoiceData.pastDue.reduce((acc, curr) => acc + curr, 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">
              Total Fully Paid Invoices:
            </span>
            <span className="text-xl font-bold text-green-600">
              {invoiceData.paid.reduce((acc, curr) => acc + curr, 0)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex item-start justify-start w-full mt-4">
        <NotesComponent
          notes={InvoicesChartNotes}
          title="Invoice Status Overview and Insights"
        />
      </div>
    </div>
  );
};

const ChartCard = ({ title, chartData, options }) => (
  <div className="flex-col bg-white rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400 p-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    <Line data={chartData} options={options} />
  </div>
);

export default InvoicesChart;
