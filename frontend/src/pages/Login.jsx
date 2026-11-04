import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/useTheme";
import logoBlack from "../assets/smallthingsICON-green-black0.png";
import logoWhite from "../assets/smallthingsICON-green-white.png";
import api from "../services/api";
import { connectSocket } from "../socket";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Refresh socket with new token
      connectSocket();

      toast.success("Welcome back! Login successful.");

      const destination = location.state?.from?.pathname || "/marketplace";
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <img
            src={darkMode ? logoWhite : logoBlack}
            alt="SmallThings"
            className="auth-logo"
          />
          <h2>
            Small<span>Things</span>
          </h2>
        </div>

        <div className="auth-title-box">
          <h3>Welcome Back</h3>
          <p>Sign in to your SmallThings account to manage your listings and chats</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              <>
                <span>Sign In</span>
                <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account yet?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
