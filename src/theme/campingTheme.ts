import { createTheme } from "@mui/material";

export const campingTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#163A42" },
    secondary: { main: "#D2A554" },
    background: { default: "#F9F6ED", paper: "#ffffff" },
    text: { primary: "#231F20", secondary: "#555555" },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Quicksand", "Roboto", sans-serif',
    h3: {
      fontWeight: 900,
      color: "#50826C",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    },
    h5: {
      fontWeight: 800,
      color: "#163A42",
    },
    h6: {
      fontWeight: 500,
      color: "#555555",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: 800,
          padding: "14px 32px",
          transition: "transform 0.1s ease-in-out",
          "&:active": {
            transform: "scale(0.95)",
          },
          "&.MuiButton-containedPrimary": {
            backgroundColor: "#D2A554",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(210, 165, 84, 0.4)",
            "&:hover": {
              backgroundColor: "#c19443",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          boxShadow: "0 4px 20px rgba(22, 58, 66, 0.08)",
          border: "2px solid transparent",
          transition: "transform 0.1s ease-in-out, border-color 0.2s ease",
          "&:active": {
            transform: "scale(0.98)",
            borderColor: "#D2A554",
          },
        },
      },
    },
  },
});
