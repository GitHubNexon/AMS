// src/Pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import NDC_BG from "../assets/images/NDC_BG.png"; // Ensure the image path is correct

const NotFound = () => {
  return (
    <div className="relative flex items-center justify-center flex-col min-h-screen text-center p-4">
      <img
        src={NDC_BG}
        alt="Background"
        className="absolute inset-0 w-full h-full object-contain opacity-20" // Adjust image styling as needed
      />
      <div className="relative z-10"> {/* Ensure content is on top of the image */}
        <span className="text-4xl">ERROR!!!</span>
        <h1 className="text-[100px]">404 - Page Not Found</h1>
        <p className="text-lg">The page you are looking for does not exist.</p>
        
        <Link to="/">
          <p className="text-lg text-blue-500 underline mt-40">Try the homepage</p>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
