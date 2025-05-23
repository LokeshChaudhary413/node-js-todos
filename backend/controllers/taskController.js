const db = require('../config/mongoose');
const Task = require('../models/task');
const User = require('../models/userModel');
const Category = require('../models/category');

// Helper function to redirect based on referer
const redirectBasedOnReferer = (req, res) => {
    const referer = req.get('Referer');
    if (referer) {
        if (referer.includes('/tasks/pending')) {
            return res.redirect('/tasks/pending');
        } else if (referer.includes('/tasks/completed')) {
            return res.redirect('/tasks/completed');
        } else if (referer.includes('/tasks/manage')) {
            return res.redirect('/tasks/manage');
        } else if (referer.includes('/tasks')) {
            return res.redirect('/tasks');
        }
    }

    // Default redirect to dashboard
    return res.redirect('/dashboard');
};

// Task and Category Forms Page
const taskCategoryFormsPage = async (req, res) => {
    try {
        // Get tasks for the current user
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

        // Get categories for the current user
        const categories = await Category.find({ user: req.user._id }).sort({ isDefault: -1, name: 1 });

        res.render('task-category-forms', {
            title: 'Task & Category Management',
            user: req.user,
            tasks,
            categories,
            activePage: 'task-forms',
            additionalStyles: '',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error loading task and category forms page:', error);
        req.flash('error', 'Error loading page');
        res.redirect('/dashboard');
    }
};

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

        // Get categories for the footer
        const categories = await Category.find({ user: req.session.user._id }).sort({ isDefault: -1, name: 1 });

        // Calculate category counts for the footer
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = tasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        // Define additional scripts
        const additionalScripts = `
        <script>
            // Additional scripts for all tasks
        </script>
        `;

        // Count total and completed tasks
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'completed').length;
        const pending = total - completed;
        const name = user ? user.firstName + " " + user.lastName : "";

        // Render the dashboard content first
        const dashboardContent = await new Promise((resolve, reject) => {
            res.render('partials/dashboard-content', {
                title: "All Tasks",
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
                activeTab: 'all'
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Then render the dashboard layout with the content
        res.render('partials/dashboard-layout', {
            title: 'All Tasks',
            user,
            activePage: 'all-tasks',
            additionalStyles: '',
            categories,
            totalTasks: total,
            completedTasks: completed,
            pendingTasks: pending,
            categoryCounts,
            additionalScripts,
            mainContent: dashboardContent,
            messages: {
                success: req.flash ? req.flash('success') : '',
                error: req.flash ? req.flash('error') : ''
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading tasks' });
    }
};

// Task management page
const manageTasksPage = async (req, res) => {
    try {
        const user = req.session.user;
        const baseUrl = req.protocol + '://' + req.get('host');

        const tasks = await Task.find({
            user: req.session.user._id,
            completed: false
        }).sort({ date: 1 }); // Sort by due date

        // Get all categories for the user
        const categories = await Category.find({ user: req.session.user._id });
        console.log(`Category From task controller: ${req.session.user._id}`)

        // Get task counts for sidebar
        const allTasks = await Task.find({ user: req.session.user._id });
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Count tasks by category for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = allTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;

        // Calculate pending tasks
        const total = allTasks.length;
        const completed = completedTasks;
        const pending = total - completed;
        const name = req.session.user ? req.session.user.firstName + " " + req.session.user.lastName : "";

        // Define additional scripts
        const additionalScripts = `
        <script>
            // Additional scripts for pending tasks
        </script>
        `;

        // Render the dashboard content first
        const dashboardContent = await new Promise((resolve, reject) => {
            res.render('task-management', {
                title: "Manage Tasks",
                name: name,
                tasks: tasks,
                user: user,
                categories: categories,
                workTasks,
                personalTasks,
                shoppingTasks,
                otherTasks,
                total,
                completed,
                pending,
                activeTab: 'all'
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Then render the dashboard layout with the content
        res.render('partials/dashboard-layout', {
            title: 'Manage Tasks',
            user: req.session.user,
            activePage: 'tasks/manage',
            additionalStyles: '',
            categories,
            totalTasks,
            completedTasks,
            pendingTasks,
            categoryCounts,
            additionalScripts,
            mainContent: dashboardContent,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });

    } catch (error) {
        console.error('Error loading task management page:', error);
        res.render('error', { message: 'Error loading task management page' });
    }
};

// Get pending tasks
const getPendingTasks = async (req, res) => {
    console.log('Pending Tasks Calling: ' + req.session.user._id)
    try {
        // Get pending tasks
        const tasks = await Task.find({
            user: req.session.user._id,
            completed: false
        }).sort({ date: 1 }); // Sort by due date

        // Get all categories for the user
        const categories = await Category.find({ user: req.session.user._id });

        // Get task counts for sidebar
        const allTasks = await Task.find({ user: req.session.user._id });
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Count tasks by category for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = allTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;

        // Calculate pending tasks
        const total = allTasks.length;
        const completed = completedTasks;
        const pending = total - completed;
        const name = req.session.user ? req.session.user.firstName + " " + req.session.user.lastName : "";

        // Define additional scripts
        const additionalScripts = `
        <script>
            // Additional scripts for pending tasks
        </script>
        `;

        // Render the pending tasks content first
        const pendingTasksContent = await new Promise((resolve, reject) => {
            res.render('partials/dashboard-content', {
                title: "Pending Tasks",
                name: name,
                tasks: tasks,
                user: req.session.user,
                workTasks,
                personalTasks,
                shoppingTasks,
                otherTasks,
                total,
                completed,
                pending,
                activeTab: 'pending'
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Then render the dashboard layout with the content
        res.render('partials/dashboard-layout', {
            title: 'Pending Tasks',
            user: req.session.user,
            activePage: 'pending-tasks',
            additionalStyles: '',
            categories,
            totalTasks,
            completedTasks,
            pendingTasks,
            categoryCounts,
            additionalScripts,
            mainContent: pendingTasksContent,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading pending tasks' });
    }
};

// Get completed tasks
const getCompletedTasks = async (req, res) => {
    try {
        // Get completed tasks
        const tasks = await Task.find({
            user: req.session.user._id,
            completed: true
        }).sort({ updatedAt: -1 }); // Sort by completion date (newest first)

        // Get all categories for the user
        const categories = await Category.find({ user: req.session.user._id });

        // Get task counts for sidebar
        const allTasks = await Task.find({ user: req.session.user._id });
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;


        // Count tasks by category for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = allTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        // Count tasks by category
        const workTasks = tasks.filter(task => task.categoryChoosed === 'work').length;
        const personalTasks = tasks.filter(task => task.categoryChoosed === 'personal').length;
        const shoppingTasks = tasks.filter(task => task.categoryChoosed === 'shopping').length;
        const otherTasks = tasks.filter(task => task.categoryChoosed === 'others').length;

        // Calculate pending tasks
        const total = allTasks.length;
        const completed = completedTasks;
        const pending = total - completed;
        const name = req.session.user ? req.session.user.firstName + " " + req.session.user.lastName : "";

        // Define additional scripts
        const additionalScripts = `
        <script>
            // Additional scripts for completed tasks
        </script>
        `;

        // Render the completed tasks content first
        const completedTasksContent = await new Promise((resolve, reject) => {
            res.render('partials/dashboard-content', {
                title: "Completed Tasks",
                name: name,
                tasks: tasks,
                user: req.session.user,
                workTasks,
                personalTasks,
                shoppingTasks,
                otherTasks,
                total,
                completed,
                pending,
                activeTab: 'completed'
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Then render the dashboard layout with the content
        res.render('partials/dashboard-layout', {
            title: 'Completed Tasks',
            user: req.session.user,
            activePage: 'completed-tasks',
            additionalStyles: '',
            categories,
            totalTasks,
            completedTasks,
            pendingTasks,
            categoryCounts,
            additionalScripts,
            mainContent: completedTasksContent,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading completed tasks' });
    }
};

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, date, time, categoryChoosed, category } = req.body;

        // Validate required fields
        if (!title || !date) {
            req.flash('error', 'Title and date are required');
            return redirectBasedOnReferer(req, res);
        }

        // Create the task
        const task = new Task({
            title,
            description,
            date,
            time,
            categoryChoosed: categoryChoosed || 'others', // Default to 'others' if not provided
            category: category || null, // Use the category ID if provided
            user: req.session.user._id,
        });

        await task.save();
        req.flash('success', 'Task created successfully');

        return redirectBasedOnReferer(req, res);
    } catch (error) {
        console.error('Error creating task:', error);
        req.flash('error', 'Error creating task');

        return redirectBasedOnReferer(req, res);
    }
};

// Update task status
const updateTaskStatus = async (req, res) => {
    console.log('Update Status Calling: ' + req.session.user._id)
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.session.user._id
        });

        if (!task) {
            req.flash('error', 'Task not found');
            return redirectBasedOnReferer(req, res);
        }

        // Update task status
        task.completed = !task.completed;
        // Update status field to match completed boolean
        task.status = task.completed ? 'completed' : 'pending';
        task.user = req.session.user._id;
        await task.save();
        req.flash('success', 'Task status updated successfully');
        return redirectBasedOnReferer(req, res);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error updating task status');
        return redirectBasedOnReferer(req, res);
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
            return redirectBasedOnReferer(req, res);
        }
        req.flash('success', 'Task deleted successfully');
        return redirectBasedOnReferer(req, res);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error deleting task');
        return redirectBasedOnReferer(req, res);
    }
};

// Admin/Superadmin: Get all users' tasks
const getAllUsersTasks = async (req, res) => {
    try {
        // Check if user is in session
        if (!req.session || !req.session.user) {
            console.error('No user in session');
            return res.redirect('/login');
        }

        // Check if user has admin or superadmin role
        if (req.session.user.role !== 'admin' && req.session.user.role !== 'superadmin') {
            console.error('User does not have admin privileges:', req.session.user.role);
            return res.redirect('/dashboard');
        }

        // Get all tasks with user information
        const tasks = await Task.find().populate('user', 'firstName lastName email');
        console.log('Found tasks:', tasks.length);

        // Render the admin tasks view
        res.render('admin/tasks', {
            title: 'All Users Tasks',
            tasks,
            user: req.session.user,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error in getAllUsersTasks:', error);
        req.flash('error', 'Error loading tasks');
        res.redirect('/dashboard');
    }
};

// Get task by ID
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId).populate('user', 'firstName lastName');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.render('task-detail', {
            title: 'Task Details',
            task,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving task' });
    }
};

// Get task categories
const getTaskCategories = async (req, res) => {
    try {
        // Define the standard categories
        const categories = [
            { id: 'work', name: 'Work', description: 'Work-related tasks' },
            { id: 'personal', name: 'Personal', description: 'Personal tasks' },
            { id: 'shopping', name: 'Shopping', description: 'Shopping lists and tasks' },
            { id: 'others', name: 'Others', description: 'Other miscellaneous tasks' }
        ];

        // Count tasks in each category for the current user
        const counts = {};

        if (req.user && req.user.role !== 'guest') {
            // For registered users, count their tasks by category
            const tasks = await Task.find({ user: req.user._id });

            categories.forEach(category => {
                counts[category.id] = tasks.filter(task => task.categoryChoosed === category.id).length;
            });
        } else {
            // For guests, just show the categories without counts
            categories.forEach(category => {
                counts[category.id] = 0;
            });
        }

        res.render('categories', {
            title: 'Task Categories',
            categories,
            counts,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading categories' });
    }
};

module.exports = {
    getAllTasks,
    getPendingTasks,
    getCompletedTasks,
    createTask,
    updateTaskStatus,
    getAllUsersTasks,
    deleteTask,
    getTaskById,
    getTaskCategories,
    manageTasksPage,
    taskCategoryFormsPage
};
