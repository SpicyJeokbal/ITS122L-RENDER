// backend/src/routes/historyRoutes.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication and super admin
router.use(authenticateToken);

// Get all task history
router.get('/', historyController.getTaskHistory);

// Get history for specific task
router.get('/task/:taskId', historyController.getTaskHistoryById);

module.exports = router;