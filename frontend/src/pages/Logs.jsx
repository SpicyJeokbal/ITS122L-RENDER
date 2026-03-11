// frontend/src/pages/Logs.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import '../index.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Otherwise show full date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action) => {
    if (!action) return 'log-badge';
    if (action.includes('login')) return 'log-badge log-login';
    if (action.includes('logout')) return 'log-badge log-logout';
    if (action.includes('create')) return 'log-badge log-create';
    if (action.includes('delete')) return 'log-badge log-delete';
    if (action.includes('update') || action.includes('edit')) return 'log-badge log-update';
    return 'log-badge';
  };

  const formatAction = (action) => {
    if (!action) return 'Unknown';
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionDescription = (log) => {
    const action = log.action || '';
    const userName = log.user_name || 'Unknown User';
    const targetName = log.target_name || '';
    
    if (action.includes('login')) {
      return `${userName} logged in`;
    }
    if (action.includes('logout')) {
      return `${userName} logged out`;
    }
    if (action.includes('create_user')) {
      return `${userName} created user: ${targetName}`;
    }
    if (action.includes('update_user')) {
      return `${userName} updated user: ${targetName}`;
    }
    if (action.includes('delete_user')) {
      return `${userName} deleted user: ${targetName}`;
    }
    if (action.includes('create_task')) {
      return `${userName} created task: ${targetName}`;
    }
    if (action.includes('update_task')) {
      return `${userName} updated task: ${targetName}`;
    }
    if (action.includes('delete_task')) {
      return `${userName} deleted task: ${targetName}`;
    }
    
    return `${userName} performed action on ${targetName || 'system'}`;
  };

  const filterByDate = (log) => {
    if (filterDate === 'all') return true;

    const logDate = new Date(log.created_at);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterDate) {
      case 'today':
        return logDate >= today;
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return logDate >= monthAgo;
      
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return logDate >= yearAgo;
      
      default:
        return true;
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const matchesAction = filterAction === 'all' || log?.action === filterAction;
    const matchesDate = filterByDate(log);
    const matchesSearch = 
      log?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log?.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log?.target_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesDate && matchesSearch;
  }) : [];

  const downloadPDF = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #2c5f2d;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c5f2d;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            font-size: 13px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
          }
          tr:hover {
            background: #fafafa;
          }
          .badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
          }
          .badge-login { background: #e8f5e9; color: #388e3c; }
          .badge-logout { background: #ffebee; color: #c62828; }
          .badge-create { background: #e3f2fd; color: #1976d2; }
          .badge-update { background: #fff3e0; color: #f57c00; }
          .badge-delete { background: #ffebee; color: #e74c3c; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 11px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Activity Logs Report</h1>
          <p>Boy Scouts of the Philippines - Parañaque City Council</p>
        </div>

        <div class="meta">
          <div>
            <strong>Generated:</strong> ${new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div>
            <strong>Total Logs:</strong> ${filteredLogs.length}
          </div>
          <div>
            <strong>Filter:</strong> ${filterDate === 'all' ? 'All Time' : filterDate.charAt(0).toUpperCase() + filterDate.slice(1)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Description</th>
              <th>User</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td>${formatFullDate(log.created_at)}</td>
                <td>
                  <span class="badge badge-${
                    log.action?.includes('login') ? 'login' :
                    log.action?.includes('logout') ? 'logout' :
                    log.action?.includes('create') ? 'create' :
                    log.action?.includes('delete') ? 'delete' :
                    'update'
                  }">
                    ${formatAction(log.action)}
                  </span>
                </td>
                <td>${getActionDescription(log)}</td>
                <td>${log.user_name || 'Unknown'}</td>
                <td style="font-family: monospace; font-size: 11px;">${log.ip_address || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          This is an official activity log report generated by the Boy Scout Task Management System
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="workspace-container">
      <Navbar />
      
      <div className="main-content">
        <div className="admin-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h1>Activity Logs</h1>
            </div>
            <p>Track all system activities and user actions</p>
          </div>
          <button className="btn-create-user" onClick={downloadPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Logs
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className="logs-filters">
          <div className="filter-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </label>
            <input
              type="text"
              className="search-input"
              placeholder="Search by user, action, or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Time Period
            </label>
            <select
              className="filter-select"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
              <option value="register">Register</option>
              <option value="reset_password">Reset Password</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Action Type
            </label>
            <select
              className="filter-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create_user">Create User</option>
              <option value="update_user">Update User</option>
              <option value="delete_user">Delete User</option>
              <option value="create_task">Create Task</option>
              <option value="update_task">Update Task</option>
              <option value="delete_task">Delete Task</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <div>
              <div className="stat-value">{filteredLogs.length}</div>
              <div className="stat-label">Total Logs</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <div>
              <div className="stat-value">{filteredLogs.filter(l => l.action?.includes('login')).length}</div>
              <div className="stat-label">Logins</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <div>
              <div className="stat-value">{filteredLogs.filter(l => l.action?.includes('create')).length}</div>
              <div className="stat-label">Created</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <div>
              <div className="stat-value">{filteredLogs.filter(l => l.action?.includes('delete')).length}</div>
              <div className="stat-label">Deleted</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" style={{ marginBottom: '15px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Error Loading Logs</h2>
            <p style={{ color: '#666' }}>{error}</p>
          </div>
        )}

        {/* Logs Table */}
        {!error && loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Loading logs...</h2>
          </div>
        ) : !error && filteredLogs.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h2>No logs found</h2>
            <p>No activity logs match your current filters</p>
          </div>
        ) : !error && (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Target</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {getActionDescription(log)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                        {log.user_name || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {log.target_name || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#999', fontFamily: 'monospace' }}>
                        {log.ip_address || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;