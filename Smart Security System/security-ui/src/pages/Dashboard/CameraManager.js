import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  MapPin,
  Maximize2,
  Trash2,
  Activity,
  X,
  Wifi,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./CameraManager.css";
import { useNavigate } from "react-router-dom";

export default function CameraManager() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  // --- DYNAMIC DATA STATE ---
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:8000/api/cameras";

  // --- FETCH CAMERAS FROM BACKEND ---
  const fetchCameras = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCameras(res.data);
    } catch (err) {
      console.error("Matrix Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // --- DELETE NODE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to decommission this node?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCameras(); // Refresh list
    } catch (err) {
      alert("Failed to delete node.");
    }
  };

  return (
    <div className="matrix-root">
      {/* HEADER */}
      <button className="nav-back" onClick={() => navigate("/dashboard")}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <header className="matrix-header">
        <div className="brand">
          <h1 className="matrix-title">Surveillance Matrix</h1>
          <p>Real-time Monitoring UI</p>
        </div>
        <div className="system-status">
          <div className="status-pill green-glow">
            <Activity size={14} /> Core: {loading ? "Syncing..." : "Online"}
          </div>
          <div className="status-pill blue-glow">
            Active Nodes: {cameras.length}/05
          </div>
        </div>
      </header>

      {/* CAMERA GRID */}
      <div className="nodes-container">
        {cameras.map((cam) => (
          <div key={cam._id} className="camera-node-card">
            <div className="video-viewport">
              {/* Pointing to your YOLO FastAPI Stream */}
              <img
                src={`${API_BASE}/stream/${cam._id}`}
                alt={cam.name}
                className="matrix-stream-render"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/640x360/0a0a0a/3b82f6?text=NODE_OFFLINE";
                }}
              />
              <div className="viewport-overlay">
                <span className="live-indicator">
                  <span className="pulse-dot"></span> LIVE
                </span>
              </div>
            </div>

            <div className="node-info-bar">
              <div>
                <h3>{cam.name}</h3>
                <p>
                  <MapPin size={12} /> {cam.location}
                </p>
              </div>

              <div className="node-actions">
                <button
                  className="btn-circ primary"
                  onClick={() => navigate(`/dashboard/camera/view/${cam._id}`)}
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  className="btn-circ danger"
                  onClick={() => handleDelete(cam._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* ADD NODE PLACEHOLDER */}
        {!loading && cameras.length < 5 && (
          <div
            className="add-node-placeholder"
            onClick={() => setShowInstructions(true)}
          >
            <div className="circle-plus">
              <Plus size={32} />
            </div>
            <h3>Initialize Node</h3>
            <span>Connect Camera</span>
          </div>
        )}
      </div>

      {/* INSTRUCTION POPUP */}
      {showInstructions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Connect Mobile Camera</h3>
              <button
                className="close-x"
                onClick={() => setShowInstructions(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="instruction-modal-body">
              <div className="wifi-icon-container">
                <Wifi size={48} color="#3b82f6" />
                Setup
              </div>
              <ol>
                <li>Connect phone & laptop to same Wi-Fi</li>
                <li>
                  Install <b>IP Webcam</b> app on Android
                </li>
                <li>
                  Tap <b>'Start Server'</b> in the app
                </li>
                <li>Note down the IP address shown on screen</li>
              </ol>

              <button
                className="btn-deploy"
                onClick={() => navigate("/dashboard/camera/new")}
              >
                Continue Setup <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
