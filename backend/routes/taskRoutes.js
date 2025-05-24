const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const roleAuth = require('../middlewares/roleAuth');
const { canAccessTask, canModifyTask, restrictGuest } = require('../middlewares/taskPermissions');

// Protected routes (require authentication)
router.use(auth);

// Task routes - all users including guests can view tasks
router.get('/', taskController.getAllTasks);
router.get('/pending', taskController.getPendingTasks);
router.get('/completed', taskController.getCompletedTasks);
router.get('/categories', taskController.getTaskCategories);

// Task management page
router.get('/manage', restrictGuest, taskController.manageTasksPage);


// Task routes - only registered users can create/modify tasks
router.post('/', restrictGuest, taskController.createTask);
router.patch('/:id/status', restrictGuest, canModifyTask, taskController.updateTaskStatus);
router.delete('/:id', restrictGuest, canModifyTask, taskController.deleteTask);

// Admin and superadmin routes
router.get('/admin/all', roleAuth(['admin', 'superadmin']), taskController.getAllUsersTasks);

// Task access by ID
router.get('/:id', canAccessTask, taskController.getTaskById);

module.exports = router;