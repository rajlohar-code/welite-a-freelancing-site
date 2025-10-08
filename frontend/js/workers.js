// frontend/js/workers.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Welcome to the Shopping Mall! (workers.js has started)");

    const workersContainer = document.getElementById('workers-container');
    const pageTitle = document.getElementById('page-title');

    // --- Step 1: The Manager reads the "Secret Message" from the address bar ---
    const urlParams = new URLSearchParams(window.location.search);
    const skill = urlParams.get('skill'); // This will be "electrician" or null

    let apiUrl = 'http://127.0.0.1:5000/api/workers'; // The default address

    if (skill) {
        // If there IS a secret message...
        console.log(`This is a special page for the skill: ${skill}`);
        // We add the secret message to the kitchen's address.
        apiUrl = `http://127.0.0.1:5000/api/workers?skill=${skill}`;
        pageTitle.innerText = `Our Best ${skill}s`; // Update the page title
    } else {
        console.log("This is the main page for ALL workers.");
    }

    // --- Step 2: The Manager sends the order to the kitchen ---
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                workersContainer.innerHTML = ''; // Clear the "Loading..." message
                const workers = data.workers;

                if (workers.length === 0) {
                    workersContainer.innerHTML = '<p>Sorry, no professionals found for this category.</p>';
                    return;
                }

                // --- Step 3: The Manager builds the cards for each worker ---
                workers.forEach(worker => {
                    const cardHTML = `
                        <div class="worker-card">
                            <img src="http://127.0.0.1:5000/${worker.profile_picture_url}" alt="${worker.name}">
                            <h3>${worker.name}</h3>
                            <p>@${worker.username}</p>
                            <p><strong>${worker.skill}</strong> in ${worker.location}</p>
                            <button class="hire-btn" id="${worker.username}">Hire</button>
                        </div>
                    `;
                    workersContainer.innerHTML += cardHTML;
                });
                 attachHireButtonListeners();
            } else {
                workersContainer.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
            }
        })
        .catch(error => {
            console.error("Error fetching workers:", error);
            workersContainer.innerHTML = `<p style="color:red;">Could not connect to the server.</p>`;
        });
});

function attachHireButtonListeners() {
    const hireButtons = document.querySelectorAll('.hire-btn');
    console.log(`Button Attendant found ${hireButtons.length} hire buttons to manage.`);

    hireButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // When a button is clicked, he gets the worker's unique username from the button's ID.
            const workerUsername = event.target.id;
            console.log(`Hire button clicked for username: ${workerUsername}`);

            // Then, he sends the client to the profile page with the special "invitation".
            window.location.href = `freelancerProfile.html?username=${workerUsername}`;
        });
    });
}





// ### Part 3: Connecting Your Homepage

// This is the final, easy step. Go to your `frontend/index.html` file. Find the links for your services and update their `href` address to send the secret message.

// **Example in `index.html`:**
// Find your "Get help today" section.

// **BEFORE:**
// ```html
// <a href = "login.html"><div class="suggestion">Plumbing</div></a>
// <a href = "login.html"><div class="suggestion">Electrician</div></a>
// ```

// **AFTER (The link now sends the secret message!):**
// ```html
// <a href = "workers.html?skill=Plumbing"><div class="suggestion">Plumbing</div></a>
// <a href = "workers.html?skill=Electrician"><div class="suggestion">Electrician</div></a>
