const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email address'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\+?\d{7,15}$/, 'Please provide a valid phone number'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true,
  },
  lastName: {
    type: String,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin', 'superadmin'],
    default: 'user',
  },
  masqueradingAs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  profileImage: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  dob: {
    type: String,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in the format YYYY-MM-DD'],
  },
  address: String,
  city: String,
  state: String,
  zipcode: {
    type: String,
    match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid zip code'],
  },
  country: String,
});



// Static method to register a new user
userSchema.statics.registerUser = async function (userData) {
  console.log('model User data:', userData);
  const { password } = userData;

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
