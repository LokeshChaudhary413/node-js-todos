const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const roleAuth = require('../middlewares/roleAuth');

// Protected routes (require authentication)
router.use(auth);

// Task routes
router.get('/', taskController.getAllTasks);
router.get('/pending', taskController.getPendingTasks);
router.get('/completed', taskController.getCompletedTasks);
router.post('/', taskController.createTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

// Admin only routes
router.get('/admin/all', roleAuth(['admin']), taskController.getAllUsersTasks);

module.exports = router;