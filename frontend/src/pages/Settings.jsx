import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import { useTheme } from "../context/useTheme";

import {
  User,
  Lock,
  Bell,
  Palette,
  Moon,
  Shield,
  FileText,
  Info,
  Trash2,
  LogOut,
  ChevronRight,
  Mail,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import "../styles/Settings.css";

const SettingItem = ({
  icon: Icon,
  title,
  subtitle,
  value,
  danger = false,
  toggle = false,
  checked,
  onToggle,
  onClick,
  to,
}) => {
  const content = (
    <>
      <div className="setting-left">
        <div className={`setting-icon ${danger ? "danger-icon" : ""}`}>
          <Icon size={20} />
        </div>

        <div>
          <h4>{title}</h4>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="setting-right">
        {toggle ? (
          <label className="switch" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggle}
              aria-label={title}
            />
            <span className="slider"></span>
          </label>
        ) : value ? (
          <span className="setting-value">{value}</span>
        ) : (
          <ChevronRight size={18} className="chevron-icon" />
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`setting-item ${danger ? "danger" : ""}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={`setting-item ${danger ? "danger" : ""}`}
    >
      {content}
    </button>
  );
};

function Setting() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const comingSoon = (feature = "This feature") => {
    toast(`${feature} is coming soon in the next update!`, {
      icon: "✨",
      duration: 2500,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <Layout>
      <div className="settings-container">
        <div className="settings-header">
          <h1>Account & App Settings</h1>
          <p>Manage your account preferences, themes, and notifications</p>
        </div>

        {/* GRID */}
        <div className="settings-grid">
          {/* APPEARANCE */}
          <div className="settings-card">
            <div className="card-title">
              <Palette size={20} />
              <h3>Appearance & Theme</h3>
            </div>

            <SettingItem
              icon={Moon}
              title="Dark Mode"
              subtitle="Switch between light and obsidian dark theme"
              toggle
              checked={darkMode}
              onToggle={toggleTheme}
            />

            <SettingItem
              icon={Sparkles}
              title="Accent Color"
              subtitle="Emerald Green (Default)"
              value="Emerald"
              onClick={() => comingSoon("Custom accent colors")}
            />
          </div>

          {/* ACCOUNT */}
          <div className="settings-card">
            <div className="card-title">
              <User size={20} />
              <h3>Account Management</h3>
            </div>

            <SettingItem
              icon={User}
              title="Edit Profile"
              subtitle="Update your name, phone, bio and location"
              to="/profile"
            />

            <SettingItem
              icon={Lock}
              title="Change Password"
              subtitle="Update your account security password"
              onClick={() => comingSoon("Password change")}
            />

            <SettingItem
              icon={LogOut}
              title="Log Out"
              subtitle="Sign out from this device"
              onClick={logout}
            />
          </div>

          {/* NOTIFICATIONS */}
          <div className="settings-card">
            <div className="card-title">
              <Bell size={20} />
              <h3>Notifications</h3>
            </div>

            <SettingItem
              icon={Mail}
              title="Email Notifications"
              subtitle="Receive transaction alerts via email"
              onClick={() => comingSoon("Email notifications")}
            />

            <SettingItem
              icon={ShoppingBag}
              title="Order Updates"
              subtitle="Push notifications for new purchase requests"
              onClick={() => comingSoon("Order notifications")}
            />
          </div>

          {/* PRIVACY & LEGAL */}
          <div className="settings-card">
            <div className="card-title">
              <Shield size={20} />
              <h3>Privacy & Terms</h3>
            </div>

            <SettingItem
              icon={FileText}
              title="Privacy Policy"
              subtitle="Learn how your personal data is protected"
              onClick={() => comingSoon("Privacy policy viewer")}
            />

            <SettingItem
              icon={FileText}
              title="Marketplace Rules & Terms"
              subtitle="Buyer and seller transaction guidelines"
              onClick={() => comingSoon("Terms & conditions")}
            />
          </div>

          {/* ABOUT */}
          <div className="settings-card">
            <div className="card-title">
              <Info size={20} />
              <h3>About SmallThings</h3>
            </div>

            <SettingItem
              icon={Info}
              title="Platform Version"
              subtitle="Latest stable release"
              value="v2.4.0"
            />

            <SettingItem
              icon={User}
              title="Marketplace Architecture"
              subtitle="Full-Stack C2C & B2C Platform"
              value="SmallThings Team"
            />
          </div>

          {/* DANGER ZONE */}
          <div className="settings-card danger-card">
            <div className="card-title danger-title">
              <Trash2 size={20} />
              <h3>Danger Zone</h3>
            </div>

            <SettingItem
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account and listings"
              danger
              onClick={() => comingSoon("Account deletion")}
            />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="settings-footer">
          <p>SmallThings Marketplace</p>
          <span>Production Build — 2026</span>
          <small>© 2026 SmallThings Inc. All rights reserved.</small>
        </footer>
      </div>
    </Layout>
  );
}

export default Setting;
