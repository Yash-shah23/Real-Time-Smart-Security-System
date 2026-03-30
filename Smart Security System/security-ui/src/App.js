import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome/Welcome";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register"; // Import it here
import Dashboard from "./pages/Dashboard/Dashboard";
import CamaraManager from "./pages/Dashboard/CameraManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cameras" element={<CamaraManager />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
