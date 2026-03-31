import React, { useState } from "react";
import {
  Plus,
  MapPin,
  Maximize2,
  Trash2,
  Activity,
  X,
  Smartphone,
  Wifi,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./CameraManager.css";
import { useNavigate } from "react-router-dom";

export default function CameraManager() {
  const [showInstructions, setShowInstructions] = useState(false);

  const navigate = useNavigate();
  // Dummy cameras (no backend)
  const cameras = [
    {
      _id: "1",
      name: "Front Gate",
      location: "Entrance",
    },
    {
      _id: "2",
      name: "Office Cam",
      location: "Main Hall",
    },
  ];

  

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
            <Activity size={14} /> Core: Online
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
              <img
                src="https://via.placeholder.com/640x360/0a0a0a/3b82f6?text=CAMERA"
                alt="Camera"
              />
              <div className="viewport-overlay">
                <span className="live-indicator">LIVE</span>
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
                <button className="btn-circ primary">
                  <Maximize2 size={16} />
                </button>
                <button className="btn-circ danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* ADD NODE */}
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
      </div>

      {/* INSTRUCTION POPUP */}
      {showInstructions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Connect Mobile Camera</h3>
              <button onClick={() => setShowInstructions(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <h4>
                <Wifi size={16} /> Steps:
              </h4>
              <ol>
                <li>Connect phone & laptop to same Wi-Fi</li>
                <li>Install IP Webcam app</li>
                <li>Start server</li>
                <li>Copy IP address</li>
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
