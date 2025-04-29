import React, { useState, useEffect } from "react";
import moment from "moment";

const DatePicker = ({ onDateRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState("This Year");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");

  const years = Array.from({ length: 20 }, (_, index) => 2025 - index);
  const quarters = ["1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateSelect = (range) => {
    setSelectedRange(range);
    if (range === "This Year") {
      setSelectedMonth(null);
      setSelectedQuarter(null);
    } else if (range === "This Quarter") {
      setSelectedMonth(null);
    } else if (range === "This Month") {
      setSelectedQuarter(null);
    }
  };

  const getDateRange = () => {
    if (selectedRange === "This Year") {
      const startDate = moment().year(selectedYear).startOf("year");
      const endDate = moment().year(selectedYear).endOf("year");

      return {
        StartDate: startDate.format("YYYY-MM-DD"),
        EndDate: endDate.format("YYYY-MM-DD"),
      };
    } else if (selectedRange === "This Quarter" && selectedQuarter !== null) {
      const quarterStartMonth = (selectedQuarter - 1) * 3;
      const quarterStartDate = moment()
        .year(selectedYear)
        .month(quarterStartMonth)
        .startOf("month");
      const quarterEndDate = moment()
        .year(selectedYear)
        .month(quarterStartMonth + 2)
        .endOf("month");

      return {
        StartDate: quarterStartDate.format("YYYY-MM-DD"),
        EndDate: quarterEndDate.format("YYYY-MM-DD"),
      };
    } else if (selectedRange === "This Month" && selectedMonth !== null) {
      const monthStartDate = moment()
        .year(selectedYear)
        .month(selectedMonth)
        .startOf("month");
      const monthEndDate = moment()
        .year(selectedYear)
        .month(selectedMonth)
        .endOf("month");

      return {
        StartDate: monthStartDate.format("YYYY-MM-DD"),
        EndDate: monthEndDate.format("YYYY-MM-DD"),
      };
    }

    return { StartDate: null, EndDate: null };
  };

  const { StartDate, EndDate } = getDateRange();

  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(StartDate, EndDate);
    }
  }, [StartDate, EndDate, onDateRangeChange]);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  const handleQuarterChange = (e) => {
    setSelectedQuarter(Number(e.target.value));
  };

  return (
    <div className="flex items-center space-x-5">
      <>
        <div>
          <label className="mb-1 font-medium">Select Range:</label>
          <select
            className="block p-2 mt-2 border border-gray-300 rounded"
            value={selectedRange}
            onChange={(e) => handleDateSelect(e.target.value)}
          >
            <option value="">-- Select a Range --</option>
            <option value="This Year">This Year</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Month">This Month</option>
          </select>
        </div>

        <div className="flex space-x-4 items-center">
          {selectedRange === "This Quarter" && (
            <div>
          <label className="mb-1 font-medium">Select a Quarter:</label>
              <select
                className="block p-2 mt-2 border border-gray-300 rounded"
                value={selectedQuarter}
                onChange={handleQuarterChange}
              >
                {quarters.map((quarter, index) => (
                  <option key={index} value={index + 1}>
                    {quarter}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedRange === "This Month" && (
            <div>
              <label className="mb-1 font-medium">Select Month:</label>
              <select
                className="block p-2 mt-2 border border-gray-300 rounded"
                value={selectedMonth}
                onChange={handleMonthChange}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedRange && (
            <div>
              <label className="mb-1 font-medium break-words">
                Select Year:
              </label>
              <select
                className="block p-2 mt-2 border border-gray-300 rounded"
                value={selectedYear}
                onChange={handleYearChange}
              >
                <option value="">-- Select a Year --</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default DatePicker;
