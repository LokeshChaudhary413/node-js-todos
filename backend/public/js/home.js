const nav = document.querySelector('.nav');
const maincontainer = document.querySelector('.main-container');
const element1 = document.querySelector('.element1');
const element2 = document.querySelector('.element2');
const element3 = document.querySelector('.element3');
const getStartButton = document.querySelector('.get-start');
const learnMoreButton = document.getElementById('more');
const learnMoreContainer = document.getElementById('learn-more-container');
const closeButton = document.querySelector('.close-button');
const body = document.getElementsByTagName('body')[0];

getStartButton.addEventListener('click', () => {
    console.log('get start button clicked!');
})

learnMoreButton.addEventListener('click', () => {
    console.log('lean more button clicked!');
    learnMoreContainer.style.opacity = 1;
    learnMoreContainer.style.pointerEvents = 'all';
    body.style.pointerEvents = 'none';
    nav.style.filter = 'blur(5px)';
    maincontainer.style.filter = 'blur(5px)';
    element1.style.filter = 'blur(5px)';
    element2.style.filter = 'blur(5px)';
    element3.style.filter = 'blur(5px)';
})

closeButton.addEventListener('click', () => {
    console.log('close button clicked!');
    learnMoreContainer.style.opacity = 0;
    learnMoreContainer.style.pointerEvents = 'none';
    body.style.pointerEvents = 'all';
    body.style.opacity = 1;
    nav.style.filter = 'blur(0px)';
    maincontainer.style.filter = 'blur(0px)';
    element1.style.filter = 'blur(0px)';
    element2.style.filter = 'blur(0px)';
    element3.style.filter = 'blur(0px)';
})

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const menuToggle = document.getElementById('menuToggle');
    const loginSection = document.getElementById('loginSection');
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const html = document.documentElement;

    // Function to close the menu
    function closeMenu() {
        loginSection.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
        html.style.overflow = '';
    }

    // Toggle menu on click
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = loginSection.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            loginSection.classList.add('active');
            overlay.classList.add('active');
            body.style.overflow = 'hidden';
            html.style.overflow = 'hidden';
        }
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMenu);

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-login, .nav-register');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when window is resized to desktop width
    function handleResize() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    }


    // Handle escape key press to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginSection.classList.contains('active')) {
            closeMenu();
        }
    });

    // Initialize menu state based on viewport size
    handleResize();
    window.addEventListener('resize', handleResize);
});