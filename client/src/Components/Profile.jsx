import React, { useState, useEffect, useRef } from "react";
import { FaCamera } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import NDC_BG from "../assets/images/NDC_BG.png";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toastNotifications";
import { getProfile, updateProfile } from "../api/profileApi";
import { redBorderMarker } from "../helper/helper";

const Profile = () => {
  const { user, setUser } = useAuth();

  // State variables for the additional fields
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const nameRef = useRef();
  const emailRef = useRef();
  const fileInputRef = useRef();

  const maxFileSizeMB = 5;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name || "");
        setFirstName(profile.firstName || "");
        setMiddleName(profile.middleName || "");
        setLastName(profile.lastName || "");
        setGender(profile.gender || "");
        setContactNumber(profile.contactNumber || "");
        setAddress(profile.address || "");
        setEmail(profile.email || "");
        setProfileImage(profile.profileImage || "");
      } catch (error) {
        console.error("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please upload a valid image file.", "error");
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024); // Convert to MB
      if (fileSizeMB > maxFileSizeMB) {
        showToast(
          "File size exceeds 5MB. Please upload a smaller file.",
          "warning"
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result.split(",")[1];
        setProfileImage(base64Image);
        showToast("Image uploaded successfully!", "success");
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        showToast("Failed to read the file. Please try again.", "error");
      };
      reader.readAsDataURL(file);
    } else {
      showToast("No file selected. Please choose an image file.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkInput()) return;

    try {
      await updateProfile(user._id, {
        firstName,
        middleName,
        lastName,
        gender,
        contactNumber,
        address,
        email,
        password,
        profileImage,
      });
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("Failed to update profile. Please try again.", "error");
    }
  };
  function checkInput() {
    let isValid = true;
    if (!firstName) {
      redBorderMarker(nameRef.current);
      isValid = false;
    }
    if (!email) {
      if (emailRef.current) redBorderMarker(emailRef.current);
      isValid = false;
    }
    return isValid;
  }

  const navigate = useNavigate();

  const handleBackButtonClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <img
        src={NDC_BG}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full opacity-30"
      />
      <div
        className="relative max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg backdrop-filter backdrop-blur-sm border border-gray-300 m-4"
        data-aos="zoom-out"
      >
        <Link
          to="/"
          onClick={handleBackButtonClick}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft size={30} />
        </Link>
        <div className="text-center mb-6">
          <div
            className="relative inline-block w-36 h-36 rounded-full overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              id="profileImage"
              src={`data:image/jpeg;base64,${profileImage}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300">
              <FaCamera />
            </div>
          </div>
          <h2 className="text-xl font-bold mt-4">{user.name}</h2>
          <p className="text-gray-600">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 animated-border"
                name="firstName"
                placeholder="Input First Name"
                value={firstName}
                ref={nameRef}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="middleName"
                className="block text-sm font-semibold text-gray-700"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="middleName"
                placeholder="Input Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="lastName"
                placeholder="Input Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-semibold text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-semibold text-gray-700"
              >
                Contact Number
              </label>
              <input
                type="text"
                id="contactNumber"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="contactNumber"
                placeholder="Input Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="address"
                placeholder="Input Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 animated-border"
                name="email"
                placeholder="Input Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailRef}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Change Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full p-2 rounded-lg bg-gray-200 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                name="password"
                placeholder="Type here..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg border border-green-600 shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform transform hover:scale-105"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
