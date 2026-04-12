import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Monitor,
  Smartphone,
  Wifi,
  ShieldCheck,
  Zap,
  X,
  Activity,
  MousePointer2,
  CameraOffIcon,
  Tag,
  MapPin,
} from "lucide-react";
import "./HardwareInit.css";

export default function HardwareInitialization() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [camType, setCamType] = useState("ip");
  const [connStatus, setConnStatus] = useState("idle");

  const [ipAddress, setIpAddress] = useState("");
  const [verifiedUrl, setVerifiedUrl] = useState("");
  const [formData, setFormData] = useState({ name: "", location: "" });

  const [isDrawing, setIsDrawing] = useState(false);
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const containerRef = useRef(null);

  const handleTestConnection = async () => {
    if (camType === "ip" && !ipAddress.startsWith("http")) {
      alert("Enter valid URL (http://...)");
      return;
    }
    setConnStatus("connecting");
    try {
      const res = await axios.get(
        `http://localhost:8000/api/hardware/verify-stream`,
        {
          params: { url: ipAddress },
        },
      );
      if (res.data.status === "success") {
        setConnStatus("connected");
        const suffix = ipAddress.endsWith("/") ? "video" : "/video";
        setVerifiedUrl(ipAddress + suffix);
      }
    } catch (err) {
      setConnStatus("error");
    }
  };

  const handleMouseDown = (e) => {
    if (connStatus !== "connected") return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setCoords((prev) => ({
      ...prev,
      x2: e.clientX - rect.left,
      y2: e.clientY - rect.top,
    }));
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

 const handleFinalDeploy = async () => {
   if (!formData.name || !formData.location)
     return alert("Fill Identity fields");

   let cleanUrl = ipAddress.trim();

   if (camType === "ip") {
     if (!cleanUrl.endsWith("/video") && !cleanUrl.endsWith("/videofeed")) {
       cleanUrl = cleanUrl.endsWith("/")
         ? `${cleanUrl}video`
         : `${cleanUrl}/video`;
     }
   }

   const rect = containerRef.current.getBoundingClientRect();

   const normalizedCoords = {
     x1: Math.min(coords.x1, coords.x2) / rect.width,
     y1: Math.min(coords.y1, coords.y2) / rect.height,
     x2: Math.max(coords.x1, coords.x2) / rect.width,
     y2: Math.max(coords.y1, coords.y2) / rect.height,
     width: rect.width,
     height: rect.height,
   };

   console.log("📦 NORMALIZED:", normalizedCoords);

   try {
     await axios.post(
       "http://localhost:8000/api/cameras/setup-full",
       {
         name: formData.name,
         location: formData.location,
         stream_url: cleanUrl,
         coords: normalizedCoords,
       },
       {
         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
       },
     );

     navigate("/dashboard/cameras");
   } catch (err) {
     alert("Deploy Failed: " + (err.response?.data?.detail || "Server Error"));
   }
 };

  return (
    <div className="setup-wizard-overlay center-content flex-column">
      <div className="connection-wizard-card">
        <div className="wizard-header">
          <h2>Node Initialization</h2>
          <button
            className="close-btn"
            onClick={() => navigate("/dashboard/cameras")}
          >
            <X size={24} />
          </button>
        </div>

        <div className="wizard-body">
          <div className="wizard-controls">
            <div className="hardware-tabs">
              <button
                className={`hw-tab ${camType === "ip" ? "active" : ""}`}
                onClick={() => setCamType("ip")}
              >
                <Smartphone size={18} /> Mobile IoT
              </button>
              <button
                className={`hw-tab ${camType === "local" ? "active" : ""}`}
                onClick={() => setCamType("local")}
              >
                <Monitor size={18} /> Local
              </button>
            </div>

            {/* ❌ NO UI CHANGE BELOW */}
            {/* only logic changed above */}

            <div className="instruction-box">
              {connStatus !== "connected" ? (
                <>
                  <h4>
                    <Wifi size={16} /> Establish Handshake
                  </h4>
                  <ol>
                    <li>Connect phone & laptop to same Wi-Fi.</li>
                    <li>Open IP Webcam & 'Start Server'.</li>
                  </ol>
                  <p>Enter the IP from your mobile device.</p>
                  <input
                    className="modern-url-input"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="http://192.168..."
                  />
                  <button
                    className="btn-test"
                    onClick={handleTestConnection}
                    disabled={connStatus === "connecting"}
                  >
                    {connStatus === "connecting"
                      ? "Syncing..."
                      : "Verify Connection"}
                  </button>
                </>
              ) : (
                <>
                  <h4>
                    <Tag size={16} /> Node Identity & Zone
                  </h4>
                  <input
                    className="modern-url-input"
                    placeholder="Camera Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <input
                    className="modern-url-input"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    style={{ marginTop: "10px" }}
                  />

                  <div className="coords-display" style={{ marginTop: "15px" }}>
                    <MousePointer2 size={12} /> Drag on preview to set Zone
                    <p style={{ fontSize: "10px", margin: "5px 0 0" }}>
                      X1:{Math.round(coords.x1)} Y1:{Math.round(coords.y1)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className={`status-banner status-${connStatus}`}>
              {connStatus === "connected" ? (
                <>
                  <ShieldCheck size={18} /> Verified
                </>
              ) : (
                <>
                  <Activity size={18} /> Awaiting Signal
                </>
              )}
            </div>

            <button
              className="btn-deploy"
              disabled={connStatus !== "connected"}
              onClick={handleFinalDeploy}
            >
              Finalize & Deploy Node
            </button>
          </div>

          {/* preview untouched */}
          <div className="wizard-preview">
            <div
              className="preview-placeholder"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDragStart={(e) => e.preventDefault()}
            >
              {connStatus === "connected" && verifiedUrl ? (
                <div className="video-mock" style={{ pointerEvents: "none" }}>
                  <img
                    src={verifiedUrl}
                    alt="Live"
                    draggable="false"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      userSelect: "none",
                    }}
                  />
                  <div className="scan-line"></div>

                  {coords.x1 !== 0 && (
                    <div
                      className="drawn-perimeter"
                      style={{
                        left: Math.min(coords.x1, coords.x2),
                        top: Math.min(coords.y1, coords.y2),
                        width: Math.abs(coords.x2 - coords.x1),
                        height: Math.abs(coords.y2 - coords.y1),
                        pointerEvents: "none",
                      }}
                    >
                      <span className="box-label">SECURE_ZONE</span>
                    </div>
                  )}
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
    </div>
  );
}
