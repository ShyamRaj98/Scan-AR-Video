import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
        }
      }
      setLoader(false);
    };

    initAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("Registration response:", response.data); // Debug log

      // Your backend returns user object with token
      if (response.data && response.data.token) {
        // Store the entire user object
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Registration failed");
      throw error; // Re-throw to handle in component
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data); // Debug log

      if (response.data && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Helper to get token for API requests
  const getToken = () => {
    return user?.token || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        loader,
        error,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
