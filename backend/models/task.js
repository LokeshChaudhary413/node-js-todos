const mongoose = require('mongoose');
const date = new Date();
const currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
const currentDate = date.getDate() + " " + getMonth(date.getMonth()) + " " + date.getFullYear();
console.log(currentDate);


function getMonth(monthNumber) {
    const monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthsArr[monthNumber];

}

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    currenttime: {
        type: String,
        default: currentTime
    },
    currentDate: {
        type: String,
        default: currentDate
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: false
    },
    categoryChoosed: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    accessLevel: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
