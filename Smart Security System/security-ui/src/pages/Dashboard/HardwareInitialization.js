import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  Smartphone,
  Wifi,
  ShieldCheck,
  Zap,
  Video,
  Activity,
  AlertCircle,
  X,
  HelpCircle,
  MousePointer2,
  CameraIcon,
  CameraOffIcon,
  BadgeHelp,
} from "lucide-react";
import "./HardwareInit.css";

export default function HardwareInitialization() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Connect, Step 2: Draw Zone
  const [camType, setCamType] = useState("ip");
  const [connStatus, setConnStatus] = useState("idle");

  // Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const containerRef = useRef(null);

  const handleTestConnection = () => {
    setConnStatus("connecting");
    setTimeout(() => setConnStatus("connected"), 2000);
  };

  // --- DRAG LOGIC ---
  const handleMouseDown = (e) => {
    if (step !== 2) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || step !== 2) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords((prev) => ({
      ...prev,
      x2: e.clientX - rect.left,
      y2: e.clientY - rect.top,
    }));
  };

  const handleMouseUp = () => setIsDrawing(false);

  return (
    <div className="setup-wizard-overlay center-content flex-column">
      <div className="connection-wizard-card">
        {/* HEADER */}
        <div className="wizard-header">
          <div className="header-title-group">
            <h2>
              {step === 1 ? "Node Initialization" : "Spatial Calibration"}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={() => navigate("/dashboard/cameras")}
          >
            <X size={24} color="#94a3b8" />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="wizard-body">
          {/* LEFT: CONTROLS */}
          <div className="wizard-controls">
            {step === 1 ? (
              <>
                <div className="hardware-tabs">
                  <button
                    className={`hw-tab ${camType === "local" ? "active" : ""}`}
                    onClick={() => {
                      setCamType("local");
                      setConnStatus("idle");
                    }}
                  >
                    <Monitor size={18} /> Local / USB
                  </button>
                  <button
                    className={`hw-tab ${camType === "ip" ? "active" : ""}`}
                    onClick={() => {
                      setCamType("ip");
                      setConnStatus("idle");
                    }}
                  >
                    <Smartphone size={18} /> Mobile IoT
                  </button>
                </div>

                <div className="instruction-box">
                  {camType === "ip" ? (
                    <>
                      <h4>
                        <Wifi size={16} /> Mobile Setup
                      </h4>
                      <ol>
                        <li>Connect phone & laptop to same Wi-Fi.</li>
                        <li>Open IP Webcam & 'Start Server'.</li>
                      </ol>
                      <input
                        className="modern-url-input"
                        type="text"
                        placeholder="http://192.168.1.50:8080/video"
                      />
                    </>
                  ) : (
                    <>
                      <h4>
                        <Monitor size={16} /> Local Setup
                      </h4>
                      <p>Accessing integrated hardware (ID: 0).</p>
                    </>
                  )}
                  <button className="btn-test" onClick={handleTestConnection}>
                    {connStatus === "connecting"
                      ? "Establishing..."
                      : "Test Connection"}
                  </button>
                </div>
              </>
            ) : (
              <div className="instruction-box">
                <h4>
                  <MousePointer2 size={16} /> Area Selection
                </h4>
                <p>
                  Click and drag on the preview to define the{" "}
                  <b>Restricted Perimeter</b>.
                </p>
                <div className="coords-display">
                  X: {Math.round(coords.x1)} Y: {Math.round(coords.y1)} to{" "}
                  <br />
                  X: {Math.round(coords.x2)} Y: {Math.round(coords.y2)}
                </div>
              </div>
            )}

            <div className={`status-banner status-${connStatus}`}>
              {connStatus === "connected" ? (
                <>
                  <ShieldCheck size={18} /> Connected
                </>
              ) : (
                <>
                  <Activity size={18} /> Awaiting Link
                </>
              )}
            </div>

            <button
              className="btn-deploy"
              disabled={connStatus !== "connected"}
              onClick={() =>
                step === 1 ? setStep(2) : navigate("/dashboard/cameras")
              }
            >
              {step === 1
                ? "Proceed to Spatial Setup"
                : "Finalize & Deploy Node"}
            </button>
          </div>

          {/* RIGHT: PREVIEW (DRAG LAYER) */}
          <div className="wizard-preview">
            <div
              className="preview-placeholder"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: step === 2 ? "crosshair" : "default" }}
            >
              {connStatus === "connected" ? (
                <div className="video-mock">
                  <div className="scan-line"></div>
                  <span className="live-tag">LIVE_STREAM</span>

                  {/* THE DRAWN BOX */}
                  <div
                    className="drawn-perimeter"
                    style={{
                      left: Math.min(coords.x1, coords.x2),
                      top: Math.min(coords.y1, coords.y2),
                      width: Math.abs(coords.x2 - coords.x1),
                      height: Math.abs(coords.y2 - coords.y1),
                      display: coords.x1 !== 0 ? "block" : "none",
                    }}
                  >
                    <span className="box-label">RESTRICTED ZONE</span>
                  </div>
                </div>
              ) : (
                <div className="no-signal">
                  <CameraOffIcon size={48} opacity={0.7} />
                  <span>NO SIGNAL</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 2. THE NEW EXTERNAL HELP FOOTER */}
      <div className="wizard-external-footer">
        <div className="footer-item">
          <Wifi size={16} color="#3b82f6" />
          <span>
            <b>Pro Tip:</b> Ensure phone & laptop are on the same 2.4GHz Wi-Fi
            band for lower latency.
          </span>
        </div>
        <div className="footer-item">
          <Video size={16} color="#3b82f6" />
          <span>
            <b>Troubleshoot:</b> If "No Signal" persists, check if your firewall
            blocks Port 8080.
          </span>
        </div>
        <div className="footer-links">
          <button className="text-link">Full Documentation</button>
          <span className="divider">|</span>
          <button
            className="text-link"
            onClick={() => navigate("/SupportPage")}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
