// frontend/src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import '../index.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.message);
      setHistory([]);
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

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
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
    const classes = {
      created: 'action-badge action-created',
      updated: 'action-badge action-updated',
      deleted: 'action-badge action-deleted',
      status_changed: 'action-badge action-status'
    };
    return classes[action] || 'action-badge';
  };

  const formatAction = (action) => {
    if (!action) return 'Unknown';
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filterByDate = (item) => {
    if (filterDate === 'all') return true;

    const itemDate = new Date(item.created_at);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterDate) {
      case 'today':
        return itemDate >= today;
      
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return itemDate >= monthAgo;
      
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return itemDate >= yearAgo;
      
      default:
        return true;
    }
  };

  const filteredHistory = Array.isArray(history) ? history.filter(item => {
    const matchesAction = filterAction === 'all' || item?.action_type === filterAction;
    const matchesDate = filterByDate(item);
    const matchesSearch = 
      item?.task_data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.performed_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.task_data?.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesDate && matchesSearch;
  }) : [];

  const handleViewTask = (item) => {
    setSelectedTask(item);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedTask(null);
  };

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
          .badge-created { background: #e8f5e9; color: #388e3c; }
          .badge-updated { background: #fff3e0; color: #f57c00; }
          .badge-deleted { background: #ffebee; color: #c62828; }
          .badge-status { background: #e3f2fd; color: #1976d2; }
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
          <h1>Task History Report</h1>
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
            <strong>Total Records:</strong> ${filteredHistory.length}
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
              <th>Task Title</th>
              <th>Performed By</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            ${filteredHistory.map(item => `
              <tr>
                <td>${formatFullDate(item.created_at)}</td>
                <td>
                  <span class="badge badge-${
                    item.action_type === 'created' ? 'created' :
                    item.action_type === 'updated' ? 'updated' :
                    item.action_type === 'deleted' ? 'deleted' :
                    'status'
                  }">
                    ${formatAction(item.action_type)}
                  </span>
                </td>
                <td>${item.task_data?.title || 'Untitled'}</td>
                <td>${item.performed_by_name || 'Unknown'}</td>
                <td>${item.task_data?.assigned_to_name || '-'}</td>
                <td>${item.task_data?.status?.toUpperCase() || '-'}</td>
                <td>${item.task_data?.priority?.toUpperCase() || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          This is an official task history report generated by the Boy Scout Task Management System
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-history-${new Date().toISOString().split('T')[0]}.html`;
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
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <h1>Task History</h1>
            </div>
            <p>View all task form copies and changes</p>
          </div>
          <button className="btn-create-user" onClick={downloadPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download History
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
              placeholder="Search by task, user, or assignee..."
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
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="status_changed">Status Changed</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <div className="stat-value">{filteredHistory.length}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <div>
              <div className="stat-value">{filteredHistory.filter(h => h.action_type === 'created').length}</div>
              <div className="stat-label">Created</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <div>
              <div className="stat-value">{filteredHistory.filter(h => h.action_type === 'updated' || h.action_type === 'status_changed').length}</div>
              <div className="stat-label">Updated</div>
            </div>
          </div>

          <div className="stat-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <div>
              <div className="stat-value">{filteredHistory.filter(h => h.action_type === 'deleted').length}</div>
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
            <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Error Loading History</h2>
            <p style={{ color: '#666' }}>{error}</p>
          </div>
        )}

        {/* History Table */}
        {!error && loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Loading history...</h2>
          </div>
        ) : !error && filteredHistory.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h2>No history found</h2>
            <p>Task history will appear here once tasks are created or modified</p>
          </div>
        ) : !error && (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Task Title</th>
                  <th>Performed By</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td>
                      <span className={getActionBadgeClass(item.action_type)}>
                        {formatAction(item.action_type)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                        {item.task_data?.title || 'Untitled Task'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {item.performed_by_name || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {item.task_data?.assigned_to_name || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${item.task_data?.status || 'ongoing'}`}>
                        {item.task_data?.status?.toUpperCase() || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`card-priority priority-${item.task_data?.priority || 'medium'}`}>
                        {item.task_data?.priority?.toUpperCase() || '-'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleViewTask(item)}
                        title="View Details"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Task Details Modal */}
      {isViewModalOpen && selectedTask && (
        <div className="modal-overlay active" onClick={handleCloseModal}>
          <div className="modal-content modal-task-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>TASK HISTORY DETAILS</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <div className="modal-body-grid">
              {/* Left Column */}
              <div className="form-left">
                <div className="form-group">
                  <label>TASK TITLE:</label>
                  <div className="form-input" style={{ background: '#f9f9f9', cursor: 'default' }}>
                    {selectedTask.task_data?.title || 'Untitled'}
                  </div>
                </div>

                <div className="form-group">
                  <label>DESCRIPTION:</label>
                  <div className="form-textarea" style={{ background: '#f9f9f9', cursor: 'default', minHeight: '100px', padding: '12px' }}>
                    {selectedTask.task_data?.description || 'No description'}
                  </div>
                </div>

                <div className="form-row-inline">
                  <div className="form-group">
                    <label>ASSIGNED TO:</label>
                    <div className="form-input" style={{ background: '#f9f9f9', cursor: 'default' }}>
                      {selectedTask.task_data?.assigned_to_name || '-'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>PRIORITY:</label>
                    <div className="form-input" style={{ background: '#f9f9f9', cursor: 'default' }}>
                      {selectedTask.task_data?.priority?.toUpperCase() || '-'}
                    </div>
                  </div>
                </div>

                <div className="form-row-inline">
                  <div className="form-group">
                    <label>DUE DATE:</label>
                    <div className="form-input" style={{ background: '#f9f9f9', cursor: 'default' }}>
                      {selectedTask.task_data?.due_date ? new Date(selectedTask.task_data.due_date).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>CATEGORY:</label>
                    <div className="form-input" style={{ background: '#f9f9f9', cursor: 'default' }}>
                      {selectedTask.task_data?.category?.toUpperCase() || '-'}
                    </div>
                  </div>
                </div>

                {selectedTask.task_data?.notes && (
                  <div className="form-group">
                    <label>ADDITIONAL NOTES:</label>
                    <div className="form-textarea" style={{ background: '#f9f9f9', cursor: 'default', minHeight: '80px', padding: '12px' }}>
                      {selectedTask.task_data.notes}
                    </div>
                  </div>
                )}

                <div className="signature-section">
                  <div className="signature-group">
                    <label>PERFORMED BY:</label>
                    <div className="created-by-name">
                      {selectedTask.performed_by_name?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="signature-line"></div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="form-right">
                <div className="summary-box">
                  <div className="summary-row">
                    <span className="summary-label">ACTION TYPE:</span>
                    <span className={getActionBadgeClass(selectedTask.action_type)}>
                      {formatAction(selectedTask.action_type)}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">TIMESTAMP:</span>
                    <span className="summary-value">
                      {formatFullDate(selectedTask.created_at)}
                    </span>
                  </div>
                  <div className="summary-divider"></div>
                  
                  <div className="task-summary-info">
                    <h3>Task Details</h3>
                    
                    <div className="summary-item">
                      <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <div>
                        <div className="summary-item-label">Status</div>
                        <div className="summary-item-value">
                          {selectedTask.task_data?.status?.toUpperCase() || '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-item">
                      <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <div>
                        <div className="summary-item-label">Priority</div>
                        <div className="summary-item-value">
                          {selectedTask.task_data?.priority?.toUpperCase() || '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="summary-item">
                      <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      <div>
                        <div className="summary-item-label">Category</div>
                        <div className="summary-item-value">
                          {selectedTask.task_data?.category?.charAt(0).toUpperCase() + selectedTask.task_data?.category?.slice(1) || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="button" className="btn-save" onClick={handleCloseModal}>
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;