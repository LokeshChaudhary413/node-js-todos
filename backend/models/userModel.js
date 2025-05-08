const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?\d{7,15}$/, 'Please provide a valid phone number'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin', 'superadmin'],
    default: 'user'
  },
  masqueradingAs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  profileImage: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    type: String,
    required: [false, 'Address is required'],
  },
  dob: {
    type: String,
    required: [true, 'Date of birth is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in the format YYYY-MM-DD'],
  },
  city: {
    type: String,
    required: [false, 'City is required'],
  },
  zipcode: {
    type: String,
    required: [false, 'Zip code is required'],
    match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid zip code'],
  },
  state: {
    type: String,
    required: [false, 'State is required'],
  },
  country: {
    type: String,
    required: [false, 'Country is required'],
  },
});



// Static method to register a new user
userSchema.statics.registerUser = async function (userData) {
  console.log('User data:', userData);
  const { email, password, phone } = userData;

  // Check if email or phone already exists
  const existingUser = await this.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new Error('Email or phone already exists');
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save the user
  const user = new this({ ...userData, password: hashedPassword });
  await user.save();

  // Create default categories for the user
  try {
    const Category = require('./category');
    await Category.createDefaultCategories(user._id);
  } catch (error) {
    console.error('Error creating default categories:', error);
    // Continue even if category creation fails
  }

  return user;
};



// Compile the model
const User = mongoose.model('User', userSchema);

module.exports = User;
