import { createContext, useContext, useState, useCallback } from "react";
import axiosClient from "../services/axiosClient";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (accountName, password) => {
    const response = await axiosClient.post("/auth/login", {
      accountName,
      password,
    });

    const { accessToken, refreshToken, accountId, role } = response.data;

    const userData = { accountId, accountName, role };

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend to allow server-side cleanup if added in the future
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.warn("Logout request failed, clearing local storage anyway.");
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
