import React from "react";

const ZipCodeSVG = ({ zip, width = 120, height = 50 }) => {
  // If no zip is provided, use empty strings to maintain layout
  const formattedZip = zip ? zip.split("") : ["", "", "", ""];
  const digitWidth = width / 4; // Each digit gets equal space

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

      {/* Small Vertical Dividers */}
      {formattedZip.map(
        (_, index) =>
          index < 3 && (
            <line
              key={`divider-${index}`}
              x1={(index + 1) * digitWidth}
              y1="25"
              x2={(index + 1) * digitWidth}
              y2={height}
              stroke="black"
              strokeWidth="1"
            />
          )
      )}

      {/* ZIP Digits (or placeholders) */}
      {formattedZip.map((digit, index) => (
        <text
          key={`digit-${index}`}
          x={index * digitWidth + digitWidth / 2} // Center horizontally
          y={height / 2 + 5} // Center vertically (adjusting a bit for alignment)
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle" // Ensures text is centered horizontally at the x position
          alignmentBaseline="middle" // Ensures text is centered vertically at the y position
          visibility={digit ? "visible" : "hidden"} // Hide digits if empty
        >
          {digit || " "} {/* If no zip, render a space */}
        </text>
      ))}
    </svg>
  );
};

export default ZipCodeSVG;
