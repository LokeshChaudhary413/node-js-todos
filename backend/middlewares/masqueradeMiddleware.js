const User = require('../models/userModel');

/**
 * Middleware to handle superadmin masquerading as another user
 * This middleware should be placed after the auth middleware
 */
const handleMasquerade = async (req, res, next) => {
    try {
        console.log('MasqueradeMiddleware - Starting masquerade check');
        console.log('MasqueradeMiddleware - Session:', req.session ? 'exists' : 'does not exist');
        console.log('MasqueradeMiddleware - Session user:', req.session && req.session.user ? req.session.user : 'not set');

        // Skip if no user in session
        if (!req.session || !req.session.user) {
            console.log('MasqueradeMiddleware - No session or user, skipping');
            return next();
        }

        // If already masquerading, just continue
        if (req.session.user.isMasqueraded) {
            console.log('MasqueradeMiddleware - Already masquerading as:', req.session.user.email);

            // Ensure response locals are set for views
            res.locals.isMasqueraded = true;

            return next();
        }

        // Skip if not authenticated or req.user not set by auth middleware
        if (!req.user) {
            console.log('MasqueradeMiddleware - No req.user, skipping');
            return next();
        }

        // If not a superadmin, just continue
        if (req.user.role !== 'superadmin') {
            console.log('MasqueradeMiddleware - User is not a superadmin, skipping');
            return next();
        }

        console.log('MasqueradeMiddleware - Checking masquerade for superadmin:', req.user.email);
        console.log('MasqueradeMiddleware - Masquerading as:', req.user.masqueradingAs);

        // If superadmin is masquerading as someone
        if (req.user.masqueradingAs) {
            // Get the masqueraded user
            const masqueradedUser = await User.findById(req.user.masqueradingAs);
            if (masqueradedUser) {
                console.log('MasqueradeMiddleware - Found masqueraded user:', masqueradedUser.email);

                // Store original user ID for reference
                req.originalUser = req.user;

                // Replace session user with masqueraded user
                req.session.user = {
                    _id: masqueradedUser._id,
                    email: masqueradedUser.email,
                    firstName: masqueradedUser.firstName,
                    lastName: masqueradedUser.lastName,
                    role: masqueradedUser.role,
                    isMasqueraded: true,
                    masqueradedBy: req.user._id
                };

                console.log('MasqueradeMiddleware - Updated session user:', req.session.user);

                // Update req.user to be the masqueraded user
                req.user = req.session.user;

                // Add indicator to response locals for views
                res.locals.isMasqueraded = true;
                res.locals.originalUser = {
                    _id: req.originalUser._id,
                    firstName: req.originalUser.firstName,
                    lastName: req.originalUser.lastName
                };

                console.log('MasqueradeMiddleware - Successfully set up masquerade session');

                // Save the session to ensure changes are persisted
                req.session.save((err) => {
                    if (err) {
                        console.error('MasqueradeMiddleware - Session save error:', err);
                    }
                    console.log('MasqueradeMiddleware - Session saved');
                    next();
                });
                return; // Return early since we're calling next() in the callback
            } else {
                console.log('MasqueradeMiddleware - Masqueraded user not found');
            }
        } else {
            console.log('MasqueradeMiddleware - Superadmin is not masquerading');
        }

        next();
    } catch (error) {
        console.error('MasqueradeMiddleware - Error:', error);
        next();
    }
};

module.exports = handleMasquerade;
