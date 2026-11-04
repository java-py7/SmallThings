import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-md)",
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
          },
          success: {
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </ThemeProvider>
  </BrowserRouter>
);
