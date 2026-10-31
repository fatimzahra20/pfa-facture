// src/components/Layout/Sidebar.js
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  People,
  Receipt,
  CheckCircle,
  ExpandLess,
  ExpandMore,
  Logout,
  Person,
  BarChart,
  Menu as MenuIcon,
  ManageAccounts,
  FolderOpen,
  NotificationsOutlined,
  Paid,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DRAWER_WIDTH = 260;

const NavItem = ({ icon, label, path, onClick, nested }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <ListItem disablePadding sx={{ pl: nested ? 2 : 0 }}>
      <ListItemButton
        onClick={onClick || (() => navigate(path))}
        sx={{
          mx: 1,
          borderRadius: 1,
          mb: 0.25,
          bgcolor: active ? "primary.main" : "transparent",
          color: "white",
          "&:hover": {
            bgcolor: active ? "primary.dark" : "rgba(255,255,255,0.08)",
          },
        }}
      >
        <ListItemIcon
          sx={{ color: "white", minWidth: 36 }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: active ? 600 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { userRole, logout, isAdmin, isUser } = useAuth();
  const [adminOpen, setAdminOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [comptableOpen, setComptableOpen] = useState(true);
  const [tresOpen, setTresOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#022c22",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="/mafacture_logo_blanc_transparent.png"
          alt="MaFacture"
          sx={{
            width: "100%",
            maxWidth: 155,
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Navigation */}
      <Box flex={1} overflow="auto" py={1}>
        <List dense>
          {/* Section USER */}
          {isUser && (
            <>
              <ListItem>
                <ListItemButton
                  onClick={() => setUserOpen(!userOpen)}
                  sx={{ py: 0.5, px: 1 }}
                >
                  <ListItemText
                    primary="ESPACE COMPTABLE"
                    primaryTypographyProps={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: 1,
                    }}
                  />
                  {userOpen ? (
                    <ExpandLess sx={{ color: "white", fontSize: 16 }} />
                  ) : (
                    <ExpandMore sx={{ color: "white", fontSize: 16 }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={userOpen}>
                <NavItem
                  icon={<People fontSize="small" />}
                  label="Clients"
                  path="/clients"
                />
                <NavItem
                  icon={<FolderOpen fontSize="small" />}
                  label="Projet"
                  path="/projets"
                />
                <NavItem
                  icon={<Receipt fontSize="small" />}
                  label="Creer une Facture"
                  path="/factures/creer"
                />
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Mes Factures"
                  path="/factures"
                />
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Impots"
                  path="/impots"
                />
                <NavItem
                  icon={<NotificationsOutlined fontSize="small" />}
                  label="Messages"
                  path="/messages"
                />
                <NavItem
                  icon={<Person fontSize="small" />}
                  label="Profil"
                  path="/profil"
                />
              </Collapse>
            </>
          )}

          {/* Section COMPTABLE */}
          {userRole === "comptable" && (
            <>
              <ListItem>
                <ListItemButton
                  onClick={() => setComptableOpen(!comptableOpen)}
                  sx={{ py: 0.5, px: 1 }}
                >
                  <ListItemText
                    primary="ESPACE COMPTABLE"
                    primaryTypographyProps={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: 1,
                    }}
                  />
                  {comptableOpen ? (
                    <ExpandLess sx={{ color: "white", fontSize: 16 }} />
                  ) : (
                    <ExpandMore sx={{ color: "white", fontSize: 16 }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={comptableOpen}>
                <NavItem
                  icon={<People fontSize="small" />}
                  label="Clients"
                  path="/clients"
                />
                <NavItem
                  icon={<FolderOpen fontSize="small" />}
                  label="Projet"
                  path="/projets"
                />
                <NavItem
                  icon={<Receipt fontSize="small" />}
                  label="Creer une Facture"
                  path="/factures/creer"
                />
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Mes Factures"
                  path="/factures"
                />
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Impots"
                  path="/impots"
                />
                <NavItem
                  icon={<NotificationsOutlined fontSize="small" />}
                  label="Messages"
                  path="/messages"
                />
                <NavItem
                  icon={<Person fontSize="small" />}
                  label="Profil"
                  path="/profil"
                />
              </Collapse>
            </>
          )}

          {/* Section TRESORIER */}
          {userRole === "tresorier" && (
            <>
              <ListItem>
                <ListItemButton
                  onClick={() => setTresOpen(!tresOpen)}
                  sx={{ py: 0.5, px: 1 }}
                >
                  <ListItemText
                    primary="ESPACE TRÉSORIER"
                    primaryTypographyProps={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: 1,
                    }}
                  />
                  {tresOpen ? (
                    <ExpandLess sx={{ color: "white", fontSize: 16 }} />
                  ) : (
                    <ExpandMore sx={{ color: "white", fontSize: 16 }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={tresOpen}>
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Gestion des impôts"
                  path="/impots"
                />
                <NavItem
                  icon={<Paid fontSize="small" />}
                  label="Encaissements"
                  path="/encaissements"
                />
                <NavItem
                  icon={<Paid fontSize="small" />}
                  label="Decaissements"
                  path="/decaissements"
                />
                <NavItem
                  icon={<NotificationsOutlined fontSize="small" />}
                  label="Messages"
                  path="/messages"
                />
                <NavItem
                  icon={<Person fontSize="small" />}
                  label="Profil"
                  path="/profil"
                />
              </Collapse>
            </>
          )}

          {/* Section ADMIN */}
          {isAdmin && (
            <>
              <ListItem sx={{ mt: 1 }}>
                <ListItemButton
                  onClick={() => setAdminOpen(!adminOpen)}
                  sx={{ py: 0.5, px: 1 }}
                >
                  <ListItemText
                    primary="ESPACE ADMIN"
                    primaryTypographyProps={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: 1,
                    }}
                  />
                  {adminOpen ? (
                    <ExpandLess sx={{ color: "white", fontSize: 16 }} />
                  ) : (
                    <ExpandMore sx={{ color: "white", fontSize: 16 }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={adminOpen}>
                <NavItem
                  icon={<Dashboard fontSize="small" />}
                  label="Dashboard"
                  path="/admin/dashboard"
                />
                <NavItem
                  icon={<People fontSize="small" />}
                  label="Clients"
                  path="/admin/clients"
                />
                <NavItem
                  icon={<FolderOpen fontSize="small" />}
                  label="Projets"
                  path="/admin/projets"
                />
                <NavItem
                  icon={<BarChart fontSize="small" />}
                  label="Impôts"
                  path="/admin/impots"
                />
                <NavItem
                  icon={<ManageAccounts fontSize="small" />}
                  label="Utilisateurs"
                  path="/admin/comptables"
                />
                <NavItem
                  icon={<CheckCircle fontSize="small" />}
                  label="Validation Factures"
                  path="/admin/validation"
                />
                <NavItem
                  icon={<NotificationsOutlined fontSize="small" />}
                  label="Messages"
                  path="/admin/notifications"
                />
                <NavItem
                  icon={<Person fontSize="small" />}
                  label="Mon profil"
                  path="/admin/profil"
                />
              </Collapse>
            </>
          )}
        </List>
      </Box>

      {/* Déconnexion */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <List dense sx={{ py: 1 }}>
        <NavItem
          icon={<Logout fontSize="small" />}
          label="Se déconnecter"
          onClick={handleLogout}
        />
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
          display: { xs: "none", sm: "block" },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          display: { xs: "block", sm: "none" },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;




