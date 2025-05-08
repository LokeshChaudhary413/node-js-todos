const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const roleAuth = require('../middlewares/roleAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Admin dashboard - accessible by admin and superadmin
router.get('/', roleAuth(['admin', 'superadmin']), adminController.dashboard);

// User management - accessible by admin and superadmin
router.get('/users', roleAuth(['admin', 'superadmin']), adminController.listUsers);

// Superadmin only routes
router.get('/masquerade', roleAuth(['superadmin']), adminController.masqueradeForm);
router.post('/masquerade/:userId', roleAuth(['superadmin']), adminController.startMasquerade);

// Stop masquerade - no role check needed as this is used when masquerading
router.get('/stop-masquerade', adminController.stopMasquerade);

// User profile management
router.get('/users/:userId/edit', roleAuth(['admin', 'superadmin']), adminController.editUserForm);
router.post('/users/:userId', roleAuth(['admin', 'superadmin']), upload.single('profileImage'), adminController.updateUser);

// User profile update with right sidebar
router.get('/users/:userId/profile', roleAuth(['admin', 'superadmin']), adminController.userProfileForm);
router.post('/users/:userId/profile', roleAuth(['admin', 'superadmin']), upload.single('profileImage'), adminController.updateUserProfile);

// Category management routes
router.get('/categories', roleAuth(['admin', 'superadmin']), adminController.listCategories);
router.post('/categories', roleAuth(['admin', 'superadmin']), adminController.createCategory);
router.post('/categories/:id/update', roleAuth(['admin', 'superadmin']), adminController.updateCategory);
router.post('/categories/:id/delete', roleAuth(['admin', 'superadmin']), adminController.deleteCategory);
router.post('/categories/:id/assign', roleAuth(['admin', 'superadmin']), adminController.assignCategoryToUsers);

module.exports = router;
