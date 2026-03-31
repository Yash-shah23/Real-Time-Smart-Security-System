import React, { useState } from "react";
import {
  ChevronLeft,
  Send,
  Search,
  Wifi,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import "./SupportPage.css";
import { useNavigate } from "react-router-dom";

export default function SupportPage({ onClose }) {

  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState("idle"); // idle, sending, sent
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "Error -138: Cannot connect to Mobile IP Camera",
      a: "This is a local network block. Ensure both your phone and laptop are connected to the exact same Wi-Fi network. Turn off mobile data on your phone. If it still fails, check Windows Firewall and ensure Python/Uvicorn is allowed on Private Networks.",
    },
    {
      q: "My Local Webcam is showing a black screen",
      a: "Only one application can use your webcam at a time. Close Zoom, MS Teams, or any other browser tabs that might be holding the camera. Refresh the SecureAI dashboard.",
    },
    {
      q: "The AI is not detecting people in the restricted zone",
      a: "Ensure the camera is perfectly still. If the camera was bumped or moved after you drew the red restricted zone, the spatial coordinates will no longer align with the physical room. You must delete the node and recalibrate it.",
    },
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setFormStatus("sending");
    // Simulate API call to save ticket to database
    setTimeout(() => setFormStatus("sent"), 1500);
  };

  return (
    <div className="support-page-root">
      {/* Top Navigation */}
      <nav className="support-nav">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ChevronLeft size={18} /> Back to Dashboard
        </button>
        <h2>SecureAI Support Center</h2>
        <div style={{ width: "100px" }}></div> {/* Spacer for centering */}
      </nav>

      <div className="support-container">
        {/* LEFT COLUMN: Guides & FAQ */}
        <div className="support-content">
          <div className="search-bar">
            <Search size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search for error codes, setup guides, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <section className="guide-section">
            <h3>
              <Wifi size={24} color="#3b82f6" /> Smart Connect: Wi-Fi Setup
              Guide
            </h3>
            <div className="setup-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Network Sync</h4>
                <p>
                  Connect both your SecureAI Matrix (laptop) and your IoT Sensor
                  (mobile phone) to the <b>identical Wi-Fi network</b>.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Initialize Sensor</h4>
                <p>
                  Open the IP Webcam app on your phone. Scroll to the bottom and
                  tap <b>Start Server</b>. Keep the screen awake.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Pairing Phase</h4>
                <p>
                  Enter the IPv4 address shown on your phone into the SecureAI
                  dashboard. <br />
                  <br />
                  <i>
                    *Coming Soon: Scan the SecureAI QR code to auto-pair devices
                    via mDNS.
                  </i>
                </p>
              </div>
            </div>
          </section>

          <section className="faq-section">
            <h3>
              <AlertCircle size={24} color="#3b82f6" /> Frequently Asked
              Questions
            </h3>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div className="faq-item" key={index}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Support Ticket Form */}
        <div className="support-sidebar">
          <div className="ticket-card">
            <h3>Need Technical Assistance?</h3>
            <p>
              Open a ticket with our engineering team. We typically respond
              within 2 hours.
            </p>

            {formStatus === "sent" ? (
              <div className="success-message">
                <CheckCircle2 size={48} color="#10b981" />
                <h4>Ticket Submitted</h4>
                <p>
                  Your diagnostic data has been sent to our team. We will email
                  you shortly.
                </p>
                <button
                  onClick={() => setFormStatus("idle")}
                  className="btn-reset"
                >
                  Submit Another Issue
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="ticket-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" required placeholder="John Doe" />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@secureai.com"
                  />
                </div>
                <div className="input-group">
                  <label>Issue Category</label>
                  <select>
                    <option>Hardware Connectivity (Error -138)</option>
                    <option>Neural Network / Detection Fails</option>
                    <option>Dashboard UI Bugs</option>
                    <option>Account & Billing</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Detailed Description</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Describe the steps to reproduce the error..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formStatus === "sending"}
                >
                  {formStatus === "sending" ? (
                    "Transmitting..."
                  ) : (
                    <>
                      <Send size={18} /> Submit Diagnostic Ticket
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
