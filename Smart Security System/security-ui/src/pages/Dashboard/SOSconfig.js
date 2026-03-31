import React, { useState } from "react";
import {
  ShieldAlert,
  BellRing,
  Save,
  HardDrive,
  Cpu,
  Smartphone,
  RefreshCcw,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./SOSconfig.css";
export default function SOSConfig() {

  const navigate = useNavigate();
  const [config, setConfig] = useState({
    alarmDuration: 30,
    detectionSensitivity: 75,
    autoArm: true,
    silentMode: false,
    notifyPhone: true,
  });

  const handleSave = () => {
    // This would call your FastAPI /api/config/update endpoint
    alert("System Configuration Synchronized with Neural Engine");
  };

  return (
    <div className="sub-page">
        <button className="nav-back" onClick={() => navigate("/dashboard")}>
            <ChevronLeft size={18} /> Back to Dashboard
        </button>
      <div className="page-header">
        <div className="header-with-status">
          <h2>System SOS Configuration</h2>
          <div className="live-badge">SYSTEM SECURE</div>
        </div>
        <p>Calibrate AI response protocols and emergency alert triggers</p>
      </div>

      <div className="config-grid">
        {/* SECTION 1: ALARM PARAMETERS */}
        <div className="config-card">
          <div className="card-title">
            <BellRing size={20} color="#3b82f6" />
            <h3>Alert Protocols</h3>
          </div>
          <div className="control-group">
            <label>Alarm Duration (Seconds): {config.alarmDuration}s</label>
            <input
              type="range"
              min="5"
              max="300"
              value={config.alarmDuration}
              onChange={(e) =>
                setConfig({ ...config, alarmDuration: e.target.value })
              }
            />
          </div>
          <div className="toggle-group">
            <span>Enable Remote Mobile Notification</span>
            <button
              className={`toggle-btn ${config.notifyPhone ? "active" : ""}`}
              onClick={() =>
                setConfig({ ...config, notifyPhone: !config.notifyPhone })
              }
            >
              <div className="slider"></div>
            </button>
          </div>
        </div>

        {/* SECTION 2: AI ENGINE SENSITIVITY */}
        <div className="config-card">
          <div className="card-title">
            <Cpu size={20} color="#10b981" />
            <h3>Neural Engine Sensitivity</h3>
          </div>
          <div className="control-group">
            <label>Confidence Threshold: {config.detectionSensitivity}%</label>
            <input
              type="range"
              min="25"
              max="95"
              value={config.detectionSensitivity}
              onChange={(e) =>
                setConfig({ ...config, detectionSensitivity: e.target.value })
              }
            />
            <p className="hint-text">
              Higher sensitivity reduces false alarms but may miss distant
              objects.
            </p>
          </div>
          <button className="btn-secondary">
            <RefreshCcw size={16} /> Re-calibrate YOLO Model
          </button>
        </div>

        {/* SECTION 3: SYSTEM OVERRIDE */}
        <div className="config-card danger-zone">
          <div className="card-title">
            <ShieldAlert size={20} color="#ef4444" />
            <h3>Emergency Override</h3>
          </div>
          <p>
            Instantly disable all active buzzers and neural detection across the
            entire matrix.
          </p>
          <button className="btn-danger-large">FORCE SYSTEM DISARM</button>
        </div>
      </div>

      <div className="sticky-footer">
        <button className="btn-save" onClick={handleSave}>
          <Save size={20} /> Commit Configuration to Core
        </button>
      </div>
    </div>
  );
}
