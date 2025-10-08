// // frontend/js/freelanceLog.js

// // --- PART 1: THE GATEKEEPER ---
// // This code runs instantly to check if the user is already a worker.
// (function() {
//     const loggedInUserString = localStorage.getItem('loggedInUser');
//     if (loggedInUserString) {
//         const loggedInUser = JSON.parse(loggedInUserString);
//         if (loggedInUser.role === 'worker') {
//             console.log("Gatekeeper says: This user is already a worker. Redirecting to their profile.");
//             window.location.href = 'freelancerProfile.html';
//         }
//     }
// })();


// // --- PART 2: THE RECEPTIONIST (Form Handling) ---
// // This "wrapper" makes sure the page is ready before running the form logic.
// document.addEventListener('DOMContentLoaded', function() {
    
//     // --- Image Preview Logic (This is perfect, no changes) ---
//     const input = document.getElementById("imageInput");
//     const preview = document.getElementById("preview");
//     const placeholder = document.getElementById("placeholder");
    
//     if (input) {
//         input.addEventListener("change", function () {
//             const file = this.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = function () {
//                     preview.src = reader.result;
//                     preview.style.display = "block";
//                     placeholder.style.display = "none";
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     }

//     // --- Handling the first "Get Started" form (This is perfect, no changes) ---
//     const skillAddForm = document.getElementById('skillAdd');
//     let freelancerData = {};

//     if (skillAddForm) {
//         skillAddForm.addEventListener('submit', function(e) {
//             e.preventDefault();
//             const area = document.getElementById('area').value;
//             const skill = document.getElementById('skill').value;
//             freelancerData.skillInfo = { area: area, skill: skill };
//             console.log("Step 1 Complete. Data:", freelancerData);
//             alert("Great! Now, tell us a bit more about yourself.");
//             document.getElementById('biopage').scrollIntoView({ behavior: 'smooth' });
//         });
//     }

//     // --- Handling the final "Bio" form ---
//     const bioForm = document.getElementById('bioform');

//     if (bioForm) {
//         bioForm.addEventListener('submit', function(e) {
//             e.preventDefault(); 

//             // All your validation logic is perfect here...
//             const username = document.getElementById('username').value.trim();
//             const bio = document.getElementById('bio').value.trim();
//             const profilePicFile = document.getElementById("imageInput").files[0];

//             if (!freelancerData.skillInfo || !username || !bio || !profilePicFile) {
//                 alert("Please complete all steps and fill all fields.");
//                 return;
//             }
//             if (username.includes(' ') || username !== username.toLowerCase()) {
//                 alert("Username must be lowercase and cannot contain spaces.");
//                 return;
//             }

//             const loggedInUserString = localStorage.getItem('loggedInUser');
//             if (!loggedInUserString) {
//                 alert("You must be logged in to become a freelancer. Please log in first.");
//                 window.location.href = 'login.html';
//                 return;
//             }
            
//             // --- The "Place Order" Step ---
//             const loggedInUser = JSON.parse(loggedInUserString);
//             const formData = new FormData();
            
//             formData.append('profilePic', profilePicFile);
//             formData.append('email', loggedInUser.email);
//             formData.append('area', freelancerData.skillInfo.area);
//             formData.append('skill', freelancerData.skillInfo.skill);
//             formData.append('username', username);
//             formData.append('bio', bio);

//             fetch('http://127.0.0.1:5000/api/user/upgrade-to-worker', {
//                 method: 'POST',
//                 body: formData
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert("✅ Congratulations! You are now a Welite Worker.");

//                     // --- THIS IS THE CRUCIAL FIX ---
//                     // The Receptionist takes the old card, and stamps "WORKER" on it.
//                     loggedInUser.role = 'worker';
//                     // He also adds the new username to the card, so the profile page can find it.
//                     loggedInUser.username = username;
//                     // He puts the new, updated card back in the user's wallet.
//                     localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

//                     // Now, he sends the user to their new VIP Lounge.
//                     window.location.href = 'freelancerProfile.html';
//                 } else {
//                     alert("❌ " + data.error);
//                 }
//             })
//             .catch(error => {
//                 console.error("Error:", error);
//                 alert("A server error occurred. Please try again.");
//             });
//         });
//     }
// });

// frontend/js/signlog.js

console.log("Receptionist has arrived for duty! (signlog.js has started)");

// This "wrapper" makes sure the page is ready before our script runs.
document.addEventListener('DOMContentLoaded', function() {

    // --- PART 1: THE SIGN UP FORM ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log("Receptionist is now watching the SIGNUP form.");
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Stop the form from doing the old, lazy submission.

            // Get all the data from the form.
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const address = document.getElementById('address').value.trim();
            const pincode = document.getElementById('pincode').value.trim();

            // Simple validation checks.
            if (!name || !email || !password) {
                alert("Please fill out at least Name, Email, and Password.");
                return;
            }
            if (password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }

            // Prepare the "order slip" for the kitchen.
            const userData = { name, email, password, address, pincode };
            
            console.log("SIGNUP: Sending this data to the Python kitchen:", userData);

            // Send the order to the kitchen's "signup" counter.
            fetch('http://127.0.0.1:5000/api/signup/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                console.log("SIGNUP: Received this response from the kitchen:", data);
                if (data.message === "Client account created successfully!") {
                    alert("✅ Account created successfully! Please log in.");
                    window.location.href = "login.html";
                } else {
                    alert("❌ " + data.error);
                }
            })
            .catch(error => {
                console.error('SIGNUP ERROR:', error);
                alert("Could not connect to the server. Is the Python server running?");
            });
        });
    }

    // --- PART 2: THE LOGIN FORM ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log("Receptionist is now watching the LOGIN form.");
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Stop the lazy postman!

            // Get the email and password.
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            const loginData = { email, password };
            console.log("LOGIN: Sending this data to the Python kitchen:", loginData);

            // Send the order to the kitchen's "login" counter.
            fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
                console.log("LOGIN: Received this RAW response from the kitchen:", data);
                
                if (data.success && data.user) {
                    // If the Chef says success and sends the "VIP Card"...
                    console.log("LOGIN SUCCESS: Storing the VIP Card and redirecting.");
                    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                    alert(`✅ Welcome back, ${data.user.name}!`);
                    window.location.href = "index.html"; 
                } else {
                    // If the Chef says the login failed...
                    console.log("LOGIN FAILED: The Chef said success was false or user was null.");
                    alert("❌ " + (data.error || "Incorrect email or password."));
                }
            })
            .catch(error => {
                console.error('LOGIN ERROR:', error);
                alert("Could not connect to the server. Is the Python server running?");
            });
        });
    }
});


