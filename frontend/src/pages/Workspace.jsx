// frontend/src/pages/Workspace.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import KanbanBoard from '../components/KanbanBoard.jsx';
import TaskForm from '../components/TaskForm';
import '../index.css';

const Workspace = () => {
  const [tasks, setTasks] = useState({
    ongoing: [],
    done: [],
    cancelled: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ongoing');
  const [selectedTask, setSelectedTask] = useState(null);
  const [scouts, setScouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all',
    assignedTo: 'all'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTasks();
    fetchScouts();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Group tasks by status
        const grouped = {
          ongoing: data.tasks.filter(t => t.status === 'ongoing'),
          done: data.tasks.filter(t => t.status === 'done'),
          cancelled: data.tasks.filter(t => t.status === 'cancelled')
        };
        setTasks(grouped);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchScouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/scouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setScouts(data.scouts);
      }
    } catch (error) {
      console.error('Error fetching scouts:', error);
    }
  };

  const handleAddTask = (status) => {
    setSelectedStatus(status);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedTask 
        ? `http://localhost:5000/api/tasks/${selectedTask.id}`
        : 'http://localhost:5000/api/tasks';
      
      const method = selectedTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(selectedTask ? 'Task updated successfully!' : 'Task created successfully!');
        fetchTasks();
        handleCloseModal();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Error submitting task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: taskId,
          status: newStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchTasks();
      } else {
        alert('Error updating status');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
      fetchTasks();
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Task deleted successfully');
        fetchTasks();
      } else {
        alert('Error deleting task: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    }
  };

  const handleArchive = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Task archived successfully');
        fetchTasks();
      } else {
        alert('Error archiving task: ' + data.message);
      }
    } catch (error) {
      console.error('Error archiving task:', error);
      alert('Error archiving task');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      priority: 'all',
      category: 'all',
      assignedTo: 'all'
    });
  };

  const applyFilters = (taskList) => {
    return taskList.filter(task => {
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || task.category === filters.category;
      const matchesAssignedTo = filters.assignedTo === 'all' || task.assigned_to === filters.assignedTo;
      
      return matchesPriority && matchesCategory && matchesAssignedTo;
    });
  };

  const filteredTasks = {
    ongoing: applyFilters(tasks.ongoing.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase())
    )),
    done: applyFilters(tasks.done.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase())
    )),
    cancelled: applyFilters(tasks.cancelled.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="workspace-container">
      <Navbar />
      
      <div className="main-content">
        {/* Header with Greeting and Search */}
        <div className="workspace-header">
          <div className="workspace-info">
            <h1>Workspace</h1>
            <p className="workspace-greeting">
              {getGreeting()}, {user.first_name}!
            </p>
          </div>

          <div className="workspace-actions">
            <div className="search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                className="search-input-workspace" 
                placeholder="Search tasks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-container">
              <button 
                className="filter-btn-workspace" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="filter-dropdown">
                  <div className="filter-dropdown-header">
                    <h3>Filters</h3>
                    <button 
                      className="filter-clear-btn"
                      onClick={handleClearFilters}
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="filter-section">
                    <label className="filter-label">Priority</label>
                    <select 
                      className="filter-select"
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="filter-section">
                    <label className="filter-label">Category</label>
                    <select 
                      className="filter-select"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="camping">Camping</option>
                      <option value="training">Training</option>
                      <option value="community">Community Service</option>
                      <option value="admin">Administration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="filter-section">
                    <label className="filter-label">Assigned To</label>
                    <select 
                      className="filter-select"
                      value={filters.assignedTo}
                      onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    >
                      <option value="all">All Scouts</option>
                      {scouts.map(scout => (
                        <option key={scout.id} value={scout.id}>
                          {scout.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-active-count">
                    {(filters.priority !== 'all' || filters.category !== 'all' || filters.assignedTo !== 'all') && (
                      <span className="filter-badge">
                        {[filters.priority !== 'all', filters.category !== 'all', filters.assignedTo !== 'all'].filter(Boolean).length} active
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <KanbanBoard 
          tasks={filteredTasks}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onArchive={handleArchive}
        />
      </div>

      {/* Task Form Modal */}
      {isModalOpen && (
        <TaskForm 
          task={selectedTask}
          status={selectedStatus}
          scouts={scouts}
          onClose={handleCloseModal}
          onSubmit={handleTaskSubmit}
        />
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showFilterDropdown && (
        <div 
          className="filter-overlay" 
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
};

export default Workspace;