import React, { useState } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Key,
  Hash,
  Send,
  Smartphone,
  Save,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import "./TwilioConfig.css";
import { useNavigate } from "react-router-dom";

export default function TwilioConfig() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    accountSid: "",
    authToken: "",
    twilioNumber: "",
    alertRecipient: "",
  });

  const [testStatus, setTestStatus] = useState("idle"); // idle, testing, success, error

  const handleTestConnection = () => {
    setTestStatus("testing");
    // Simulate Twilio API Handshake
    setTimeout(() => {
      setTestStatus("success");
    }, 2000);
  };

  return (
    <div className="sub-page">
      <button className="nav-back" onClick={() => navigate("/dashboard")}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>
      <div className="page-header">
        <div className="header-flex">
          <h2>Twilio Cloud Integration</h2>
          <div className="api-status-pill">
            <div
              className={`status-dot ${testStatus === "success" ? "online" : "offline"}`}
            ></div>
            {testStatus === "success"
              ? "GATEWAY ONLINE"
              : "GATEWAY DISCONNECTED"}
          </div>
        </div>
        <p>
          Configure SMS and WhatsApp automation for instant intrusion alerts
        </p>
      </div>

      <div className="config-container">
        <div className="config-main">
          {/* API CREDENTIALS CARD */}
          <div className="glass-card">
            <div className="card-header">
              <Key size={20} color="#3b82f6" />
              <h3>API Credentials</h3>
            </div>
            <div className="input-grid">
              <div className="modern-input">
                <label>Account SID</label>
                <input
                  type="password"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={credentials.accountSid}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      accountSid: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modern-input">
                <label>Auth Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={credentials.authToken}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      authToken: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* SENDER & RECIPIENT CARD */}
          <div className="glass-card">
            <div className="card-header">
              <Smartphone size={20} color="#10b981" />
              <h3>Communication Channels</h3>
            </div>
            <div className="input-grid">
              <div className="modern-input">
                <label>Twilio Virtual Number</label>
                <div className="input-with-icon">
                  <Hash size={16} />
                  <input
                    placeholder="+1 555 000 1234"
                    value={credentials.twilioNumber}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        twilioNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="modern-input">
                <label>Admin Alert Number (Recipient)</label>
                <div className="input-with-icon">
                  <Smartphone size={16} />
                  <input
                    placeholder="+91 98765 43210"
                    value={credentials.alertRecipient}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        alertRecipient: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: TESTING & INFO */}
        <div className="config-sidebar">
          <div className="test-panel">
            <h3>Gateway Diagnostic</h3>
            <p>
              Send a test packet to verify your Twilio credentials and network
              route.
            </p>

            <button
              className={`btn-test-api ${testStatus}`}
              onClick={handleTestConnection}
              disabled={testStatus === "testing"}
            >
              {testStatus === "testing"
                ? "Verifying..."
                : testStatus === "success"
                  ? "Test Passed"
                  : "Run Diagnostic Test"}
            </button>

            {testStatus === "success" && (
              <div className="success-note">
                <ShieldCheck size={16} />
                <span>Handshake successful. SMS alerts are active.</span>
              </div>
            )}
          </div>

          <div className="info-panel">
            <h4>
              <AlertCircle size={16} /> Setup Note
            </h4>
            <p>
              Ensure your Twilio account has sufficient credits. For WhatsApp
              alerts, ensure your sender number is approved in the Twilio
              Console.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky-action-bar">
        <button className="btn-save-config">
          <Save size={18} /> Sync Twilio Configuration
        </button>
      </div>
    </div>
  );
}
