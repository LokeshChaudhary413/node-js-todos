// Middleware to handle 404 errors
const notFoundMiddleware = (req, res, next) => {
    res.render('pageNotFound', {
        title: "404 - Page Not Found"
    });
};

module.exports = notFoundMiddleware;

