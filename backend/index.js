const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');

const app = express();
const path = require('path');

// require the mongoose file
const db = require('./config/mongoose');

// set up the blade engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// set up the static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('assets'));

// set up the middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET,  // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(methodOverride('_method'));
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use((req, res, next) => {
    res.locals.baseUrl = req.protocol + "://" + req.get("host");
    next();
});

// custom middlewares
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const isAuthenticated = require('./middlewares/auth'); // Adjust the path based on your structure

// Main Routes Files appends
const homeRoutes = require('./routes/homeRoutes');
const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');

// path: routes\index.js
app.use('/', homeRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/dashboard', isAuthenticated, dashboardRoutes);
app.use('/tasks', isAuthenticated, taskRoutes);

app.get('/logout', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if session doesn't exist
    }

    // Save session before destroying it
    req.session.save(() => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout Error:", err);
                return res.status(500).send("Error logging out.");
            }

            // Clear session cookie
            res.clearCookie('connect.sid'); // Default cookie name for express-session

            return res.redirect('/login');
        });
    });
});

app.get('/session-check', (req, res) => {
    console.log('Session:', req.session.user);
    res.json(req.session.user);
});

app.use(notFoundMiddleware);

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(`Error: ${err}`);
    }
    console.log(`Yupp! Server is running on port ${process.env.PORT}`);
})