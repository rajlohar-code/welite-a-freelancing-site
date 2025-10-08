// frontend/js/freelanceLog.js

// This "wrapper" makes sure the HTML page is fully loaded before our script runs.
document.addEventListener('DOMContentLoaded', function() {

     // --- THIS IS THE NEW "LIVE MENU UPDATE" LOGIC ---
    const areaSelect = document.getElementById('area');
    const skillSelect = document.getElementById('skill');

    // The Receptionist first asks the kitchen for the latest list of locations.
    fetch('http://127.0.0.1:5000/api/locations')
        .then(res => res.json())
        .then(locations => {
            // He clears the old, static options from the dropdown.
            areaSelect.innerHTML = '<option value="" disabled>Choose your area...</option>';
            // Then he adds the new, fresh options from the database.
            locations.forEach(loc => {
                const option = `<option value="${loc.name}">${loc.name}</option>`;
                areaSelect.innerHTML += option;
            });
        });

    // Then, he asks the kitchen for the latest list of skills.
    fetch('http://127.0.0.1:5000/api/skills')
        .then(res => res.json())
        .then(skills => {
            skillSelect.innerHTML = '<option value="" disabled>Select your skill...</option>';
            skills.forEach(skill => {
                const option = `<option value="${skill.name}">${skill.name}</option>`;
                skillSelect.innerHTML += option;
            });
        });


    // --- PART 1: The Image Preview Logic ---
    // This is your excellent code. It does not need to change.
    const input = document.getElementById("imageInput");
    const preview = document.getElementById("preview");
    const placeholder = document.getElementById("placeholder");

    if (input) {
        input.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function () {
                    preview.src = reader.result;
                    preview.style.display = "block";
                    placeholder.style.display = "none";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- PART 2: Handling the first "Get Started" form ---
    // This part is also perfect. It does not need to change.
    const skillAddForm = document.getElementById('skillAdd');
    let freelancerData = {};

    if (skillAddForm) {
        skillAddForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const area = document.getElementById('area').value;
            const skill = document.getElementById('skill').value;
            freelancerData.skillInfo = { area: area, skill: skill };
            console.log("Step 1 Complete. Data:", freelancerData);
            alert("Great! Now, tell us a bit more about yourself.");
            document.getElementById('biopage').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- PART 3: Handling the final "Bio" form ---
    const bioForm = document.getElementById('bioform');
   if (bioForm) {
        bioForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // ... (Your perfect validation logic is here, no changes needed)
            const username = document.getElementById('username').value.trim();
            const bio = document.getElementById('bio').value.trim();
            const profilePicFile = document.getElementById("imageInput").files[0];

            if (!freelancerData.skillInfo || !username || !bio || !profilePicFile) {
                alert("Please complete all steps and fill all fields.");
                return;
            }
            if (username.includes(' ') || username !== username.toLowerCase()) {
                alert("Username must be lowercase and cannot contain spaces.");
                return;
            }

            const loggedInUserString = localStorage.getItem('loggedInUser');
            if (!loggedInUserString) {
                alert("You must be logged in to become a freelancer.");
                window.location.href = 'login.html';
                return;
            }
            
            const loggedInUser = JSON.parse(loggedInUserString); // This is the photocopy.
            const formData = new FormData();
            
            formData.append('profilePic', profilePicFile);
            formData.append('email', loggedInUser.email);
            formData.append('area', freelancerData.skillInfo.area);
            formData.append('skill', freelancerData.skillInfo.skill);
            formData.append('username', username);
            formData.append('bio', bio);

            fetch('http://127.0.0.1:5000/api/user/upgrade-to-worker', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("✅ Congratulations! You are now a Welite Worker.");

                    // --- THIS IS THE CRUCIAL FIX ---
                    // Step 1: You update the role on the photocopy.
                    loggedInUser.role = 'worker';
                    // Step 2: You also add the new username to the photocopy.
                    loggedInUser.username = username;
                    
                    // Step 3 (THE MISSING STEP): You put the updated photocopy
                    // back into the filing cabinet.
                    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

                    // Now that the filing cabinet is correct, you can safely redirect.
                    window.location.href = 'freelancerProfile.html';
                } else {
                    alert("❌ " + data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("A server error occurred. Please try again.");
            });
        });
    }
});
// --- PART 1: THE GATEKEEPER ---
// This code is special. It runs instantly, as soon as the file is loaded.
// His only job is to check if the user is already a worker.
function Gatekeeper() {
    // 1. The Gatekeeper checks the user's wallet for the "VIP Card" (the loggedInUser ticket).
    const loggedInUserString = localStorage.getItem('loggedInUser');

    // 2. He only proceeds if he finds a card.
    if (loggedInUserString) {
        // 3. He reads the card to check the user's status.
        const loggedInUser = JSON.parse(loggedInUserString);

        // 4. THE IMPORTANT RULE: If the card says the user's role is "worker"...
        if (loggedInUser.role === 'worker') {
            // ...then this person is already a VIP. They don't belong on the signup page.
            console.log("Gatekeeper says: This user is already a worker. Redirecting to their profile.");
            
            // 5. The Gatekeeper immediately sends them to their VIP Lounge.
            window.location.href = 'freelancerProfile.html';
        }
    }
    // If the user is not logged in, or is just a 'client', the Gatekeeper does nothing,
    // and the user will see the signup form as normal.
};

Gatekeeper();