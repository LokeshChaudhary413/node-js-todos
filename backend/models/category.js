const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/7245/7245102.png'
    },
    color: {
        type: String,
        default: '#4CAF50'
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better performance
// Only enforce uniqueness when creator is not null
categorySchema.index({ creator: 1, name: 1 }, { unique: true, sparse: true });

const Category = mongoose.model('Category', categorySchema);

// Create default categories for a user
Category.createDefaultCategories = async function (userId) {
    const defaultCategories = [
        {
            name: 'Work',
            icon: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
            color: '#2196F3',
            users: [userId],
            creator: userId,
            isDefault: true
        },
        {
            name: 'Personal',
            icon: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
            color: '#9C27B0',
            users: [userId],
            creator: userId,
            isDefault: true
        },
        {
            name: 'Shopping',
            icon: 'https://cdn-icons-png.flaticon.com/512/4290/4290854.png',
            color: '#FF9800',
            users: [userId],
            creator: userId,
            isDefault: true
        },
        {
            name: 'Others',
            icon: 'https://cdn-icons-png.flaticon.com/512/7245/7245102.png',
            color: '#607D8B',
            users: [userId],
            creator: userId,
            isDefault: true
        }
    ];

    try {
        await Category.insertMany(defaultCategories);
        return true;
    } catch (error) {
        console.error('Error creating default categories:', error);
        return false;
    }
};

module.exports = Category;
