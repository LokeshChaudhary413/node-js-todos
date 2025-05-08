const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const Category = require('../models/category');
const auth = require('../middlewares/auth');
const { restrictGuest, canModifyTask } = require('../middlewares/taskPermissions');

// Apply authentication middleware
router.use(auth);

// Get all tasks for the current user
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id })
            .populate('category')
            .sort({ date: 1, time: 1 });

        res.json(tasks);
    } catch (error) {
        console.error('API - Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Get pending tasks
router.get('/tasks/pending', async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user._id,
            completed: false
        })
        .populate('category')
        .sort({ date: 1, time: 1 });

        res.json(tasks);
    } catch (error) {
        console.error('API - Error fetching pending tasks:', error);
        res.status(500).json({ error: 'Failed to fetch pending tasks' });
    }
});

// Get completed tasks
router.get('/tasks/completed', async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user._id,
            completed: true
        })
        .populate('category')
        .sort({ date: -1, time: -1 });

        res.json(tasks);
    } catch (error) {
        console.error('API - Error fetching completed tasks:', error);
        res.status(500).json({ error: 'Failed to fetch completed tasks' });
    }
});

// Get task by ID
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('category');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('API - Error fetching task:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// Create a new task
router.post('/tasks', restrictGuest, async (req, res) => {
    try {
        const { title, description, date, time, categoryChoosed, category } = req.body;

        // Validate required fields
        if (!title || !date || !categoryChoosed) {
            return res.status(400).json({ error: 'Title, date, and category are required' });
        }

        // Create the task
        const task = new Task({
            title,
            description,
            date,
            time,
            categoryChoosed,
            category: category || null,
            user: req.user._id,
        });

        await task.save();

        // Return the created task
        res.status(201).json(task);
    } catch (error) {
        console.error('API - Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update a task
router.put('/tasks/:id', restrictGuest, canModifyTask, async (req, res) => {
    try {
        const { title, description, date, time, categoryChoosed, category } = req.body;

        // Validate required fields
        if (!title || !date || !categoryChoosed) {
            return res.status(400).json({ error: 'Title, date, and category are required' });
        }

        // Find and update the task
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                title,
                description,
                date,
                time,
                categoryChoosed,
                category: category || null
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('API - Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Toggle task status
router.post('/tasks/:id/toggle-status', restrictGuest, canModifyTask, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Toggle the completed status
        task.completed = !task.completed;
        // Update status field to match completed boolean
        task.status = task.completed ? 'completed' : 'pending';
        await task.save();

        res.json(task);
    } catch (error) {
        console.error('API - Error toggling task status:', error);
        res.status(500).json({ error: 'Failed to toggle task status' });
    }
});

// Delete a task
router.delete('/tasks/:id', restrictGuest, canModifyTask, async (req, res) => {
    try {
        const result = await Task.deleteOne({ _id: req.params.id, user: req.user._id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('API - Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
