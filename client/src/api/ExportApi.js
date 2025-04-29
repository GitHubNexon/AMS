import axios from "axios";
import { API_BASE_URL } from "./config";

axios.defaults.withCredentials = true;

const ExportApi = {
  exportAlphaListTaxReport: async (Grandtotal, individualAlphaListEntries) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/alphalisttaxreport/excel`,
        { Grandtotal, individualAlphaListEntries },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "alphalisttaxreport.xlsx"; // Name of the file to download
      link.click();
    } catch (error) {
      console.error("Error exporting AlphaListTaxReport:", error);
    }
  },

  exportAlphaListOutputTaxReport: async (Grandtotal, individualAlphaListEntries) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/alphalisttaxreport/OutputTax/excel`,
        { Grandtotal, individualAlphaListEntries },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "alphalistOutputTax.xlsx"; // Name of the file to download
      link.click();
    } catch (error) {
      console.error("Error exporting AlphaListTaxReport:", error);
    }
  },

  // Method for exporting EWT Report
  exportEWTReport: async (
    reports,
    totalIncomePayment,
    totalTaxRate,
    totalTaxTotal
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportEWTReport/excel`,
        { reports, totalIncomePayment, totalTaxRate, totalTaxTotal },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "EWT_Report.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting EWT Report:", error);
    }
  },

  exportFVATReport: async (
    reports,
    totalIncomePayment,
    totalTaxRate,
    totalTaxTotal
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportFVATReport/excel`,
        { reports, totalIncomePayment, totalTaxRate, totalTaxTotal },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "FVAT_Report.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting FVAT Report:", error);
    }
  },

  exportWPTReport: async (
    reports,
    totalIncomePayment,
    totalTaxRate,
    totalTaxTotal
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportWPTReport/excel`,
        { reports, totalIncomePayment, totalTaxRate, totalTaxTotal },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "WPT_Report.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting WPT Report:", error);
    }
  },

  exportWTCReport: async (
    reports,
    totalIncomePayment,
    totalTaxRate,
    totalTaxTotal
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportWTCReport/excel`,
        { reports, totalIncomePayment, totalTaxRate, totalTaxTotal },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "WTC_Report.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting WTC Report:", error);
    }
  },

  exportDepreciation: async (summary, totals) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportDepreciation/excel`,
        { summary, totals },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Depreciation_Schedule.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting Depreciation Report:", error);
    }
  },

  exportTransactionList: async (bankRecon) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/export/exportTransactionList/excel`,
        { bankRecon },
        { responseType: "arraybuffer" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "TransactionListBankRecon.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting TransactionListBankRecon Report:", error);
    }
  },
};

export default ExportApi;
