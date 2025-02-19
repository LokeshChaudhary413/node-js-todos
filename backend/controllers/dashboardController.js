const db = require('../config/mongoose');
const Task = require('../models/task');
const User = require('../models/userModel');

module.exports.index = async function(req, res) {
    try {
        const tasks = await Task.find({ user: req.session.user._id });
        const user = await User.findOne({ email: req.session.user.email });
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        // Count total and completed tasks
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'completed').length;
        const pending = total - completed;
        
        const name = user ? user.firstName + " " + user.lastName : "";
        
        return res.render('dashboard', {
            title: "Dashboard",
            name: name,
            tasks: tasks,
            user: user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks,
            total,
            completed,
            pending
        });
    } catch (err) {
        console.log('Error', err);
        return res.render('error', { message: 'Error loading dashboard' });
    }
};

module.exports.pendingTasks = async function(req, res) {
    try {
        const allTasks = await Task.find({ user: req.session.user._id });
        const tasks = await Task.find({ 
            user: req.session.user._id,
            status: 'pending'
        });
        const user = await User.findOne({ email: req.session.user.email });
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        // Count total and completed tasks
        const total = allTasks.length;
        const completed = allTasks.filter(task => task.status === 'completed').length;
        const pending = total - completed;
        
        const name = user ? user.firstName + " " + user.lastName : "";
        
        return res.render('dashboard', {
            title: "Pending Tasks",
            name: name,
            tasks: tasks,
            user: user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks,
            total,
            completed,
            pending,
            activeTab: 'pending'
        });
    } catch (err) {
        console.log('Error', err);
        return res.render('error', { message: 'Error loading pending tasks' });
    }
};

module.exports.completedTasks = async function(req, res) {
    try {
        const allTasks = await Task.find({ user: req.session.user._id });
        const tasks = await Task.find({ 
            user: req.session.user._id,
            status: 'completed'
        });
        const user = await User.findOne({ email: req.session.user.email });
        
        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;
        
        // Count total and completed tasks
        const total = allTasks.length;
        const completed = allTasks.filter(task => task.status === 'completed').length;
        const pending = total - completed;
        
        const name = user ? user.firstName + " " + user.lastName : "";
        
        return res.render('dashboard', {
            title: "Completed Tasks",
            name: name,
            tasks: tasks,
            user: user,
            workTasks,
            personalTasks,
            shoppingTasks,
            otherTasks,
            total,
            completed,
            pending,
            activeTab: 'completed'
        });
    } catch (err) {
        console.log('Error', err);
        return res.render('error', { message: 'Error loading completed tasks' });
    }
};