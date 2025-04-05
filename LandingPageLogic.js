document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Here you would typically show/hide content based on the tab
            // For this example, we're just updating the active state
        });
    });

    // Card scrolling functionality
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const cardsContainer = document.querySelector('.cards-container');

    function handleScroll(direction) {
        const scrollAmount = 300;
        if (direction === 'left') {
            cardsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            cardsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // Event listeners for scroll buttons
    if (scrollLeftBtn && scrollRightBtn && cardsContainer) {
        scrollLeftBtn.addEventListener('click', () => handleScroll('left'));
        scrollRightBtn.addEventListener('click', () => handleScroll('right'));
    }

    // Get Started button functionality
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            alert('Get Started button clicked!');
            // Replace with your actual functionality
        });
    }

    // Mobile menu functionality would go here
    // const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    // const desktopNav = document.querySelector('.desktop-nav');
    // if (mobileMenuBtn && desktopNav) {
    //     mobileMenuBtn.addEventListener('click', function() {
    //         desktopNav.classList.toggle('show');
    //     });
    // }
});
function NavToAuthOptions() {
     window.location.href = "signup-options.html";
}
function NavToLoginAuthOptions() {
    window.location.href = "login-options.html";
}

// function NavToSignUpOptions() {
//         window.location.href = "SignUp.html";
// }
function NavToHome(){
        window.location.href = "HomePage.html";
}