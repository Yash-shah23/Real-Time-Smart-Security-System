import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  FileText,
  Clock,
  ShieldAlert,
  LogIn,
  HardDrive,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import "./ActivityLogs.css";
import { useNavigate } from "react-router-dom";

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/api/cameras/logs/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLogs(res.data);
        console.log("LOGS RECEIVED FROM DB:", res.data);
      } catch (err) {
        console.error("Log fetch failed", err);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "intrusion":
        return <ShieldAlert size={18} className="icon-red" />;
      case "auth":
        return <LogIn size={18} className="icon-blue" />;
      case "system":
        return <HardDrive size={18} className="icon-green" />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <div className="sub-page">
      <button className="nav-back" onClick={() => navigate("/dashboard")}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>
      <div className="page-header">
        <h2>Security Activity Logs</h2>
        <p>Audit trail of all neural detections and system events</p>
      </div>

      <div className="log-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by location, event or timestamp..."
          />
        </div>
        <button className="filter-btn">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Event</th>
              <th>Location</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="log-row">
                <td>{getIcon(log.type)}</td>
                <td className="font-bold">{log.event}</td>
                <td>{log.location}</td>
                <td className="text-muted">
                  <Clock size={12} /> {log.time}
                </td>
                <td>
                  <span
                    className={`status-tag tag-${log.status.toLowerCase()}`}
                  >
                    {log.status}
                  </span>
                </td>
                <td>
                  {log.snapshot_url ? (
                    <a
                      href={`http://localhost:8000/${log.snapshot_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-snap-link"
                    >
                      <ImageIcon size={18} /> View Snap
                    </a>
                  ) : (
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      No Image
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
