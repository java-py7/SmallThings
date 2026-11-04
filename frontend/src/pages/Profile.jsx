import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Edit3, Check, X, MapPin, Mail, Phone, Calendar, User, FileText } from "lucide-react";
import Layout from "../components/Layout";
import api from "../services/api";
import { getAvatarUrl } from "../utils/avatar";
import "../styles/Profile.css";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    createdAt: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      toast.error("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put("/users/me", {
        name: user.name,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
      });

      toast.success("Profile updated successfully");
      setIsEditing(false);
      setUser(res.data);

      // Keep localStorage in sync
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            name: res.data.name,
            phone: res.data.phone,
            location: res.data.location,
            bio: res.data.bio,
          })
        );
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <Layout>
      <div className="profile-page-container">
        <div className="profile-card">
          {/* Header Banner */}
          <div className="profile-banner">
            <div className="profile-avatar-wrapper">
              <img
                src={getAvatarUrl(user)}
                alt={user.name || "User Avatar"}
                className="profile-avatar-img"
              />
            </div>
          </div>

          {/* Profile Headline */}
          <div className="profile-headline-section">
            <div className="profile-name-group">
              <h2>{user.name || "User Profile"}</h2>
              <p className="profile-email-badge">
                <Mail size={14} />
                {user.email || "No email available"}
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                className="profile-btn-edit"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="profile-edit-btn-group">
                <button
                  type="button"
                  className="profile-btn-save"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  <Check size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="profile-btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="profile-loading-state">
              <div className="chat-loading-spinner" />
              <p>Loading profile details...</p>
            </div>
          ) : (
            <div className="profile-body">
              <div className="profile-grid">
                {/* Full Name */}
                <div className="profile-info-card">
                  <div className="profile-field-label">
                    <User size={15} />
                    <span>Full Name</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="profile-field-value">{user.name || "-"}</p>
                  )}
                </div>

                {/* Email (Readonly) */}
                <div className="profile-info-card">
                  <div className="profile-field-label">
                    <Mail size={15} />
                    <span>Email Address</span>
                  </div>
                  <p className="profile-field-value readonly">{user.email || "-"}</p>
                </div>

                {/* Phone */}
                <div className="profile-info-card">
                  <div className="profile-field-label">
                    <Phone size={15} />
                    <span>Phone Number</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="profile-input"
                      value={user.phone || ""}
                      onChange={(e) =>
                        setUser({ ...user, phone: e.target.value })
                      }
                      placeholder="e.g. +91 9876543210"
                    />
                  ) : (
                    <p className="profile-field-value">{user.phone || "Not specified"}</p>
                  )}
                </div>

                {/* Location */}
                <div className="profile-info-card">
                  <div className="profile-field-label">
                    <MapPin size={15} />
                    <span>City / Location</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={user.location || ""}
                      onChange={(e) =>
                        setUser({ ...user, location: e.target.value })
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                    />
                  ) : (
                    <p className="profile-field-value">{user.location || "Not specified"}</p>
                  )}
                </div>

                {/* Member Since (Readonly) */}
                <div className="profile-info-card">
                  <div className="profile-field-label">
                    <Calendar size={15} />
                    <span>Member Since</span>
                  </div>
                  <p className="profile-field-value readonly">{formattedDate}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="profile-info-card full-width">
                <div className="profile-field-label">
                  <FileText size={15} />
                  <span>About & Bio</span>
                </div>
                {isEditing ? (
                  <textarea
                    rows={4}
                    className="profile-textarea"
                    value={user.bio || ""}
                    onChange={(e) =>
                      setUser({ ...user, bio: e.target.value })
                    }
                    placeholder="Tell buyers and sellers a bit about yourself, what you sell or collect..."
                  />
                ) : (
                  <p className="profile-field-value bio-text">
                    {user.bio || "No biography added yet. Click 'Edit Profile' to introduce yourself."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
