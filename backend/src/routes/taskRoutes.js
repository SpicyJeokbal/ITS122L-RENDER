// backend/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all tasks
router.get('/', taskController.getTasks);

// Get single task by ID
router.get('/:id', taskController.getTaskById);

// Create new task
router.post('/', taskController.createTask);

// Update task
router.put('/:id', taskController.updateTask);

// Update task status (for drag and drop)
router.post('/update-status', taskController.updateTaskStatus);

// Archive task manually
router.post('/:id/archive', taskController.archiveTask);

// Generate PDF for task
router.get('/:id/pdf', taskController.generateTaskPDF);

// Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;