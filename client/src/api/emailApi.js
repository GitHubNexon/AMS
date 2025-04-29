import axios from "axios";
import { API_BASE_URL } from "./config.js";

axios.defaults.withCredentials = true;

// Function to send email
export const sendEmail = async (emailData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/emails/send-email`,
      emailData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Function to fetch email configuration
export const fetchEmailConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/emails/email-config`);
    return response.data; // Return the configuration data
  } catch (error) {
    console.error("Error fetching email configuration:", error);
    throw error; // Re-throw the error to handle it in the component
  }
};
