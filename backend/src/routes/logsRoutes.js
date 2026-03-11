// backend/src/routes/logsRoutes.js
const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication and super admin
router.use(authenticateToken);

// Get all activity logs
router.get('/', logsController.getActivityLogs);

// Get logs for specific user
router.get('/user/:userId', logsController.getUserLogs);

module.exports = router;