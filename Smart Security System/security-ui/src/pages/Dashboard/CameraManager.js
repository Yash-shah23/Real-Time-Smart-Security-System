import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Video,
  ChevronLeft,
  MousePointer2,
  Settings2,
  Check,
  Plus,
  MapPin,
  Tag,
  Trash2,
  Maximize2,
  Activity,
  AlertTriangle,
  X,
  AlertOctagon,
  Smartphone,
  Monitor,
  Wifi,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import "./CameraManager.css";

export default function CameraManager() {
  const [view, setView] = useState("grid"); // 'grid', 'wizard_connect', 'setup'
  const [cameras, setCameras] = useState([]);

  // Setup & Connection States
  const [camType, setCamType] = useState("local"); // 'local' or 'ip'
  const [connStatus, setConnStatus] = useState("idle"); // 'idle', 'connecting', 'connected', 'error'
  const [localStream, setLocalStream] = useState(null); // Holds the webcam stream if local

  const [isDrawing, setIsDrawing] = useState(false);
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [camDetails, setCamDetails] = useState({
    name: "",
    location: "",
    stream_url: "",
  });

  // Modal / Popup States
  const [selectedCam, setSelectedCam] = useState(null);
  const [activeZone, setActiveZone] = useState(null);
  const [isIntruding, setIsIntruding] = useState(false);
  const [hasBuzzed, setHasBuzzed] = useState(false);

  const containerRef = useRef(null);
  const API_BASE = "http://127.0.0.1:8000/api/cameras";

  // --- 1. FETCH CAMERAS ---
  const fetchCameras = async () => {
    try {
      const res = await axios.get(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCameras(res.data);
    } catch (err) {
      console.error("Database sync error", err);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [view]);

  // --- 2. WIZARD: STEP 1 (CONNECTION) ---
  const startConnectionWizard = () => {
    setView("wizard_connect");
    setCamType("ip"); // Default to the cooler Mobile setup
    setConnStatus("idle");
    setCamDetails({ name: "", location: "", stream_url: "" });
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  };

  const testLocalCamera = async () => {
    setConnStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);
      setCamDetails((prev) => ({ ...prev, stream_url: "0" }));
      setConnStatus("connected");
    } catch (err) {
      setConnStatus("error");
      alert("Camera access denied or busy.");
    }
  };

  const testIPCamera = () => {
    if (!camDetails.stream_url) return alert("Please enter the IP URL first.");
    setConnStatus("connecting");
    // The <img onLoad> handler in the UI will flip this to "connected" if it works.
  };

  const proceedToDrawing = () => {
    if (connStatus !== "connected")
      return alert("Please establish a successful connection first.");
    setView("setup");
  };

  const cancelSetup = () => {
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    setView("grid");
  };

  // --- 3. WIZARD: STEP 2 (DRAWING & SAVE) ---
  const saveConfiguration = async () => {
    if (!camDetails.name || !camDetails.location)
      return alert("Please provide Node Name and Location.");
    try {
      await axios.post(
        `${API_BASE}/setup-full`,
        {
          name: camDetails.name,
          location: camDetails.location,
          stream_url: camDetails.stream_url || "0",
          coords: {
            x1: Math.round(Math.min(coords.x1, coords.x2)),
            y1: Math.round(Math.min(coords.y1, coords.y2)),
            x2: Math.round(Math.max(coords.x1, coords.x2)),
            y2: Math.round(Math.max(coords.y1, coords.y2)),
          },
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      cancelSetup(); // Returns to grid and cleans up
    } catch (err) {
      alert("Server Error: Database save failed.");
    }
  };

  // --- 4. POPUP & ALERTS LOGIC (Unchanged) ---
  const openCameraPopup = async (cam) => {
    setSelectedCam(cam);
    setIsIntruding(false);
    setHasBuzzed(false);
    try {
      const zoneRes = await axios.get(`${API_BASE}/zone/${cam._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setActiveZone(zoneRes.data.coordinates);
    } catch (err) {
      setActiveZone(null);
    }
  };

  const closePopup = () => {
    setSelectedCam(null);
    setActiveZone(null);
    setIsIntruding(false);
    setHasBuzzed(false);
  };

  useEffect(() => {
    let interval;
    if (selectedCam) {
      interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(
            `${API_BASE}/status/${selectedCam._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          if (statusRes.data.intruder) {
            setIsIntruding(true);
            if (!hasBuzzed) {
              const audio = new Audio(`${window.location.origin}/buzzer.mp3`);
              audio.play().catch((e) => console.log("Audio autoplay blocked"));
              setHasBuzzed(true);
            }
          } else {
            setIsIntruding(false);
            setHasBuzzed(false);
          }
        } catch (err) {}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedCam, hasBuzzed]);

  // ==========================================
  // VIEW 1: HARDWARE CONNECTION WIZARD
  // ==========================================
  if (view === "wizard_connect") {
    return (
      <div className="setup-wizard-overlay">
        <div className="connection-wizard-card">
          <div className="wizard-header">
            <h2>Hardware Initialization</h2>
            <button className="close-btn" onClick={cancelSetup}>
              <X size={24} />
            </button>
          </div>

          <div className="wizard-body">
            {/* Left: Instructions & Inputs */}
            <div className="wizard-controls">
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

              {camType === "ip" ? (
                <div className="instruction-box">
                  <h4>
                    <Wifi size={16} /> Connect Mobile IP Camera
                  </h4>
                  <ol>
                    <li>
                      Connect phone & laptop to the <b>same Wi-Fi</b>.
                    </li>
                    <li>
                      Download <b>IP Webcam</b> on your mobile.
                    </li>
                    <li>
                      Open app & tap <b>Start Server</b> at the bottom.
                    </li>
                    <li>Enter the IPv4 address provided by the app below.</li>
                  </ol>
                  <div className="modern-input">
                    <label>Stream URL (Ensure it ends in /video)</label>
                    <input
                      placeholder="http://192.168.1.50:8080/video"
                      value={camDetails.stream_url}
                      onChange={(e) =>
                        setCamDetails({
                          ...camDetails,
                          stream_url: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button className="btn-test" onClick={testIPCamera}>
                    Test Network Stream
                  </button>
                </div>
              ) : (
                <div className="instruction-box">
                  <h4>
                    <Monitor size={16} /> Connect Local Hardware
                  </h4>
                  <p>
                    SecureAI will request access to your laptop's built-in
                    webcam or a connected USB camera.
                  </p>
                  <button className="btn-test" onClick={testLocalCamera}>
                    Request Camera Access
                  </button>
                </div>
              )}

              {/* Status Indicator */}
              <div className={`status-banner status-${connStatus}`}>
                {connStatus === "idle" && (
                  <>
                    <Activity size={18} /> Waiting for hardware...
                  </>
                )}
                {connStatus === "connecting" && (
                  <>
                    <Activity size={18} /> Establishing Handshake...
                  </>
                )}
                {connStatus === "connected" && (
                  <>
                    <ShieldCheck size={18} /> Hardware Connected Successfully!
                  </>
                )}
                {connStatus === "error" && (
                  <>
                    <AlertCircle size={18} /> Connection Failed. Check Network.
                  </>
                )}
              </div>

              <button
                className="btn-deploy"
                disabled={connStatus !== "connected"}
                onClick={proceedToDrawing}
                style={{ opacity: connStatus === "connected" ? 1 : 0.5 }}
              >
                Proceed to Spatial Setup{" "}
                <ChevronLeft
                  size={18}
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>
            </div>

            {/* Right: Live Preview */}
            <div className="wizard-preview">
              <div className="preview-placeholder">
                {camType === "local" && localStream && (
                  <video
                    autoPlay
                    playsInline
                    muted
                    ref={(el) => el && (el.srcObject = localStream)}
                  />
                )}

                {camType === "ip" && connStatus !== "idle" && (
                  <img
                    src={camDetails.stream_url}
                    alt="Testing IP Feed"
                    onLoad={() => setConnStatus("connected")}
                    onError={() => setConnStatus("error")}
                    style={{
                      display:
                        connStatus === "connected" ||
                        connStatus === "connecting"
                          ? "block"
                          : "none",
                    }}
                  />
                )}

                {connStatus !== "connected" && (
                  <div className="no-signal">
                    <Video size={48} opacity={0.2} />
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

  // ==========================================
  // VIEW 2: ZONE DRAWING (SETUP)
  // ==========================================
  if (view === "setup") {
    return (
      <div className="setup-wizard-overlay">
        <aside className="setup-sidebar glass-effect">
          <button
            className="nav-back"
            onClick={() => setView("wizard_connect")}
          >
            <ChevronLeft size={18} /> Back to Hardware
          </button>
          <div className="setup-form">
            <h2 className="glow-text">Node Provisioning</h2>
            <p className="subtitle">Calibrate spatial detection boundaries</p>

            <div className="modern-input">
              <label>
                <Tag size={14} /> Node Label
              </label>
              <input
                value={camDetails.name}
                onChange={(e) =>
                  setCamDetails({ ...camDetails, name: e.target.value })
                }
                placeholder="Front Desk Cam"
              />
            </div>

            <div className="modern-input">
              <label>
                <MapPin size={14} /> Zone Mapping
              </label>
              <input
                value={camDetails.location}
                onChange={(e) =>
                  setCamDetails({ ...camDetails, location: e.target.value })
                }
                placeholder="North Entrance"
              />
            </div>

            <div className="geometry-card">
              <p>
                <Settings2 size={12} /> Boundary Logic: Active
              </p>
              <small>
                X:{Math.round(coords.x1)} Y:{Math.round(coords.y1)} to X:
                {Math.round(coords.x2)} Y:{Math.round(coords.y2)}
              </small>
            </div>

            <button className="btn-deploy" onClick={saveConfiguration}>
              <Check size={20} /> Deploy Neural Node
            </button>
          </div>
        </aside>

        <main className="canvas-viewport">
          <div className="canvas-hint">
            <MousePointer2 size={16} /> Drag to define Restricted Perimeter
          </div>
          <div
            ref={containerRef}
            className="interaction-layer"
            onMouseDown={(e) => {
              const rect = containerRef.current.getBoundingClientRect();
              setCoords({
                x1: e.clientX - rect.left,
                y1: e.clientY - rect.top,
                x2: e.clientX - rect.left,
                y2: e.clientY - rect.top,
              });
              setIsDrawing(true);
            }}
            onMouseMove={(e) => {
              if (!isDrawing) return;
              const rect = containerRef.current.getBoundingClientRect();
              setCoords((prev) => ({
                ...prev,
                x2: e.clientX - rect.left,
                y2: e.clientY - rect.top,
              }));
            }}
            onMouseUp={() => setIsDrawing(false)}
          >
            {/* Display Video for Local, Image for IP Camera MJPEG stream */}
            {camType === "local" ? (
              <video
                autoPlay
                playsInline
                muted
                ref={(el) => el && (el.srcObject = localStream)}
              />
            ) : (
              <img
                src={camDetails.stream_url}
                alt="IP Stream"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            <div
              className="perimeter-box"
              style={{
                left: Math.min(coords.x1, coords.x2),
                top: Math.min(coords.y1, coords.y2),
                width: Math.abs(coords.x2 - coords.x1),
                height: Math.abs(coords.y2 - coords.y1),
              }}
            >
              <div className="box-label">RESTRICTED ZONE</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: MAIN GRID & POPUP (Unchanged)
  // ==========================================
  return (
    <div className="matrix-root">
      <header className="matrix-header">
        <div className="brand">
          <h1 className="matrix-title">Surveillance Matrix</h1>
          <p>Real-time Neural Perimeter Monitoring</p>
        </div>
        <div className="system-status">
          <div className="status-pill green-glow">
            <Activity size={14} /> Core: Online
          </div>
          <div className="status-pill blue-glow">
            Active Nodes:{" "}
            {cameras.length < 10 ? `0${cameras.length}` : cameras.length}/05
          </div>
        </div>
      </header>

      <div className="nodes-container">
        {cameras.map((cam) => (
          <div key={cam._id} className="camera-node-card">
            <div className="video-viewport">
              <img
                src={`${API_BASE}/stream/${cam._id}`}
                alt="Live Stream"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/640x360/0a0a0a/3b82f6?text=STREAM+OFFLINE")
                }
              />
              <div className="viewport-overlay">
                <span className="live-indicator">
                  <span className="pulse-dot"></span> LIVE
                </span>
              </div>
            </div>
            <div className="node-info-bar">
              <div className="text-content">
                <h3>{cam.name}</h3>
                <p>
                  <MapPin size={12} /> {cam.location}
                </p>
              </div>
              <div className="node-actions">
                <button
                  className="btn-circ primary"
                  onClick={() => openCameraPopup(cam)}
                >
                  <Maximize2 size={16} />
                </button>
                <button className="btn-circ danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {cameras.length < 5 && (
          <div className="add-node-placeholder" onClick={startConnectionWizard}>
            <div className="circle-plus">
              <Plus size={32} />
            </div>
            <h3>Initialize Node {cameras.length + 1}</h3>
            <span>Connect Integrated Hardware</span>
          </div>
        )}
      </div>

      {selectedCam && (
        <div className="modal-overlay">
          <div
            className={`modal-content ${isIntruding ? "modal-alert-active" : ""}`}
          >
            <div className="modal-header">
              <div className="modal-title">
                <Activity
                  size={20}
                  color={isIntruding ? "#ef4444" : "#10b981"}
                />
                <h3>
                  {selectedCam.name}{" "}
                  <span className="text-muted">| Live Analysis</span>
                </h3>
              </div>
              <button className="close-btn" onClick={closePopup}>
                <X size={28} />
              </button>
            </div>
            <div className="modal-video-container">
              <img
                src={`${API_BASE}/stream/${selectedCam._id}`}
                alt="Popup Feed"
                className="modal-video-feed"
              />
              {activeZone && (
                <div
                  className={`restricted-zone-overlay ${isIntruding ? "zone-breached" : ""}`}
                  style={{
                    left: Math.min(activeZone.x1, activeZone.x2),
                    top: Math.min(activeZone.y1, activeZone.y2),
                    width: Math.abs(activeZone.x2 - activeZone.x1),
                    height: Math.abs(activeZone.y2 - activeZone.y1),
                  }}
                >
                  <span className="zone-text-tag">
                    {isIntruding ? "BREACH DETECTED" : "RESTRICTED AREA"}
                  </span>
                </div>
              )}
              {isIntruding && (
                <div className="intruder-warning-banner">
                  <AlertOctagon size={24} /> UNAUTHORIZED PERSONNEL IN ZONE
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
