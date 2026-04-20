import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./CameraView.css";

export default function CameraView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState(null);
  const [status, setStatus] = useState({ intruder: false });
  const [loading, setLoading] = useState(true);
  const [isArmed, setIsArmed] = useState(false);

  const wsRef = useRef(null);
  const wasIntruding = useRef(false);
  const audioRef = useRef(new Audio("/buzzer.mp3"));

  const playBuzzer = () => {
    audioRef.current.play().catch((err) => console.log("Audio blocked:", err));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const initNode = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/cameras/${id}`, {
          headers,
        });
        setCamera(res.data);
        setStatus({ intruder: res.data.intruder_detected || false });
        wasIntruding.current = res.data.intruder_detected || false;
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initNode();

    const ws = new WebSocket(
      `ws://localhost:8000/api/cameras/ws/camera/${id}?token=${token}`,
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Data Received:", data); // Check this in F12 Console

      setStatus({ intruder: data.intruder });

      if (data.intruder && isArmed && !wasIntruding.current) {
        playBuzzer();
        wasIntruding.current = true;
      }

      if (!data.intruder) {
        wasIntruding.current = false;
      }
    };

    return () => ws.close();
  }, [id, isArmed]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!camera) return <div>Camera Not Found</div>;

  const zone = camera.zone?.coordinates;

  return (
    <div className="camera-view-root">
      <div className="view-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ChevronLeft size={20} /> Dashboard
        </button>
        <h1>{camera.name}</h1>

        <button
          className={`status-badge ${isArmed ? "danger" : "success"}`}
          onClick={() => setIsArmed(!isArmed)}
        >
          {isArmed ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span>{isArmed ? "ALARM ARMED" : "ALARM SILENT"}</span>
        </button>

        <div
          className={`status-badge ${status.intruder ? "danger" : "success"}`}
        >
          {status.intruder ? (
            <ShieldAlert size={20} />
          ) : (
            <ShieldCheck size={20} />
          )}
          <span>{status.intruder ? "BREACHED" : "SECURE"}</span>
        </div>
      </div>

      <div className="viewport">
        <div className="video-container">
          <img
            src={`http://localhost:8000/api/cameras/stream/${id}?t=${Date.now()}`}
            className="full-stream-render"
          />
          {zone && (
            <div
              style={{
                position: "absolute",
                left: `${zone.x1 * 100}%`,
                top: `${zone.y1 * 100}%`,
                width: `${(zone.x2 - zone.x1) * 100}%`,
                height: `${(zone.y2 - zone.y1) * 100}%`,
                border: "2px solid red",
                background: status.intruder
                  ? "rgba(255,0,0,0.3)"
                  : "rgba(255,0,0,0.1)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
