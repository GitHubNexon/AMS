// profileApi.js
import axios from "axios";
import { API_BASE_URL } from "./config.js";
axios.defaults.withCredentials = true;

// Function to get user profile
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// Function to update user profile
// profileApi.js
export const updateProfile = async (userId, profileData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/user/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };
  
