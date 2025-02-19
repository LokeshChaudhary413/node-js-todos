const date = new Date();
const ampm = date.getHours() >= 12 ? 'pm' : 'am';
const hour = date.getHours();

// greeting user
const greetingUser = document.querySelector('.greeting-user');

if (hour >= 4 && hour < 12 && ampm === 'am') {
    greetingUser.innerHTML = 'Good Morning ,';
} else if (hour >= 12 && hour <= 17 && ampm === 'pm') {
    greetingUser.innerHTML = 'Good Afternoon ,';
} else if (hour >= 0 && hour <= 4 && ampm === 'am') {
    greetingUser.innerHTML = 'Good Night Take A Rest or';
} else {
    greetingUser.textContent = 'Good Evening ,';
}

// add task section
const addTask = document.getElementById('add-task-section');
const addTaskForm = document.getElementById('add-task-form');
const addTaskBtn = document.querySelector('.add-task-button');
const navbar = document.querySelector('.nav-container');
const mainContainer = document.querySelector('.main-container');
const closeAddTaskSection = document.querySelector('.close-add-task-section');
const body = document.getElementsByTagName('body')[0];

addTaskBtn.addEventListener('click', () => {
    addTask.style.opacity = '1';
    addTask.style.pointerEvents = 'all';
    navbar.style.filter = 'blur(5px)';
    navbar.style.pointerEvents = 'none';
    mainContainer.style.filter = 'blur(5px)';
});

closeAddTaskSection.addEventListener('click', () => {
    addTask.style.opacity = '0';
    addTask.style.pointerEvents = 'none';
    navbar.style.filter = 'blur(0px)';
    navbar.style.pointerEvents = 'all';
    mainContainer.style.filter = 'blur(0px)';
});

// restricting the user from selecting a date before today
var currentDate = new Date().toISOString().split("T")[0];
var dateInput = document.querySelector(".input-date");

// Set the min attribute to the current date
dateInput.setAttribute("min", currentDate);

// category section (active category)
const work = document.getElementById('work');
const personal = document.getElementById('personal');
const shopping = document.getElementById('shopping');
const others = document.getElementById('others');

work.addEventListener('click', () => {
    work.classList.add('active-category');
    personal.classList.remove('active-category');
    shopping.classList.remove('active-category');
    others.classList.remove('active-category');
});

personal.addEventListener('click', () => {
    personal.classList.add('active-category');
    work.classList.remove('active-category');
    shopping.classList.remove('active-category');
    others.classList.remove('active-category');
});

shopping.addEventListener('click', () => {
    shopping.classList.add('active-category');
    personal.classList.remove('active-category');
    work.classList.remove('active-category');
    others.classList.remove('active-category');
});

const addNewTask = document.querySelector('.add-new-task');
addNewTask.addEventListener('click', () => {
    work.classList.remove('active-category');
    personal.classList.remove('active-category');
    shopping.classList.remove('active-category');
    others.classList.remove('active-category');
});

const categoryDivs = document.querySelectorAll('.category');

categoryDivs.forEach((categoryDiv) => {
    categoryDiv.addEventListener('click', () => {
        const categoryValue = categoryDiv.getAttribute('data-id');
        document.getElementById('category-choosed').value = categoryValue;
    });
});

others.addEventListener('click', () => {
    others.classList.add('active-category');
    personal.classList.remove('active-category');
    shopping.classList.remove('active-category');
    work.classList.remove('active-category');
});

// category section (show list)
const workCategory = document.getElementsByClassName('work-category');
const personalCategory = document.getElementsByClassName('personal-category');
const shoppingCategory = document.getElementsByClassName('shopping-category');
const othersCategory = document.getElementsByClassName('others-category');

const workCategoryList = document.getElementsByClassName('work-category-list');
const personalCategoryList = document.getElementsByClassName('personal-category-list');
const shoppingCategoryList = document.getElementsByClassName('shopping-category-list');
const othersCategoryList = document.getElementsByClassName('others-category-list');

document.body.addEventListener('click', (e) => {
    console.log(e.target);
    console.log("id", e.target.id);
    if (e.target.id === 'work-category') {
        for (let i = 0; i < workCategoryList.length; i++) {
            workCategoryList[i].classList.toggle('show-work-category-list');
        }
    } else if (e.target.id === 'personal-category') {
        for (let i = 0; i < personalCategoryList.length; i++) {
            personalCategoryList[i].classList.toggle('show-personal-category-list');
        }
    } else if (e.target.id === 'shopping-category') {
        for (let i = 0; i < shoppingCategoryList.length; i++) {
            shoppingCategoryList[i].classList.toggle('show-shopping-category-list');
        }
    } else if (e.target.id === 'other-category') {
        for (let i = 0; i < othersCategoryList.length; i++) {
            othersCategoryList[i].classList.toggle('show-others-category-list');
        }
    }
});

// show list detials
const leftSideSection = document.getElementsByClassName('left-side-section');
const lisitButtomSection = document.getElementsByClassName('list-buttom-section');

for (let i = 0; i < leftSideSection.length; i++) {
    leftSideSection[i].addEventListener('click', () => {
        console.log(lisitButtomSection);
        leftSideSection[i].classList.toggle('show-left-side-section');
        lisitButtomSection[i].classList.toggle('show-list-buttom-section');
    });
}

var baseUrl = window.location.origin;

// Task status management
async function loadTasks(status = 'all') {
    try {
        let url = '/api/tasks';
        if (status === 'pending') {
            url = '/api/tasks/pending';
        } else if (status === 'completed') {
            url = '/api/tasks/completed';
        }

        const response = await fetch(url, {
            credentials: 'same-origin' // This ensures cookies are sent with the request
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update task status');
        }

        await loadTasks(currentFilter);
        showNotification('Task status updated successfully', 'success');
    } catch (error) {
        console.error('Error updating task status:', error);
        showNotification('Error updating task status', 'error');
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        await loadTasks(currentFilter);
        showNotification('Task deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

function displayTasks(tasks) {
    const taskContainer = document.querySelector('.task-container');
    taskContainer.innerHTML = '';

    if (tasks.length === 0) {
        taskContainer.innerHTML = '<div class="no-tasks">No tasks found</div>';
        return;
    }

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-details">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description || ''}</p>
                <div class="task-meta">
                    <span class="task-date">${task.date}</span>
                    <span class="task-time">${task.time || ''}</span>
                </div>
                <div class="task-actions">
                    <button class="status-btn ${task.status}" onclick="updateTaskStatus('${task._id}', '${task.status === 'pending' ? 'completed' : 'pending'}')">${task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}</button>
                    <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
                </div>
            </div>
        `;
        taskContainer.appendChild(taskCard);
    });
}

// Task filtering
let currentFilter = 'all';
const filterButtons = {
    all: document.getElementById('all-tasks'),
    pending: document.getElementById('pending-tasks'),
    completed: document.getElementById('completed-tasks')
};

Object.entries(filterButtons).forEach(([status, button]) => {
    if (button) { // Check if button exists
        button.addEventListener('click', () => {
            currentFilter = status;
            updateActiveFilter(status);
            loadTasks(status);
        });
    }
});

function updateActiveFilter(activeStatus) {
    Object.entries(filterButtons).forEach(([status, button]) => {
        if (button) { // Check if button exists
            button.classList.toggle('active', status === activeStatus);
        }
    });
}

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', () => {
    // loadTasks();
});
