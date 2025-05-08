const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Display user profile form
const profileForm = async (req, res) => {
    try {
        // Get the current user
        const user = await User.findById(req.user._id);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/dashboard');
        }

        res.render('profile', {
            title: 'My Profile',
            user: user,
            activePage: 'profile',
            additionalStyles: '',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Profile form error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/dashboard');
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, gender, dob, address, city, zipcode } = req.body;

        // Find the user to update
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/dashboard');
        }

        // Update user information
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;
        user.gender = gender;
        user.dob = dob;
        user.address = address || '';
        user.city = city || '';
        user.zipcode = zipcode || '';

        // Update password if provided
        if (req.body.password && req.body.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        // Handle profile image upload if provided
        if (req.file) {
            // Save the file path to the user's profile
            user.profileImage = `/uploads/${req.file.filename}`;
        }

        await user.save();

        // Update the session user data
        req.session.user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        };

        req.flash('success', 'Profile updated successfully');
        res.redirect('/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/profile');
    }
};

module.exports = {
    profileForm,
    updateProfile
};
