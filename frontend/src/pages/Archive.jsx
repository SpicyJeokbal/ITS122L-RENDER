// frontend/src/pages/Archive.jsx
import { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import '../index.css';

const Archive = () => {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/archive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setArchivedTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/archive/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Task deleted successfully');
        fetchArchivedTasks();
      } else {
        alert('Error deleting task: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="workspace-container">
      <Navbar />
      
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Archive</h1>
          <p>View archived tasks (auto-deleted after 90 days)</p>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Loading archived tasks...</h2>
          </div>
        ) : archivedTasks.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>No archived tasks</h2>
            <p>Completed tasks will appear here after 30 days</p>
          </div>
        ) : (
          <div className="archive-list">
            {archivedTasks.map(task => (
              <div key={task.id} className="archive-card">
                <div className="archive-card-header">
                  <div>
                    <h3 className="archive-task-title">{task.title}</h3>
                    <p className="archive-task-description">{task.description}</p>
                  </div>
                  <button 
                    className="btn-delete-archive"
                    onClick={() => handleDelete(task.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="archive-card-details">
                  <div className="archive-detail">
                    <span className="archive-label">Assigned to:</span>
                    <span>{task.assigned_to_name}</span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Created by:</span>
                    <span>{task.created_by_name}</span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Status:</span>
                    <span className={`archive-status status-${task.status}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Priority:</span>
                    <span className={`archive-priority priority-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Category:</span>
                    <span>{task.category}</span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Archived on:</span>
                    <span>{formatDate(task.archived_at)}</span>
                  </div>
                  <div className="archive-detail">
                    <span className="archive-label">Days until deletion:</span>
                    <span className="archive-days-remaining">
                      {task.days_until_deletion} days
                    </span>
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

export default Archive;