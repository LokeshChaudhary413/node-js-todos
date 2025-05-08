const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, ...otherFields } = req.body;
        console.log('User data:', req.body);

        if (!email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Validate phone number format
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(phone)) {
            return res.render('register', {
                error: 'Please enter a valid phone number (7-15 digits, may start with +)',
                formData: { email, firstName, lastName }
            });
        }

        if (typeof User.registerUser !== "function") {
            return res.status(500).json({ error: "User registration method is missing" });
        }

        const user = await User.registerUser({ email, password, firstName, lastName, phone, ...otherFields });
        if (!user) {
            return res.status(500).json({ error: "User registration failed" });
        }

        return res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);

        // Check if it's a MongoDB duplicate key error (e.g., duplicate phone number)
        if (error.code === 11000) {
            let errorMessage = 'This account already exists.';

            // Check which field caused the duplicate key error
            if (error.keyPattern && error.keyPattern.phone) {
                errorMessage = 'This phone number is already registered.';
            } else if (error.keyPattern && error.keyPattern.email) {
                errorMessage = 'This email address is already registered.';
            }

            return res.render('register', {
                error: errorMessage,
                formData: { firstName, lastName, email }
            });
        }

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.render('register', {
                error: errorMessages[0],
                formData: { firstName, lastName, email }
            });
        }

        // Handle other errors
        return res.render('register', {
            error: 'Registration failed. Please try again.',
            formData: { firstName, lastName, email }
        });
    }
};

const registerForm = (req, res) => {
    res.render('register', {
        formData: {},
        error: undefined
    });
};

module.exports = { registerUser, registerForm };
