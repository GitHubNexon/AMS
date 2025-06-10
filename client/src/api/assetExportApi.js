import axios from "axios";
import { API_BASE_URL } from "./config";

axios.defaults.withCredentials = true;

const assetExportApi = {
  exportAssetHistory: async (inventoryHistory) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/asset-export/history/`,
        { inventoryHistory },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Assets_History.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  },
};

export default assetExportApi;
