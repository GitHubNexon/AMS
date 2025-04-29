import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import LineChartComponent from "../Components/LineChartComponent";
import BarChartComponent from "../Components/BarChartComponent";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col items-center py-8 px-4">
        {/* Title */}
        <h1 className="text-green-600 font-bold text-4xl md:text-5xl lg:text-6xl mb-8">
          ANALYTICS
        </h1>
        {/* Chart Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/2 bg-white shadow-lg rounded-lg p-6">
            {/* Line Chart */}
            <LineChartComponent />
          </div>
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/2 bg-white shadow-lg rounded-lg p-6">
            {/* Bar Chart */}
            <BarChartComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
