import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Tooltip, Legend);

const BarChart = ({ barData, lineData, barOptions, lineOptions }) => {
  return (
    <div>
      <Bar data={barData} options={barOptions} />
      <Line data={lineData} options={lineOptions} />
    </div>
  );
};

export default BarChart;
