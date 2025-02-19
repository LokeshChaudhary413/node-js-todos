function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // User is logged in, proceed to the next middleware
    }
    return res.redirect('/login'); // Redirect to login page if not authenticated
}

module.exports = isAuthenticated;
