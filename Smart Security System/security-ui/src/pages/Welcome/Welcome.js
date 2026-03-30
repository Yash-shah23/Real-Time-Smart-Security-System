import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Database,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  XCircle,
  CheckCircle,
  Home,
  Factory,
  Store,
} from "lucide-react";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  // Carousel Data
  const demoVideos = [
    {
      id: 1,
      title: "Real-Time Object Detection",
      desc: "YOLOv8 identifying humans and filtering out background noise.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      id: 2,
      title: "Facial Identity Verification",
      desc: "Extracting 128-dimensional facial embeddings for instantaneous matching.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === demoVideos.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? demoVideos.length - 1 : prev - 1));

  return (
    <div>
      {/* HEADER */}
      <header className="main-header">
        <div className="brand-logo">
          SECURE<span>AI</span>
        </div>
        <button className="nav-login-btn" onClick={() => navigate("/login")}>
          Operator Login
        </button>
      </header>

      {/* SECTION 1: THE HERO (The Hook) */}
      <main
        className="section section-dark"
        style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}
      >
        <div className="hero-content">
          <h1>
            Active Defense.
            <br />
            Not Just Surveillance.
          </h1>
          <p className="hero-desc">
            Upgrade your physical security from passive recording to active
            prevention. SecureAI detects intruders, verifies identities, and
            triggers alerts in milliseconds using advanced Edge ML.
          </p>
          <button
            className="nav-login-btn"
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              background: "var(--primary)",
              color: "white",
            }}
            onClick={() => navigate("/login")}
          >
            Deploy Dashboard
          </button>
        </div>
      </main>

      {/* SECTION 2: THE PROBLEM (Traditional vs New) */}
      <section className="section section-light">
        <h2 className="section-title">The Flaw in Traditional CCTV</h2>
        <p className="section-subtitle">
          Why standard cameras are no longer enough for modern security needs.
        </p>

        <div className="comparison-container">
          <div className="compare-box compare-traditional">
            <h3 style={{ fontSize: "1.5rem", color: "#ef4444" }}>
              Traditional Systems
            </h3>
            <ul>
              <li>
                <XCircle color="#ef4444" size={20} />{" "}
                <strong>Passive Recording:</strong> Only useful for
                post-incident forensic review.
              </li>
              <li>
                <XCircle color="#ef4444" size={20} />{" "}
                <strong>Human Dependency:</strong> Requires guards to constantly
                monitor screens.
              </li>
              <li>
                <XCircle color="#ef4444" size={20} />{" "}
                <strong>False Alarms:</strong> Simple motion sensors are
                triggered by pets, shadows, or trees.
              </li>
            </ul>
          </div>

          <div className="compare-box compare-modern">
            <h3 style={{ fontSize: "1.5rem", color: "#10b981" }}>
              SecureAI System
            </h3>
            <ul>
              <li>
                <CheckCircle color="#10b981" size={20} />{" "}
                <strong>Proactive Alerts:</strong> Stops incidents before they
                escalate via instant SOS.
              </li>
              <li>
                <CheckCircle color="#10b981" size={20} />{" "}
                <strong>Autonomous Monitoring:</strong> AI never blinks, sleeps,
                or suffers from fatigue.
              </li>
              <li>
                <CheckCircle color="#10b981" size={20} />{" "}
                <strong>High Precision:</strong> Only alerts for unknown humans,
                ignoring authorized staff and pets.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (The Pipeline) */}
      <section className="section section-dark">
        <h2 className="section-title">System Architecture</h2>
        <p className="section-subtitle">
          A seamless, three-step automated pipeline executing at 30+ frames per
          second.
        </p>

        <div className="timeline">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Perimeter Breach</h3>
            <p>
              YOLOv8 continuously scans the video stream. If a human enters the
              dynamically drawn "Restricted Zone," the system locks on.
            </p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>Identity Extraction</h3>
            <p>
              The system crops the face and maps 128 unique data points,
              querying the local secure database to check if the user is
              authorized.
            </p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>Asynchronous Response</h3>
            <p>
              If unauthorized, an alarm triggers instantly, and the intruder's
              snapshot, timestamp, and location are logged directly to the
              database.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: UNIQUENESS / FEATURES */}
      <section className="section section-light">
        <h2 className="section-title">Our Unique Advantage</h2>
        <p className="section-subtitle">
          Built on cutting-edge computer vision protocols.
        </p>

        <div className="difference-grid">
          <div className="diff-card">
            <Eye className="diff-icon" size={40} />
            <h3>Spatial Filtering</h3>
            <p>
              Custom coordinates allow administrators to draw invisible walls.
              Activity outside the box is ignored, saving massive computational
              overhead.
            </p>
          </div>
          <div className="diff-card">
            <ShieldCheck className="diff-icon" size={40} />
            <h3>CUDA Accelerated</h3>
            <p>
              Engineered to utilize local GPU processing, ensuring zero-latency
              detection without relying on slow cloud-based API calls.
            </p>
          </div>
          <div className="diff-card">
            <Database className="diff-icon" size={40} />
            <h3>Immutable Logging</h3>
            <p>
              Every event is packaged into a structured data payload, creating
              an automated, searchable digital ledger of all physical access.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: VIDEO DEMONSTRATION */}
      <section className="section section-dark">
        <h2 className="section-title">Live Demonstration</h2>
        <p className="section-subtitle">
          Watch the computer vision models track and identify in real-time.
        </p>

        <div className="carousel-container">
          <div className="video-wrapper">
            <video
              key={demoVideos[currentSlide].videoUrl}
              className="demo-video"
              autoPlay
              loop
              muted
            >
              <source
                src={demoVideos[currentSlide].videoUrl}
                type="video/mp4"
              />
            </video>

            <div className="carousel-controls">
              <div className="carousel-info">
                <h3>{demoVideos[currentSlide].title}</h3>
                <p>{demoVideos[currentSlide].desc}</p>
              </div>
              <div className="carousel-btns">
                <button onClick={prevSlide}>
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide}>
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: DAILY USERS / MOTIVE */}
      <section className="section section-light">
        <h2 className="section-title">Real-World Applications</h2>
        <p className="section-subtitle">
          Designed to protect spaces that matter most to daily users.
        </p>

        <div className="users-grid">
          <div className="user-card">
            <Home
              size={40}
              color="var(--primary)"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3>Residential Security</h3>
            <p>
              Homeowners can secure backyards and driveways at night without
              getting woken up by stray cats or moving shadows.
            </p>
          </div>
          <div className="user-card">
            <Store
              size={40}
              color="var(--primary)"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3>Retail & Stores</h3>
            <p>
              Shop owners can restrict access to stockrooms, instantly logging
              any customer who wanders into employee-only zones.
            </p>
          </div>
          <div className="user-card">
            <Factory
              size={40}
              color="var(--primary)"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3>Industrial Zones</h3>
            <p>
              Factories can monitor hazardous areas, ensuring heavy machinery
              automatically halts if an unauthorized person gets too close.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER & FINAL CTA */}
      <footer className="main-footer">
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Ready to secure your perimeter?
          </h2>
          <button className="nav-login-btn" onClick={() => navigate("/login")}>
            Access Command Center
          </button>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "2rem",
          }}
        >
          <div
            className="brand-logo"
            style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}
          >
            SECURE<span>AI</span>
          </div>
          <p className="footer-text">Advanced Machine Learning Project</p>
          <p
            className="footer-text"
            style={{ fontSize: "0.8rem", opacity: 0.5 }}
          >
            © 2026 All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
