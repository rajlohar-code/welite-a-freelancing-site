// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Welcome to the Head Office!");

    const userTableBody = document.getElementById('user-table-body');
    const roleFilter = document.getElementById('role-filter');
    let allUsers = [];

    // --- UPGRADED function to display users in the table ---
    function renderUsers(usersToRender) {
        userTableBody.innerHTML = '';
        if (usersToRender.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
            return;
        }
        usersToRender.forEach(user => {
            // Now we also add a cell for the "Delete" button
            const row = `<tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                 <td>${user.username || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.skill}</td>
                 
                <td>
                    <button class="delete-btn" data-userid="${user.id}">Delete</button>
                </td>
            </tr>`;
            userTableBody.innerHTML += row;

              
        });

        // After creating the buttons, we must give them instructions.
        attachDeleteListeners();
    }

    // Function to fetch all users (this is the same)
    function fetchAllUsers() {
        fetch('http://127.0.0.1:5000/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    allUsers = data.users;
                    renderUsers(allUsers);
                }
            });
    }

    // Initial fetch
    fetchAllUsers();
    
    // Filter functionality (this is the same)
    roleFilter.addEventListener('change', function() {
        const selectedRole = roleFilter.value;
        if (selectedRole === 'all') {
            renderUsers(allUsers);
        } else {
            const filteredUsers = allUsers.filter(user => user.role === selectedRole);
            renderUsers(filteredUsers);
        }
    });

    // --- NEW "Button Attendant" for the Delete buttons ---
    function attachDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const userId = e.target.dataset.userid;
                deleteUser(userId);
            });
        });
    }

    // --- NEW function to handle the delete action ---
    function deleteUser(userId) {
        // A safety check to prevent accidental deletion.
        if (!confirm(`Are you sure you want to permanently delete user with ID: ${userId}?`)) {
            return; // If the admin clicks "Cancel", stop right here.
        }

        // Send the delete order to the kitchen.
        fetch(`http://127.0.0.1:5000/api/admin/users/delete/${userId}`, {
            method: 'DELETE',
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // After deleting, we must refresh the user list.
                fetchAllUsers();
            } else {
                alert("Error: " + data.error);
            }
        });
    }

    // --- Location Management ---
    const locationForm = document.getElementById('add-location-form');
    locationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const locationNameInput = document.getElementById('new-location-name');
        const locationName = locationNameInput.value.trim();
        if (!locationName) return; // Don't submit if the box is empty

        // Send the new location to the kitchen
        fetch('http://127.0.0.1:5000/api/locations/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: locationName })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Location added successfully!');
                locationNameInput.value = ''; // Clear the input box
            }
        });
    });

    // --- Skill Management ---
    const skillForm = document.getElementById('add-skill-form');
    skillForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const skillNameInput = document.getElementById('new-skill-name');
        const skillName = skillNameInput.value.trim();
        if(!skillName) return; // Don't submit if the box is empty

        // Send the new skill to the kitchen
        fetch('http://127.0.0.1:5000/api/skills/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: skillName })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Skill added successfully!');
                skillNameInput.value = ''; // Clear the input box
            }
        });
    });
});

