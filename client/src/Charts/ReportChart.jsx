import React, { useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const ReportChart = () => {
  const reportData = {
    months: [
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
    ],
    expensesReports: [5, 7, 9, 4, 8, 6, 10, 12, 8, 11, 13, 15], 
    incomeReports: [3, 5, 6, 4, 7, 9, 8, 10, 9, 12, 11, 14], 
  };

  const currentYear = new Date().getFullYear();
  const [timePeriod, setTimePeriod] = useState("year"); 
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  
  const filteredData = () => {
    switch (timePeriod) {
      case "quarter":
        return {
          months: reportData.months.slice(0, 3), 
          expensesReports: reportData.expensesReports.slice(0, 3),
          incomeReports: reportData.incomeReports.slice(0, 3),
        };
      case "month":
        return {
          months: reportData.months.slice(selectedMonth, selectedMonth + 1),
          expensesReports: reportData.expensesReports.slice(
            selectedMonth,
            selectedMonth + 1
          ),
          incomeReports: reportData.incomeReports.slice(
            selectedMonth,
            selectedMonth + 1
          ),
        };
      case "year":
      default:
        return reportData; 
    }
  };

  const currentData = filteredData();

  const chartData = {
    labels: currentData.months,
    datasets: [
      {
        type: "bar",
        label: "Expenses Reports",
        data: currentData.expensesReports,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        type: "bar",
        label: "Income Reports",
        data: currentData.incomeReports,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
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
            `${context.dataset.label}: ${context.raw} reports`,
        },
        bodyFont: {
          size: 15,
        },
        titleFont: {
          size: 16,
        },
        padding: 15,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Reports",
        },
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full h-full p-4 flex items-center justify-center flex-col">
      <h2 className="text-2xl pb-5">Monthly Reports Overview</h2>
      <h2 className="text-2xl font-semibold mb-4">---Dummy Data---</h2>
      <div className="flex items-center mb-4 justify-center">
        <select
          onChange={handleTimePeriodChange}
          value={timePeriod}
          className="mr-4 p-2 mb-2 border border-gray-300 rounded"
        >
          <option value="year">This Year</option>
          <option value="quarter">This Quarter</option>
          <option value="month">This Month</option>
        </select>

        {/* Quarter dropdown */}
        {timePeriod === "quarter" && (
          <select
            onChange={(e) => setSelectedQuarter(Number(e.target.value))}
            value={selectedQuarter}
            className="mr-4 p-2 mb-2 border border-gray-300 rounded"
          >
            {[1, 2, 3, 4].map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter} Quarter
              </option>
            ))}
          </select>
        )}

        {/* Month dropdown */}
        {timePeriod === "month" && (
          <select
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            value={selectedMonth}
            className="mr-4 p-2 mb-2 border border-gray-300 rounded"
          >
            {reportData.months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        )}

        {/* Year dropdown */}
        <select
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          value={selectedYear}
          className="mr-4 p-2 mb-2 border border-gray-300 rounded"
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

      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ReportChart;
