const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const isAuthenticated = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get all categories
router.get('/', categoryController.getUserCategories);

// Create a new category
router.post('/', categoryController.createCategory);

// Update a category
router.put('/:id', categoryController.updateCategory);
router.post('/:id/update', categoryController.updateCategory); // For form submissions

// Delete a category
router.delete('/:id', categoryController.deleteCategory);
router.post('/:id/delete', categoryController.deleteCategory); // For form submissions

// API endpoint for AJAX requests
router.get('/api', categoryController.getCategoriesApi);

// Assign a category to a user
router.post('/:id/assign', categoryController.assignCategoryToUser);

module.exports = router;
