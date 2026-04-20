import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
  BadgeHelp,
  ShieldCheck,
  Cpu,
  HardDrive,
  BarChart3,
  ToggleRight,
  Radio,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [isAlarmArmed, setIsAlarmArmed] = useState(true);

  // Check if we are on the base dashboard route to show the "Overview"
  const isOverview =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  useEffect(() => {
    const timer = setInterval(
      () => setSystemTime(new Date().toLocaleTimeString()),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar-container">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck size={28} color="#3b82f6" />
          </div>
          <div className="brand-text">
            SECURE<span>AI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">General</p>
          <NavLink to="/dashboard" end className="nav-link-item">
            <LayoutDashboard size={20} /> <span>System Overview</span>
          </NavLink>
          <NavLink to="/dashboard/cameras" className="nav-link-item">
            <Camera size={20} /> <span>Live Monitors</span>
          </NavLink>

          <p className="nav-label">Intelligence</p>
          <NavLink to="/dashboard/KnownFaces" className="nav-link-item">
            <Users size={20} /> <span>Face Database</span>
          </NavLink>
          <NavLink to="/dashboard/ActivityLogs" className="nav-link-item">
            <Activity size={20} /> <span>Security Logs</span>
          </NavLink>

          <p className="nav-label">Help & Support</p>
          <NavLink to="/SupportPage" className="nav-link-item" >
            <BadgeHelp size={20} /> <span>Help center Logs</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => navigate("/login")}>
            <LogOut size={18} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN VIEWPORT --- */}
      <main className="main-viewport">
        <header className="viewport-header">
          <div className="header-left">
            <div className="uptime-tag">
              <span className="pulse-indicator"></span>
              NODE_ACTIVE: {systemTime}
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="bell">
                <Bell size={20} />
              </div>
              <div className="user-text">
                <span className="u-name">Yash Shah</span>
                <span className="u-role">System Administrator</span>
              </div>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yash"
                alt="avatar"
              />
            </div>
          </div>
        </header>

        <div className="content-scroller">
          {isOverview ? (
            <div className="overview-content">
              {/* Top Stats Ribbon */}
              <section className="stats-grid">
                <div className="stat-card-new">
                  <div className="stat-icon blue">
                    <Camera size={24} />
                  </div>
                  <div className="stat-data">
                    <h3>01 / 05</h3>
                    <p>Active Streams</p>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-icon green">
                    <Cpu size={24} />
                  </div>
                  <div className="stat-data">
                    <h3>12ms</h3>
                    <p>Avg. Inference</p>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-icon purple">
                    <HardDrive size={24} />
                  </div>
                  <div className="stat-data">
                    <h3>98.2%</h3>
                    <p>Storage Health</p>
                  </div>
                </div>
                <div className="stat-card-new">
                  <div className="stat-icon red">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="stat-data">
                    <h3>00</h3>
                    <p>Threats Today</p>
                  </div>
                </div>
              </section>

              <div className="analytics-row">
                {/* Visual Graph Placeholder */}
                <div className="graph-container glass-card">
                  <div className="card-header-flex">
                    <h4>
                      <BarChart3 size={18} /> Neural Load (Real-time)
                    </h4>
                    <Radio size={16} className="pulse-text" color="#ef4444" />
                  </div>
                  <div className="visual-graph">
                    {/* Simplified CSS Graph for Demo */}
                    <div className="bar-chart-mock">
                      <div
                        className="chart-bar"
                        style={{ height: "40%" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "70%" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "55%" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "90%" }}
                      ></div>
                      <div
                        className="chart-bar"
                        style={{ height: "65%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Quick Settings Panel */}
                <div className="quick-actions glass-card">
                  <h4>Quick Controls </h4>
                  <div className="action-item">
                    <div className="action-info">
                      <span>Master Alarm System</span>
                      <p>Global buzzer arm/disarm</p>
                    </div>
                    <button
                      className={`toggle-pill ${isAlarmArmed ? "on" : ""}`}
                      onClick={() => setIsAlarmArmed(!isAlarmArmed)}
                    >
                      {isAlarmArmed ? "ARMED" : "OFF"}
                    </button>
                  </div>
                  <div className="action-item">
                    <div className="action-info">
                      <span>High Sensitivity</span>
                      <p>Boost YOLO confidence</p>
                    </div>
                    <button className="toggle-pill">OFF</button>
                  </div>
                  <div className="action-item">
                    <div className="action-info">
                      <span>Cloud Sync</span>
                      <p>Push logs to Twilio</p>
                    </div>
                    <button className="toggle-pill on">ON</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="page-render-area">
              <Outlet />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
