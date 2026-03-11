// frontend/src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, status, scouts, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    category: 'other',
    notes: '',
    status: status || 'ongoing'
  });

  const [isReadOnly, setIsReadOnly] = useState(false);

  // Debug: Log scouts data
  useEffect(() => {
    console.log('Scouts data:', scouts);
  }, [scouts]);

  useEffect(() => {
    if (task) {
      // View mode - populate with task data
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        category: task.category || 'other',
        notes: task.notes || '',
        status: task.status || 'ongoing'
      });
      setIsReadOnly(true);
    } else {
      // Create mode
      setFormData(prev => ({ ...prev, status }));
    }
  }, [task, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReadOnly) {
      onSubmit(formData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAssignedScoutName = () => {
    if (!formData.assigned_to) {
      return 'Entire Organization';
    }
    const scout = scouts.find(s => s.id === formData.assigned_to);
    return scout ? scout.name : 'Entire Organization';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content modal-task-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isReadOnly ? 'VIEW TASK' : 'CREATE TASK'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body-grid">
            {/* Left Column */}
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="title">TASK TITLE:</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title"
                  className="form-input" 
                  placeholder="e.g., Prepare camping equipment" 
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">DESCRIPTION:</label>
                <textarea 
                  id="description" 
                  name="description"
                  className="form-textarea" 
                  rows="4" 
                  placeholder="Detailed description of the task..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-row-inline">
                <div className="form-group">
                  <label htmlFor="assigned_to">
                    ASSIGNED TO:
                    <span style={{ fontSize: '10px', color: '#999', marginLeft: '5px' }}>(Optional)</span>
                  </label>
                  <select 
                    id="assigned_to" 
                    name="assigned_to"
                    className="form-input"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">Entire Organization</option>
                    {scouts.map(scout => (
                      <option key={scout.id} value={scout.id}>
                        {scout.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">PRIORITY:</label>
                  <select 
                    id="priority" 
                    name="priority"
                    className="form-input"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row-inline">
                <div className="form-group">
                  <label htmlFor="due_date">DUE DATE:</label>
                  <input 
                    type="date" 
                    id="due_date" 
                    name="due_date"
                    className="form-input"
                    value={formData.due_date}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">CATEGORY:</label>
                  <select 
                    id="category" 
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="camping">Camping</option>
                    <option value="training">Training</option>
                    <option value="community">Community Service</option>
                    <option value="admin">Administration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">ADDITIONAL NOTES:</label>
                <textarea 
                  id="notes" 
                  name="notes"
                  className="form-textarea" 
                  rows="3" 
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="signature-section">
                <div className="signature-group">
                  <label>CREATED BY:</label>
                  <div className="created-by-name">
                    {isReadOnly && task ? task.created_by_name?.toUpperCase() : `${user.first_name?.toUpperCase()} ${user.last_name?.toUpperCase()}`}
                  </div>
                  <div className="signature-line"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="form-right">
              <div className="summary-box">
                <div className="summary-row">
                  <span className="summary-label">TASK ID:</span>
                  <span className="summary-value">{task ? `#${task.id.substring(0, 8)}` : 'NEW'}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">CREATED DATE:</span>
                  <span className="summary-value">
                    {task ? formatDate(task.created_at) : getCurrentDate()}
                  </span>
                </div>
                <div className="summary-divider"></div>
                
                <div className="task-summary-info">
                  <h3>Task Summary</h3>
                  
                  <div className="summary-item">
                    <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <div>
                      <div className="summary-item-label">Assigned To</div>
                      <div className="summary-item-value">
                        {getAssignedScoutName()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div>
                      <div className="summary-item-label">Due Date</div>
                      <div className="summary-item-value">
                        {formatDate(formData.due_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <svg className="summary-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5f2d" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div className="summary-item-label">Priority</div>
                      <div className="summary-item-value">
                        {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
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
                        {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type={isReadOnly ? 'button' : 'submit'} className="btn-save" onClick={isReadOnly ? onClose : undefined}>
                {isReadOnly ? 'CLOSE' : 'CREATE TASK'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;