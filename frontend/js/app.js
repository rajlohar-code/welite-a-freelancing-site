// frontend/js/app.js

// This "wrapper" makes sure the page is ready before our script runs.
document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: The Navbar Switcher ---
    // The Lobby Manager finds all the furniture he needs to control.
    const loggedOutNav = document.getElementById('logged-out-nav');
    const loggedInNav = document.getElementById('logged-in-nav');
    
    // He checks for the "VIP Card" in localStorage.
    const userIsLoggedIn = localStorage.getItem('loggedInUser');

    if (userIsLoggedIn) {
        // If the card exists, he shows the VIP navbar.
        loggedOutNav.style.display = 'none';
        loggedInNav.style.display = 'flex'; // Use 'flex' or 'block' to show it
    } else {
        // If there is no card, he shows the normal public navbar.
        loggedOutNav.style.display = 'flex';
        loggedInNav.style.display = 'none';
    }


    
    // --- PART 2: The Slide-Out Menu Logic ---
    // The manager finds the new furniture: the profile icon and the menu itself.
    const profileIcon = document.getElementById('profileIcon');
    const slideOutMenu = document.getElementById('slideOutMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // He gives instructions to the profile icon button.
    if (profileIcon) {
        profileIcon.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the link from trying to go anywhere
            // When clicked, add the 'is-active' class to make the menu slide in.
            slideOutMenu.classList.add('is-active');
        });
    }

    // He gives instructions to the 'X' close button.
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function() {
            // When clicked, remove the 'is-active' class to make the menu slide out.
            slideOutMenu.classList.remove('is-active');
        });
    }

    // --- PART 3: The Logout Button ---
    // He gives instructions to the logout button inside the menu.
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the link from trying to go anywhere

            // The most important step: Throw away the "VIP Card".
            localStorage.removeItem('loggedInUser');

            // Show a nice message and refresh the page.
            alert("You have been successfully logged out.");
            window.location.reload(); // Refreshing the page will automatically show the correct navbar.
        });
    }
     // --- PART 2: The Smart "Freelance" Link Receptionist ---
    const freelanceLink = document.getElementById('freelanceLink');
    if (freelanceLink) {
        freelanceLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            const loggedInUserString = localStorage.getItem('loggedInUser');

            if (!loggedInUserString) {
                alert("Please log in to become a freelancer.");
                window.location.href = 'login.html';
                return;
            }

            const loggedInUser = JSON.parse(loggedInUserString);
            if (loggedInUser.role === 'worker') {
                window.location.href = 'freelancerProfile.html';
            } else {
                window.location.href = 'freelanceSign.html';
            }
        });
    }

     // --- PART 3: The Universal Search Logic ---
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

      if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) return;

            fetch(`http://127.0.0.1:5000/api/search?q=${searchTerm}`)
                .then(res => res.json())
                .then(data => {
                    switch (data.type) {
                        case 'profile':
                            window.location.href = `freelancerProfile.html?username=${data.value}`;
                            break;
                        case 'skill':
                            window.location.href = `workers.html?skill=${data.value}`;
                            break;
                        case 'location':
                            window.location.href = `workers.html?location=${data.value}`;
                            break;
                        default:
                            alert("Sorry, we couldn't find anything matching your search.");
                    }
                });
        });}
});

