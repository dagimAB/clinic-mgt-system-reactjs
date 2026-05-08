import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaUsers, FaRobot } from "react-icons/fa";
import banner from "../../img/banner.png";
import "./MainPortal.css";

const MainPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="portal-container">
      <div className="portal-left">
        <img src={banner} alt="portal-banner" />
      </div>
      <div className="portal-right">
        <div className="portal-header">
          <h1>Welcome to SHMS</h1>
          <p>Student Health Management System</p>
        </div>
        
        <div className="portal-options">
          <div className="option-card" onClick={() => navigate("/queue")}>
            <div className="icon-wrapper queue-icon">
              <FaUsers />
            </div>
            <h2>View Queue</h2>
            <p>Check the current patient status and waiting list.</p>
            <button className="portal-btn">Open Queue</button>
          </div>

          <div className="option-card" onClick={() => navigate("/login")}>
            <div className="icon-wrapper login-icon">
              <FaUserShield />
            </div>
            <h2>Staff Login</h2>
            <p>Access the management dashboard (Doctors, Nurses, Admins).</p>
            <button className="portal-btn login-btn">Login Now</button>
          </div>

          <div className="option-card" onClick={() => navigate("/ai-assistant")}>
            <div className="icon-wrapper queue-icon">
              <FaRobot />
            </div>
            <h2>AI Assistant</h2>
            <p>Ask role-aware questions about SHMS workflows and get guided help.</p>
            <button className="portal-btn">Open Assistant</button>
          </div>
        </div>
        
        <div className="portal-footer">
          <p>© 2026 AASTU Student Health Center</p>
        </div>
      </div>
    </div>
  );
};

export default MainPortal;
