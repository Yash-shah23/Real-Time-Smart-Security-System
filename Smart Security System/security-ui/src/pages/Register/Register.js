import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { registerUser } from "../../services/api"; // Import our API helper
import "./Register.css";
import "../Login/Login.css"; // Reuse input styles

export default function Register() {
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // State for UI feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Send data to FastAPI Backend
      const response = await registerUser(formData);

      setSuccess("Account created successfully! Redirecting to login...");

      // Clear form
      setFormData({ name: "", email: "", password: "", phone: "" });

      // Wait 2 seconds, then send them to the login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-split-layout">        
      {/* Form Side */}
      <div className="register-form-container">
        <div className="form-wrapper">
          <h3>Create Operator Account</h3>
          <p>Fill out the form below to initialize your database profile.</p>

          {/* Feedback Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleRegister}>
            <div className="input-block">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="solid-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-block">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="solid-input"
                placeholder="name@organization.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-block">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="solid-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-block">
              <label>Secure Password</label>
              <input
                type="password"
                name="password"
                className="solid-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Register Account"}
            </button>

            <p
              style={{
                marginTop: "1.5rem",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              Already have an account?{" "}
              <span
                style={{ color: "#3b82f6", cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </form>
        </div>
      </div>
      {/* Branding Side */}
      <div className="register-branding">
        <UserPlus
          size={48}
          color="#3b82f6"
          style={{ marginBottom: "2.5rem" }}
        />
        <h2>Request Access</h2>
        <p>
          System administrators must register their credentials before accessing
          the SecureAI Command Center. All accounts are subject to audit.
        </p>
      </div>
    </div>
  );
}
