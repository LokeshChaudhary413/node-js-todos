const User = require('../models/userModel');

const roleAuth = (roles) => {
    return async (req, res, next) => {
        console.log('RoleAuth - Checking roles:', roles);
        console.log('RoleAuth - Session user:', req.session.user);

        if (!req.session || !req.session.user) {
            console.log('RoleAuth - No session or user');
            req.flash('error', 'Please login to continue');
            return res.redirect('/login');
        }

        try {
            // If this is a masqueraded session, use the session data directly
            if (req.session.user.isMasqueraded) {
                console.log('RoleAuth - Using masqueraded user from session:', req.session.user.email, 'with role:', req.session.user.role);

                // Check if masqueraded user has the required role
                if (!roles.includes(req.session.user.role)) {
                    console.log('RoleAuth - Masqueraded user does not have required role');
                    req.flash('error', 'You do not have permission to access this page');
                    return res.redirect('/dashboard');
                }

                return next();
            }

            // For normal sessions, get the full user object from database
            console.log('RoleAuth - Getting user from database with ID:', req.session.user._id);
            const user = await User.findById(req.session.user._id);
            if (!user) {
                console.log('RoleAuth - User not found in database');
                req.flash('error', 'User not found');
                return res.redirect('/login');
            }

            console.log('RoleAuth - Found user:', user.email, 'with role:', user.role);

            // Store the full user object in the request if not already set
            if (!req.user) {
                req.user = user;
            }

            // Check if user has the required role
            if (!roles.includes(user.role)) {
                console.log('RoleAuth - User does not have required role');
                req.flash('error', 'You do not have permission to access this page');
                return res.redirect('/dashboard');
            }

            console.log('RoleAuth - User has required role, proceeding');
            next();
        } catch (error) {
            console.error('Role auth error:', error);
            req.flash('error', 'An error occurred. Please try again.');
            return res.redirect('/dashboard');
        }
    };
};

module.exports = roleAuth;
