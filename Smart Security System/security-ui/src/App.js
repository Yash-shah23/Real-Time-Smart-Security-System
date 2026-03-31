import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome/Welcome";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register"; // Import it here
import Dashboard from "./pages/Dashboard/Dashboard";
import CamaraManager from "./pages/Dashboard/CameraManager";

import KnownFaces from "./pages/Dashboard/KnownFaces";
import ActivityLogs from "./pages/Dashboard/ActivityLogs";
import SOSConfig from "./pages/Dashboard/SOSconfig";
import TwilioConfig from "./pages/Dashboard/TwilioConfig";
import SupportPage from "./pages/Dashboard/SupportPage";
import HardwareInitialization from "./pages/Dashboard/HardwareInitialization";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/cameras" element={<CamaraManager />} />
        <Route path="/dashboard/KnownFaces" element={<KnownFaces />} />
        <Route path="/dashboard/ActivityLogs" element={<ActivityLogs />} />
        <Route path="/dashboard/SOSconfig" element={<SOSConfig />} />
        <Route path="/dashboard/TwilioConfig" element={<TwilioConfig />} />
        <Route path="/SupportPage" element={<SupportPage />} />
        <Route path="/dashboard/camera/new" element={<HardwareInitialization />}
        />
      </Routes>
    </Router>
  );
}

export default App;
