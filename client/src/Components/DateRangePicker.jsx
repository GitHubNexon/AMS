import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function DateRangePicker({ onChange }) {
    const [range, setRange] = useState(null); // Initially null
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);
    const containerRef = useRef(null);

    const handleSelect = (ranges) => {
        setRange([ranges.selection]);
        onChange && onChange(ranges.selection);
    };

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Ensure the date picker is fully visible when opened
    useEffect(() => {
        if (open && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [open]);

    return (
        <div className="relative" ref={pickerRef}>
            {/* Input Field */}
            <button
                onClick={() => setOpen(!open)}
                className="border p-2 rounded-lg w-[200px] bg-white shadow-md text-left"
            >
                📅 {range
                    ? `${format(range[0].startDate, "MMM dd, yyyy")} - ${format(range[0].endDate, "MMM dd, yyyy")}`
                    : "Select Date"}
            </button>

            {/* Date Picker */}
            {open && (
                <div ref={containerRef} className="absolute z-50 mt-2 bg-white shadow-lg rounded-lg">
                    <DateRange
                        editableDateInputs={true}
                        onChange={handleSelect}
                        moveRangeOnFirstSelection={false}
                        ranges={range || [{ startDate: new Date(), endDate: new Date(), key: "selection" }]} // Only shows default when opened
                    />
                </div>
            )}
        </div>
    );
}

export default DateRangePicker;
