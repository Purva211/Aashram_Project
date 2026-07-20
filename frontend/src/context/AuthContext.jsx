import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";


export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || localStorage.getItem("documentAdminToken") || sessionStorage.getItem("documentAdminToken");
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (error) {
          console.error("Token verification failed:", error);
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          sessionStorage.removeItem("documentAdminToken");
          localStorage.removeItem("documentAdminToken");
          delete api.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    sessionStorage.setItem("token", token);
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("documentAdminToken");
    localStorage.removeItem("documentAdminBranch");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};