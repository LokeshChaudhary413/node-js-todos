const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const isAuthenticated = require('../middlewares/auth');

// Dashboard routes
router.get('/', isAuthenticated, dashboardController.index);
router.get('/pending', isAuthenticated, dashboardController.pendingTasks);
router.get('/completed', isAuthenticated, dashboardController.completedTasks);

module.exports = router;