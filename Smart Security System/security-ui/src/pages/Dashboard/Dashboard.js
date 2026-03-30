import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  ShieldAlert,
  Users,
  Settings,
  LogOut,
  Bell,
  Activity,
  Zap,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [systemUptime, setUptime] = useState("00:00:00");

  // Simple timer effect for "Professional" feel
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUptime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* LEFT SIDEBAR - Persistent Navigation */}
      <aside className="sidebar-container">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShieldAlert size={28} />
          </div>
          <div className="brand-text">
            SECURE<span>AI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Main Menu</p>
          <NavLink to="/dashboard/cameras" className="nav-link-item">
            <Camera size={20} /> <span>Live Monitors</span>
          </NavLink>
          <NavLink to="/dashboard/logs" className="nav-link-item">
            <Activity size={20} /> <span>Activity Logs</span>
          </NavLink>
          <NavLink to="/dashboard/faces" className="nav-link-item">
            <Users size={20} /> <span>Face Database</span>
          </NavLink>

          <p className="nav-label" style={{ marginTop: "2rem" }}>
            Security
          </p>
          <NavLink to="/dashboard/config" className="nav-link-item">
            <Zap size={20} /> <span>SOS Config</span>
          </NavLink>
          <NavLink to="/dashboard/settings" className="nav-link-item">
            <Settings size={20} /> <span>Preferences</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => navigate("/login")}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-viewport">
        {/* TOP HEADER - Interactive Status Bar */}
        <header className="viewport-header">
          <div className="header-search">
            <span className="pulse-indicator"></span>
            <span className="status-text">System Live: {systemUptime}</span>
          </div>

          <div className="header-actions">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="notif-count">3</span>
            </div>
            <div className="user-profile">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yash"
                alt="user"
              />
              <div className="user-info">
                <span className="user-name">Yash Shah</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <div className="content-scroller">
          {/* Dashboard Stats Ribbon */}
          <section className="stats-ribbon">
            <div className="mini-stat-card elevated">
              <p>Active Cameras</p>
              <h3>04 / 05</h3>
              <div className="stat-progress">
                <div className="bar" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div className="mini-stat-card elevated alert-bg">
              <p>Threats Blocked</p>
              <h3>00</h3>
              <span>-0 today</span>
            </div>
            <div className="mini-stat-card elevated">
              <p>Recognized Faces</p>
              <h3>00</h3>
              <span>Database Sync</span>
            </div>
          </section>

          {/* This is where sub-pages render */}
          <div className="page-render-area">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
