import React, { useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Clock,
  ShieldAlert,
  LogIn,
  HardDrive,
  ChevronLeft,
} from "lucide-react";
import "./ActivityLogs.css";
import { useNavigate } from "react-router-dom";

export default function ActivityLogs() {

    const navigate = useNavigate();
  // Mock data representing your System_Logs and Alerts collections
  const [logs] = useState([
    {
      id: 1,
      type: "intrusion",
      event: "Human Detected",
      location: "North Entrance",
      time: "2026-03-31 10:15:22",
      status: "Critical",
    },
    {
      id: 2,
      type: "system",
      event: "Node Initialized",
      location: "Lobby Cam 01",
      time: "2026-03-31 09:45:10",
      status: "Info",
    },
    {
      id: 3,
      type: "auth",
      event: "User Login",
      location: "Admin Panel",
      time: "2026-03-31 08:30:05",
      status: "Success",
    },
    {
      id: 4,
      type: "intrusion",
      event: "Human Detected",
      location: "Server Room",
      time: "2026-03-31 02:12:45",
      status: "Critical",
    },
    {
      id: 5,
      type: "system",
      event: "Privacy Policy Accepted",
      location: "Setup Wizard",
      time: "2026-03-30 22:15:10",
      status: "Info",
    },
  ]);

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
              <th>Location / Source</th>
              <th>Timestamp</th>
              <th>Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
