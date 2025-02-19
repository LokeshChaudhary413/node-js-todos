const db = require('../config/mongoose');
const Task = require('../models/task');
const User = require('../models/userModel');

// Get all tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.session.user._id });
        const user = req.session.user;
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        res.render('dashboard', {
            title: 'Dashboard',
            tasks,
            user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading tasks' });
    }
};

// Get pending tasks
const getPendingTasks = async (req, res) => {
    console.log('Pending Tasks Calling: '+ req.session.user._id)
    try {
        const tasks = await Task.find({ 
            user: req.session.user._id,
            completed: true
        });
        const user = req.session.user;
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        res.render('dashboard', {
            title: 'Pending Tasks',
            tasks,
            user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks,
            activeTab: 'pending'
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading pending tasks' });
    }
};

// Get completed tasks
const getCompletedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ 
            user: req.session.user._id,
            status: 'completed'
        });
        const user = req.session.user;
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        res.render('dashboard', {
            title: 'Completed Tasks',
            tasks,
            user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks,
            activeTab: 'completed'
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading completed tasks' });
    }
};

// Create a new task
const createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            user: req.session.user._id,
        });
        await task.save();
        req.flash('success', 'Task created successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error creating task');
        res.redirect('/dashboard');
    }
};

// Update task status
const updateTaskStatus = async (req, res) => {
    console.log('Update Status Calling: '+ req.session.user._id)
    try {
        const task = await Task.findOne({ 
            _id: req.params.id, 
            user: req.session.user._id 
        });
        
        if (!task) {
            req.flash('error', 'Task not found');
            return res.redirect('/dashboard');
        }
        
        // Update task status
        task.completed = !task.completed;
        task.user = req.session.user._id;
        await task.save();
        req.flash('success', 'Task status updated successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error updating task status');
        res.redirect('/dashboard');
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.session.user._id 
        });
        if (!task) {
            req.flash('error', 'Task not found');
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Task deleted successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error deleting task');
        res.redirect('/dashboard');
    }
};

// Admin only: Get all users' tasks
const getAllUsersTasks = async (req, res) => {
    try {
        if (req.session.user.role !== 'admin') {
            return res.redirect('/dashboard');
        }
        const tasks = await Task.find().populate('user', 'firstName lastName email');
        res.render('admin/tasks', {
            title: 'All Users Tasks',
            tasks,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};

module.exports = {
    getAllTasks,
    getPendingTasks,
    getCompletedTasks,
    createTask,
    updateTaskStatus,
    getAllUsersTasks,
    deleteTask
};
