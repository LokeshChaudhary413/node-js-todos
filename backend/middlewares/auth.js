const User = require('../models/userModel');

async function isAuthenticated(req, res, next) {
    console.log('AuthMiddleware - Path:', req.path);
    console.log('AuthMiddleware - Session:', req.session ? 'exists' : 'does not exist');
    console.log('AuthMiddleware - Session user:', req.session && req.session.user ? req.session.user : 'not set');

    // Skip authentication for public routes
    if (req.path === '/' || req.path === '/login' || req.path === '/register') {
        console.log('AuthMiddleware - Public route, skipping authentication');
        return next();
    }

    // Special case for session-check endpoint
    if (req.path === '/session-check') {
        console.log('AuthMiddleware - Session check endpoint, allowing access');
        return next();
    }

    if (req.session && req.session.user) {
        try {
            // If this is a masqueraded session, use the session data directly
            if (req.session.user.isMasqueraded) {
                console.log('AuthMiddleware - Using masqueraded user from session:', req.session.user.email);

                // Add user info to request and response locals
                req.user = req.session.user;
                res.locals.currentUser = req.session.user;
                res.locals.isMasqueraded = true;

                return next();
            }

            // For normal sessions, get the full user object from database
            console.log('AuthMiddleware - Getting user from database with ID:', req.session.user._id);
            const user = await User.findById(req.session.user._id);
            if (!user) {
                console.log('AuthMiddleware - User not found in database');
                // User not found in database, clear session
                req.session.destroy();
                return res.redirect('/login');
            }

            console.log('AuthMiddleware - Found user:', user.email, 'with role:', user.role);

            // Add user to request object
            req.user = user;

            // Add user info to response locals for views
            res.locals.currentUser = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };

            console.log('AuthMiddleware - Authentication successful');
            return next(); // User is logged in, proceed to the next middleware
        } catch (error) {
            console.error('AuthMiddleware - Error:', error);
            return res.redirect('/login');
        }
    }

    console.log('AuthMiddleware - No session or user, redirecting to login');
    return res.redirect('/login'); // Redirect to login page if not authenticated
}

module.exports = isAuthenticated;
