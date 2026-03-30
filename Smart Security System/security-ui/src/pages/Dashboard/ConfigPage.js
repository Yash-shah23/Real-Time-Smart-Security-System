import React from "react";
import { Smartphone, ShieldCheck, Mail } from "lucide-react";

export default function ConfigPage() {
  return (
    <div className="sub-page">
      <h2>System Configuration</h2>
      <div className="stat-card" style={{ marginTop: "2rem" }}>
        <h3
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Smartphone color="#3b82f6" /> Twilio SOS Gateway
        </h3>
        <div className="input-block">
          <label>Account SID</label>
          <input
            className="solid-input"
            type="password"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <div className="input-block">
          <label>Auth Token</label>
          <input
            className="solid-input"
            type="password"
            placeholder="••••••••••••••••"
          />
        </div>
        <div className="input-block">
          <label>Recipient Phone Number (SOS)</label>
          <input className="solid-input" placeholder="+91 98765 43210" />
        </div>
        <button className="btn-submit">Save SMS Configuration</button>
      </div>

      <div
        className="stat-card"
        style={{
          marginTop: "2rem",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <h3
          style={{
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldCheck /> AI Model Status
        </h3>
        <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginTop: "10px" }}>
          YOLOv8 Engine: <strong>Active (CUDA Accelerated)</strong>
          <br />
          Face Embeddings: <strong>128-bit Encryption Enabled</strong>
        </p>
      </div>
    </div>
  );
}
