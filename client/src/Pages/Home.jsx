import React from "react";
import HomeBg from "../assets/images/bg-img.png";
import Login from "../Admin/Login";
import Hero1 from "../assets/images/itrack_logo.png";
import { FaBook } from "react-icons/fa";

const Home = () => {
  return (
    <div className={`relative min-h-screen flex flex-col overflow-hidden`}>
      <div className="overflow-y-scroll max-h-[100vh] m-5">
        <img
          src={HomeBg}
          alt="Home Background"
          className="absolute top-0 left-0 w-full h-full object-cover z-11"
        />
        <div
          className="relative flex-1 flex flex-col lg:flex-row gap-4 p-4 z-10 "
          data-aos="fade-up"
        >
          {/* LEFT SIDE HERO */}
          <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 xl:p-16 flex-1 overflow-y-auto">
            <img
              src={Hero1}
              alt="Placeholder"
              className="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl h-auto mb-4 object-cover rounded-xl"
            />
            <h1 className="text-white text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 text-center">
              Building the Future...
            </h1>
            <p className="text-white text-sm md:text-base lg:text-lg xl:text-xl text-center">
              "Without continual growth and progress, such words as improvement,
              achievement, and success have no meaning."
            </p>
          </div>
          {/* RIGHT SIDE HERO */}
          <div className="flex items-center justify-center p-4 md:p-8 lg:p-12 xl:p-16 flex-1">
            <div className="flex flex-col items-center">
              <Login />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
