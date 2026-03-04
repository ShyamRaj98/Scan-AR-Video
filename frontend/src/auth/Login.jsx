// frontend/src/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitHandle = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return setError("All fields are required");
    }

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      // Navigation happens in the login function (to /admin)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-8">Login to your account</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={submitHandle} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm cursor-pointer text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register" // This stays the same
            className="text-black font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;