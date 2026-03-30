import React, { useState } from "react";
import { UserPlus, UserCheck, Trash2 } from "lucide-react";

export default function KnownFaces() {
  const [faces, setFaces] = useState([
    {
      id: 1,
      name: "Yash Shah",
      role: "Admin",
      img: "https://via.placeholder.com/150",
    },
  ]);

  return (
    <div className="sub-page">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h2>Identity Database</h2>
        <p style={{ color: "#94a3b8" }}>
          Manage authorized personnel recognized by SecureAI
        </p>
      </div>

      <div className="stats-strip">
        <div
          className="stat-card"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <UserPlus size={32} color="#3b82f6" />
          <input type="file" style={{ display: "none" }} id="face-upload" />
          <label
            htmlFor="face-upload"
            className="btn-primary"
            style={{ cursor: "pointer" }}
          >
            Register New Face
          </label>
        </div>
      </div>

      <div
        className="faces-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {faces.map((face) => (
          <div
            key={face.id}
            className="stat-card"
            style={{ textAlign: "center" }}
          >
            <img
              src={face.img}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                marginBottom: "1rem",
                border: "2px solid #3b82f6",
              }}
              alt="face"
            />
            <h3 style={{ fontSize: "1rem" }}>{face.name}</h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                marginBottom: "1rem",
              }}
            >
              {face.role}
            </p>
            <button className="icon-btn" style={{ color: "#ef4444" }}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
