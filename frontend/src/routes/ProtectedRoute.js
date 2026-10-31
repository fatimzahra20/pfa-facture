// src/routes/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, isActive, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    ); 
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isActive) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      if (userRole === "admin")
        return <Navigate to="/admin/dashboard" replace />;
      if (userRole === "comptable") return <Navigate to="/factures" replace />;
      if (userRole === "tresorier") return <Navigate to="/tresorerie" replace />;
      if (userRole === "user") return <Navigate to="/factures" replace />;
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
