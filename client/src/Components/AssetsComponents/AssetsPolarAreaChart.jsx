import React, { useEffect, useState } from "react";
import { PolarArea } from "react-chartjs-2";
import assetReportApi from "../../api/assetReportApi";

// Import Chart.js components needed for PolarArea chart
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const statusColors = {
  Available: "rgba(0, 128, 0, 0.6)", // Green
  Dispose: "rgba(255, 0, 0, 0.6)", // Red
  "Under-Repair": "rgba(255, 255, 0, 0.6)", // Yellow
  "Lost/Stolen": "rgba(128, 128, 128, 0.6)", // Gray
  Issued: "rgba(255, 165, 0, 0.6)", // Orange
};

const AssetsPolarAreaChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        const data = await assetReportApi.getInventoryStatus();

        const backgroundColors = data.labels.map(
          (label) => statusColors[label] || "rgba(0, 0, 0, 0.3)"
        );

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Inventory",
              data: data.data,
              backgroundColor: backgroundColors,
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch inventory status");
        setLoading(false);
      }
    };

    fetchInventoryStatus();
  }, []);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <PolarArea data={chartData} />
    </div>
  );
};

export default AssetsPolarAreaChart;
