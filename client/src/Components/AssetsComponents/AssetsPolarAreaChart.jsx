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

const AssetsPolarAreaChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        const data = await assetReportApi.getInventoryStatus();
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Inventory",
              data: data.data,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)", // Red-ish
                "rgba(54, 162, 235, 0.6)", // Blue-ish
                "rgba(255, 206, 86, 0.6)", // Yellow-ish
                // add more colors if you have more statuses
              ],
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
