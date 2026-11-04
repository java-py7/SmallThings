import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowRight, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/useTheme";
import logoBlack from "../assets/smallthingsICON-green-black0.png";
import logoWhite from "../assets/smallthingsICON-green-white.png";
import api from "../services/api";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPasswordValid = password.length >= 6;
  const isMatch = password && password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (!isMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        password,
        bio: bio.trim(),
      });

      toast.success(res.data.message || "Account created successfully!");

      // If token returned, we can auto-login or redirect
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setTimeout(() => {
          navigate("/marketplace");
        }, 600);
      } else {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <img
            src={darkMode ? logoWhite : logoBlack}
            alt="SmallThings"
            className="register-logo"
          />
          <h2>
            Small<span>Things</span>
          </h2>
        </div>

        <div className="register-title-box">
          <h3>Create Your Account</h3>
          <p>Buy pre-owned items, list your products, or launch your small business</p>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Maya Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                type="email"
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number *</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-location">City / Location *</label>
              <input
                id="reg-location"
                type="text"
                placeholder="e.g. Mumbai, MH"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password (6+ chars) *</label>
              <div className="password-input-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          {password && (
            <div className="password-hints">
              <span className={`hint-pill ${isPasswordValid ? "valid" : ""}`}>
                <FontAwesomeIcon icon={faCheckCircle} /> 6+ characters
              </span>
              <span className={`hint-pill ${isMatch && confirmPassword ? "valid" : ""}`}>
                <FontAwesomeIcon icon={faCheckCircle} /> Passwords match
              </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-bio">About You / Store Bio (Optional)</label>
            <textarea
              id="reg-bio"
              rows={2}
              placeholder="Tell buyers a little bit about what you sell..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              <>
                <span>Create Account</span>
                <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
