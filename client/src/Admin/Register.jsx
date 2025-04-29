import React, { useState } from "react";
import "../Admin/Register.css";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container w-[400px]">
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-gray-700 text-[0.9rem]">Create Account</h1>
        <p className="text-gray-900 text-2xl font-normal mb-10">Register for an Account</p>
        <form className="form w-full" onSubmit={handleSubmit}>
          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              id="fullName"
            />
            <label htmlFor="fullName">Full Name</label>
          </div>

          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="username"
            />
            <label htmlFor="username">Username</label>
          </div>

          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              id="phone"
            />
            <label htmlFor="phone">Phone Number</label>
          </div>

          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />
            <button
              type="button"
              className="passicon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <AiFillEyeInvisible className="text-gray-500" />
              ) : (
                <AiFillEye className="text-gray-500" />
              )}
            </button>
            <label htmlFor="password">Password</label>
          </div>

          <div className="input-field relative">
            <input
              required
              autoComplete="off"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
            />
            <button
              type="button"
              className="passicon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <AiFillEyeInvisible className="text-gray-500" />
              ) : (
                <AiFillEye className="text-gray-500" />
              )}
            </button>
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>

          <div className="relative">
            <label className="block text-gray-700">Gender</label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Female
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="preferNotToSay"
                  checked={gender === "preferNotToSay"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Prefer not to say
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-black text-white text-[0.8rem] p-2 rounded-lg mb-4"
          >
            Register
          </button>
          <div className="flex items-center justify-center space-x-6">
            <h1 className="text-gray-800">Already have an account?</h1>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
