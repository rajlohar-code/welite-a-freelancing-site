// frontend/js/freelancerProfile.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Super Smart Butler has arrived for duty!");
    
    let usernameToFetch = null;
    let loggedInUser = null; // We will store the logged-in user's info here.

    // --- Step 1: The Butler determines WHOSE profile to show ---
    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('username');
    const loggedInUserString = localStorage.getItem('loggedInUser');
    
    if (loggedInUserString) {
        loggedInUser = JSON.parse(loggedInUserString);
    }

    if (usernameFromUrl) {
        usernameToFetch = usernameFromUrl; // A client is viewing a profile.
        console.log(usernameToFetch);   
    } else if (loggedInUser && loggedInUser.role === 'worker') {
        usernameToFetch = loggedInUser.username; // A worker is viewing their own profile.
    }
    

    if (!usernameToFetch) {
        alert("A profile username is required.");
        window.location.href = 'index.html';
        return;
    }
    // one update  here , as username was not defined in connsole 
   // --- Step 2: The Butler fetches the profile data from the kitchen ---
    fetch(`http://127.0.0.1:5000/api/worker/profile/${usernameToFetch}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const profile = data.profile;
                console.log(usernameToFetch);
                displayProfileData(profile); 

                // --- THE SMART "OWNERSHIP" CHECK ---
                if (loggedInUser && loggedInUser.username === profile.username) {
                    showEditButton(profile);
                } else if (loggedInUser) {
                    showPostJobButton(profile);
                }
                
                fetchAndDisplayJobs(profile.username);

            } else {
                document.querySelector('.profile-container').innerHTML = `<h1>Profile not found.</h1>`;
            }
        })
        .catch(error => console.error("Error fetching main profile data:", error));
});


// --- Helper function to display the profile data ---
function displayProfileData(profile) {
    // Display static info
    if (profile.profile_picture_url) {
        document.getElementById('profile-pic').src = `http://127.0.0.1:5000/${profile.profile_picture_url}`;
        console.log(profile.profile_picture_url);
    }
    document.getElementById('profile-name').innerText = profile.name;
    document.getElementById('profile-username').innerText = `@${profile.username}`;
    document.getElementById('profile-skill-display').innerText = profile.skill;
    document.getElementById('profile-location-display').innerText = profile.location;
    document.getElementById('profile-price-display').innerText = profile.price || 'Not set';
    document.getElementById('profile-bio-display').innerText = profile.bio;
    
    // Fill hidden edit fields
    document.getElementById('profile-skill-edit').value = profile.skill;
    document.getElementById('profile-location-edit').value = profile.location;
    document.getElementById('profile-price-edit').value = profile.price || '';
    document.getElementById('profile-bio-edit').value = profile.bio;
}


// --- Function to handle the entire Edit/Save process ---
function showEditButton(profile) {
    const container = document.getElementById('action-button-container');
    const editButton = document.createElement('button');
    editButton.innerText = 'Edit Profile';
    editButton.className = 'action-btn';
    container.appendChild(editButton);

    editButton.addEventListener('click', function() {
        // When "Edit" is clicked, switch to edit mode.
        if (editButton.innerText === 'Edit Profile') {
            toggleEditMode(true);
            editButton.innerText = 'Save Changes';
            editButton.style.backgroundColor = '#4CAF50'; // Green for save
        } else {
            // When "Save Changes" is clicked...
            saveProfileChanges(profile.username, editButton);
        }
    });
}

// A helper to switch between showing text and showing input boxes
function toggleEditMode(isEditing) {
    const displayElements = document.querySelectorAll('[id$="-display"], .price-context');
    const editElements = document.querySelectorAll('[id$="-edit"]');
    
    displayElements.forEach(el => el.style.display = isEditing ? 'none' : 'inline-block'); // Use inline-block for span
    editElements.forEach(el => el.style.display = isEditing ? 'block' : 'none');
}

// --- FINAL, CORRECTED saveProfileChanges function ---
// The clerk in Office B now receives the photocopy of the username.
function saveProfileChanges(username, button) {
    const updatedData = new FormData();
    // THE FIX: The clerk uses the 'username' photocopy he was given.
    // He is no longer looking for a file that doesn't exist in his office.
    updatedData.append('username', username);
    updatedData.append('skill', document.getElementById('profile-skill-edit').value);
    updatedData.append('location', document.getElementById('profile-location-edit').value);
    updatedData.append('price', document.getElementById('profile-price-edit').value);
    updatedData.append('bio', document.getElementById('profile-bio-edit').value);

    fetch('http://127.0.0.1:5000/api/worker/profile/update', {
        method: 'POST',
        body: updatedData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully!');
            window.location.reload(); 
        } else {
            alert('Error: ' + data.error);
        }
    });
}

    // (We would add logic here to upload a NEW photo if the user selected one)

   
    // --- Step 2: The Butler fetches the profile data from the kitchen ---
    fetch(`http://127.0.0.1:5000/api/worker/profile/${usernameToFetch}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const profile = data.profile;
                displayProfileData(profile); // A helper to put data on the page.

                // --- THIS IS THE SMART "OWNERSHIP" CHECK ---
                if (loggedInUser && loggedInUser.username === profile.username) {
                    // If you are the OWNER, show the "Edit Profile" button.
                    showEditButton(profile);
                } else if (loggedInUser) {
                    // If you are LOGGED IN (but not the owner), show the "Post a Job" button.
                    showPostJobButton(profile);
                }
                
                // After showing the profile, the Butler also fetches the jobs for this worker.
                fetchAndDisplayJobs(profile.username);

            } else {
                document.querySelector('.profile-container').innerHTML = `<h1>Profile not found.</h1>`;
            }
        })
        .catch(error => console.error("Error fetching main profile data:", error));



// --- Function to handle the "Post a Job" feature for clients ---
function showPostJobButton(profile) {
    const container = document.getElementById('action-button-container');
    const postJobBtn = document.createElement('button');
    postJobBtn.innerText = 'Post a Job';
    postJobBtn.className = 'action-btn'; // Green by default
    container.appendChild(postJobBtn);

    const modal = document.getElementById('post-job-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const jobForm = document.getElementById('post-job-form');

    postJobBtn.addEventListener('click', () => { modal.style.display = 'block'; });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if(e.target == modal) { modal.style.display = 'none'; }});

    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const problem = document.getElementById('problem-description').value;
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!problem) { alert("Please describe the job."); return; }

        const jobData = { client_email: loggedInUser.email, worker_username: profile.username, problem: problem };

        fetch('http://127.0.0.1:5000/api/jobs/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Job posted successfully!');
                modal.style.display = 'none';
                jobForm.reset();
                fetchAndDisplayJobs(profile.username); // Refresh the job board
            } else {
                alert('Error: ' + data.error);
            }
        });
    });
}

// --- BRAND NEW FUNCTIONS to handle the button clicks ---
// These functions need to be OUTSIDE the DOMContentLoaded wrapper so the HTML can call them.

function acceptJob(jobId) {
    fetch(`http://127.0.0.1:5000/api/jobs/accept/${jobId}`, { method: 'POST' })
    .then(res => res.json()).then(data => {
        if (data.success) { alert(data.message); window.location.reload(); }
        else { alert('Error: ' + data.error); }
    });
}

function rejectJob(jobId) {
    if (confirm('Are you sure you want to reject and delete this job?')) {
        fetch(`http://127.0.0.1:5000/api/jobs/reject/${jobId}`, { method: 'POST' })
        .then(res => res.json()).then(data => {
            if (data.success) { alert(data.message); window.location.reload(); }
            else { alert('Error: ' + data.error); }
        });
    }
}

function cancelJob(jobId) {
    if (confirm('Are you sure you want to cancel and delete this job request?')) {
        fetch(`http://127.0.0.1:5000/api/jobs/cancel/${jobId}`, { method: 'DELETE' })
        .then(res => res.json()).then(data => {
            if (data.success) { alert(data.message); window.location.reload(); }
            else { alert('Error: ' + data.error); }
        });
    }
}
function deleteJob(jobId) {
    if (confirm('Are you sure you want to permanently clear this job from your board?')) {
        fetch(`http://127.0.0.1:5000/api/jobs/delete/${jobId}`, { method: 'DELETE' })
        .then(res => res.json()).then(data => {
            if (data.success) { alert(data.message); window.location.reload(); }
            else { alert('Error: ' + data.error); }
        });
    }
}


// --- Function to fetch and display jobs on the Job Board ---
// --- THIS IS THE NEW, UPGRADED FUNCTION ---
// --- It now understands status and shows the correct buttons ---
// --- UPGRADED function to fetch and display jobs on the Job Board ---
function fetchAndDisplayJobs(username) {
    const jobListContainer = document.getElementById('job-list');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    fetch(`http://127.0.0.1:5000/api/worker/jobs/${username}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                jobListContainer.innerHTML = '';
                if (data.jobs.length === 0) {
                    jobListContainer.innerHTML = '<p>No job requests yet.</p>';
                    return;
                }
                data.jobs.forEach(job => {
                    let buttonsHTML = ''; // Start with no buttons

                    // --- THE SMART BUTTON LOGIC ---
                    if (loggedInUser) {
                        // Rule 1: If the job is PENDING...
                        if (job.status === 'Pending') {
                            if (loggedInUser.username === username) { // ...and YOU are the WORKER
                                buttonsHTML = `
                                    <button onclick="acceptJob(${job.id})">Accept</button>
                                    <button onclick="rejectJob(${job.id})">Reject</button>
                                `;
                            } else if (loggedInUser.id === job.client_id) { // ...and YOU are the CLIENT
                                buttonsHTML = `<button onclick="cancelJob(${job.id})">Cancel</button>`;
                            }
                        }
                        // Rule 2: If the job is FINISHED (Accepted or Rejected)...
                        else if (job.status === 'Accepted' || job.status === 'Rejected') {
                            // ...and YOU are either the WORKER OR the CLIENT...
                            if (loggedInUser.username === username || loggedInUser.id === job.client_id) {
                                // ...show the final "Delete" button for cleanup.
                                buttonsHTML = `<button class="final-delete-btn" onclick="deleteJob(${job.id})">Delete</button>`;
                            }
                        }
                    }

                    const jobCardHTML = `
                        <div class="job-card">
                            <p>${job.problem}</p>
                            <div class="client-info">
                                <span>Posted by: ${job.client_name}</span> | 
                                <span>Contact: ${job.client_email}</span>
                            </div>
                            <div>
                                <span class="job-status status-${job.status.toLowerCase()}">${job.status}</span>
                                <span class="job-actions">${buttonsHTML}</span>
                            </div>
                        </div>
                    `;
                    jobListContainer.innerHTML += jobCardHTML;
                });
            }
        });
}