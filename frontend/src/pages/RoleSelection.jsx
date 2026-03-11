// frontend/src/pages/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);
    navigate(`/login/${role}`);
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <div className="role-header">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h1>Boy Scouts</h1>
          <p>Task Management System</p>
        </div>

        <h2 className="role-title">Select Your Role</h2>
        <p className="role-subtitle">Choose how you want to access the system</p>

        <div className="role-cards">
          <div 
            className="role-card role-card-admin"
            onClick={() => handleRoleSelect('admin')}
          >
            <div className="role-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3>Admin</h3>
            <p>Manage tasks, users, and system settings</p>
            <div className="role-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>

          <div 
            className="role-card role-card-scout"
            onClick={() => handleRoleSelect('scout')}
          >
            <div className="role-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>Scout</h3>
            <p>View and update assigned tasks</p>
            <div className="role-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;