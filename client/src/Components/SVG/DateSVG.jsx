import React from "react";
import moment from "moment";

const DateSVG = ({ date, width = 200, height = 50 }) => {
  // If there's no valid date, return an empty string (or use placeholders like " " for blank spaces)
  const formattedDate = date
    ? moment(date).format("MM/DD/YYYY").replace(/\//g, "").split("")
    : ["", "", "", "", "", "", "", ""];

  const totalDigits = formattedDate.length; // 8 digits (MMDDYYYY)
  const boxWidth = width / totalDigits; // Dynamic width per digit

  const mainSeparators = [2, 4]; // MM | DD | YYYY separators at index 2 and 4

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Border */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        stroke="black"
        fill="white"
        strokeWidth="1.5"
      />

      {/* Main Separators (MM | DD | YYYY) */}
      {mainSeparators.map((index) => (
        <line
          key={`main-${index}`}
          x1={index * boxWidth}
          y1="0"
          x2={index * boxWidth}
          y2={height}
          stroke="black"
          strokeWidth="1.5"
        />
      ))}

      {/* Small Vertical Dividers for Each Number */}
      {formattedDate.map((_, index) => (
        <line
          key={`small-${index}`}
          x1={(index + 1) * boxWidth}
          y1="25"
          x2={(index + 1) * boxWidth}
          y2={height}
          stroke="black"
          strokeWidth="1"
        />
      ))}

      {/* Date Digits (or placeholders) */}
      {formattedDate.map((digit, index) => (
        <text
          key={`digit-${index}`}
          x={index * boxWidth + boxWidth / 2} // Center horizontally
          y={height / 2 + 5} // Center vertically (adjusting a bit for alignment)
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle" // Ensures text is centered horizontally at the x position
          alignmentBaseline="middle" // Ensures text is centered vertically at the y position
          visibility={digit ? "visible" : "hidden"} // Hide digits if they're empty
        >
          {digit || " "} {/* If no date, render a space */}
        </text>
      ))}
    </svg>
  );
};

export default DateSVG;
