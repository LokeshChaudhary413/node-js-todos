const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, ...otherFields } = req.body;
        console.log('User data:', req.body);

        if (!email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (typeof User.registerUser !== "function") {
            return res.status(500).json({ error: "User registration method is missing" });
        }

        const user = await User.registerUser({ email, password, firstName, lastName, phone, ...otherFields });
        if(!user){
            return res.status(500).json({ error: "User registration failed" });
        }

        return res.redirect('/login');
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const registerForm = (req, res) => {
    res.render('register');
};

module.exports = { registerUser, registerForm };
