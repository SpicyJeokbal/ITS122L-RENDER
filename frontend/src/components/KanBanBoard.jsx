// frontend/src/components/KanbanBoard.jsx
import React, { useState } from 'react';
import TaskCard from './TaskCard';

const KanbanBoard = ({ tasks, onAddTask, onTaskClick, onStatusChange, onDelete, onArchive }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
  };

  const columns = [
    { id: 'ongoing', title: 'ONGOING', tasks: tasks.ongoing },
    { id: 'done', title: 'DONE', tasks: tasks.done },
    { id: 'cancelled', title: 'CANCELLED', tasks: tasks.cancelled }
  ];

  return (
    <div className="board">
      {columns.map(column => (
        <div key={column.id} className="column">
          <div className="column-header">
            <div className="column-title-group">
              <div className="column-title">{column.title}</div>
              <div className="column-count">{column.tasks.length}</div>
            </div>
            <button 
              className="add-card-btn" 
              onClick={() => onAddTask(column.id)}
            >
              +
            </button>
          </div>
          
          <div 
            className="drop-zone" 
            data-status={column.id}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {column.tasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onClick={() => onTaskClick(task)}
                onDelete={onDelete}
                onArchive={onArchive}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;