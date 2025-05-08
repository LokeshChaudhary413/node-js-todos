const Category = require('../models/category');

// Get all categories for the current user
const getUserCategories = async (req, res) => {
    try {
        const categories = await Category.find({ users: req.user._id }).sort({ isDefault: -1, name: 1 });

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ categories });
        }

        // Get task counts for each category
        const Task = require('../models/task');
        const tasks = await Task.find({ user: req.user._id });

        // Create a counts object to store the number of tasks per category
        const counts = {};

        // Initialize counts for all categories
        categories.forEach(category => {
            counts[category.id] = 0;
        });

        // Count tasks for each category
        tasks.forEach(task => {
            if (task.category && counts[task.category.toString()] !== undefined) {
                counts[task.category.toString()]++;
            }
        });

        // Get task counts for sidebar
        // Reuse the tasks array we already have
        const allTasks = tasks;
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

        // Define additional scripts
        const additionalScripts = `
        <script>
            // Additional scripts for categories
        </script>
        `;

        // Render the categories content first
        const categoriesContent = await new Promise((resolve, reject) => {
            res.render('partials/categories-content', {
                title: 'Categories',
                categories,
                counts,
                user: req.user,
                totalTasks,
                completedTasks,
                categoryCounts
            }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        // Then render the dashboard layout with the content
        res.render('partials/dashboard-layout', {
            title: 'Categories',
            user: req.user,
            activePage: 'categories',
            additionalStyles: '',
            categories,
            totalTasks,
            completedTasks,
            pendingTasks,
            categoryCounts,
            additionalScripts,
            mainContent: categoriesContent,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Failed to fetch categories' });
        }
        req.flash('error', 'Failed to fetch categories');
        res.redirect('/dashboard');
    }
};

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, icon, color } = req.body;

        // Check if category with same name already exists for this creator
        const existingCategory = await Category.findOne({
            creator: req.user._id,
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive search
        });

        if (existingCategory) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ error: 'Category with this name already exists' });
            }
            req.flash('error', 'Category with this name already exists');
            return res.redirect('/categories');
        }

        // Create new category
        const category = new Category({
            name,
            icon: icon || undefined, // Use default if not provided
            color: color || undefined, // Use default if not provided
            users: [req.user._id], // Initialize with current user
            creator: req.user._id
        });

        await category.save();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(201).json({ category });
        }

        req.flash('success', 'Category created successfully');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Failed to create category' });
        }
        req.flash('error', 'Failed to create category');
        res.redirect('/categories');
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color } = req.body;

        // Find the category
        const category = await Category.findOne({ _id: id, users: req.user._id });

        if (!category) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Category not found' });
            }
            req.flash('error', 'Category not found');
            return res.redirect('/categories');
        }

        // Don't allow editing default categories
        if (category.isDefault) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ error: 'Cannot modify default categories' });
            }
            req.flash('error', 'Cannot modify default categories');
            return res.redirect('/categories');
        }

        // Check if new name conflicts with existing category
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                creator: req.user._id,
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id }
            });

            if (existingCategory) {
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                    return res.status(400).json({ error: 'Category with this name already exists' });
                }
                req.flash('error', 'Category with this name already exists');
                return res.redirect('/categories');
            }

            category.name = name;
        }

        if (icon) category.icon = icon;
        if (color) category.color = color;

        await category.save();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ category });
        }

        req.flash('success', 'Category updated successfully');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Failed to update category' });
        }
        req.flash('error', 'Failed to update category');
        res.redirect('/categories');
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category
        const category = await Category.findOne({ _id: id, users: req.user._id });

        if (!category) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Category not found' });
            }
            req.flash('error', 'Category not found');
            return res.redirect('/categories');
        }

        // Don't allow deleting default categories
        if (category.isDefault) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ error: 'Cannot delete default categories' });
            }
            req.flash('error', 'Cannot delete default categories');
            return res.redirect('/categories');
        }

        // If user is the creator and there are other users, just remove the current user
        if (category.creator.toString() === req.user._id.toString() && category.users.length > 1) {
            // Remove current user from the users array
            await Category.updateOne(
                { _id: id },
                { $pull: { users: req.user._id } }
            );
        } else if (category.creator.toString() === req.user._id.toString()) {
            // If user is the creator and there are no other users, delete the category
            await Category.deleteOne({ _id: id });
        } else {
            // If user is not the creator, just remove them from the users array
            await Category.updateOne(
                { _id: id },
                { $pull: { users: req.user._id } }
            );
        }

        // Update any tasks using this category to use 'Others' category
        const Task = require('../models/task');
        const othersCategory = await Category.findOne({
            users: req.user._id,
            name: 'Others',
            isDefault: true
        });

        if (othersCategory) {
            await Task.updateMany(
                { category: id },
                {
                    category: othersCategory._id,
                    categoryChoosed: 'others'
                }
            );
        }

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true });
        }

        req.flash('success', 'Category deleted successfully');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error deleting category:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Failed to delete category' });
        }
        req.flash('error', 'Failed to delete category');
        res.redirect('/categories');
    }
};

// API to get categories for AJAX requests
const getCategoriesApi = async (req, res) => {
    try {
        const categories = await Category.find({ users: req.user._id }).sort({ isDefault: -1, name: 1 });
        res.json({ categories });
    } catch (error) {
        console.error('Error fetching categories API:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// Assign a category to another user
const assignCategoryToUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // Check if the category exists and the current user has access to it
        const category = await Category.findOne({ _id: id, users: req.user._id });

        if (!category) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Category not found' });
            }
            req.flash('error', 'Category not found');
            return res.redirect('/categories');
        }

        // Check if the user exists
        const User = require('../models/userModel');
        const user = await User.findById(userId);

        if (!user) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ error: 'User not found' });
            }
            req.flash('error', 'User not found');
            return res.redirect('/categories');
        }

        // Check if the category is already assigned to the user
        if (category.users.includes(userId)) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ error: 'Category already assigned to this user' });
            }
            req.flash('error', 'Category already assigned to this user');
            return res.redirect('/categories');
        }

        // Add the user to the category's users array
        await Category.updateOne(
            { _id: id },
            { $addToSet: { users: userId } }
        );

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true });
        }

        req.flash('success', 'Category assigned to user successfully');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error assigning category to user:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ error: 'Failed to assign category to user' });
        }
        req.flash('error', 'Failed to assign category to user');
        res.redirect('/categories');
    }
};

module.exports = {
    getUserCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesApi,
    assignCategoryToUser
};
