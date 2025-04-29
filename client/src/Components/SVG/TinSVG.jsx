import React from "react";

const TinSVG = ({ tin, width = 250, height = 50 }) => {
  // If no TIN is provided, set an array of empty strings to maintain the structure
  const formattedTin = tin
    ? tin.replace(/-/g, "").split("")
    : ["", "", "", "", "", "", "", "", "", ""];

  const totalDigits = formattedTin.length; // 9-12 digits
  const groups = [3, 3, 3, totalDigits - 9]; // Dynamic last group
  const mainSeparators = [3, 6, 9]; // Positions of `-` separators

  const boxWidth = width / totalDigits; // Dynamic width per digit

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

      {/* Main Separators (-) */}
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
      {formattedTin.map((_, index) => (
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

      {/* TIN Digits (or placeholders) */}
      {formattedTin.map((digit, index) => (
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
          {digit || " "} {/* If no TIN, render a space */}
        </text>
      ))}
    </svg>
  );
};

export default TinSVG;
