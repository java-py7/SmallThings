import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MarketPlace from "./pages/MarketPlace";
import ProductDetails from "./pages/ProductDetails";
import Overview from "./pages/Overview";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/LandingPage" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Marketplace & Discovery (Public) */}
      <Route path="/marketplace" element={<MarketPlace />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/overview"
        element={
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute>
            <Listings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <Saved />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
