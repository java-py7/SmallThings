import { createTheme } from "@mui/material/styles";

/**
 * Creates a cohesive Material UI theme synchronized with SmallThings design tokens.
 * @param {'light'|'dark'} mode
 */
export function createAppTheme(mode = "light") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#22c55e" : "#16a34a",
        dark: "#15803d",
        light: "#4ade80",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f59e0b",
      },
      success: {
        main: "#22c55e",
      },
      background: {
        default: isDark ? "#0b0f19" : "#ffffff",
        paper: isDark ? "#111827" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#475569",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontWeight: 800,
        letterSpacing: "-0.03em",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.025em",
      },
      h3: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.015em",
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0b0f19" : "#ffffff",
            color: isDark ? "#f8fafc" : "#0f172a",
            transition: "background-color 0.25s ease, color 0.25s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: "0.9rem",
            boxShadow: "none",
            "&:hover": {
              boxShadow: isDark
                ? "0 4px 14px rgba(34, 197, 94, 0.3)"
                : "0 4px 14px rgba(22, 163, 74, 0.25)",
            },
          },
          containedPrimary: {
            background: isDark
              ? "linear-gradient(135deg, #16a34a, #22c55e)"
              : "linear-gradient(135deg, #15803d, #16a34a)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.35)"
              : "0 4px 20px rgba(0, 0, 0, 0.05)",
            backgroundImage: "none",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            backgroundImage: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#22c55e" : "#16a34a",
              borderWidth: "1.5px",
            },
          },
        },
      },
    },
  });
}

export default createAppTheme;

