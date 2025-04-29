import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { useSplash } from "../context/SplashContext";
import { showToast } from "../utils/toastNotifications"; // Import the toast utility

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { setShowSplash } = useSplash();

  useEffect(() => {
    setShowSplash(false);
  }, [setShowSplash]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      console.log(error.status);

      // Check if the error response indicates a locked account
      if (error.status === 403) {
        showToast("Account is locked. Try again later.", "warning");
      } else {
        showToast(
          "Login failed. Please check your credentials and try again.",
          "error"
        );
      }
    }
  };

  return (
    <div className="container w-[400px]">
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-gray-700 text-[0.9rem]">Welcome Back</h1>
        <p className="text-gray-900 text-2xl font-normal mb-10">
          Log In to your Account
        </p>
        <form className="form w-full" onSubmit={handleSubmit}>
          <div className="input-field relative">
            <div className="input-field">
              <input
                required
                autoComplete="off"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
              />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="input-field relative">
            <div className="input-field">
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
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2 w-4 h-4"
              />
              <label htmlFor="rememberMe" className="text-gray-700">
                Remember Me
              </label>
            </div>
            <Link
              to="#"
              className="text-blue-500 hover:underline text-[0.9rem]"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-black text-white text-[0.8rem] p-2 rounded-lg mb-4"
          >
            Continue
          </button>
          <div className="flex items-center justify-center space-x-6"></div>
        </form>
      </div>
    </div>
  );
};

export default Login;
