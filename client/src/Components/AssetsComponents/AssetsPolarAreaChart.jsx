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
  "New-Available": "rgba(0, 128, 0, 0.6)",              // Green
  "Used-Available": "rgba(34, 139, 34, 0.6)",           // Forest Green
  "Repaired-Available": "rgba(60, 179, 113, 0.6)",      // Medium Sea Green
  Dispose: "rgba(220, 20, 60, 0.6)",                    // Crimson
  "Under-Repair": "rgba(255, 215, 0, 0.6)",             // Gold
  "Lost/Stolen": "rgba(105, 105, 105, 0.6)",            // Dim Gray
  Issued: "rgba(255, 140, 0, 0.6)",                     // Dark Orange

  // Reserved statuses
  "Reserved for Issuance": "rgba(70, 130, 180, 0.6)",   // Steel Blue
  "Reserved for Disposal": "rgba(178, 34, 34, 0.6)",    // Firebrick
  "Reserved for Return": "rgba(138, 43, 226, 0.6)",     // Blue Violet
  "Reserved for Repair": "rgba(218, 165, 32, 0.6)",     // Goldenrod
  "Reserved for Re-Assign Repaired Assets": "rgba(46, 139, 87, 0.6)", // Sea Green
  "Reserved for Lost/Stolen": "rgba(169, 169, 169, 0.6)", // Dark Gray
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
