import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
} from "../services/authService";

const AuthContext = createContext();

const USER_STORAGE_KEY = "auth_user";
const TOKEN_STORAGE_KEY = "auth_token";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRoleState] = useState(null);
  const [userName, setUserName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        const normalizedUser = { ...user, uid: user.uid || user.id };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
        setCurrentUser(normalizedUser);
        setUserRoleState(normalizedUser.role || "user");
        setUserName(normalizedUser.nom || normalizedUser.name || "Anonyme");
        setIsActive(normalizedUser.actif !== false);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        if (storedUser) {
          setCurrentUser(null);
          setUserRoleState(null);
          setUserName("");
          setIsActive(true);
        }
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const login = async (email, password) => {
    const result = await loginRequest(email, password);
    const normalizedUser = {
      ...result.user,
      uid: result.user.uid || result.user.id,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));

    setCurrentUser(normalizedUser);
    setUserRoleState(normalizedUser.role || "user");
    setUserName(normalizedUser.nom || normalizedUser.name || "Anonyme");
    setIsActive(normalizedUser.actif !== false);

    return {
      user: normalizedUser,
      role: normalizedUser.role || "user",
      nom: normalizedUser.nom || normalizedUser.name || "Anonyme",
      actif: normalizedUser.actif !== false,
    };
  };

  const logout = async () => {
    try {
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        await logoutRequest();
      }
    } catch {
      // Ignore logout API failures and clear local session anyway.
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentUser(null);
      setUserRoleState(null);
      setUserName("");
      setIsActive(true);
      setLoading(false);
    }
  };

  const isAdmin = userRole === "admin";
  const isUser = userRole === "user";

  const value = {
    currentUser,
    userRole,
    userName,
    isActive,
    isAdmin,
    isUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
