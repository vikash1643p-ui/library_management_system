
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);
const AUTH_URL = "http://localhost:3002/api/auth";

function readStoredUser() {
  try {
    const token = localStorage.getItem("libraryToken");
    const user = localStorage.getItem("libraryUser");

    if (!token || !user) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("libraryToken");
      localStorage.removeItem("libraryUser");
      return null;
    }

    return JSON.parse(user);
  } catch {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(
    () => localStorage.getItem("libraryToken")
  );

  async function login(idOrEmail, password) {
    try {
      const loginData = {
        idOrEmail: String(idOrEmail || "").trim(),
        password: String(password || "")
      };

      console.log("Login ID:", loginData.idOrEmail);
      console.log("Password received:", Boolean(loginData.password));

      const response = await axios.post(
        `${AUTH_URL}/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const { accessToken, user: loggedInUser } = response.data;

      if (!accessToken || !loggedInUser) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("libraryToken", accessToken);
      localStorage.setItem(
        "libraryUser",
        JSON.stringify(loggedInUser)
      );

      setToken(accessToken);
      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");

    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    function handleExpired() {
      localStorage.removeItem("libraryToken");
      localStorage.removeItem("libraryUser");

      setToken(null);
      setUser(null);
    }

    window.addEventListener(
      "library-auth-expired",
      handleExpired
    );

    return () => {
      window.removeEventListener(
        "library-auth-expired",
        handleExpired
      );
    };
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/account/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
