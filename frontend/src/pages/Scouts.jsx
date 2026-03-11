// frontend/src/pages/Scouts.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import '../index.css';

const Scouts = () => {
  const [scouts, setScouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScouts();
  }, []);

  const fetchScouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/users/scouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      console.log('Scouts API Response:', data); // Debug log
      
      if (data.success) {
        setScouts(data.scouts);
      }
    } catch (error) {
      console.error('Error fetching scouts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-container">
      <Navbar />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h1>Scouts Directory</h1>
          </div>
          <p>View all registered scouts and their information</p>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2" style={{ marginBottom: '20px', animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <h2>Loading scouts...</h2>
          </div>
        ) : scouts.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h2>No scouts registered yet</h2>
            <p>Scouts will appear here once they register</p>
          </div>
        ) : (
          <div className="scouts-grid">
            {scouts.map(scout => (
              <div key={scout.id} className="scout-card">
                <div className="scout-avatar">
                  {(scout.first_name?.charAt(0) || '?').toUpperCase()}
                  {(scout.last_name?.charAt(0) || '?').toUpperCase()}
                </div>
                <div className="scout-info">
                  <h3>
                    {scout.first_name || 'Unknown'} {scout.last_name || 'User'}
                  </h3>
                  <div className="scout-email">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', flexShrink: 0 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {scout.email || 'No email'}
                  </div>
                  <div className="scout-meta">
                    <span className="scout-role">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      Scout
                    </span>
                    {scout.created_at && (
                      <span className="scout-joined">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Joined: {new Date(scout.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scouts;