import axios from "axios";
import { API_BASE_URL } from "./config";

const reportsApi = {
    invoiceStatusOverview: async ()=>{
        const response = await axios.get(`${API_BASE_URL}/reports/invoice/status/simple`, { withCredentials: true });
        return response.data.data;
    }
};

export default reportsApi;