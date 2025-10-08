// frontend/js/services.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Welcome to the Mall Directory! (services.js has started)");

    const skillList = document.getElementById('skill-list-container');
    const locationList = document.getElementById('location-list-container');

    // --- The Manager's First Job: Get the list of all skills ---
    fetch('http://127.0.0.1:5000/api/skills')
        .then(res => res.json())
        .then(skills => {
            skillList.innerHTML = ''; // Clear the "Loading..." message
            skills.forEach(skill => {
                // For each skill, he creates a beautiful link.
                // This link goes to the workers page and sends a "secret message" to filter!
                const listItem = `
                    <li>
                        <a href="workers.html?skill=${skill.name}">${skill.name}</a>
                    </li>
                `;
                skillList.innerHTML += listItem;
            });
        });

    // --- The Manager's Second Job: Get the list of all locations ---
    fetch('http://127.0.0.1:5000/api/locations')
        .then(res => res.json())
        .then(locations => {
            locationList.innerHTML = ''; // Clear the "Loading..." message
            locations.forEach(location => {
                // For now, the location link will just take the user to the main workers page.
                // We can upgrade our kitchen later to filter by location!
                const listItem = `
                    <li>
                        <a href="workers.html">${location.name}</a>
                    </li>
                `;
                locationList.innerHTML += listItem;
            });
        });
});
