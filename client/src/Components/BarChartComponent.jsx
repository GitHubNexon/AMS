import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChartComponent = () => {
  // Hardcoded data for demonstration
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'], // Quarterly data
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 15000, 18000, 16000],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Bar color
        borderColor: 'rgb(54, 162, 235)', // Border color
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: [8000, 9000, 12000, 11000],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Different color for another dataset
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: $${tooltipItem.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Quarters',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [5, 5],
        },
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };

  return (
    <div className="w-full h-full p-4 bg-white shadow-lg rounded-lg">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChartComponent;
