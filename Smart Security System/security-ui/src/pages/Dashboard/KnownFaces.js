import React, { useState } from "react";
import { UserPlus, UserCheck, Trash2 } from "lucide-react";
import "./KnownFaces.css"; // IMPORTANT: Import the CSS file
import { Navigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KnownFaces() {

  const navigate = useNavigate();
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
      <button className="nav-back" onClick={() => navigate("/dashboard")}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>
      <div className="page-header">
        <h2>Identity Database</h2>
        <p>Manage authorized personnel recognized by SecureAI</p>
      </div>

      <div className="stats-strip">
        <div className="stat-card upload-card">
          <UserPlus size={32} color="#3b82f6" />
          <div>
            <input type="file" id="face-upload" className="hidden-input" />
            <label htmlFor="face-upload" className="btn-primary">
              Register New Face
            </label>
          </div>
        </div>
      </div>

      <div className="faces-grid">
        {faces.map((face) => (
          <div key={face.id} className="stat-card face-card">
            <img src={face.img} alt={face.name} className="face-avatar" />
            <h3 className="face-name">{face.name}</h3>
            <span className="face-role">{face.role}</span>
            <button className="icon-btn delete-btn">
              <Trash2 size={16} /> Delete Identity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
