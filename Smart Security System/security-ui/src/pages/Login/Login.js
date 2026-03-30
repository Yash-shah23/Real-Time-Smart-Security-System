import React, { useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, Mail } from "lucide-react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe,setRememberMe] = useState(false)
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/login",
        {
          email,
          password,
        },
      );

      // 1. Save Token to LocalStorage
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 2. Redirect to Dashboard
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Authentication failed. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-layout">
      {/* LEFT PANEL */}
      <div className="login-branding">
        <ShieldCheck
          size={60}
          color="#3b82f6"
          style={{ marginBottom: "2rem" }}
        />
        <h2>
          Identity <br /> Verification
        </h2>
        <p>
          Access the SecureAI perimeter defense protocol. Please authenticate
          with your verified operator credentials.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-form-container">
        <div className="form-wrapper">
          <h3>Welcome Back</h3>
          <p>Sign in to monitor active zones.</p>

          {error && (
            <div
              style={{
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-block">
              <label>Operator Email</label>
              <input
                type="email"
                className="solid-input"
                placeholder="operator@secureai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-block">
              <label>Secure Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="solid-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <div className="form-utils">
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#3b82f6" }}
                />
                Remember this device
              </label>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>

          <p
            style={{
              marginTop: "2rem",
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#94a3b8",
            }}
          >
            New operator?{" "}
            <Link
              to="/register"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Register Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
