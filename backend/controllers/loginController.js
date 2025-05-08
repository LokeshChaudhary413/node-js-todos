const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const login = function (req, res) {
  console.log("Session:", req.session.user);
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.render('login', {
    title: "Login",
  });
}

const task = function (req, res) {
  return res.render('task', {
    title: "task",
  });
};


const loginSubmit = async function (req, res) {
  const { email, password } = req.body;
  //   console.log("Login Data", email, password);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    //   console.log("User found:", user);

    if (!user) {
      return res.render('login', {
        title: "Login",
        error: "Invalid username or password. Please try again.",
      });
    }

    // Compare password with hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('login', {
        title: "Login",
        error: "Invalid username or password. Please try again.",
      });
    }

    // Store user in session (if using express-session)
    console.log("Setting session:", user.email);
    req.session.user = {
      email: user.email,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    // Redirect to task on successful login
    return res.redirect('/dashboard');

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Internal Server Error");
  }
};


module.exports = { login, task, loginSubmit };