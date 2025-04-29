import axios from 'axios';
import React, { useEffect, useState } from 'react';

const YearDropdown = ({ date, setDate }) => {

    const [years, setYears] = useState([]);

    useEffect(() => {
        getEntryYears();
    }, []);

    // Fetch the available years from the API
    async function getEntryYears() {
        try {
            const response = await axios.get('/reports/entries/years', { withCredentials: true });
            if (response.data.length > 0) {
                setYears(response.data);
            }
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    }

    // If date is empty, default to the current year
    const currentDate = date ? new Date(date) : '';

    // Format the date to "YYYY-MM-DD"
    const formatDate = (year) => {
        const date = new Date(Date.UTC(year, 11, 31)); // December 31st in UTC
        return date.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    };

    // Handle year change and set the date to December 31st of the selected year
    const handleYearChange = (e) => {
        const selectedYear = e.target.value;
        const formattedDate = formatDate(selectedYear);
        setDate(formattedDate); // Set date in "YYYY-MM-DD" format
    };

    return (
        <select 
            id="year" 
            className='mr-2 border px-2 py-1 rounded' 
            value={currentDate ? currentDate.getFullYear() : ''} 
            onChange={handleYearChange}
        >
            <option value="">Select a year</option>
            {years.reverse().map((year) => ( // Reverse here if you need the latest year first
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </select>
    );
};

export default YearDropdown;
