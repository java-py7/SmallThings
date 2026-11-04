import { createContext, useEffect, useState, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createAppTheme from "../theme/muiTheme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        return saved;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const darkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      darkMode,
      toggleTheme,
      setTheme,
    }),
    [theme, darkMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
export default ThemeProvider;
