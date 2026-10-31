// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#064e3b",
      dark: "#053f30",
      light: "#d1fae5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
      dark: "#6d28d9",
      light: "#ede9fe",
    },
    success: { main: "#10b981", dark: "#059669", light: "#d1fae5" },
    warning: { main: "#f59e0b", dark: "#d97706", light: "#fef3c7" },
    error: { main: "#ef4444", dark: "#dc2626", light: "#fee2e2" },
    info: { main: "#0284c7", dark: "#0369a1", light: "#e0f2fe" },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 500 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: "none",
          padding: "8px 16px",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          background: "#064e3b",
          "&:hover": { background: "#053f30" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#064e3b",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #e2e8f0", padding: "12px 16px" },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8fafc" },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: "#022c22", color: "#f8fafc" },
      },
    },
  },
});

export default theme;
