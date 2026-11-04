import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faThLarge,
  faUser,
  faBox,
  faShoppingBag,
  faCommentAlt,
  faBookmark,
  faCog,
  faSignOutAlt,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faSignInAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import LogoutModal from "../components/LogoutModal";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Close mobile drawer on navigation
  const handleNavClick = useCallback(() => {
    if (window.innerWidth <= 768 && isOpen) {
      toggleSidebar();
    }
  }, [isOpen, toggleSidebar]);

  // Close drawer on Escape key (mobile/desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && window.innerWidth <= 768) {
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggleSidebar]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
    toast.success("Logged out successfully!");
    setLogoutOpen(false);
    handleNavClick();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-label="Close navigation drawer"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Header inside drawer */}
        <div className="mobile-sidebar-header">
          <span className="mobile-sidebar-brand">
            Small<span>Things</span>
          </span>
          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Desktop Collapse/Expand Toggle */}
        <div
          className="topMenu"
          onClick={toggleSidebar}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleSidebar();
          }}
        >
          <FontAwesomeIcon
            icon={isOpen ? faAngleDoubleLeft : faAngleDoubleRight}
          />
        </div>

        <div className="profileName">
          <div className="nav-pro-box">
            {token && currentUser ? (
              <>
                <img
                  id="navProfileImg"
                  src={getAvatarUrl(currentUser)}
                  alt={currentUser.name}
                />
                <div className="profileInfo">
                  <p id="userInfo">{currentUser.name}</p>
                  <p id="userEmail">{currentUser.email}</p>
                </div>
              </>
            ) : (
              <div
                className="guest-profile"
                onClick={() => {
                  handleNavClick();
                  navigate("/login");
                }}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
              >
                <img
                  id="navProfileImg"
                  src={getAvatarUrl("Guest")}
                  alt="Guest"
                />
                <div className="profileInfo">
                  <p id="userInfo">Guest User</p>
                  <p id="userEmail">Sign in to sync</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="nav">
          <NavLink
            to="/marketplace"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Marketplace"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faStore} className="nav-icon" />
            <span>Marketplace</span>
          </NavLink>

          <NavLink
            to="/overview"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Overview"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faThLarge} className="nav-icon" />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/listings"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="My Listings"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faBox} className="nav-icon" />
            <span>My Listings</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Orders"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="nav-icon" />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Chat"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faCommentAlt} className="nav-icon" />
            <span>Chat</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Saved Items"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faBookmark} className="nav-icon" />
            <span>Saved</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            title="Profile"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faUser} className="nav-icon" />
            <span>Profile</span>
          </NavLink>

          <div className="bottom-nav">
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              title="Settings"
              onClick={handleNavClick}
            >
              <FontAwesomeIcon icon={faCog} className="nav-icon" />
              <span>Settings</span>
            </NavLink>

            {token ? (
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="logout"
                title="Log Out"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                <span>Logout</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className="signIn"
                title="Sign In"
                onClick={handleNavClick}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="nav-icon" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </nav>

        <LogoutModal
          isOpen={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}

export default Sidebar;
