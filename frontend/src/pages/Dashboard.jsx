// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import '../index.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-container">
        <Navbar />
        <div className="main-content">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Loading dashboard...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-container">
      <Navbar />
      
      <div className="main-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <h1>Dashboard</h1>
          </div>
          <p>Overview of all tasks and activities</p>
        </div>

        <div className="dashboard-grid">
          {/* Summary Cards */}
          <div className="stats-card stats-card-total">
            <div className="stats-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>{stats?.total_tasks || 0}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stats-card stats-card-ongoing">
            <div className="stats-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>{stats?.ongoing || 0}</h3>
              <p>Ongoing</p>
            </div>
          </div>

          <div className="stats-card stats-card-done">
            <div className="stats-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>{stats?.done || 0}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stats-card stats-card-cancelled">
            <div className="stats-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>{stats?.cancelled || 0}</h3>
              <p>Cancelled</p>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <h2>Priority Breakdown (Ongoing)</h2>
            </div>
            <div className="priority-bars">
              <div className="priority-bar">
                <div className="priority-label">
                  <span className="priority-dot priority-high"></span>
                  High Priority
                </div>
                <div className="priority-value">{stats?.high_priority || 0}</div>
              </div>
              <div className="priority-bar">
                <div className="priority-label">
                  <span className="priority-dot priority-medium"></span>
                  Medium Priority
                </div>
                <div className="priority-value">{stats?.medium_priority || 0}</div>
              </div>
              <div className="priority-bar">
                <div className="priority-label">
                  <span className="priority-dot priority-low"></span>
                  Low Priority
                </div>
                <div className="priority-value">{stats?.low_priority || 0}</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <h2>Tasks by Category</h2>
            </div>
            <div className="category-grid">
              <div className="category-item">
                <svg className="category-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="category-name">Camping</span>
                <span className="category-count">{stats?.by_category?.camping || 0}</span>
              </div>
              <div className="category-item">
                <svg className="category-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span className="category-name">Training</span>
                <span className="category-count">{stats?.by_category?.training || 0}</span>
              </div>
              <div className="category-item">
                <svg className="category-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="category-name">Community</span>
                <span className="category-count">{stats?.by_category?.community || 0}</span>
              </div>
              <div className="category-item">
                <svg className="category-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <span className="category-name">Admin</span>
                <span className="category-count">{stats?.by_category?.admin || 0}</span>
              </div>
              <div className="category-item">
                <svg className="category-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="category-name">Other</span>
                <span className="category-count">{stats?.by_category?.other || 0}</span>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="dashboard-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <h2>Performance Metrics</h2>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2" style={{ marginBottom: '10px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div className="metric-value">{stats?.completion_rate || 0}%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
              <div className="metric-item">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" style={{ marginBottom: '10px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <div className="metric-value">{stats?.overdue || 0}</div>
                <div className="metric-label">Overdue Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;