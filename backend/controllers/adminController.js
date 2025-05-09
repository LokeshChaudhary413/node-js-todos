const User = require('../models/userModel');
const Task = require('../models/task');
const Category = require('../models/category');
const bcrypt = require('bcryptjs');

// Admin dashboard
const dashboard = async (req, res) => {
    try {
        // Get counts for dashboard
        const userCount = await User.countDocuments();
        const taskCount = await Task.countDocuments();
        const pendingTaskCount = await Task.countDocuments({ status: 'pending' });
        const completedTaskCount = await Task.countDocuments({ status: 'completed' });

        // Get data for right sidebar
        const categories = await Category.find({ user: req.user._id });
        const userTasks = await Task.find({ user: req.user._id });
        const totalTasks = userTasks.length;
        const userCompletedTasks = userTasks.filter(task => task.completed).length;

        // Calculate category counts for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = userTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.user,
            userCount,
            taskCount,
            pendingTaskCount,
            completedTaskCount,
            categories,
            totalTasks,
            completedTasks: userCompletedTasks,
            categoryCounts,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading admin dashboard' });
    }
};

// List all users
const listUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName email role');

        // Get data for right sidebar
        const categories = await Category.find({ user: req.user._id });
        const userTasks = await Task.find({ user: req.user._id });
        const totalTasks = userTasks.length;
        const userCompletedTasks = userTasks.filter(task => task.completed).length;
        const userPendingTasks = userTasks.filter(task => task.pending).length;

        // Calculate category counts for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = userTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        res.render('admin/users', {
            title: 'User Management',
            user: req.user,
            users,
            categories,
            totalTasks,
            completedTasks: userCompletedTasks,
            pendingTasks: userPendingTasks,
            categoryCounts,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading users' });
    }
};

// Masquerade form
const masqueradeForm = async (req, res) => {
    try {
        // Only superadmin can masquerade
        if (req.user.role !== 'superadmin') {
            return res.redirect('/admin');
        }

        const users = await User.find({ _id: { $ne: req.user._id } }, 'firstName lastName email role');

        // Get data for right sidebar
        const categories = await Category.find({ user: req.user._id });
        const userTasks = await Task.find({ user: req.user._id });
        const totalTasks = userTasks.length;
        const userCompletedTasks = userTasks.filter(task => task.completed).length;

        // Calculate category counts for the sidebar
        const categoryCounts = {};
        categories.forEach(category => {
            categoryCounts[category.id] = userTasks.filter(task =>
                task.category && task.category.toString() === category.id.toString()
            ).length;
        });

        res.render('admin/masquerade', {
            title: 'Masquerade as User',
            user: req.user,
            users,
            categories,
            totalTasks,
            completedTasks: userCompletedTasks,
            categoryCounts,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Error loading masquerade form' });
    }
};

// Start masquerading as another user
const startMasquerade = async (req, res) => {
    try {
        console.log('StartMasquerade - Starting masquerade process');
        console.log('StartMasquerade - Current user:', req.user);

        // Only superadmin can masquerade
        if (req.user.role !== 'superadmin') {
            console.log('StartMasquerade - User is not a superadmin');
            req.flash('error', 'Only superadmins can masquerade as other users');
            return res.redirect('/admin');
        }

        const userId = req.params.userId;
        console.log('StartMasquerade - Attempting to masquerade as user ID:', userId);

        const targetUser = await User.findById(userId);

        if (!targetUser) {
            console.log('StartMasquerade - Target user not found');
            req.flash('error', 'User not found');
            return res.redirect('/admin/masquerade');
        }

        console.log('StartMasquerade - Target user found:', targetUser.email);

        // Update the superadmin user to store who they're masquerading as
        const updatedSuperadmin = await User.findByIdAndUpdate(
            req.user._id,
            { masqueradingAs: targetUser._id },
            { new: true } // Return the updated document
        );

        console.log('StartMasquerade - Updated superadmin user:', updatedSuperadmin);

        // Directly update the session with masqueraded user info
        req.session.user = {
            _id: targetUser._id,
            email: targetUser.email,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName,
            role: targetUser.role,
            isMasqueraded: true,
            masqueradedBy: req.user._id
        };

        console.log('StartMasquerade - Updated session with masqueraded user:', req.session.user);

        // Save the session to ensure changes are persisted
        req.session.save((err) => {
            if (err) {
                console.error('StartMasquerade - Session save error:', err);
            }

            console.log('StartMasquerade - Session saved, redirecting to dashboard');
            req.flash('success', `You are now masquerading as ${targetUser.firstName} ${targetUser.lastName}`);
            return res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('StartMasquerade - Error:', error);
        req.flash('error', 'Error starting masquerade');
        res.redirect('/admin/masquerade');
    }
};

// Stop masquerading
const stopMasquerade = async (req, res) => {
    try {
        console.log('StopMasquerade - Starting stop masquerade process');
        console.log('StopMasquerade - Current session user:', req.session.user);

        // Check if we're masquerading
        if (!req.session.user || !req.session.user.isMasqueraded || !req.session.user.masqueradedBy) {
            console.log('StopMasquerade - Not currently masquerading');
            req.flash('error', 'Not currently masquerading');
            return res.redirect('/admin');
        }

        console.log('StopMasquerade - Stopping masquerade, original user ID:', req.session.user.masqueradedBy);

        // Get the original superadmin user
        const originalUser = await User.findById(req.session.user.masqueradedBy);
        if (!originalUser) {
            console.log('StopMasquerade - Original user not found');
            req.flash('error', 'Original user not found');
            return res.redirect('/dashboard');
        }

        console.log('StopMasquerade - Found original user:', originalUser.email);

        // Clear the masqueradingAs field
        const updatedOriginalUser = await User.findByIdAndUpdate(
            originalUser._id,
            { masqueradingAs: null },
            { new: true } // Return the updated document
        );

        console.log('StopMasquerade - Updated original user:', updatedOriginalUser);

        // Restore the original user to the session
        req.session.user = {
            _id: originalUser._id,
            email: originalUser.email,
            firstName: originalUser.firstName,
            lastName: originalUser.lastName,
            role: originalUser.role
        };

        console.log('StopMasquerade - Restored original user to session:', req.session.user);

        // Save the session to ensure changes are persisted
        req.session.save((err) => {
            if (err) {
                console.error('StopMasquerade - Session save error:', err);
            }

            console.log('StopMasquerade - Session saved, redirecting to admin');
            req.flash('success', 'You have stopped masquerading');
            return res.redirect('/admin');
        });
    } catch (error) {
        console.error('StopMasquerade - Error:', error);
        req.flash('error', 'Error stopping masquerade');
        res.redirect('/dashboard');
    }
};

// Edit user form
const editUserForm = async (req, res) => {
    try {
        const userId = req.params.userId;
        const editUser = await User.findById(userId);

        if (!editUser) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        res.render('admin/edit-user', {
            title: 'Edit User Profile',
            user: req.user,
            editUser,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Edit user form error:', error);
        req.flash('error', 'Error loading user profile');
        res.redirect('/admin/users');
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { firstName, lastName, email, role, password } = req.body;

        // Find the user to update
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        // Check if the user has permission to change the role
        if (req.user.role !== 'superadmin' && role === 'superadmin') {
            req.flash('error', 'Only superadmins can assign the superadmin role');
            return res.redirect(`/admin/users/${userId}/edit`);
        }

        // Update basic info
        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.email = email;

        // Only update role if the current user has permission
        if (req.user.role === 'superadmin' || (req.user.role === 'admin' && role !== 'superadmin')) {
            userToUpdate.role = role;
        }

        // Update password if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        // Handle profile image upload if provided
        if (req.file) {
            // Save the file path to the user's profile
            userToUpdate.profileImage = `/uploads/${req.file.filename}`;
        }

        await userToUpdate.save();

        req.flash('success', 'User profile updated successfully');
        res.redirect(`/admin/users/${userId}/edit`);
    } catch (error) {
        console.error('Update user error:', error);
        req.flash('error', 'Error updating user profile');
        res.redirect(`/admin/users/${req.params.userId}/edit`);
    }
};

// User profile view
const userProfileForm = async (req, res) => {
    try {
        const userId = req.params.userId;
        const selectedUser = await User.findById(userId);

        if (!selectedUser) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        res.render('admin/profile-update', {
            title: 'User Profile',
            user: req.user,
            selectedUser,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('User profile form error:', error);
        req.flash('error', 'Error loading user profile');
        res.redirect('/admin/users');
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {
            firstName, lastName, email, phone, gender, dob,
            address, city, zipcode, role, password
        } = req.body;

        // Find the user to update
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        // Check if the user has permission to change the role
        if (req.user.role !== 'superadmin' && role === 'superadmin') {
            req.flash('error', 'Only superadmins can assign the superadmin role');
            return res.redirect(`/admin/users/${userId}/profile`);
        }

        // Update user information
        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.email = email;
        userToUpdate.phone = phone;
        userToUpdate.gender = gender;
        userToUpdate.dob = dob;
        userToUpdate.address = address || '';
        userToUpdate.city = city || '';
        userToUpdate.zipcode = zipcode || '';

        // Only update role if the current user has permission
        if (req.user.role === 'superadmin' || (req.user.role === 'admin' && role !== 'superadmin')) {
            userToUpdate.role = role;
        }

        // Update password if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        // Handle profile image upload if provided
        if (req.file) {
            // Save the file path to the user's profile
            userToUpdate.profileImage = `/uploads/${req.file.filename}`;
        }

        await userToUpdate.save();

        req.flash('success', 'User profile updated successfully');
        res.redirect(`/admin/users/${userId}/profile`);
    } catch (error) {
        console.error('Update user profile error:', error);
        req.flash('error', 'Error updating user profile');
        res.redirect(`/admin/users/${req.params.userId}/profile`);
    }
};

// List all categories
const listCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('users', 'firstName lastName email').populate('creator', 'firstName lastName email');
        const users = await User.find({}, 'firstName lastName email');

        res.render('admin/categories', {
            title: 'Category Management',
            user: req.user,
            categories,
            users,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error listing categories:', error);
        req.flash('error', 'Error loading categories');
        res.redirect('/admin');
    }
};

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, icon, color, users } = req.body;

        // Convert users to array if it's not already
        const userIds = Array.isArray(users) ? users : [users];

        // Check if at least one user exists
        const usersExist = await User.find({ _id: { $in: userIds } });
        if (usersExist.length === 0) {
            req.flash('error', 'No valid users selected');
            return res.redirect('/admin/categories');
        }

        // Check if category with same name already exists for the admin/creator
        const existingCategory = await Category.findOne({
            creator: req.user._id,
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive search
        });

        if (existingCategory) {
            req.flash('error', 'Category with this name already exists');
            return res.redirect('/admin/categories');
        }

        // Create new category
        const category = new Category({
            name,
            icon: icon || undefined, // Use default if not provided
            color: color || undefined, // Use default if not provided
            users: userIds,
            creator: req.user._id
        });

        await category.save();

        req.flash('success', 'Category created successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'Failed to create category');
        res.redirect('/admin/categories');
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color, users } = req.body;

        // Find the category
        const category = await Category.findById(id);

        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/admin/categories');
        }

        // Don't allow changing name of default categories
        if (category.isDefault && name !== category.name) {
            req.flash('error', 'Cannot change the name of default categories');
            return res.redirect('/admin/categories');
        }

        // Check if new name conflicts with existing category for the same creator
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                creator: category.creator,
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id }
            });

            if (existingCategory) {
                req.flash('error', 'Category with this name already exists');
                return res.redirect('/admin/categories');
            }

            category.name = name;
        }

        if (icon) category.icon = icon;
        if (color) category.color = color;

        // Update users if provided
        if (users) {
            // Convert users to array if it's not already
            const userIds = Array.isArray(users) ? users : [users];

            // Check if at least one user exists
            const usersExist = await User.find({ _id: { $in: userIds } });
            if (usersExist.length > 0) {
                category.users = userIds;
            }
        }

        await category.save();

        req.flash('success', 'Category updated successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'Failed to update category');
        res.redirect('/admin/categories');
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the category
        const category = await Category.findById(id);

        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/admin/categories');
        }

        // Don't allow deleting default categories
        if (category.isDefault) {
            req.flash('error', 'Cannot delete default categories');
            return res.redirect('/admin/categories');
        }

        // Delete the category
        await Category.deleteOne({ _id: id });

        // For each user, update their tasks to use their 'Others' category
        for (const userId of category.users) {
            // Find the 'Others' category for this user
            const othersCategory = await Category.findOne({
                users: userId,
                name: 'Others',
                isDefault: true
            });

            if (othersCategory) {
                await Task.updateMany(
                    { category: id, user: userId },
                    {
                        category: othersCategory._id,
                        categoryChoosed: 'others'
                    }
                );
            }
        }

        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error deleting category:', error);
        req.flash('error', 'Failed to delete category');
        res.redirect('/admin/categories');
    }
};

// Assign a category to users
const assignCategoryToUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const { users } = req.body;

        // Find the category
        const category = await Category.findById(id);

        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/admin/categories');
        }

        // Handle users array from form
        const userIds = Array.isArray(users) ? users : (users ? [users] : []);

        // Check if at least one user exists
        const usersExist = await User.find({ _id: { $in: userIds } });
        if (usersExist.length === 0) {
            req.flash('error', 'No valid users selected');
            return res.redirect('/admin/categories');
        }

        // Update the category with the new users
        await Category.findByIdAndUpdate(
            id,
            { users: userIds },
            { new: true, runValidators: false }
        );

        req.flash('success', 'Category assigned to users successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error assigning category to users:', error);
        req.flash('error', 'Failed to assign category to users');
        res.redirect('/admin/categories');
    }
};

module.exports = {
    dashboard,
    listUsers,
    masqueradeForm,
    startMasquerade,
    stopMasquerade,
    editUserForm,
    updateUser,
    userProfileForm,
    updateUserProfile,
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    assignCategoryToUsers
};
