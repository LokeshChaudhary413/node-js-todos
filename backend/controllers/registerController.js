const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { email, password, confirmPassword, firstName, lastName } = req.body;
        console.log('User data:', req.body);

        if (!email || !password || !confirmPassword || !firstName || !lastName) {
            throw new Error('All required fields must be provided');
        }

        if(password != confirmPassword){
            throw new Error("Password is missmatch");
        }

        // Validate phone number format
        // const phoneRegex = /^\+?[0-9]{7,15}$/;
        // if (!phoneRegex.test(phone)) {
        //     return res.render('register', {
        //         // error: 'Please enter a valid phone number (7-15 digits, may start with +)',
        //         // formData: { email, firstName, lastName }
        //     });
        // }

        if (typeof User.registerUser !== "function") {
            throw new Error("User registration method is missing");
        }

        const user = await User.registerUser({ email, password, firstName, lastName });
        if (!user) {
            throw new Error("User registration failed");
        }

        return res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);

        // Check if it's a MongoDB duplicate key error (e.g., duplicate phone number)
        console.log("error code "+ error.code)
        if (error.code === 11000) {
            let errorMessage = 'This account already exists.';

            // Check which field caused the duplicate key error
            if (error.keyPattern?.email) {
                errorMessage = 'This email address is already registered.';
            }

            return res.render('register', {
                error: errorMessage,
                // formData: { firstName, lastName, email }
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
            error: error.message || 'Registration failed. Please try again.',
            // formData: { firstName, lastName, email }
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
