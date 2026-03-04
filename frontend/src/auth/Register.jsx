// frontend/src/auth/Register.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Register() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submitHandle = async (e) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password || !confirmPassword) {
      return setError("All fields are required");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      await register(name, email, password);
      // Navigation happens in the register function (to /admin)
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-gray-500 text-center mb-8">Join us today</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={submitHandle} className="space-y-5">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/admin/login" // CHANGED: from "/login" to "/admin/login"
            className="text-black font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;