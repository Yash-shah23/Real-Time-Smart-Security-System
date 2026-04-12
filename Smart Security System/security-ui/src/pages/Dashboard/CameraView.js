import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import "./CameraView.css";

export default function CameraView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState(null);
  const [status, setStatus] = useState({ intruder: false });
  const [loading, setLoading] = useState(true);

  const wsRef = useRef(null);
  const wasIntruding = useRef(false);

  // 🔊 Buzzer
  const playBuzzer = () => {
    const audio = new Audio("/buzzer.mp3");
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // 🔹 INITIAL LOAD
    const initNode = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/cameras/${id}`, {
          headers,
        });
        
        setCamera(res.data);

        // initial state
        setStatus({ intruder: res.data.intruder_detected || false });
        wasIntruding.current = res.data.intruder_detected || false;
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initNode();

    // 🔥 WEBSOCKET CONNECTION
    const ws = new WebSocket(`ws://localhost:8000/ws/camera/${id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setStatus({ intruder: data.intruder });

        // 🔊 trigger only once
        if (data.intruder && !wasIntruding.current) {
          playBuzzer();
        }

        wasIntruding.current = data.intruder;
      } catch (err) {
        console.error("WS Parse Error", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket Closed");
    };

    return () => {
      ws.close();
    };
  }, [id]);

  if (loading)
    return (
      <div className="loading-screen">
        <h2>Initializing Neural Link...</h2>
        <div className="loader"></div>
      </div>
    );

  if (!camera) return <div className="error-screen">Node Not Found</div>;

  const zone = camera.zone?.coordinates;

  return (
    <div className="camera-view-root">
      <div className="view-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ChevronLeft size={20} /> Matrix Dashboard
        </button>

        <div className="node-meta">
          <h1>{camera.name || "Camera Node"}</h1>
          <p>{camera.location}</p>
        </div>

        <div
          className={`status-badge ${status.intruder ? "danger" : "success"}`}
        >
          {status.intruder ? (
            <ShieldAlert size={20} />
          ) : (
            <ShieldCheck size={20} />
          )}
          <span>{status.intruder ? "CRITICAL BREACH" : "SECURE"}</span>
        </div>
      </div>

      <div className="viewport">
        <div className="video-container" style={{ position: "relative" }}>
          {/* 🔴 FULLSCREEN STREAM */}
          <img
            src={`http://localhost:8000/api/cameras/stream/${id}`}
            alt="AI Stream"
            className="full-stream-render"
          />

          {/* 🔴 ZONE OVERLAY (FIXED & SCALED) */}
          {zone && (
            <div
              style={{
                position: "absolute",
                left: `${zone.x1 * 100}%`,
                top: `${zone.y1 * 100}%`,
                width: `${(zone.x2 - zone.x1) * 100}%`,
                height: `${(zone.y2 - zone.y1) * 100}%`,
                background: "rgba(255, 0, 0, 0.2)",
                border: "2px solid red",
                pointerEvents: "none",
              }}
            />
          )}

          {/* 🔴 UI OVERLAY */}
          <div className="overlay-elements">
            <div className="rec-dot"></div>
            <span className="timestamp">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
