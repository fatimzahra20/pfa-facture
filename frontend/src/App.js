// src/App.js
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Box,
} from "@mui/material";
import theme from "./theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Clients from "./pages/user/Clients";
import ClientDetails from "./pages/user/ClientDetails";
import InvoiceList from "./pages/user/InvoiceList";
import CreateInvoice from "./pages/user/CreateInvoice";
import Dashboard from "./pages/admin/Dashboard";
import Projets from "./pages/admin/Projets";
import ProjectDetails from "./pages/admin/ProjectDetails";
import Validation from "./pages/admin/Validation";
import Comptables from "./pages/admin/Comptables";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import ImpotsAdmin from "./pages/admin/ImpotsAdmin";
import NotificationsAdmin from "./pages/admin/NotificationsAdmin";
import ImpotsComptable from "./pages/comptable/ImpotsComptable";
import ImpotsTresorier from "./pages/tresorier/ImpotsTresorier";
import Tresorerie from "./pages/tresorier/Tresorerie";

const ImpotsRoute = () => {
  const { userRole } = useAuth();
  return userRole === "tresorier" ? <ImpotsTresorier /> : <ImpotsComptable />;
};

const RootRedirect = () => {
  const { userRole, loading } = useAuth();
  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (userRole === "comptable") return <Navigate to="/factures" replace />;
  if (userRole === "tresorier") return <Navigate to="/tresorerie" replace />;
  if (userRole === "user") return <Navigate to="/factures" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <Routes>
                {/* Route publique */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Routes protégées (USER + ADMIN) */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<RootRedirect />} />

                  {/* Routes USER et COMPTABLE */}
                  <Route
                    element={
                      <ProtectedRoute requiredRole={["user", "comptable"]}>
                        <Outlet />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="clients" element={<Clients />} />
                    <Route path="clients/:id" element={<ClientDetails />} />
                    <Route path="projets" element={<Projets />} />
                    <Route path="projets/:id" element={<ProjectDetails />} />
                    <Route path="factures" element={<InvoiceList />} />
                    <Route path="factures/creer" element={<CreateInvoice />} />
                    <Route
                      path="factures/modifier/:id"
                      element={<CreateInvoice />}
                    />
                  </Route>

                  <Route
                    path="messages"
                    element={
                      <ProtectedRoute requiredRole={["user", "comptable", "tresorier"]}>
                        <NotificationsAdmin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profil"
                    element={
                      <ProtectedRoute requiredRole={["user", "comptable", "tresorier"]}>
                        <ProfileAdmin />
                      </ProtectedRoute>
                    }
                  />

                  {/* Routes USER, COMPTABLE et TRESORIER */}
                  <Route
                    path="impots"
                    element={
                      <ProtectedRoute requiredRole={["user", "comptable", "tresorier"]}>
                        <ImpotsRoute />
                      </ProtectedRoute>
                    }
                  />

                  {/* Routes TRESORIER */}
                  <Route
                    path="tresorerie"
                    element={
                      <ProtectedRoute requiredRole="tresorier">
                        <Tresorerie />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="encaissements"
                    element={
                      <ProtectedRoute requiredRole="tresorier">
                        <Tresorerie initialTab={0} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="decaissements"
                    element={
                      <ProtectedRoute requiredRole="tresorier">
                        <Tresorerie initialTab={1} />
                      </ProtectedRoute>
                    }
                  />

                  {/* Routes ADMIN uniquement */}
                  <Route
                    path="admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/profil"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ProfileAdmin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/clients"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Clients />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/clients/:id"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ClientDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/projets"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Projets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/projets/:id"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ProjectDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/validation"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Validation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/notifications"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <NotificationsAdmin />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/comptables"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Comptables />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/impots"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <ImpotsAdmin />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
