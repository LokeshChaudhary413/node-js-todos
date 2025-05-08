const Task = require('../models/task');

/**
 * Middleware to check if a user has permission to access a task
 */
const canAccessTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        if (!taskId) {
            return next();
        }

        // Skip permission check for superadmin and admin
        if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
            return next();
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the task belongs to the user or is public
        if (task.user.toString() !== req.user._id.toString() && task.accessLevel !== 'public') {
            return res.status(403).json({ message: 'You do not have permission to access this task' });
        }

        // Add task to request object
        req.task = task;
        next();
    } catch (error) {
        console.error('Task permission error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if a user can modify a task
 */
const canModifyTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        if (!taskId) {
            return next();
        }

        // Skip permission check for superadmin and admin
        if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
            return next();
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only the owner can modify the task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to modify this task' });
        }

        // Add task to request object
        req.task = task;
        next();
    } catch (error) {
        console.error('Task permission error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to restrict guest users
 */
const restrictGuest = (req, res, next) => {
    if (req.user && req.user.role === 'guest') {
        return res.status(403).json({ message: 'Guest users cannot perform this action' });
    }
    next();
};

module.exports = {
    canAccessTask,
    canModifyTask,
    restrictGuest
};
