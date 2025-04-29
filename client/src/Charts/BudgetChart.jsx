import React, { useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  LineController  // need to import this
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  LineController, // need to register this
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale
);

const BudgetChart = () => {
  const budgetData = {
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
    budget: [500, 600, 700, 800, 750, 900, 850, 950, 1000, 1100, 1050, 1200],
    actual_budget: [
      450, 620, 680, 850, 730, 950, 800, 970, 990, 1120, 1000, 1150,
    ], 
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
        const startMonth = (selectedQuarter - 1) * 3;
        return {
          months: budgetData.months.slice(startMonth, startMonth + 3),
          budget: budgetData.budget.slice(startMonth, startMonth + 3),
          actual_budget: budgetData.actual_budget.slice(startMonth, startMonth + 3),
        };
      case "month":
        return {
          months: budgetData.months.slice(selectedMonth, selectedMonth + 1),
          budget: budgetData.budget.slice(selectedMonth, selectedMonth + 1),
          actual_budget: budgetData.actual_budget.slice(selectedMonth, selectedMonth + 1),
        };
      case "year":
      default:
        return budgetData; 
    }
  };

  const currentData = filteredData();

  const chartData = {
    labels: currentData.months,
    datasets: [
      {
        type: "bar",
        label: "Budget",
        data: currentData.budget,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Actual Budget",
        data: currentData.actual_budget,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.1,
        yAxisID: "y1",
      },
    ],
  };

  // Chart options
  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ₱${context.raw}`,
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
        id: "y",
        title: {
          display: true,
          text: "Budget",
        },
        ticks: {
          beginAtZero: true,
        },
      },
      y1: {
        id: "y1",
        title: {
          display: true,
          text: "Actual Budget",
        },
        position: "right",
        ticks: {
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full h-full p-4 flex items-center justify-center flex-col">
      <h2 className="text-2xl pb-5">Yearly Budget Overview</h2>
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
            {budgetData.months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        )}

        {/* Year dropdown  */}
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

export default BudgetChart;
