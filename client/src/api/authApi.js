// src/api/authApi.js
import axios from 'axios';
import {API_BASE_URL} from './config.js';

axios.defaults.baseURL = API_BASE_URL;

export function cookieExists(name){
    return document.cookie.split(';').some((cookie)=>{
        return cookie.trim().startsWith(name + '=');
    });
}

async function checkCookies() {
    try {
        // Send a simple request to check for cookies
        const response = await axios.post(`${API_BASE_URL}/auth/check`, { withCredentials: true });
        return response.status === 200;
    } catch (error) {
        console.error('Failed to check cookies:', error.response ? error.response.data : error.message);
        return false;
    }
}

export async function fetchUser() {
    try {
        const cookiesExist = await checkCookies();
        
        if (!cookiesExist) {
            console.log('No cookies found. Skipping fetchUser request.');
            return null;
        }

        const response = await axios.post('/auth/check', {}, {
            withCredentials: true, // Ensure cookies are sent
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user info:', error.response ? error.response.data : error.message);
        return response.data;
    }
}

export async function auth(email, password) {
    try {
        const response = await axios.post('/auth', { email, password }, {
            withCredentials: true // Ensure cookies are sent
        });
        const { token, ...userData } = response.data;
        return { token, userData };
    } catch (error) {
        // Log error details
        console.error('Login failed:', error.response ? error.response.data : error.message);
        
        // Throw the error for further handling in the calling code
        if (error.response) {
            throw error.response;  // Contains status, data, etc.
        } else {
            throw error;  // For other unexpected errors
        }
    }
}

export async function logoff(){
    try{
        const response = await axios.post('/auth/logout', {}, { withCredentials: true });
        return response;
    }catch(error){
        console.error('Logout failed:', error.response ? error.response.data : error.message);
    }
}